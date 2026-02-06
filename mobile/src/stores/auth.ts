import { create } from 'zustand';
import * as authService from '../services/auth';
import * as api from '../services/api';
import type { PurchasedCoach } from '../services/api';
import * as revenuecat from '../services/revenuecat';
import type { UserContext } from '../types';

// User type matching our backend
interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier: 'FREE' | 'CREATOR';
  subscriptionExpiry?: string;
  context?: any;
  hasCompletedOnboarding?: boolean;
  contextLastUpdatedAt?: string;
  contextNudgeDismissedAt?: string;
}

interface CreatorStatus {
  tier: 'FREE' | 'CREATOR';
  isCreator: boolean;
  expiresAt: string | null;
}

interface AuthState {
  // Session state
  user: User | null;
  creator: CreatorStatus | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasSeenWelcome: boolean;
  hasCompletedOnboarding: boolean;
  showUserIntentModal: boolean;
  purchasedCoachIds: string[];  // IDs of coaches user has purchased
  purchasedCoaches: PurchasedCoach[];  // Full details of purchased coaches

  // Computed getters
  isAuthenticated: boolean;
  isCreator: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateContext: (context: UserContext) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => Promise<void>;
  setShowUserIntentModal: (show: boolean) => void;
  loadPurchasedCoaches: () => Promise<void>;
  addPurchasedCoach: (coachId: string) => void;
  hasAccessToCoach: (coachId: string, coachTier: string, creatorId?: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  creator: null,
  isLoading: true,
  isInitialized: false,
  hasCompletedOnboarding: false,
  hasSeenWelcome: false,
  showUserIntentModal: false,
  purchasedCoachIds: [],
  purchasedCoaches: [],
  isAuthenticated: false,
  isCreator: false,

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
          // Fetch full user profile with creator status
          // Token is now guaranteed to be in memory cache
          try {
            const { user: fullUser, creator } = await api.getCurrentUser();
            set({
              user: fullUser as User,
              creator,
              isAuthenticated: true,
              isCreator: creator?.isCreator || false,
              hasCompletedOnboarding: (fullUser as any)?.hasCompletedOnboarding || false,
            });
          } catch (error) {
            // If API call fails, still set basic user info from auth service
            console.error('Failed to fetch full user profile:', error);
            set({
              user: user as User,
              creator: null,
              isAuthenticated: true,
              isCreator: false,
              hasCompletedOnboarding: false,
            });
          }

          // Initialize RevenueCat with user ID
          await revenuecat.initializeRevenueCat(user.id);

          // Load purchased coaches
          try {
            const { coachIds, coaches } = await api.getPurchasedCoaches();
            set({ purchasedCoachIds: coachIds, purchasedCoaches: coaches || [] });
          } catch (e) {
            console.error('Error loading purchased coaches:', e);
          }
        } else {
          // Tokens are invalid, clear them
          await authService.clearTokens();
          await revenuecat.initializeRevenueCat();
        }
      } else {
        // Initialize RevenueCat anonymously
        await revenuecat.initializeRevenueCat();

        // Reset hasSeenWelcome for non-authenticated users
        // This ensures they always see the welcome screen when opening the app
        await authService.setHasSeenWelcome(false);
        set({ hasSeenWelcome: false });
      }

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
      const { user: fullUser, creator } = await api.getCurrentUser();
      set({
        user: fullUser as User,
        creator,
        isAuthenticated: true,
        isCreator: creator?.isCreator || false,
        // New users start with hasCompletedOnboarding: false
        hasCompletedOnboarding: false,
        // Show user intent modal for new signups
        showUserIntentModal: true,
      });

      // Mark welcome as seen (so they don't see the welcome screen again)
      await authService.setHasSeenWelcome(true);
      set({ hasSeenWelcome: true });

      // Initialize RevenueCat with user ID
      await revenuecat.identifyUser(user.id);

      // Load purchased coaches (new users won't have any)
      set({ purchasedCoachIds: [], purchasedCoaches: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.login(email, password);

      // Fetch full profile
      const { user: fullUser, creator } = await api.getCurrentUser();
      set({
        user: fullUser as User,
        creator,
        isAuthenticated: true,
        isCreator: creator?.isCreator || false,
        hasCompletedOnboarding: (fullUser as any)?.hasCompletedOnboarding || false,
      });

      // Mark welcome as seen (user has completed onboarding)
      await authService.setHasSeenWelcome(true);
      set({ hasSeenWelcome: true });

      // Initialize RevenueCat with user ID
      await revenuecat.identifyUser(user.id);

      // Load purchased coaches for returning users
      try {
        const { coachIds, coaches } = await api.getPurchasedCoaches();
        set({ purchasedCoachIds: coachIds, purchasedCoaches: coaches || [] });
      } catch (e) {
        console.error('Error loading purchased coaches:', e);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      await revenuecat.logoutUser();
      set({
        user: null,
        creator: null,
        isAuthenticated: false,
        isCreator: false,
        hasCompletedOnboarding: false,
        purchasedCoachIds: [],
        purchasedCoaches: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const { user, creator } = await api.getCurrentUser();
      set({
        user: user as User,
        creator,
        isAuthenticated: !!user,
        isCreator: creator?.isCreator || false,
        hasCompletedOnboarding: (user as any)?.hasCompletedOnboarding || false,
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

  setShowUserIntentModal: (show: boolean) => {
    set({ showUserIntentModal: show });
  },

  loadPurchasedCoaches: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) {
      set({ purchasedCoachIds: [], purchasedCoaches: [] });
      return;
    }

    try {
      const { coachIds, coaches } = await api.getPurchasedCoaches();
      set({ purchasedCoachIds: coachIds, purchasedCoaches: coaches || [] });
    } catch (error) {
      console.error('Error loading purchased coaches:', error);
    }
  },

  addPurchasedCoach: (coachId: string) => {
    set((state) => ({
      purchasedCoachIds: [...state.purchasedCoachIds, coachId],
    }));
  },

  hasAccessToCoach: (coachId: string, coachTier: string, creatorId?: string) => {
    const { user, purchasedCoachIds, isAuthenticated } = get();

    // Not authenticated - no lifetime access
    if (!isAuthenticated || !user) {
      return false;
    }

    // Free coaches are accessible to any authenticated user
    if (coachTier?.toUpperCase?.() === 'FREE') {
      return true;
    }

    // User is the creator of this coach
    if (creatorId && creatorId === user.id) {
      return true;
    }

    // User has purchased this specific coach
    if (purchasedCoachIds.includes(coachId)) {
      return true;
    }

    return false;
  },
}));
