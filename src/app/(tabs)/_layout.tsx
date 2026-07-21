/**
 * Tab Layout - Redesigned with larger kawaii icons, active labels,
 * refined tab bar styling with rounded corners and better shadows.
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { AnimatedTabIcon } from '@/components/ui/animated-tab-icon';
import { Colors, FontWeights, Shadows, BorderRadius, Spacing } from '@/constants/theme';

// Tab icon sizes
const ICON_SIZE = 28;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView 
            tint="light" 
            intensity={60} 
            style={styles.blurBackground} 
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Học',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName="home"
              focused={focused}
              size={ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Xếp hạng',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName="shield-alt"
              focused={focused}
              size={ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cửa hàng',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName="store"
              focused={focused}
              size={ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Bảng tin',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName="user-friends"
              focused={focused}
              size={ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Khác',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName="ellipsis-h"
              focused={focused}
              size={ICON_SIZE}
            />
          ),
        }}
      />
      {/* Hide internal screens from bottom tab bar */}
      <Tabs.Screen
        name="review"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
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
    position: 'absolute',
    bottom: Platform.select({ ios: Spacing.six, android: Spacing.four }),
    left: Spacing.four,
    right: Spacing.four,
    height: 68,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 0,
    elevation: 0,
    ...Shadows.lg,
    // Ensure shadow doesn't get cut off on Android
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    marginTop: -4,
    marginBottom: 6,
  },
});
