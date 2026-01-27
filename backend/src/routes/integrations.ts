import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOAuthUrl,
  handleOAuthCallback,
  getUserConnections,
  revokeConnection,
} from '../services/integration';
import { listDocuments } from '../services/contentExtractor';
import { IntegrationProvider } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// ===========================================
// OAuth Flow Endpoints
// ===========================================

/**
 * GET /integrations/oauth/:provider
 * Get OAuth authorization URL for a provider
 */
router.get('/oauth/:provider', authenticate, async (req: Request, res: Response) => {
  try {
    const providerParam = (req.params.provider as string).toUpperCase();

    // Validate provider
    if (!['NOTION', 'GOOGLE_DOCS'].includes(providerParam)) {
      res.status(400).json({ error: 'Invalid provider. Supported: notion, google_docs' });
      return;
    }

    const provider = providerParam as IntegrationProvider;
    const userId = req.userId!;

    // Create state parameter with user ID (for callback verification)
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    const authUrl = getOAuthUrl(provider, state);

    res.json({ url: authUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * GET /integrations/oauth/:provider/callback
 * Handle OAuth callback from provider
 */
router.get('/oauth/:provider/callback', async (req: Request, res: Response) => {
  try {
    const providerParam = (req.params.provider as string).toUpperCase();
    const { code, state, error: oauthError } = req.query;

    // Handle OAuth errors
    if (oauthError) {
      console.error('OAuth error:', oauthError);
      res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=${oauthError}`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=missing_code`);
      return;
    }

    // Validate and decode state
    if (!state || typeof state !== 'string') {
      res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=invalid_state`);
      return;
    }

    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=invalid_state`);
      return;
    }

    // Check state freshness (10 minute window)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=state_expired`);
      return;
    }

    const provider = providerParam as IntegrationProvider;
    const { connectionId } = await handleOAuthCallback(provider, code, stateData.userId);

    // Redirect to web app with success
    res.redirect(
      `${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?success=true&provider=${provider.toLowerCase()}&connectionId=${connectionId}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.WEB_APP_URL || 'http://localhost:3001'}/integrations?error=callback_failed`);
  }
});

// ===========================================
// Connection Management Endpoints
// ===========================================

/**
 * GET /integrations/connections
 * List user's integration connections
 */
router.get('/connections', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const connections = await getUserConnections(userId);

    res.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

/**
 * DELETE /integrations/connections/:id
 * Revoke/delete an integration connection
 */
router.delete('/connections/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const connectionId = req.params.id as string;

    const success = await revokeConnection(connectionId, userId);

    if (!success) {
      res.status(404).json({ error: 'Connection not found or not authorized' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error revoking connection:', error);
    res.status(500).json({ error: 'Failed to revoke connection' });
  }
});

// ===========================================
// Document Browsing Endpoints
// ===========================================

/**
 * GET /integrations/browse/:connectionId
 * Browse documents available from a connection
 */
router.get('/browse/:connectionId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const connectionId = req.params.connectionId as string;

    // Get connection and verify ownership
    const connections = await getUserConnections(userId);
    const connection = connections.find((c) => c.id === connectionId);

    if (!connection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }

    // List documents from the provider
    const documents = await listDocuments(connectionId, connection.provider);

    res.json({
      connection: {
        id: connection.id,
        provider: connection.provider,
      },
      documents,
    });
  } catch (error) {
    console.error('Error browsing documents:', error);
    res.status(500).json({ error: 'Failed to browse documents' });
  }
});

export default router;
