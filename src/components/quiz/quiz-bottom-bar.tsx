import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
} from "@/constants/theme";

interface QuizBottomBarProps {
  hasInteracted: boolean;
  hasSubmitted: boolean;
  isSubmitting?: boolean;
  isCorrect: boolean;
  correctAnswerText: string | null;
  onCheck: () => void;
  onNext: () => void;
  checkLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  submittingLabel?: string;
  isLastQuestion?: boolean;
  /**
   * Nhãn thay thế cho "Tuyệt vời!" khi trả lời đúng — dùng cho các trạng thái
   * đặc biệt (vd chuỗi trả lời đúng liên tiếp). Không ảnh hưởng nhãn khi sai.
   */
  correctFeedbackLabel?: string;
}

export function QuizBottomBar({
  hasInteracted,
  hasSubmitted,
  isSubmitting = false,
  isCorrect,
  correctAnswerText,
  onCheck,
  onNext,
  checkLabel = "KIỂM TRA",
  nextLabel = "TIẾP TỤC",
  finishLabel = "ĐÃ HOÀN THÀNH",
  submittingLabel = "ĐANG TẢI...",
  isLastQuestion = false,
  correctFeedbackLabel,
}: QuizBottomBarProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (hasSubmitted) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.reset();
    }
  }, [hasSubmitted, isCorrect]);

  const btnLabel = !hasSubmitted
    ? checkLabel
    : isLastQuestion
      ? finishLabel
      : nextLabel;

  return (
    <View style={styles.container}>
      {hasInteracted && hasSubmitted && (
        <Animated.View
          entering={FadeInUp.springify().mass(0.8)}
          style={styles.feedbackPanel}
        >
          <LinearGradient
            colors={
              isCorrect
                ? [Colors.success, "#16A34A"]
                : [Colors.error, "#DC2626"]
            }
            style={styles.feedbackGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.lottieContainer}>
              <LottieView
                ref={lottieRef}
                source={
                  isCorrect
                    ? require("@/assets/animations/happy_mascot.json")
                    : require("@/assets/animations/confuse_mascot.json")
                }
                autoPlay={false}
                loop={true}
                style={styles.lottie}
              />
            </View>

            <View style={styles.feedbackTextGroup}>
              <View style={styles.feedbackIconRow}>
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={24}
                  color="#FFF"
                />
                <Text style={[styles.feedbackLabel, { color: "#FFF" }]}>
                  {isCorrect
                    ? (correctFeedbackLabel ?? "Tuyệt vời!")
                    : "Chưa chính xác"}
                </Text>
              </View>

              {!isCorrect && correctAnswerText ? (
                <>
                  <Text style={styles.feedbackAnswerLabel}>Đáp án đúng:</Text>
                  <Text style={styles.feedbackAnswerText}>
                    {correctAnswerText}
                  </Text>
                </>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <GradientButton
        title={isSubmitting ? submittingLabel : btnLabel}
        onPress={!hasSubmitted ? onCheck : onNext}
        disabled={!hasInteracted || isSubmitting}
        style={styles.nextButton}
        customColors={
          hasSubmitted
            ? isCorrect
              ? [Colors.success, "#16A34A"]
              : [Colors.error, "#DC2626"]
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.three,
  },
  feedbackPanel: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  feedbackGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: BorderRadius.lg,
  },
  lottieContainer: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  feedbackTextGroup: {
    flex: 1,
    gap: 4,
  },
  feedbackIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feedbackLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
  },
  feedbackAnswerLabel: {
    fontSize: FontSizes.xs,
    color: "rgba(255,255,255,0.5)",
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  feedbackAnswerText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: "rgba(255,255,255,0.9)",
  },
  nextButton: {
    width: "100%",
  },
});
