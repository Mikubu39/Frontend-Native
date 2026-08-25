/**
 * KanaQuestion — Impeccable redesign. Theme-aware tile sort.
 */

import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AudioButton } from "@/components/ui/audio-button";
import { DualText } from "@/components/ui/dual-text";
import { useAudio } from "@/hooks/use-audio";
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

interface KanaQuestionProps {
  question: KanaQuestion;
  onAnswerChange: (isCorrect: boolean, arrangedString: string) => void;
}

export function KanaQuestionCard({
  question,
  onAnswerChange,
}: KanaQuestionProps) {
  const [arranged, setArranged] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(question.characters);
  const { isPlaying, play } = useAudio(question.audioUrl);
  const { colors, isDark } = useTheme();

  // Chỉ dựa vào việc CÓ FILE hay không. Trước đây còn xét cả chữ "nghe" trong
  // đề bài, mà đề bài dạng này luôn là "Nghe và sắp xếp câu" — thiếu file là
  // hiện ra một nút loa bấm vào không kêu.
  const isListening = !!question.audioUrl;

  useEffect(() => {
    setArranged([]);
    setBank(question.characters);
    if (question.audioUrl) {
      play();
    }
  }, [question]);

  const selectTile = (char: string) => {
    const newArranged = [...arranged, char];
    setArranged(newArranged);

    const idx = bank.indexOf(char);
    if (idx > -1) {
      const newBank = [...bank];
      newBank.splice(idx, 1);
      setBank(newBank);
    }

    validate(newArranged);
  };

  const removeTile = (char: string, index: number) => {
    const newArranged = [...arranged];
    newArranged.splice(index, 1);
    setArranged(newArranged);

    setBank([...bank, char]);
    validate(newArranged);
  };

  const validate = (currentArranged: string[]) => {
    const isCorrect =
      currentArranged.length === question.correctOrder.length &&
      currentArranged.every((char, i) => char === question.correctOrder[i]);
    onAnswerChange(isCorrect, currentArranged.join(""));
  };

  const cardBg = isDark ? "rgba(255,255,255,0.05)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;
  const previewBorder = isDark ? "rgba(139,92,246,0.4)" : Colors.primary + "55";
  const previewBg = isDark ? "rgba(139,92,246,0.07)" : Colors.primary + "07";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <Text
        style={[
          styles.instruction,
          { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary },
        ]}
      >
        {question.instruction}
      </Text>

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
                color: isDark ? "rgba(255,255,255,0.2)" : Colors.textSecondary,
              },
            ]}
          >
            Chạm vào các ký tự bên dưới để sắp xếp
          </Text>
        ) : (
          arranged.map((char, index) => (
            <TouchableOpacity
              key={`arranged-${index}`}
              onPress={() => removeTile(char, index)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <DualText
                  text={char}
                  hint={question.blockRomaji?.[char]}
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
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : colors.borderSubtle,
          },
        ]}
      />

      <Text
        style={[
          styles.label,
          { color: isDark ? "rgba(255,255,255,0.3)" : Colors.textSecondary },
        ]}
      >
        CÁC KÝ TỰ
      </Text>

      {/* Bank */}
      <View style={styles.bankContainer}>
        {bank.map((char, index) => {
          const tileTextColor = isDark ? "#F9FAFB" : Colors.textPrimary;
          const tileSubColor = isDark
            ? "rgba(255,255,255,0.45)"
            : Colors.textSecondary;
          return (
            <TouchableOpacity
              key={`bank-${index}`}
              style={[
                styles.bankTile,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : colors.backgroundElement,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.14)"
                    : colors.border,
                },
              ]}
              onPress={() => selectTile(char)}
              activeOpacity={0.7}
            >
              {/* Thẻ rời là chữ Nhật trần; không có phiên âm thì người mới
                  không đọc được thẻ nào để mà xếp thành câu. */}
              <DualText
                text={char}
                hint={question.blockRomaji?.[char]}
                mainStyle={{ ...styles.bankTileText, color: tileTextColor }}
                subStyle={{ ...styles.bankTileSubText, color: tileSubColor }}
              />
            </TouchableOpacity>
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
