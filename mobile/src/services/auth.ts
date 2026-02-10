import * as SecureStore from 'expo-secure-store';

// Default to production API if not configured
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.bettercoachingapp.com/api';

// Storage keys
const ACCESS_TOKEN_KEY = 'coachcraft_access_token';
const REFRESH_TOKEN_KEY = 'coachcraft_refresh_token';
const SEEN_WELCOME_KEY = 'coachcraft_seen_welcome';

// In-memory token cache to avoid slow SecureStore reads
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokensLoaded = false;
let tokenLoadPromise: Promise<void> | null = null;

// Token types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier: 'FREE' | 'CREATOR';
  subscriptionExpiry?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Load tokens from SecureStore into memory cache (called once on init)
async function loadTokensFromStorage(): Promise<void> {
  if (tokensLoaded) return;

  // Prevent concurrent loads
  if (tokenLoadPromise) {
    await tokenLoadPromise;
    return;
  }

  tokenLoadPromise = (async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);
      cachedAccessToken = accessToken;
      cachedRefreshToken = refreshToken;
      tokensLoaded = true;
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      tokensLoaded = true; // Mark as loaded even on error to prevent infinite retries
    }
  })();

  await tokenLoadPromise;
  tokenLoadPromise = null;
}

// Ensure tokens are loaded before accessing
export async function ensureTokensLoaded(): Promise<void> {
  await loadTokensFromStorage();
}

// Token storage
export async function getAccessToken(): Promise<string | null> {
  await loadTokensFromStorage();
  return cachedAccessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  await loadTokensFromStorage();
  return cachedRefreshToken;
}

export async function saveTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
  // Update cache immediately
  cachedAccessToken = tokens.accessToken;
  cachedRefreshToken = tokens.refreshToken;
  tokensLoaded = true;

  // Persist to SecureStore in background
  try {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
}

export async function clearTokens(): Promise<void> {
  // Clear cache immediately
  cachedAccessToken = null;
  cachedRefreshToken = null;

  // Clear from SecureStore
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

// API calls
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  // Save tokens
  await saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Save tokens
  await saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error('Logout API error:', error);
  }

  // Always clear tokens locally
  await clearTokens();
}

// Refresh lock to prevent concurrent refresh attempts
let refreshPromise: Promise<AuthTokens | null> | null = null;

export async function refreshAccessToken(): Promise<AuthTokens | null> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = doRefreshAccessToken();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefreshAccessToken(): Promise<AuthTokens | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Token is invalid, clear everything
      await clearTokens();
      return null;
    }

    const data = await response.json();

    // Save new tokens
    await saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const newTokens = await refreshAccessToken();
        if (newTokens) {
          // Retry with new token
          return getCurrentUser();
        }
        return null;
      }
      throw new Error('Failed to get user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

// Welcome screen flag
export async function getHasSeenWelcome(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(SEEN_WELCOME_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting hasSeenWelcome:', error);
    return false;
  }
}

export async function setHasSeenWelcome(seen: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(SEEN_WELCOME_KEY, seen ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting hasSeenWelcome:', error);
  }
}
