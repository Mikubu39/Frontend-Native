/**
 * Quiz Ready Screen — Impeccable redesign.
 * Dark/light theme-aware immersive pre-lesson briefing.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/gradient-button";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { LESSON_TIPS } from "@/data/quiz";
import { LEARNING_PATH } from "@/data/lessons";
import { useTheme } from "@/contexts/theme-context";

function ExampleRow({
  japanese,
  translation,
  delay,
}: {
  japanese: string;
  translation: string;
  delay: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const { colors, isDark } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <AnimatedPressable
        onPress={() => setRevealed(!revealed)}
        pressScale={0.97}
        style={[
          styles.exampleRow,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.04)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        <View style={styles.exampleContent}>
          <Text
            style={[
              styles.japaneseText,
              { color: isDark ? "#F9FAFB" : Colors.textPrimary },
            ]}
          >
            {japanese}
          </Text>
          <Text
            style={[
              styles.translationText,
              {
                color: revealed
                  ? isDark
                    ? Colors.primaryLight
                    : Colors.primaryDark
                  : isDark
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.2)",
                fontStyle: "italic",
              },
            ]}
          >
            {revealed ? translation : "Nhấn để xem nghĩa"}
          </Text>
        </View>
        <View
          style={[
            styles.revealBtn,
            {
              backgroundColor: revealed
                ? Colors.primary + "33"
                : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
            },
          ]}
        >
          <Ionicons
            name={revealed ? "eye" : "eye-off"}
            size={18}
            color={
              revealed
                ? Colors.primaryLight
                : isDark
                  ? "rgba(255,255,255,0.4)"
                  : Colors.textSecondary
            }
          />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function QuizReadyScreen() {
  const router = useRouter();
  const {
    lessonId = "lp1",
    title: lessonTitleParam,
    lessonType: lessonTypeParam,
  } = useLocalSearchParams<{
    lessonId: string;
    title?: string;
    lessonType?: string;
  }>();
  const { colors, isDark } = useTheme();

  const node = LEARNING_PATH.find((n) => n.id === lessonId);

  // Bài học thật lấy từ backend có id dạng số, không khớp với LEARNING_PATH
  // (dữ liệu mock id "lp1", "lp2"...). Trước đây mọi bài thật đều rơi vào nhánh
  // fallback và hiện lý thuyết của LESSON_TIPS.lp5 — nội dung hoàn toàn không
  // liên quan tới bài đang mở. Phần dạy thật giờ nằm trong màn hình học
  // (`TeachCardView`), nên ở đây chỉ hiện đúng tên bài.
  const isRemoteLesson = !node && !!lessonTitleParam;

  const isBoss = isRemoteLesson
    ? lessonTypeParam === "JUMP_TEST"
    : node?.nodeType === "boss";
  const isTheory = isRemoteLesson
    ? false
    : node?.nodeType === "theory" || !node?.nodeType;
  const isTopicReview = isRemoteLesson && lessonTypeParam === "TOPIC_REVIEW";

  const tip =
    LESSON_TIPS[lessonId as keyof typeof LESSON_TIPS] || LESSON_TIPS.lp5;

  const screenTitle = isRemoteLesson
    ? lessonTitleParam
    : isTheory
      ? tip.title
      : node?.title;

  const nodeTypeIcon = isBoss
    ? "trophy"
    : isTheory
      ? "bulb"
      : isTopicReview
        ? "sync"
        : "barbell";
  const nodeTypeLabel = isBoss
    ? "KIỂM TRA CHƯƠNG"
    : isRemoteLesson
      ? isTopicReview
        ? "BÀI ÔN TẬP"
        : "BÀI HỌC"
      : isTheory
        ? "BÀI HỌC"
        : "LUYỆN TẬP";
  const ctaLabel = isBoss ? "BẮT ĐẦU KIỂM TRA" : "BẮT ĐẦU";

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
    >
      {/* Ambient glow orbs — dark mode only */}
      {isDark && (
        <>
          <View style={styles.orbTopLeft} pointerEvents="none" />
          <View style={styles.orbBottomRight} pointerEvents="none" />
        </>
      )}

      {/* Back button */}
      <AnimatedPressable
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
          },
        ]}
        pressScale={0.9}
        accessibilityLabel="Quay lại"
        accessibilityRole="button"
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={isDark ? "rgba(255,255,255,0.8)" : Colors.textPrimary}
        />
      </AnimatedPressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon badge */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify()}
          style={styles.iconWrapper}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={nodeTypeIcon as any} size={30} color="#FFF" />
          </LinearGradient>
          {/* Glow ring */}
          {isDark && <View style={styles.iconGlow} pointerEvents="none" />}
        </Animated.View>

        {/* Labels */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(400)}
          style={styles.labelGroup}
        >
          <View
            style={[
              styles.typePill,
              {
                backgroundColor: Colors.primary + "22",
                borderColor: Colors.primary + "55",
              },
            ]}
          >
            <Text style={[styles.typeText, { color: Colors.primaryLight }]}>
              {nodeTypeLabel}
            </Text>
          </View>
          <Text
            style={[
              styles.title,
              { color: isDark ? "#F9FAFB" : Colors.textPrimary },
            ]}
          >
            {screenTitle}
          </Text>
        </Animated.View>

        {/* Theory card */}
        {isTheory && (
          <Animated.View
            entering={FadeInDown.delay(280).duration(400)}
            style={[
              styles.theoryCard,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : Colors.light.card,
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : Colors.light.border,
              },
            ]}
          >
            {/* Accent stripe */}
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.accentStripe}
            />

            <View style={styles.theoryCardInner}>
              {tip.formula ? (
                <View
                  style={[
                    styles.formulaBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(139,92,246,0.15)"
                        : Colors.primary + "0F",
                      borderColor: Colors.primary + "44",
                    },
                  ]}
                >
                  <Text
                    style={[styles.formulaText, { color: Colors.primaryLight }]}
                  >
                    {tip.formula}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  styles.explanation,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.75)"
                      : Colors.textPrimary,
                  },
                ]}
              >
                {tip.explanation}
              </Text>

              <View style={styles.divider} />

              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.35)"
                      : Colors.textSecondary,
                  },
                ]}
              >
                VÍ DỤ THỰC HÀNH
              </Text>

              <View style={styles.examplesList}>
                {tip.examples.map((ex, index) => (
                  <ExampleRow
                    key={index}
                    japanese={ex.japanese}
                    translation={ex.translation}
                    delay={350 + index * 80}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Spacer */}
        <View style={{ height: Spacing.six }} />

        {/* CTA */}
        <Animated.View
          entering={FadeInDown.delay(isTheory ? 520 : 280).duration(400)}
          style={styles.ctaWrapper}
        >
          <GradientButton
            title={ctaLabel}
            onPress={() => router.replace(`/quiz/q1?lessonId=${lessonId}`)}
            style={styles.ctaBtn}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.twelve,
    paddingBottom: Spacing.eight,
    gap: Spacing.five,
  },
  orbTopLeft: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  orbBottomRight: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
    opacity: 0.07,
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: Spacing.five,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconWrapper: {
    marginTop: Spacing.six,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    zIndex: -1,
  },
  labelGroup: {
    alignItems: "center",
    gap: Spacing.three,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
    lineHeight: 34,
  },
  theoryCard: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  accentStripe: {
    width: 4,
  },
  theoryCardInner: {
    flex: 1,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  formulaBox: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  formulaText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
  },
  explanation: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.5,
  },
  examplesList: {
    gap: Spacing.two,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.three,
  },
  exampleContent: {
    flex: 1,
    gap: 4,
  },
  japaneseText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  translationText: {
    fontSize: FontSizes.sm,
  },
  revealBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaWrapper: {
    width: "100%",
  },
  ctaBtn: {
    width: "100%",
  },
});
