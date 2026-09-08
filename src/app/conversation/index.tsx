/**
 * Màn chọn chủ đề luyện hội thoại.
 *
 * Màn hình cố ý giữ MỎNG theo quy ước dự án: chỉ nạp dữ liệu, ghép layout và
 * điều hướng. Toàn bộ phần trình bày nằm trong `components/conversation/`.
 */

import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { StaggeredList } from "@/components/ui/staggered-list";
import { CustomTopicCard, TopicCard } from "@/components/conversation";
import { conversationApi } from "@/services/api/conversation";
import { useTheme } from "@/contexts/theme-context";
import { CUSTOM_TOPIC_ID } from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationTopic } from "@/types/conversation";

const TRANSLATION_PREF_KEY = "@nihongo_conversation_show_translation";

export default function ConversationTopicListScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedTopics, savedPref] = await Promise.all([
        conversationApi.getTopics(),
        AsyncStorage.getItem(TRANSLATION_PREF_KEY),
      ]);
      setTopics(fetchedTopics);
      if (savedPref !== null) {
        setShowTranslation(savedPref === "true");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được danh sách.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleTranslation = async (value: boolean) => {
    setShowTranslation(value);
    await AsyncStorage.setItem(TRANSLATION_PREF_KEY, String(value));
  };

  const openTopic = (topic: ConversationTopic) =>
    router.push(
      `/conversation/${topic.id}?showTranslation=${showTranslation}` as never,
    );

  /**
   * Chủ đề tự nhập đi qua CÙNG một route với chủ đề dựng sẵn, chỉ khác ở tham
   * số truy vấn. Nhờ vậy màn hội thoại không phải biết hai luồng khác nhau.
   */
  const openCustomTopic = (text: string) =>
    router.push(
      `/conversation/${CUSTOM_TOPIC_ID}?topic=${encodeURIComponent(text)}&showTranslation=${showTranslation}` as never,
    );

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
        <AnimatedPressable
          onPress={() => router.back()}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Luyện hội thoại
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.intro,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.introIcon}>
            <Ionicons name="chatbubbles" size={28} color={Colors.primary} />
          </View>
          <View style={styles.introBody}>
            <Text style={[styles.introTitle, { color: colors.text }]}>
              Nói chuyện với người Nhật
            </Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
              Mỗi phiên 1:30 phút (90 giây). Hết giờ, AI sẽ chỉ ra lỗi của bạn
              và cách nói tự nhiên hơn.
            </Text>
          </View>
        </View>

        {/* Tuỳ chọn bật/tắt bản dịch tiếng Việt trước khi vào hội thoại */}
        <View
          style={[
            styles.optionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.optionIconBox,
              { backgroundColor: Colors.primary + "18" },
            ]}
          >
            <Ionicons name="language" size={22} color={Colors.primary} />
          </View>
          <View style={styles.optionBody}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Hiện bản dịch tiếng Việt
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
              Dịch câu tiếng Nhật (chạm vào câu để xem khi tắt)
            </Text>
          </View>
          <Switch
            value={showTranslation}
            onValueChange={handleToggleTranslation}
            trackColor={{ false: colors.border, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.centerText, { color: colors.textSecondary }]}>
              Đang tải chủ đề…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={[styles.centerText, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <AnimatedPressable
              onPress={load}
              pressScale={0.95}
              accessibilityRole="button"
              accessibilityLabel="Thử lại"
              style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </AnimatedPressable>
          </View>
        ) : (
          <>
            {/*
              Đặt TRƯỚC danh sách: chủ đề tự do là thứ kiến trúc FSM cũ không
              làm được, và cũng là lý do đáng giá nhất để chuyển sang LLM.
            */}
            <CustomTopicCard onStart={openCustomTopic} />

            <StaggeredList staggerDelay={70}>
              {topics.map((topic: ConversationTopic) => (
                <TopicCard key={topic.id} topic={topic} onPress={openTopic} />
              ))}
            </StaggeredList>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.twelve,
  },
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBody: { flex: 1 },
  optionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  optionDesc: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    lineHeight: 16,
    marginTop: 2,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary + "15",
  },
  introBody: { flex: 1 },
  introTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  introDesc: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 19,
    marginTop: 2,
  },
  centerBox: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.twelve,
  },
  centerText: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.six,
  },
  retryButton: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.full,
  },
  retryText: {
    fontFamily: Fonts.rounded,
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
});
