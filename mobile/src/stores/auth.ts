import { create } from 'zustand';
import * as authService from '../services/auth';
import * as api from '../services/api';
import * as revenuecat from '../services/revenuecat';
import type { UserContext } from '../types';

// User type matching our backend
interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'CREATOR';
  subscriptionExpiry?: string;
  context?: any;
}

interface Subscription {
  tier: 'FREE' | 'PREMIUM' | 'CREATOR';
  isPremium: boolean;
  expiresAt: string | null;
}

interface AuthState {
  // Session state
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasSeenWelcome: boolean;

  // Computed getters
  isAuthenticated: boolean;
  isPremium: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateContext: (context: UserContext) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  isLoading: true,
  isInitialized: false,
  hasSeenWelcome: false,
  isAuthenticated: false,
  isPremium: false,

  initialize: async () => {
    try {
      // IMPORTANT: Ensure tokens are loaded from SecureStore before any API calls
      // This prevents race conditions where requests fire before tokens are available
      await authService.ensureTokensLoaded();

      // Load welcome screen seen flag
      const hasSeenWelcome = await authService.getHasSeenWelcome();
      set({ hasSeenWelcome });

      // Check if we have tokens stored
      const hasAuth = await authService.isAuthenticated();

      if (hasAuth) {
        // Try to get current user from auth service (validates token)
        const user = await authService.getCurrentUser();

        if (user) {
          // Fetch full user profile with subscription
          // Token is now guaranteed to be in memory cache
          try {
            const { user: fullUser, subscription } = await api.getCurrentUser();
            set({
              user: fullUser as User,
              subscription,
              isAuthenticated: true,
              isPremium: subscription?.isPremium || false,
            });
          } catch (error) {
            // If API call fails, still set basic user info from auth service
            console.error('Failed to fetch full user profile:', error);
            set({
              user: user as User,
              subscription: null,
              isAuthenticated: true,
              isPremium: false,
            });
          }

          // Initialize RevenueCat with user ID
          await revenuecat.initializeRevenueCat(user.id);

          // Link RevenueCat ID if not already linked
          try {
            const rcId = await revenuecat.getRevenueCatUserId();
            if (rcId) {
              await api.linkRevenueCat(rcId);
            }
          } catch (e) {
            // Ignore if already linked or RevenueCat not configured
          }
        } else {
          // Tokens are invalid, clear them
          await authService.clearTokens();
          await revenuecat.initializeRevenueCat();
        }
      } else {
        // Initialize RevenueCat anonymously
        await revenuecat.initializeRevenueCat();
      }

      // Listen for RevenueCat updates
      revenuecat.addCustomerInfoUpdateListener((customerInfo) => {
        const isPremiumStatus = revenuecat.isPremium(customerInfo);
        set((state) => ({
          subscription: {
            tier: isPremiumStatus ? 'PREMIUM' : 'FREE',
            isPremium: isPremiumStatus,
            expiresAt: null,
          },
          isPremium: isPremiumStatus,
        }));
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.register(email, password, name);

      // Fetch full profile
      const { user: fullUser, subscription } = await api.getCurrentUser();
      set({
        user: fullUser as User,
        subscription,
        isAuthenticated: true,
        isPremium: subscription?.isPremium || false,
      });

      // Mark welcome as seen (user has completed onboarding)
      await authService.setHasSeenWelcome(true);
      set({ hasSeenWelcome: true });

      // Initialize RevenueCat with user ID
      await revenuecat.identifyUser(user.id);
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.login(email, password);

      // Fetch full profile
      const { user: fullUser, subscription } = await api.getCurrentUser();
      set({
        user: fullUser as User,
        subscription,
        isAuthenticated: true,
        isPremium: subscription?.isPremium || false,
      });

      // Mark welcome as seen (user has completed onboarding)
      await authService.setHasSeenWelcome(true);
      set({ hasSeenWelcome: true });

      // Initialize RevenueCat with user ID
      await revenuecat.identifyUser(user.id);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      await revenuecat.logoutUser();
      set({ user: null, subscription: null, isAuthenticated: false, isPremium: false });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const { user, subscription } = await api.getCurrentUser();
      set({
        user: user as User,
        subscription,
        isAuthenticated: !!user,
        isPremium: subscription?.isPremium || false,
      });
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  },

  updateContext: async (context: UserContext) => {
    try {
      const { context: updatedContext } = await api.updateUserContext(context);
      set((state) => ({
        user: state.user ? { ...state.user, context: updatedContext } : null,
      }));
    } catch (error) {
      console.error('Error updating context:', error);
      throw error;
    }
  },

  setHasSeenWelcome: async (seen: boolean) => {
    await authService.setHasSeenWelcome(seen);
    set({ hasSeenWelcome: seen });
  },
}));
