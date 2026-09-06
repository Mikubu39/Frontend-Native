/**
 * Characters / Học Chữ Cái Screen
 *
 * Ma trận bảng chữ cái lấy từ backend (`GET /api/v1/alphabets?type=...`),
 * tô màu theo `masteryLevel` và mở màn luyện tập spaced-repetition.
 */

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  AlphabetGrid,
  CharacterPreviewPanel,
  clampMasteryLevel,
} from "@/components/alphabet";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import { alphabetApi } from "@/services/api/alphabets";
import {
  AlphabetCharacter,
  AlphabetGroup,
  AlphabetType,
  MAX_MASTERY_LEVEL,
} from "@/types/alphabet";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

const { width } = Dimensions.get("window");
const COLUMNS = 5;
const GRID_GAP = 6;
/** Bề rộng dự phòng trước khi lưới được đo thật bằng onLayout. */
const FALLBACK_GRID_WIDTH = width - Spacing.five * 2;
/** Khớp với CustomTabBar trong (tabs)/_layout.tsx: 56 + max(insets.bottom, 8). */
const TAB_BAR_BASE_HEIGHT = 56;
/** Chiều cao footer chứa nút "Bắt đầu luyện tập" (padding + nút gradient). */
const FOOTER_HEIGHT = 80;

const TABS: { type: AlphabetType; label: string }[] = [
  { type: "HIRAGANA", label: "Hiragana (あ)" },
  { type: "KATAKANA", label: "Katakana (ア)" },
];

export default function CharactersScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPlaying, play } = useAudio();

  // Thanh tab nổi đè lên đáy màn hình -> footer phải kê lên đúng bằng chiều cao đó.
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 8);
  // Đo bề rộng thật thay vì tính từ Dimensions: đủ 5 ô mỗi hàng trên mọi bề
  // rộng màn hình (kể cả web, tablet, chia đôi màn hình).
  const [gridWidth, setGridWidth] = useState(FALLBACK_GRID_WIDTH);
  const cellSize = Math.floor((gridWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS);

  const [activeType, setActiveType] = useState<AlphabetType>("HIRAGANA");
  const [groups, setGroups] = useState<AlphabetGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlphabetCharacter | null>(null);
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await alphabetApi.getAlphabets(activeType);
        const nextGroups = Array.isArray(data) ? data : [];
        setGroups((prev) =>
          prev.length === nextGroups.length &&
          JSON.stringify(prev) === JSON.stringify(nextGroups)
            ? prev
            : nextGroups,
        );
      } catch (e) {
        if (!silent) {
          setGroups([]);
          setError(
            e instanceof Error ? e.message : "Không tải được bảng chữ cái.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [activeType],
  );

  // Tải lại mỗi khi màn hình được focus để tiến độ cập nhật ngay sau khi luyện tập.
  useFocusEffect(
    useCallback(() => {
      load(groups.length > 0);
    }, [load, groups.length]),
  );

  const characters = groups.flatMap((group) => group.characters);
  const levels = characters.map((character) =>
    clampMasteryLevel(character.masteryLevel),
  );
  // "Đã học" = đã luyện ít nhất 1 lần (viền bắt đầu sáng), "thành thạo" = mức tối đa.
  const learnedCount = levels.filter((level) => level > 0).length;
  const masteredCount = levels.filter(
    (level) => level >= MAX_MASTERY_LEVEL,
  ).length;

  const handleSelect = (character: AlphabetCharacter) => {
    setSelected(character);
    if (character.audioUrl) play(character.audioUrl);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.tabContainer,
            {
              backgroundColor: isDark ? colors.backgroundElement : Colors.cream,
            },
          ]}
        >
          {TABS.map((tab) => {
            const active = activeType === tab.type;
            return (
              <AnimatedPressable
                key={tab.type}
                style={[
                  styles.tabButton,
                  active && [
                    styles.activeTabButton,
                    { backgroundColor: colors.card },
                  ],
                ]}
                onPress={() => {
                  setActiveType(tab.type);
                  setSelected(null);
                }}
                pressScale={0.97}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    active && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + FOOTER_HEIGHT + Spacing.five },
        ]}
        onLayout={(event) =>
          setGridWidth(event.nativeEvent.layout.width - Spacing.five * 2)
        }
        showsVerticalScrollIndicator={false}
      >
        {selected ? (
          <CharacterPreviewPanel
            character={selected}
            isPlaying={isPlaying}
            onPlayAudio={() => play(selected.audioUrl ?? undefined)}
            onClose={() => setSelected(null)}
          />
        ) : (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.infoBanner,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="bulb" size={28} color={Colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Chạm vào một chữ cái để nghe phát âm. Viền càng sáng nghĩa là bạn
              càng thông thạo chữ đó.
            </Text>
          </Animated.View>
        )}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="cloud-offline" size={36} color={Colors.locked} />
            <Text style={[styles.stateText, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <GradientButton title="Thử lại" onPress={load} variant="outline" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={[styles.stateText, { color: colors.textSecondary }]}>
              Chưa có dữ liệu bảng chữ cái cho mục này.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryText, { color: colors.textSecondary }]}
              >
                Đã học {learnedCount}/{characters.length} · Thành thạo{" "}
                {masteredCount}/{characters.length}
              </Text>
            </View>
            <AlphabetGrid
              groups={groups}
              cellSize={cellSize}
              gap={GRID_GAP}
              columns={COLUMNS}
              selectedId={selected?.characterId ?? null}
              onSelect={handleSelect}
            />
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            bottom: tabBarHeight,
            backgroundColor: colors.card,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <GradientButton
          title="Bắt đầu luyện tập"
          onPress={() => router.push("/alphabet/practice")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderBottomWidth: 1,
    alignItems: "center",
    ...Shadows.sm,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.xl,
    padding: 4,
    width: "100%",
    maxWidth: 400,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  activeTabButton: {
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  activeTabText: {
    color: Colors.primaryDark,
    fontWeight: FontWeights.extrabold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    gap: Spacing.three,
    borderWidth: 1,
    ...Shadows.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  summaryRow: {
    marginBottom: Spacing.three,
  },
  summaryText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.eight,
  },
  stateText: {
    fontSize: FontSizes.sm,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderTopWidth: 1,
  },
});
