import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  HomeIcon,
  SearchIcon,
  PlusIcon,
  MessageIcon,
  UserIcon,
} from './ui/Icons';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - Easy to tweak
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Container
  bottomMargin: 8,
  horizontalMargin: 16,
  containerHeight: 72,
  containerRadius: 32,
  containerPaddingHorizontal: 8,

  // Glass effect
  glassBackground: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  blurIntensity: 80,

  // Shadow (iOS)
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffsetY: 8,

  // Android elevation
  androidElevation: 12,

  // Icon
  iconSize: 24,
  iconStrokeActive: 2,
  iconStrokeInactive: 1.5,

  // Label
  labelFontSize: 11,
  labelFontWeight: '500' as const,
  iconLabelSpacing: 4,

  // Active pill highlight
  activePillWidth: 56,
  activePillHeight: 56,
  activePillRadius: 20,
  activePillBackground: 'rgba(255, 255, 255, 1)',
  activePillShadowOpacity: 0.12,
  activePillShadowRadius: 8,
  activeIconScale: 1.05,

  // Badge
  badgeSize: 18,
  badgeBackground: '#FF3B30',
  badgeTextColor: '#FFFFFF',
  badgeFontSize: 11,
  badgeOffsetX: 8,
  badgeOffsetY: -4,
};

// ═══════════════════════════════════════════════════════════════════════════
// COLORS - Matching UI Design Spec V1
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Primary palette (from spec)
  sage: '#6F8F79',
  sageDark: '#4F6F5A',
  sageLight: '#DCE9DF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Active state - using sage theme
  activeColor: '#4F6F5A',
  inactiveColor: '#374151', // Much darker gray for strong contrast
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabName = 'index' | 'explore' | 'create' | 'history' | 'profile';

interface TabConfig {
  key: TabName;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  badge?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TABS: TabConfig[] = [
  { key: 'index', label: 'Home', icon: HomeIcon },
  { key: 'explore', label: 'Explore', icon: SearchIcon },
  { key: 'create', label: 'Create', icon: PlusIcon },
  { key: 'history', label: 'Chats', icon: MessageIcon },
  { key: 'profile', label: 'Profile', icon: UserIcon },
];

// ═══════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TabItemProps {
  tab: TabConfig;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ tab, focused, onPress, onLongPress }: TabItemProps) {
  const IconComponent = tab.icon;
  const iconColor = focused ? COLORS.activeColor : COLORS.inactiveColor;
  const labelColor = focused ? COLORS.activeColor : COLORS.inactiveColor;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(focused ? CONFIG.activeIconScale : 1, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }],
    };
  }, [focused]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.label}
    >
      {/* Active pill highlight */}
      {focused && (
        <View style={styles.activePill} />
      )}

      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <IconComponent
          size={CONFIG.iconSize}
          color={iconColor}
          strokeWidth={focused ? CONFIG.iconStrokeActive : CONFIG.iconStrokeInactive}
        />
        {tab.badge !== undefined && tab.badge > 0 && (
          <Badge count={tab.badge} />
        )}
      </Animated.View>

      <Text
        style={[
          styles.label,
          { color: labelColor },
          focused && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING TAB BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface FloatingTabBarProps extends BottomTabBarProps {
  badges?: Partial<Record<TabName, number>>;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  badges = {},
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding - just enough to clear the home indicator
  // On devices with home indicator, use minimal padding above safe area
  // On devices without, use a small fixed margin
  const bottomPadding = insets.bottom > 0
    ? insets.bottom - 8  // Tuck it slightly into the safe area
    : CONFIG.bottomMargin;

  const handleTabPress = (route: { name: string; key: string }, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleTabLongPress = (route: { key: string }) => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  // Get tabs with their badges
  const tabsWithBadges = TABS.map((tab) => ({
    ...tab,
    badge: badges[tab.key],
  }));

  const TabBarContent = (
    <View style={styles.tabBarContent}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = tabsWithBadges.find((t) => t.key === route.name);

        if (!tab) return null;

        return (
          <TabItem
            key={route.key}
            tab={tab}
            focused={isFocused}
            onPress={() => handleTabPress(route, isFocused)}
            onLongPress={() => handleTabLongPress(route)}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottomPadding },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBarWrapper}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={CONFIG.blurIntensity}
            tint="light"
            style={styles.blurContainer}
          >
            {TabBarContent}
          </BlurView>
        ) : (
          <View style={[styles.blurContainer, styles.androidFallback]}>
            {TabBarContent}
          </View>
        )}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: CONFIG.horizontalMargin,
  },

  tabBarWrapper: {
    borderRadius: CONFIG.containerRadius,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: CONFIG.shadowColor,
    shadowOffset: { width: 0, height: CONFIG.shadowOffsetY },
    shadowOpacity: CONFIG.shadowOpacity,
    shadowRadius: CONFIG.shadowRadius,
    // Android elevation
    elevation: CONFIG.androidElevation,
  },

  blurContainer: {
    borderRadius: CONFIG.containerRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CONFIG.glassBorder,
  },

  androidFallback: {
    backgroundColor: CONFIG.glassBackground,
  },

  tabBarContent: {
    flexDirection: 'row',
    height: CONFIG.containerHeight,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: CONFIG.containerPaddingHorizontal,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : undefined,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },

  activePill: {
    position: 'absolute',
    width: CONFIG.activePillWidth,
    height: CONFIG.activePillHeight,
    backgroundColor: CONFIG.activePillBackground,
    borderRadius: CONFIG.activePillRadius,
    // Active pill shadow
    shadowColor: CONFIG.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: CONFIG.activePillShadowOpacity,
    shadowRadius: CONFIG.activePillShadowRadius,
    elevation: 4,
  },

  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  label: {
    fontSize: CONFIG.labelFontSize,
    fontWeight: CONFIG.labelFontWeight,
    marginTop: CONFIG.iconLabelSpacing,
    zIndex: 1,
  },

  labelActive: {
    fontWeight: '600',
  },

  badge: {
    position: 'absolute',
    top: CONFIG.badgeOffsetY,
    right: CONFIG.badgeOffsetX,
    minWidth: CONFIG.badgeSize,
    height: CONFIG.badgeSize,
    borderRadius: CONFIG.badgeSize / 2,
    backgroundColor: CONFIG.badgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },

  badgeText: {
    color: CONFIG.badgeTextColor,
    fontSize: CONFIG.badgeFontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT TAB BAR HEIGHT FOR CONTENT PADDING
// ═══════════════════════════════════════════════════════════════════════════

export const TAB_BAR_HEIGHT = CONFIG.containerHeight + CONFIG.bottomMargin;

export default FloatingTabBar;
