/**
 * Sổ tay Từ điển — các từ người học đã thật sự gặp trong bài.
 *
 * Trước đây màn này đọc `MOCK_WORDS`/`MOCK_PHRASES`: sáu từ cứng, nghĩa ghi bằng
 * TIẾNG ANH ("Sun", "Moon") trong một app dạy Nhật cho người Việt, và không liên
 * quan gì tới việc người dùng đã học được gì. Giờ nó đọc `/vocabulary/learned`,
 * tức đúng những từ đã mở khoá, kèm trạng thái ôn tập của từng từ.
 */

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { WordCard } from "@/components/dictionary/word-card";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";
import type { DictionaryEntry, VocabularyItem } from "@/types";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

const TABS = ["Tất cả", "Cần ôn"] as const;

/** Chiều cao cố định của thanh điều hướng đáy CustomTabBar */
const TAB_BAR_HEIGHT = 56;

/** Ghép mục kho từ về hình dạng mà `WordCard` đã dùng sẵn. */
function toEntry(item: VocabularyItem): DictionaryEntry {
  const normalizedRomaji = item.romaji
    ? item.romaji
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
    : "";
  const audioUrl =
    item.audioUrl ||
    (normalizedRomaji
      ? `/uploads/audios/words/${normalizedRomaji}.mp3`
      : undefined);

  return {
    id: String(item.id),
    kanji: item.surface,
    romaji: item.romaji ?? "",
    meaning: item.meaningVn,
    audioUrl,
  };
}

export default function DictionaryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await vocabularyApi.getLearned(100);
      setItems(res.items);
      setDueCount(res.dueCount);
      setError(null);
    } catch {
      setError(
        "Không tải được sổ tay. Kiểm tra kết nối rồi kéo xuống để thử lại.",
      );
    }
  }, []);

  // Theo TIÊU ĐIỂM chứ không theo vòng đời: sổ tay nằm trong `(tabs)` nên còn
  // sống mãi sau lần mở đầu. Học xong một bài là có từ mới, ôn xong một phiên
  // là cột "cần ôn" đổi — `useEffect` sẽ không bao giờ thấy những thay đổi đó.
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const visible = activeTab === 1 ? items.filter((i) => i.due) : items;
  const bottomPadding =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + Spacing.six;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Sổ tay của tôi
        </Text>
        {dueCount > 0 ? (
          <View style={styles.duePill}>
            <Ionicons name="time-outline" size={14} color={Colors.warning} />
            <Text style={styles.duePillText}>{dueCount} cần ôn</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(index)}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === index }}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
            {activeTab === index && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {visible.map((item) => (
            <WordCard key={item.id} entry={toEntry(item)} />
          ))}

          {visible.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {error ??
                (items.length === 0
                  ? "Chưa có từ nào. Học một bài để mở khoá từ đầu tiên nhé!"
                  : "Không có từ nào trong mục này.")}
            </Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.four,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
  },
  duePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.warning + "22",
  },
  duePillText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.warning,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.five,
    gap: Spacing.six,
  },
  tabItem: { paddingBottom: Spacing.two },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  tabTextActive: { color: Colors.primary },
  tabUnderline: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.eight,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
});
