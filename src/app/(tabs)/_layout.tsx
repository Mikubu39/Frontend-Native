/**
 * Tab Layout - Bottom tab navigator
 * Tabs: Learn, Search, Review, Dictionary, More
 */

import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontSizes, FontWeights } from '@/constants/theme';

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{icon}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.lockedBg,
          height: 65,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <TabIcon icon="📚" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color }) => <TabIcon icon="🔄" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: 'Dictionary',
          tabBarIcon: ({ color }) => <TabIcon icon="📖" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <TabIcon icon="⋯" color={color} />,
        }}
      />
    </Tabs>
  );
}
