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
import { useSpeechInput } from "@/hooks/use-speech-input";
import { QuestionPrompt } from "@/components/quiz/question-prompt";

interface SpeakingQuestionProps {
  question: SpeakingQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
  onSkipSpeaking?: () => void;
}

export function SpeakingQuestionCard({
  question,
  onAnswerChange,
  onSkipSpeaking,
}: SpeakingQuestionProps) {
  const [hasRecorded, setHasRecorded] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);

  const pulseScale = useSharedValue(1);
  const { isPlaying, play } = useAudio(question.audioUrl, question.textToSpeak);

  const cleanText = (text: string) =>
    text.replace(/[.,!?。、\s]/g, "").toLowerCase();

  const isJapaneseMatch = (sttText: string, expectedText: string) => {
    const cleanStt = cleanText(sttText);
    const cleanExp = cleanText(expectedText);

    if (cleanStt === cleanExp) return true;

    const toRegex = (str: string) => {
      let r = "^";
      for (const char of str) {
        if (char.match(/[\u4E00-\u9FAF\u3400-\u4DBF]/)) {
          r += ".{1,6}";
        } else {
          r += char;
        }
      }
      r += "$";
      return new RegExp(r);
    };

    try {
      if (toRegex(cleanStt).test(cleanExp)) return true;
      if (toRegex(cleanExp).test(cleanStt)) return true;
    } catch {
      // Ignore
    }

    return false;
  };

  const {
    status,
    partialTranscript,
    error: speechError,
    start,
    stop,
  } = useSpeechInput({
    onFinalTranscript: (text) => {
      const isMatch = isJapaneseMatch(text, question.textToSpeak);
      if (isMatch) {
        setHasRecorded(true);
        setWrongMessage(null);
        onAnswerChange(true);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 4) {
          setWrongMessage(`Bạn nói: "${text}". Chưa chính xác!`);
          setHasRecorded(true);
          onAnswerChange(false);
        } else {
          setWrongMessage(`Bạn nói: "${text}". Chưa chính xác, thử lại nhé!`);
        }
      }
    },
  });

  const isRecording = status === "listening";

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
    } else {
      pulseScale.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <QuestionPrompt
        instruction={question.instruction}
        isNew={question.isNew}
      />

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

        {/* Không nghe qua trước thì người mới không có gì để bắt chước. Có file
            thật thì phát file người bản xứ, không thì đọc bằng TTS. */}
        {question.audioUrl || question.textToSpeak ? (
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

      <View style={styles.recordSection}>
        <View style={styles.messagesContainer}>
          {wrongMessage && !isRecording && (
            <Text
              style={[
                styles.wrongMessage,
                attempts >= 4 ? styles.wrongMessageFinal : null,
              ]}
            >
              {wrongMessage}
            </Text>
          )}
          {speechError && (
            <Text style={[styles.wrongMessage, styles.wrongMessageFinal]}>
              {speechError}
            </Text>
          )}
          {isRecording && partialTranscript ? (
            <Text style={styles.partialTranscript}>{partialTranscript}</Text>
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
              status === "denied" && styles.recordButtonDisabled,
            ]}
            onPress={() => {
              if (isRecording) {
                stop();
              } else if (!hasRecorded && status !== "denied") {
                setWrongMessage(null);
                start();
              }
            }}
            disabled={hasRecorded || status === "denied"}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={hasRecorded ? "check" : "microphone"}
              size={32}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.hintContainer}>
          <Text style={styles.recordHint}>
            {hasRecorded
              ? attempts >= 4
                ? "Chưa chính xác"
                : "Đã ghi âm thành công!"
              : isRecording
                ? "Đang ghi âm (chạm để dừng)..."
                : status === "denied"
                  ? "Không có quyền micro"
                  : "Chạm để nói"}
          </Text>

          {!hasRecorded && onSkipSpeaking && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkipSpeaking}
            >
              <Text style={styles.skipButtonText}>
                Bạn không thể nói lúc này?
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  recordSection: {
    alignItems: "center",
    width: "100%",
    marginTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  messagesContainer: {
    minHeight: 40,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  recordContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 120,
    width: 120,
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
  recordButtonDisabled: {
    backgroundColor: Colors.locked,
  },
  hintContainer: {
    alignItems: "center",
    marginTop: Spacing.four,
    minHeight: 60,
  },
  recordHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.two,
  },
  wrongMessage: {
    color: Colors.warning,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
  wrongMessageFinal: {
    color: Colors.error,
  },
  partialTranscript: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontStyle: "italic",
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textDecorationLine: "underline",
    fontWeight: FontWeights.medium,
  },
});
