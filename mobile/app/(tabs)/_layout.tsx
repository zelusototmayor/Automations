import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../src/components/FloatingTabBar';

// ═══════════════════════════════════════════════════════════════════════════
// TAB LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export default function TabLayout() {
  // Optional: Define badges for tabs (e.g., unread messages count)
  // You can connect this to your state management (Zustand, etc.)
  const badges = {
    // history: 3, // Example: 3 unread chats
  };

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} badges={badges} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Chats',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
