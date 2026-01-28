import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as api from '../services/api';
import { useAuthStore } from '../stores/auth';

const colors = {
  sage: '#6F8F79',
  sageDark: '#4F6F5A',
  sageLight: '#DCE9DF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

interface ContextRefreshBannerProps {
  contextLastUpdatedAt?: string | null;
  contextNudgeDismissedAt?: string | null;
}

// Check if context is stale (more than 30 days old)
function isContextStale(contextLastUpdatedAt?: string | null): boolean {
  if (!contextLastUpdatedAt) return true;

  const lastUpdated = new Date(contextLastUpdatedAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return lastUpdated < thirtyDaysAgo;
}

// Check if nudge was dismissed within the last 7 days
function wasRecentlyDismissed(contextNudgeDismissedAt?: string | null): boolean {
  if (!contextNudgeDismissedAt) return false;

  const dismissedAt = new Date(contextNudgeDismissedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return dismissedAt > sevenDaysAgo;
}

export function ContextRefreshBanner({
  contextLastUpdatedAt,
  contextNudgeDismissedAt,
}: ContextRefreshBannerProps) {
  const router = useRouter();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Don't show if context is fresh or nudge was recently dismissed
  if (!isContextStale(contextLastUpdatedAt) || wasRecentlyDismissed(contextNudgeDismissedAt)) {
    return null;
  }

  // Don't show if already hidden in this session
  if (isHidden) {
    return null;
  }

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await api.dismissContextNudge();
      await refreshUser();
      setIsHidden(true);
    } catch (error) {
      console.error('Failed to dismiss nudge:', error);
      // Still hide locally even if API fails
      setIsHidden(true);
    } finally {
      setIsDismissing(false);
    }
  };

  const handleUpdate = () => {
    router.push('/context');
  };

  return (
    <View
      className="mx-5 mb-4 p-4 rounded-xl"
      style={{
        backgroundColor: colors.sageLight,
        borderWidth: 1,
        borderColor: colors.sage,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text
            className="text-base font-inter-semibold mb-1"
            style={{ color: colors.textPrimary }}
          >
            Have your goals changed?
          </Text>
          <Text
            className="text-sm font-inter-regular"
            style={{ color: colors.textSecondary }}
          >
            Update your personal context to get more relevant coaching.
          </Text>
        </View>

        {/* Dismiss button */}
        <Pressable
          onPress={handleDismiss}
          disabled={isDismissing}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ opacity: isDismissing ? 0.5 : 1 }}
        >
          <Text
            className="text-lg font-inter-regular"
            style={{ color: colors.textSecondary }}
          >
            ×
          </Text>
        </Pressable>
      </View>

      {/* Update button */}
      <Pressable
        onPress={handleUpdate}
        className="mt-3 py-2 px-4 rounded-lg self-start"
        style={{ backgroundColor: colors.sage }}
      >
        <Text className="text-sm font-inter-semibold text-white">
          Update Context
        </Text>
      </Pressable>
    </View>
  );
}
