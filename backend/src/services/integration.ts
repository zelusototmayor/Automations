import { Client as NotionClient } from '@notionhq/client';
import { google } from 'googleapis';
import { prisma } from './database';
import { encrypt, decrypt } from './encryption';
import { IntegrationProvider, ConnectionStatus } from '@prisma/client';

// ===========================================
// OAuth Configuration
// ===========================================

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || '';
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || '';
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || '';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

// Google OAuth2 client
function getGoogleOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

// ===========================================
// OAuth URL Generation
// ===========================================

/**
 * Generate OAuth authorization URL for a provider
 */
export function getOAuthUrl(provider: IntegrationProvider, state: string): string {
  switch (provider) {
    case 'NOTION':
      return `https://api.notion.com/v1/oauth/authorize?` +
        `client_id=${NOTION_CLIENT_ID}` +
        `&response_type=code` +
        `&owner=user` +
        `&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}` +
        `&state=${encodeURIComponent(state)}`;

    case 'GOOGLE_DOCS':
      const oauth2Client = getGoogleOAuth2Client();
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/documents.readonly',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
        state,
        prompt: 'consent', // Force refresh token generation
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ===========================================
// OAuth Callback Handlers
// ===========================================

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Exchange authorization code for tokens (Notion)
 */
async function exchangeNotionCode(code: string): Promise<OAuthTokens> {
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: NOTION_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(`Notion OAuth error: ${error.error || 'Unknown error'}`);
  }

  const data = await response.json() as {
    access_token: string;
    workspace_id: string;
    workspace_name: string;
    workspace_icon: string;
    bot_id: string;
  };

  return {
    accessToken: data.access_token,
    // Notion tokens don't expire
    metadata: {
      workspace_id: data.workspace_id,
      workspace_name: data.workspace_name,
      workspace_icon: data.workspace_icon,
      bot_id: data.bot_id,
    },
  };
}

/**
 * Exchange authorization code for tokens (Google)
 */
async function exchangeGoogleCode(code: string): Promise<OAuthTokens> {
  const oauth2Client = getGoogleOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token || undefined,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
  };
}

/**
 * Handle OAuth callback - exchange code and store connection
 */
export async function handleOAuthCallback(
  provider: IntegrationProvider,
  code: string,
  userId: string
): Promise<{ connectionId: string }> {
  let tokens: OAuthTokens;

  switch (provider) {
    case 'NOTION':
      tokens = await exchangeNotionCode(code);
      break;
    case 'GOOGLE_DOCS':
      tokens = await exchangeGoogleCode(code);
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  // Encrypt tokens before storing
  const encryptedAccessToken = encrypt(tokens.accessToken);
  const encryptedRefreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

  // Upsert connection (update if exists, create if not)
  const connection = await prisma.integrationConnection.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: tokens.expiresAt,
      status: 'ACTIVE',
      metadata: tokens.metadata || {},
      updatedAt: new Date(),
    },
    create: {
      userId,
      provider,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: tokens.expiresAt,
      status: 'ACTIVE',
      metadata: tokens.metadata || {},
    },
  });

  return { connectionId: connection.id };
}

// ===========================================
// Token Management
// ===========================================

/**
 * Get decrypted access token for a connection
 */
export async function getAccessToken(connectionId: string): Promise<string> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Check if token is expired and needs refresh
  if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
    if (connection.provider === 'GOOGLE_DOCS' && connection.refreshToken) {
      const newToken = await refreshGoogleToken(connection.id, decrypt(connection.refreshToken));
      return newToken;
    }
    throw new Error('Token expired and cannot be refreshed');
  }

  return decrypt(connection.accessToken);
}

/**
 * Refresh Google OAuth token
 */
async function refreshGoogleToken(connectionId: string, refreshToken: string): Promise<string> {
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  const newAccessToken = credentials.access_token!;
  const encryptedAccessToken = encrypt(newAccessToken);

  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: encryptedAccessToken,
      tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      status: 'ACTIVE',
    },
  });

  return newAccessToken;
}

// ===========================================
// Connection Management
// ===========================================

/**
 * Get all connections for a user
 */
export async function getUserConnections(userId: string) {
  const connections = await prisma.integrationConnection.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      status: true,
      metadata: true,
      createdAt: true,
      _count: {
        select: {
          knowledgeSources: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return connections.map(conn => ({
    id: conn.id,
    provider: conn.provider,
    status: conn.status,
    metadata: conn.metadata,
    createdAt: conn.createdAt,
    sourceCount: conn._count.knowledgeSources,
  }));
}

/**
 * Get a specific connection by ID (with ownership check)
 */
export async function getConnection(connectionId: string, userId: string) {
  const connection = await prisma.integrationConnection.findFirst({
    where: {
      id: connectionId,
      userId,
    },
  });

  return connection;
}

/**
 * Revoke/delete a connection
 */
export async function revokeConnection(connectionId: string, userId: string): Promise<boolean> {
  const connection = await prisma.integrationConnection.findFirst({
    where: {
      id: connectionId,
      userId,
    },
  });

  if (!connection) {
    return false;
  }

  // Delete the connection (cascades to knowledge sources)
  await prisma.integrationConnection.delete({
    where: { id: connectionId },
  });

  return true;
}

/**
 * Mark connection as having an error
 */
export async function markConnectionError(connectionId: string, error?: string): Promise<void> {
  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      status: 'ERROR',
      metadata: error ? { error } : undefined,
    },
  });
}

// ===========================================
// Provider Clients
// ===========================================

/**
 * Get an authenticated Notion client for a connection
 */
export async function getNotionClient(connectionId: string): Promise<NotionClient> {
  const accessToken = await getAccessToken(connectionId);
  return new NotionClient({ auth: accessToken });
}

/**
 * Get authenticated Google Docs API client for a connection
 */
export async function getGoogleDocsClient(connectionId: string) {
  const accessToken = await getAccessToken(connectionId);
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.docs({ version: 'v1', auth: oauth2Client });
}

/**
 * Get authenticated Google Drive API client for a connection
 */
export async function getGoogleDriveClient(connectionId: string) {
  const accessToken = await getAccessToken(connectionId);
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}
