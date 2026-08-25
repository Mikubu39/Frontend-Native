import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { FontAwesome5 } from "@expo/vector-icons";
import type { SpeakingQuestion } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { JapaneseText } from "../ui/japanese-text";
import { AudioButton } from "@/components/ui/audio-button";
import { useAudio } from "@/hooks/use-audio";

interface SpeakingQuestionProps {
  question: SpeakingQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function SpeakingQuestionCard({
  question,
  onAnswerChange,
}: SpeakingQuestionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const pulseScale = useSharedValue(1);
  const { isPlaying, play } = useAudio(question.audioUrl);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );

      // Mock recording duration
      const timer = setTimeout(() => {
        setIsRecording(false);
        setHasRecorded(true);
        pulseScale.value = 1;
        onAnswerChange(true); // Mock successful speaking
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      pulseScale.value = 1;
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{question.instruction}</Text>

      <View style={styles.textContainer}>
        <JapaneseText
          text={question.textToSpeak}
          style={styles.textToSpeak}
          glossary={question.glossary}
        />
        {question.romaji ? (
          <Text style={styles.romaji}>{question.romaji}</Text>
        ) : null}
        <Text style={styles.translation}>{question.translation}</Text>

        {/* Không nghe người bản xứ đọc trước thì người mới không có gì để bắt
            chước. Đây là chỗ DUY NHẤT trong câu luyện nói cần âm thanh. */}
        {question.audioUrl ? (
          <View style={styles.sampleRow}>
            <AudioButton
              variant="speaker"
              size="small"
              isPlaying={isPlaying}
              onPress={() => play()}
            />
            <Text style={styles.sampleHint}>
              {isPlaying ? "Đang phát câu mẫu..." : "Nghe câu mẫu"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.recordContainer}>
        <Animated.View
          style={[
            styles.pulseRing,
            animatedStyle,
            isRecording && styles.pulseRingActive,
          ]}
        />
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            hasRecorded && styles.recordButtonDone,
          ]}
          onPress={() => !hasRecorded && setIsRecording(true)}
          disabled={isRecording || hasRecorded}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name={hasRecorded ? "check" : "microphone"}
            size={32}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.recordHint}>
          {hasRecorded
            ? "Đã ghi âm thành công!"
            : isRecording
              ? "Đang ghi âm..."
              : "Chạm để nói"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.eight,
    paddingHorizontal: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: Spacing.two,
  },
  textToSpeak: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
    textAlign: "center",
  },
  romaji: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  translation: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + "12",
  },
  sampleHint: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
  },
  recordContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.four,
    position: "relative",
    height: 140,
    width: 140,
  },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentPale,
  },
  pulseRingActive: {
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  recordButtonActive: {
    backgroundColor: Colors.error,
  },
  recordButtonDone: {
    backgroundColor: Colors.success,
  },
  recordHint: {
    position: "absolute",
    bottom: -20,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.bold,
  },
});
