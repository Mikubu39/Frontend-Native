/**
 * Tab Layout – Custom bottom navigation bar.
 *
 * Design philosophy (impeccable):
 *  - Edge-to-edge solid bar anchored to the bottom — no floating pill artifact.
 *  - Active tab: icon + label inside a tight tinted capsule.
 *  - Inactive tab: icon only, slightly muted — keeps the bar lean.
 *  - Thin 1px brand-tinted top border grounds the bar without a heavy shadow.
 *  - Solid, fully opaque background on all platforms — no blur/frosted look.
 *  - Motion: tight spring, no carnival bounce.
 */

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SpotlightTarget } from "@/components/tutorial";
import { TabItem } from "@/components/ui/tab-item";
import { MoreBottomSheet } from "@/components/ui/more-bottom-sheet";
import { useTheme } from "@/contexts/theme-context";
import { Colors, Spacing } from "@/constants/theme";
import type { TutorialTargetId } from "@/types";

// ------------------------------------------------------------------
// Tab meta — order determines visual order in the bar
// ------------------------------------------------------------------
const TABS = [
  {
    name: "index",
    label: "Học",
    icon: "home-outline" as const,
    iconActive: "home" as const,
  },
  {
    name: "leaderboard",
    label: "Xếp hạng",
    icon: "trophy-outline" as const,
    iconActive: "trophy" as const,
    tutorialTarget: "tab-leaderboard" as const,
  },
  {
    name: "search",
    label: "Cửa hàng",
    icon: "storefront-outline" as const,
    iconActive: "storefront" as const,
    tutorialTarget: "tab-shop" as const,
  },
  {
    name: "quests",
    label: "Nhiệm vụ",
    icon: "flag-outline" as const,
    iconActive: "flag" as const,
    tutorialTarget: "tab-quests" as const,
  },
  {
    name: "feed",
    label: "Bạn bè",
    icon: "people-outline" as const,
    iconActive: "people" as const,
    tutorialTarget: "tab-friends" as const,
  },
  {
    name: "more",
    label: "Thêm",
    icon: "grid-outline" as const,
    iconActive: "grid" as const,
    tutorialTarget: "tab-more" as const,
  },
] as const;

// ------------------------------------------------------------------
// CustomTabBar — receives React Navigation state from <Tabs tabBar>
// ------------------------------------------------------------------
interface CustomTabBarInternalProps extends BottomTabBarProps {
  onMorePress: () => void;
}

function CustomTabBar({
  state,
  navigation,
  onMorePress,
}: CustomTabBarInternalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const barPaddingBottom = Math.max(insets.bottom, 8);
  const barHeight = 56 + barPaddingBottom;

  return (
    <View
      style={[
        styles.barWrapper,
        { height: barHeight, paddingBottom: barPaddingBottom },
      ]}
      accessibilityRole="tablist"
    >
      {/* Background layer — solid, fully opaque */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]}
      />

      {/* Top rule */}
      <View
        style={[
          styles.topBorder,
          {
            backgroundColor: isDark ? colors.border : Colors.primary + "28",
          },
        ]}
      />

      {/* Tab items */}
      <View style={styles.itemsRow}>
        {TABS.map((tab) => {
          // Find the matching React Navigation route
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const focused = routeIndex !== -1 && state.index === routeIndex;

          const handlePress = () => {
            if (tab.name === "more") {
              onMorePress();
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[routeIndex]?.key ?? tab.name,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented && routeIndex !== -1) {
              navigation.navigate(tab.name);
            }
          };

          const handleLongPress = () => {
            if (routeIndex !== -1) {
              navigation.emit({
                type: "tabLongPress",
                target: state.routes[routeIndex]?.key ?? tab.name,
              });
            }
          };

          const item = (
            <TabItem
              iconName={tab.icon}
              iconNameActive={tab.iconActive}
              label={tab.label}
              focused={focused}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          );

          // Vài tab là mốc của tour hướng dẫn — bọc thêm một lớp đo toạ độ.
          const tutorialTarget = (tab as { tutorialTarget?: TutorialTargetId })
            .tutorialTarget;

          return tutorialTarget ? (
            <SpotlightTarget
              key={tab.name}
              targetId={tutorialTarget}
              style={styles.tabSlot}
            >
              {item}
            </SpotlightTarget>
          ) : (
            <React.Fragment key={tab.name}>{item}</React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ------------------------------------------------------------------
// Layout
// ------------------------------------------------------------------
export default function TabLayout() {
  const [moreSheetVisible, setMoreSheetVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onMorePress={() => setMoreSheetVisible(true)}
          />
        )}
      >
        {/* Visible tabs */}
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.label }}
          />
        ))}

        {/* Hidden — not in the bar */}
        <Tabs.Screen name="review" options={{ href: null }} />
        <Tabs.Screen name="characters" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="dictionary" options={{ href: null }} />
      </Tabs>

      <MoreBottomSheet
        visible={moreSheetVisible}
        onClose={() => setMoreSheetVisible(false)}
      />
    </>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  topBorder: {
    height: 1,
    width: "100%",
  },
  itemsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
  },
  // `TabItem` tự có `flex: 1`; lớp bọc phải nhận lại flex đó để bố cục không lệch.
  tabSlot: {
    flex: 1,
  },
});
