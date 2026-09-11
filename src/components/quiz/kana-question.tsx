/**
 * KanaQuestion — Impeccable redesign. Theme-aware tile sort.
 */

import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { AudioButton } from "@/components/ui/audio-button";
import { DualText } from "@/components/ui/dual-text";
import { useAudio } from "@/hooks/use-audio";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import type { KanaQuestion } from "@/types";
import { useTheme } from "@/contexts/theme-context";
import { QuestionPrompt } from "@/components/quiz/question-prompt";
import { GlossaryLockdown } from "@/contexts/glossary-context";

interface KanaQuestionProps {
  question: KanaQuestion;
  onAnswerChange: (isCorrect: boolean, arrangedString: string) => void;
}

interface BankItem {
  id: string;
  char: string;
  isPlaced: boolean;
}

export function KanaQuestionCard({
  question,
  onAnswerChange,
}: KanaQuestionProps) {
  const [arranged, setArranged] = useState<{ id: string; char: string }[]>([]);
  const [bank, setBank] = useState<BankItem[]>(() =>
    question.characters.map((char, index) => ({
      id: `${index}-${char}`,
      char,
      isPlaced: false,
    })),
  );
  const fallbackSentence = question.correctOrder?.join("") || undefined;
  const { isPlaying, play } = useAudio(question.audioUrl, fallbackSentence);
  // Tiếng gõ gỗ hyoshigi mỗi lần nhặt/trả thẻ — nhỏ nhất trong bộ âm, đủ để
  // tay biết thẻ đã bám mà không lấn tiếng đúng/sai ngay sau đó.
  const { playTap } = useSoundEffect();
  const { colors, isDark } = useTheme();

  // Loại câu này luôn là "Nghe và sắp xếp câu": có file thật thì phát file,
  // không thì đọc bằng TTS từ chính các thẻ đúng — không còn trường hợp
  // thiếu cả hai vì correctOrder luôn có nội dung.
  const isListening = !!question.audioUrl || !!fallbackSentence;

  useEffect(() => {
    setArranged([]);
    setBank(
      question.characters.map((char, index) => ({
        id: `${index}-${char}`,
        char,
        isPlaced: false,
      })),
    );
    play();
  }, [question.id]);

  const selectTile = (item: BankItem) => {
    if (item.isPlaced) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playTap();

    const next = [...arranged, { id: item.id, char: item.char }];
    setArranged(next);
    validate(next.map((a) => a.char));

    setBank((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, isPlaced: true } : t)),
    );
  };

  const removeTile = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playTap();

    const removedItem = arranged[index];
    const next = arranged.filter((_, i) => i !== index);
    setArranged(next);
    if (removedItem) {
      setBank((bPrev) =>
        bPrev.map((t) =>
          t.id === removedItem.id ? { ...t, isPlaced: false } : t,
        ),
      );
    }
    validate(next.map((a) => a.char));
  };

  const validate = (currentArrangedChars: string[]) => {
    const isCorrect =
      currentArrangedChars.length === question.correctOrder.length &&
      currentArrangedChars.every(
        (char, i) => char === question.correctOrder[i],
      );
    onAnswerChange(isCorrect, currentArrangedChars.join(""));
  };

  const cardBg = colors.cardQuiz;
  const cardBorder = colors.cardQuizBorder;
  const previewBorder = isDark ? Colors.primary + "66" : Colors.primary + "55";
  const previewBg = isDark ? Colors.primary + "11" : Colors.primary + "07";

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

      {isListening ? (
        <View style={styles.audioRow}>
          <AudioButton
            isPlaying={isPlaying}
            variant="speaker"
            size="medium"
            onPress={play}
          />
        </View>
      ) : null}

      {question.imageUrl && (
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
      )}

      {/* Arranged preview drop zone */}
      <View
        style={[
          styles.previewContainer,
          { borderColor: previewBorder, backgroundColor: previewBg },
        ]}
      >
        {arranged.length === 0 ? (
          <Text
            style={[
              styles.placeholderText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Chạm vào các từ bên dưới để sắp xếp
          </Text>
        ) : (
          arranged.map((item, index) => (
            <TouchableOpacity
              key={`arranged-${item.id}-${index}`}
              testID={`arranged-tile-${index}`}
              onPress={() => removeTile(index)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <DualText disableGlossary text={item.char} hint={question.blockRomaji?.[item.char]}
                  mainStyle={styles.tileText}
                  subStyle={styles.tileSubText}
                />
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.borderSubtle,
          },
        ]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        CÁC TỪ VỰNG
      </Text>

      {/* Bank */}
      {/* Các thẻ rời ghép lại chính là câu đáp án — khoá tra từ. */}
      <GlossaryLockdown>
        <View style={styles.bankContainer}>
          {bank.map((item) => {
            const tileTextColor = colors.text;
            const tileSubColor = colors.textSecondary;

            if (item.isPlaced) {
              return (
                <View
                  key={`ghost-${item.id}`}
                  testID={`ghost-tile-${item.char}`}
                  style={[
                    styles.bankTileGhost,
                    {
                      borderColor: isDark
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(0,0,0,0.15)",
                    },
                  ]}
                >
                  <DualText disableGlossary text={item.char} hint={question.blockRomaji?.[item.char]}
                    mainStyle={{ ...styles.bankTileText, opacity: 0 }}
                    subStyle={{ ...styles.bankTileSubText, opacity: 0 }}
                  />
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={`bank-${item.id}`}
                testID={`bank-tile-${item.char}`}
                style={[
                  styles.bankTile,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => selectTile(item)}
                activeOpacity={0.7}
              >
                {/* Thẻ rời là chữ Nhật trần; không có phiên âm thì người mới
                  không đọc được thẻ nào để mà xếp thành câu. */}
                <DualText disableGlossary text={item.char} hint={question.blockRomaji?.[item.char]}
                  mainStyle={{ ...styles.bankTileText, color: tileTextColor }}
                  subStyle={{ ...styles.bankTileSubText, color: tileSubColor }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </GlossaryLockdown>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.five,
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
    alignItems: "center",
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  previewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 64,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    width: "100%",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  placeholderText: {
    fontSize: FontSizes.xs,
    fontStyle: "italic",
    textAlign: "center",
  },
  tile: {
    minWidth: 52,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  tileText: {
    color: "#FFF",
    fontSize: FontSizes.xl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  tileSubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.2,
  },
  bankContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: Spacing.two,
  },
  bankTile: {
    minWidth: 52,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  bankTileGhost: {
    minWidth: 52,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.35,
  },
  bankTileText: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  bankTileSubText: {
    fontSize: 11,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
});
