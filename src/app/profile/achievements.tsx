import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/theme-context";
import { achievementsApi } from "@/services/api";
import { AchievementResponse } from "@/types/api";
import { AchievementMedal } from "@/components/profile/achievement-medal";
import { getAchievementIconStyle } from "@/utils/achievement-icon";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      achievementsApi
        .getMyAchievements()
        .then((data) => {
          if (isMounted) {
            setAchievements(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, []),
  );

  const renderItem = ({ item }: { item: AchievementResponse }) => {
    const iconStyle = getAchievementIconStyle(item.code);
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <AchievementMedal
          icon={iconStyle.icon}
          iconColor={iconStyle.color}
          ringGradient={["#D9AC5C", "#C4922E"]}
          locked={!item.unlocked}
          caption={
            item.unlocked ? undefined : `${item.progress}/${item.threshold}`
          }
          surfaceColor={colors.background}
          lockedRing={colors.border}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
          {item.unlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>Đã hoàn thành</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: "Tất cả thành tích",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.achievementId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Chưa có thành tích nào.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.four,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: "800",
    marginBottom: 4,
  },
  description: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    lineHeight: 20,
  },
  unlockedBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "rgba(196, 146, 46, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  unlockedText: {
    color: "#C4922E",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.eight,
    fontSize: FontSizes.md,
  },
});
