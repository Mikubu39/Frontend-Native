/**
 * Characters / Học Chữ Cái Screen - Enhanced with animated tab switching,
 * cell press animations, and animated preview panel entrance.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";

const { width } = Dimensions.get("window");
const GRID_CELL_SIZE = (width - 48 - 24) / 5; // 5 columns layout

interface Character {
  kana: string;
  romaji: string;
}

const HIRAGANA_DATA: Character[] = [
  { kana: "あ", romaji: "a" },
  { kana: "い", romaji: "i" },
  { kana: "う", romaji: "u" },
  { kana: "え", romaji: "e" },
  { kana: "お", romaji: "o" },
  { kana: "か", romaji: "ka" },
  { kana: "き", romaji: "ki" },
  { kana: "く", romaji: "ku" },
  { kana: "け", romaji: "ke" },
  { kana: "こ", romaji: "ko" },
  { kana: "さ", romaji: "sa" },
  { kana: "し", romaji: "shi" },
  { kana: "す", romaji: "su" },
  { kana: "せ", romaji: "se" },
  { kana: "そ", romaji: "so" },
  { kana: "た", romaji: "ta" },
  { kana: "ち", romaji: "chi" },
  { kana: "つ", romaji: "tsu" },
  { kana: "て", romaji: "te" },
  { kana: "と", romaji: "to" },
  { kana: "な", romaji: "na" },
  { kana: "に", romaji: "ni" },
  { kana: "ぬ", romaji: "nu" },
  { kana: "ね", romaji: "ne" },
  { kana: "の", romaji: "no" },
  { kana: "は", romaji: "ha" },
  { kana: "ひ", romaji: "hi" },
  { kana: "ふ", romaji: "fu" },
  { kana: "へ", romaji: "he" },
  { kana: "ほ", romaji: "ho" },
  { kana: "ま", romaji: "ma" },
  { kana: "み", romaji: "mi" },
  { kana: "む", romaji: "mu" },
  { kana: "め", romaji: "me" },
  { kana: "も", romaji: "mo" },
  { kana: "や", romaji: "ya" },
  { kana: "", romaji: "" },
  { kana: "ゆ", romaji: "yu" },
  { kana: "", romaji: "" },
  { kana: "よ", romaji: "yo" },
  { kana: "ら", romaji: "ra" },
  { kana: "り", romaji: "ri" },
  { kana: "る", romaji: "ru" },
  { kana: "れ", romaji: "re" },
  { kana: "ろ", romaji: "ro" },
  { kana: "わ", romaji: "wa" },
  { kana: "", romaji: "" },
  { kana: "", romaji: "" },
  { kana: "", romaji: "" },
  { kana: "を", romaji: "wo" },
  { kana: "ん", romaji: "n" },
];

const KATAKANA_DATA: Character[] = [
  { kana: "ア", romaji: "a" },
  { kana: "イ", romaji: "i" },
  { kana: "ウ", romaji: "u" },
  { kana: "エ", romaji: "e" },
  { kana: "オ", romaji: "o" },
  { kana: "カ", romaji: "ka" },
  { kana: "キ", romaji: "ki" },
  { kana: "ク", romaji: "ku" },
  { kana: "ケ", romaji: "ke" },
  { kana: "コ", romaji: "ko" },
  { kana: "サ", romaji: "sa" },
  { kana: "シ", romaji: "shi" },
  { kana: "ス", romaji: "su" },
  { kana: "セ", romaji: "se" },
  { kana: "ソ", romaji: "so" },
  { kana: "タ", romaji: "ta" },
  { kana: "チ", romaji: "chi" },
  { kana: "ツ", romaji: "tsu" },
  { kana: "テ", romaji: "te" },
  { kana: "ト", romaji: "to" },
  { kana: "ナ", romaji: "na" },
  { kana: "ニ", romaji: "ni" },
  { kana: "ヌ", romaji: "nu" },
  { kana: "ネ", romaji: "ne" },
  { kana: "ノ", romaji: "no" },
  { kana: "ハ", romaji: "ha" },
  { kana: "ヒ", romaji: "hi" },
  { kana: "フ", romaji: "fu" },
  { kana: "ヘ", romaji: "he" },
  { kana: "ホ", romaji: "ho" },
  { kana: "マ", romaji: "ma" },
  { kana: "ミ", romaji: "mi" },
  { kana: "ム", romaji: "mu" },
  { kana: "メ", romaji: "me" },
  { kana: "モ", romaji: "mo" },
  { kana: "ヤ", romaji: "ya" },
  { kana: "", romaji: "" },
  { kana: "ユ", romaji: "yu" },
  { kana: "", romaji: "" },
  { kana: "ヨ", romaji: "yo" },
  { kana: "ラ", romaji: "ra" },
  { kana: "リ", romaji: "ri" },
  { kana: "ル", romaji: "ru" },
  { kana: "レ", romaji: "re" },
  { kana: "ロ", romaji: "ro" },
  { kana: "ワ", romaji: "wa" },
  { kana: "", romaji: "" },
  { kana: "", romaji: "" },
  { kana: "", romaji: "" },
  { kana: "ヲ", romaji: "wo" },
  { kana: "ン", romaji: "n" },
];

export default function CharactersScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">(
    "hiragana",
  );
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const currentData = activeTab === "hiragana" ? HIRAGANA_DATA : KATAKANA_DATA;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header Tabs */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: isDark ? "#232338" : Colors.cream },
          ]}
        >
          <AnimatedPressable
            style={[
              styles.tabButton,
              activeTab === "hiragana" && [
                styles.activeTabButton,
                { backgroundColor: colors.card },
              ],
            ]}
            onPress={() => {
              setActiveTab("hiragana");
              setSelectedChar(null);
            }}
            pressScale={0.97}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === "hiragana" && styles.activeTabText,
              ]}
            >
              Hiragana (あ)
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[
              styles.tabButton,
              activeTab === "katakana" && [
                styles.activeTabButton,
                { backgroundColor: colors.card },
              ],
            ]}
            onPress={() => {
              setActiveTab("katakana");
              setSelectedChar(null);
            }}
            pressScale={0.97}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === "katakana" && styles.activeTabText,
              ]}
            >
              Katakana (ア)
            </Text>
          </AnimatedPressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Detail Preview Panel */}
        {selectedChar ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.previewPanel,
              { backgroundColor: colors.card, borderColor: Colors.primary },
            ]}
          >
            <View
              style={[
                styles.previewHeader,
                { borderBottomColor: colors.borderSubtle },
              ]}
            >
              <Text style={styles.previewLabel}>KÝ TỰ ĐANG CHỌN</Text>
              <AnimatedPressable
                onPress={() => setSelectedChar(null)}
                pressScale={0.9}
              >
                <View
                  style={[
                    styles.closeCircle,
                    { backgroundColor: isDark ? "#2A2A3E" : Colors.lockedBg },
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </AnimatedPressable>
            </View>
            <View style={styles.previewBody}>
              <View
                style={[
                  styles.bigCharContainer,
                  { backgroundColor: isDark ? "#232338" : Colors.cream },
                ]}
              >
                <Text style={styles.bigChar}>{selectedChar.kana}</Text>
              </View>
              <View style={styles.charInfo}>
                <Text style={[styles.romajiLabel, { color: colors.text }]}>
                  Phiên âm: /{selectedChar.romaji}/
                </Text>
                <AnimatedPressable
                  style={styles.audioBtn}
                  onPress={() => {}}
                  pressScale={0.95}
                >
                  <Ionicons
                    name="volume-medium"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.audioEmoji}>Nghe phát âm</Text>
                </AnimatedPressable>
              </View>
            </View>
          </Animated.View>
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
              Chạm vào bất kỳ chữ cái nào để xem chi tiết cách phiên âm, nghe
              phát âm mẫu và học viết!
            </Text>
          </Animated.View>
        )}

        {/* Character Grid */}
        <View style={styles.grid}>
          {currentData.map((item, index) => {
            if (!item.kana) {
              // Empty spacer cell
              return <View key={`empty-${index}`} style={styles.emptyCell} />;
            }

            const isSelected = selectedChar?.kana === item.kana;

            return (
              <AnimatedPressable
                key={item.kana}
                style={[
                  styles.cell,
                  { backgroundColor: colors.card },
                  isSelected && [
                    styles.selectedCell,
                    { backgroundColor: isDark ? "#2A2A44" : "#F5F3FF" },
                  ],
                ]}
                onPress={() => setSelectedChar(item)}
                pressScale={0.92}
              >
                <Text
                  style={[
                    styles.cellKana,
                    { color: colors.text },
                    isSelected && styles.selectedCellText,
                  ]}
                >
                  {item.kana}
                </Text>
                <Text
                  style={[
                    styles.cellRomaji,
                    { color: colors.textSecondary },
                    isSelected && styles.selectedRomaji,
                  ]}
                >
                  {item.romaji}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    ...Shadows.sm,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.cream,
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
    backgroundColor: "#FFFFFF",
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primaryDark,
    fontWeight: FontWeights.extrabold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    gap: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  previewPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.five,
    ...Shadows.glow(Colors.primary),
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
    paddingBottom: 8,
    marginBottom: Spacing.four,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 26,
    backgroundColor: Colors.lockedBg,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.six,
  },
  bigCharContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  bigChar: {
    fontSize: 52,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
  },
  charInfo: {
    flex: 1,
    gap: 10,
  },
  romajiLabel: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  audioBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    ...Shadows.glow(Colors.primary),
  },
  audioEmoji: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between",
  },
  cell: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE + 10,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#F5F3FF",
    ...Shadows.glow(Colors.primary),
  },
  cellKana: {
    fontSize: 24,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  selectedCellText: {
    color: Colors.primaryDark,
  },
  cellRomaji: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedRomaji: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  emptyCell: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE + 10,
    backgroundColor: "transparent",
  },
});
