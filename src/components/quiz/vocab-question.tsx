/**
 * VocabQuestion — Impeccable redesign. Theme-aware answer cards.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AudioButton } from "@/components/ui/audio-button";
import type { VocabQuestion as VocabQuestionType } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { DualText } from "@/components/ui/dual-text";
import { JapaneseText } from "@/components/ui/japanese-text";
import { QuestionPrompt } from "@/components/quiz/question-prompt";
import { GlossaryLockdown } from "@/contexts/glossary-context";
import { useAudio } from "@/hooks/use-audio";
import { useJapaneseSpeech } from "@/hooks/use-japanese-speech";
import { useTheme } from "@/contexts/theme-context";

interface VocabQuestionProps {
  question: VocabQuestionType;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
  /** Nguồn Lottie mascot (require(...) của character1/2/3.json) - hiện kèm bong bóng thoại phía trên. */
  mascotSource?: any;
}

export function VocabQuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  mascotSource,
}: VocabQuestionProps) {
  const [showHint, setShowHint] = useState(false);
  const { colors, isDark } = useTheme();
  // Đề bài chỉ đọc được khi CHÍNH ĐỀ BÀI là tiếng Nhật (chiều dịch JP→VN);
  // chiều ngược lại (VN→JP) đề bài là tiếng Việt, không có gì để đọc ở đây.
  const promptFallback =
    question.promptLang === "ja" ? question.word : undefined;
  const { isPlaying, play } = useAudio(question.audioUrl, promptFallback);
  const { speak: speakAnswer } = useJapaneseSpeech();

  const cardBg = colors.cardQuiz;
  const cardBorder = colors.cardQuizBorder;
  const selectedBg = isDark ? Colors.primary + "33" : Colors.primary + "18";
  const selectedBorder = Colors.primary;

  return (
    <View style={styles.container}>
      {/* Yêu cầu đứng trước đề bài: người học phải biết mình cần làm gì rồi
          mới nhìn tới chữ trong bong bóng. */}
      <QuestionPrompt
        instruction={question.instruction}
        isNew={question.isNew}
      />

      {/* Mascot + bong bóng thoại - chỉ hiện khi có mascotSource được truyền vào.
          Khi có, bong bóng đã hiện question.prompt rồi nên KHÔNG lặp lại chữ to
          bên dưới nữa - giữ nguyên tính năng nhấn-giữ-xem-hint bằng cách gắn
          luôn vào bong bóng. */}
      {mascotSource ? (
        <View style={styles.mascotRow}>
          <LottieView
            source={mascotSource}
            autoPlay
            loop
            style={styles.mascotLottie}
          />
          {question.prompt ? (
            <Pressable
              onLongPress={() => setShowHint(true)}
              onPressOut={() => setShowHint(false)}
              delayLongPress={200}
              style={styles.speechBubbleWrap}
            >
              {showHint && question.hint && (
                <View style={styles.bubbleTooltipContainer}>
                  <View
                    style={[
                      styles.tooltipBody,
                      { backgroundColor: Colors.secondary },
                    ]}
                  >
                    <Text style={styles.tooltipText}>{question.hint}</Text>
                  </View>
                  <View
                    style={[
                      styles.tooltipArrow,
                      { borderTopColor: Colors.secondary },
                    ]}
                  />
                </View>
              )}
              <View style={styles.speechBubble}>
                <View
                  style={[
                    styles.speechBubbleArrow,
                    {
                      borderRightColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#FFFFFF",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.speechBubbleBody,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#FFFFFF",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.12)"
                        : cardBorder,
                    },
                  ]}
                >
                  {question.promptRomaji ? (
                    <Text style={styles.speechBubbleRomaji}>
                      {question.promptRomaji}
                    </Text>
                  ) : null}
                  {/* Chữ Nhật thì cho tra nghĩa tại chỗ; chữ tiếng Việt (câu
                      hỏi chiều ngược) không có gì để tra nên in thẳng. */}
                  {question.promptLang === "vi" ? (
                    <Text
                      style={[styles.speechBubbleText, { color: colors.text }]}
                    >
                      {question.prompt}
                    </Text>
                  ) : (
                    <JapaneseText
                      text={question.prompt ?? ""}
                      glossary={question.glossary}
                      style={{
                        ...styles.speechBubbleText,
                        color: colors.text,
                      }}
                    />
                  )}
                </View>
              </View>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {question.imageUrl ? (
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
      ) : null}

      {/* Nút loa chỉ vẽ khi có file audioUrl để phát. Câu dịch đề bài đã in
          sẵn mặt chữ kèm phiên âm nên không cần loa fallback. */}
      {question.audioUrl ? (
        <View style={styles.audioRow}>
          <AudioButton
            variant="speaker"
            size="small"
            isPlaying={isPlaying}
            onPress={() => play()}
          />
        </View>
      ) : null}

      {!mascotSource && question.prompt ? (
        <Pressable
          onLongPress={() => setShowHint(true)}
          onPressOut={() => setShowHint(false)}
          delayLongPress={200}
        >
          <View style={styles.wordContainer}>
            {showHint && question.hint && (
              <View style={styles.tooltipContainer}>
                <View
                  style={[
                    styles.tooltipBody,
                    { backgroundColor: Colors.secondary },
                  ]}
                >
                  <Text style={styles.tooltipText}>{question.hint}</Text>
                </View>
                <View
                  style={[
                    styles.tooltipArrow,
                    { borderTopColor: Colors.secondary },
                  ]}
                />
              </View>
            )}
            <DualText
              text={question.prompt ?? ""}
              hint={question.hint}
              glossary={question.glossary}
              mainStyle={{
                ...styles.word,
                color: colors.text,
              }}
            />
          </View>
        </Pressable>
      ) : null}

      {/* Tra được nghĩa của đáp án là biết luôn đáp án — khoá từ điển ở đây. */}
      <GlossaryLockdown>
        <View style={styles.answers}>
          {question.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.id;
            return (
              <AnimatedPressable
                key={answer.id}
                // Nội dung đáp án có thể trùng chữ với phiên âm hiện trong bong
                // bóng (câu 「あ」 có romaji "a" và cũng có đáp án "a"), nên test
                // cần một mốc chọn được đúng thẻ đáp án.
                testID={`answer-${answer.id}`}
                style={[
                  styles.answerCard,
                  {
                    backgroundColor: isSelected ? selectedBg : cardBg,
                    borderColor: isSelected ? selectedBorder : cardBorder,
                  },
                ]}
                onPress={() => {
                  onSelectAnswer(answer.id);
                  // Đáp án tiếng Nhật (có romaji) thì đọc luôn khi chạm vào,
                  // để người học nghe cách phát âm ngay lúc chọn.
                  if (answer.romaji) speakAnswer(answer.text);
                }}
                pressScale={0.97}
              >
                <Text
                  style={[
                    styles.answerText,
                    {
                      color: isSelected
                        ? isDark
                          ? Colors.primaryLight
                          : Colors.primaryDark
                        : isDark
                          ? "#F9FAFB"
                          : Colors.textPrimary,
                    },
                  ]}
                >
                  {answer.text}
                </Text>
                {/* Đáp án viết bằng chữ Nhật thì người mới không đọc nổi, phải có
                  phiên âm ngay dưới. Đáp án tiếng Việt không có romaji nên dòng
                  này tự biến mất. */}
                {answer.romaji ? (
                  <Text
                    style={[
                      styles.answerRomaji,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.45)"
                          : Colors.textSecondary,
                      },
                    ]}
                  >
                    {answer.romaji}
                  </Text>
                ) : null}
              </AnimatedPressable>
            );
          })}
        </View>
      </GlossaryLockdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    width: "100%",
    gap: 0,
    marginBottom: Spacing.two,
  },
  mascotLottie: {
    width: 100,
    height: 130,
    flexShrink: 0,
    // Kéo bong bóng đè nhẹ lên vùng rìa nhân vật để 2 thứ dính sát nhau hơn.
    marginRight: -12,
  },
  speechBubbleWrap: {
    position: "relative",
    flexShrink: 1,
  },
  speechBubble: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  speechBubbleArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  speechBubbleBody: {
    flexShrink: 1,
    minWidth: 0,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  speechBubbleText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
  },
  bubbleTooltipContainer: {
    position: "absolute",
    top: -54,
    left: 8,
    alignItems: "center",
    zIndex: 20,
    width: 200,
  },
  image: {
    width: 200,
    height: 140,
    borderRadius: BorderRadius.lg,
    resizeMode: "cover",
  },
  audioRow: {
    alignSelf: "flex-end",
  },
  speechBubbleRomaji: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  wordContainer: {
    position: "relative",
    alignItems: "center",
    zIndex: 10,
  },
  word: {
    fontSize: 42,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  tooltipContainer: {
    position: "absolute",
    top: -54,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 20,
    width: 200,
  },
  tooltipBody: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  tooltipText: {
    color: "#FFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  answers: {
    width: "100%",
    gap: Spacing.three,
  },
  answerCard: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    alignItems: "center",
  },
  answerText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  answerRomaji: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.medium,
    textAlign: "center",
    marginTop: Spacing.half,
  },
});
