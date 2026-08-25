/**
 * PictureQuestionCard — Impeccable redesign. Theme-aware.
 */

import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { AudioButton } from "../ui/audio-button";
import { useAudio } from "@/hooks/use-audio";
import type { PictureQuestion } from "@/types";
import { DualText } from "@/components/ui/dual-text";
import { useTheme } from "@/contexts/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { QuestionPrompt } from "@/components/quiz/question-prompt";

interface PictureQuestionProps {
  question: PictureQuestion;
  selectedAnswerId: string | null;
  hasSubmitted?: boolean;
  onSelectAnswer: (answerId: string, isCorrect: boolean) => void;
}

export function PictureQuestionCard({
  question,
  selectedAnswerId,
  hasSubmitted,
  onSelectAnswer,
}: PictureQuestionProps) {
  const { isPlaying, play } = useAudio(question.audioUrl);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    // Câu chọn hình vốn không cần nghe (đề bài là chữ, đáp án là ảnh) nên phần
    // lớn không có audio. Chỉ tự phát khi thật sự có file.
    if (question.audioUrl) play();
  }, [question]);

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <QuestionPrompt
        instruction={question.instruction}
        isNew={question.isNew}
      />

      <View style={styles.audioRow}>
        {/* Không có file thì không vẽ nút loa: một cái loa bấm vào không kêu
            còn tệ hơn là không có loa. */}
        {question.audioUrl ? (
          <AudioButton isPlaying={isPlaying} onPress={play} size="medium" />
        ) : null}
        <DualText
          text={question.word}
          hint={question.romaji}
          glossary={question.glossary}
          mainStyle={{
            ...styles.wordText,
            color: isDark ? "#F9FAFB" : Colors.textPrimary,
          }}
          align="flex-start"
          containerStyle={{ flexShrink: 1 }}
        />
      </View>

      <View style={styles.grid}>
        {question.images.map((img) => {
          const isSelected = selectedAnswerId === img.id;
          const isCorrectAnswer = img.isCorrect;

          let borderColor: string = cardBorder;
          let bgColor: string = isDark
            ? "rgba(255,255,255,0.04)"
            : colors.backgroundElement;
          let showCheck = false;
          let checkBg: string = Colors.accent;
          let iconName: "checkmark" | "close" = "checkmark";

          if (hasSubmitted) {
            if (isCorrectAnswer) {
              borderColor = Colors.success;
              bgColor = isDark ? "rgba(74,222,128,0.12)" : "#DCFCE7";
              showCheck = true;
              checkBg = Colors.success;
              iconName = "checkmark";
            } else if (isSelected) {
              borderColor = Colors.error;
              bgColor = isDark ? "rgba(248,113,113,0.12)" : "#FEE2E2";
              showCheck = true;
              checkBg = Colors.error;
              iconName = "close";
            }
          } else if (isSelected) {
            borderColor = Colors.primary;
            bgColor = isDark ? Colors.primary + "22" : Colors.primary + "0F";
            showCheck = true;
            checkBg = Colors.primary;
            iconName = "checkmark";
          }

          return (
            <AnimatedPressable
              key={img.id}
              style={[
                styles.optionCard,
                { backgroundColor: bgColor, borderColor },
              ]}
              onPress={() => onSelectAnswer(img.id, img.isCorrect)}
              pressScale={0.95}
            >
              {img.imageUrl && (
                <Image source={{ uri: img.imageUrl }} style={styles.image} />
              )}
              {showCheck && (
                <Animated.View
                  entering={ZoomIn.duration(200).springify()}
                  style={[styles.checkBadge, { backgroundColor: checkBg }]}
                >
                  <Ionicons name={iconName} size={13} color="#FFF" />
                </Animated.View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: "center",
    width: "100%",
    gap: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    width: "100%",
  },
  wordText: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.three,
    width: "100%",
  },
  optionCard: {
    width: "47%",
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderBottomWidth: 4,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  checkBadge: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
