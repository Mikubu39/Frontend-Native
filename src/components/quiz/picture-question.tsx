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
import { useJapaneseSpeech } from "@/hooks/use-japanese-speech";
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
  const { isPlaying, play } = useAudio(question.audioUrl, question.word);
  const { speak: speakOption } = useJapaneseSpeech();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    // Có file thật thì phát file, không thì đọc bằng TTS từ chính từ đang hỏi.
    play();
  }, [question, play]);

  const cardBg = colors.cardQuiz;
  const cardBorder = colors.cardQuizBorder;

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
        {/* Có file thật hoặc từ để đọc TTS thì mới vẽ nút loa: một cái loa bấm
            vào không kêu còn tệ hơn là không có loa. */}
        {question.audioUrl || question.word ? (
          <AudioButton isPlaying={isPlaying} onPress={play} size="medium" />
        ) : null}
        <DualText
          text={question.word}
          hint={question.romaji}
          glossary={question.glossary}
          mainStyle={{
            ...styles.wordText,
            color: colors.text,
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
          let bgColor: string = colors.backgroundElement;
          let showCheck = false;
          let checkBg: string = Colors.accent;
          let iconName: "checkmark" | "close" = "checkmark";

          if (hasSubmitted) {
            if (isCorrectAnswer) {
              borderColor = Colors.success;
              bgColor = isDark ? Colors.success + "22" : Colors.success + "18";
              showCheck = true;
              checkBg = Colors.success;
              iconName = "checkmark";
            } else if (isSelected) {
              borderColor = Colors.error;
              bgColor = isDark ? Colors.error + "22" : Colors.errorLight;
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
              testID={`picture-option-${img.id}`}
              style={[
                styles.optionCard,
                { backgroundColor: bgColor, borderColor },
              ]}
              onPress={() => {
                onSelectAnswer(img.id, img.isCorrect);
                // Chạm vào ảnh nào đọc luôn từ vựng của ảnh đó, để người học
                // nghe cách phát âm ngay cả khi chọn sai.
                if (img.text) speakOption(img.text);
              }}
              pressScale={0.95}
            >
              {img.imageUrl ? (
                <Image
                  source={{ uri: img.imageUrl }}
                  style={styles.image}
                  accessible
                  accessibilityLabel={img.text || "Hình ảnh đáp án"}
                  accessibilityRole="image"
                />
              ) : (
                <View style={styles.fallbackContainer}>
                  <Text
                    style={[styles.fallbackText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {img.text}
                  </Text>
                </View>
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
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.two,
  },
  fallbackText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
});
