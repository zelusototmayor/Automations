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
// CONFIGURATION - Clean, professional design
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Container
  bottomMargin: 0,
  horizontalMargin: 0,
  containerHeight: 60,
  containerRadius: 0,
  containerPaddingHorizontal: 8,

  // Background - clean white
  background: '#FFFFFF',
  borderColor: '#E5E7EB',

  // Icon
  iconSize: 24,
  iconStrokeActive: 2,
  iconStrokeInactive: 1.5,

  // Label
  labelFontSize: 11,
  labelFontWeight: '500' as const,
  iconLabelSpacing: 4,

  // Animation
  activeIconScale: 1.0, // No scale on active

  // Badge
  badgeSize: 18,
  badgeBackground: '#FF3B30',
  badgeTextColor: '#FFFFFF',
  badgeFontSize: 11,
  badgeOffsetX: 8,
  badgeOffsetY: -4,
};

// ═══════════════════════════════════════════════════════════════════════════
// COLORS - NEUTRAL BASE WITH SAGE ACCENT
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Active state - sage green accent
  activeColor: '#4A7C59',

  // Inactive state - neutral gray
  inactiveColor: '#9CA3AF',
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
        {TabBarContent}
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
    backgroundColor: CONFIG.background,
    borderTopWidth: 1,
    borderTopColor: CONFIG.borderColor,
  },

  tabBarContent: {
    flexDirection: 'row',
    height: CONFIG.containerHeight,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: CONFIG.containerPaddingHorizontal,
    backgroundColor: CONFIG.background,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
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
