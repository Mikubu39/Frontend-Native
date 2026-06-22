/**
 * Tab Layout - Redesigned to support Duolingo's 6 bottom tabs
 * Order: Học, Leaderboard, Nhiệm vụ hàng ngày, Cửa hàng, Bảng tin, Profile
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

function TabIcon({ icon, color, active }: { icon: string; color: string; active: boolean }) {
  return (
    <Text style={[styles.icon, { color }, active && styles.activeIcon]}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarShowLabel: false, // Hide labels like in Duolingo
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Học',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="🏠" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="🛡️" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Nhiệm vụ',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="🎯" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cửa hàng',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="🛒" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Bảng tin',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="💟" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, focused }) => <TabIcon icon="👤" color={color} active={focused} />,
        }}
      />
      {/* Hide the old dictionary screen from bottom navigation tab bar */}
      <Tabs.Screen
        name="dictionary"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.lockedBg,
    borderTopWidth: 2,
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  activeIcon: {
    transform: [{ scale: 1.15 }],
  },
});
