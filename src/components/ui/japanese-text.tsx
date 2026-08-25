import React, { useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  type TextStyle,
} from "react-native";
import type { Glossary } from "@/types/quiz";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Shadows,
} from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary, useGlossaryLockdown } from "@/contexts/glossary-context";

interface JapaneseTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  /**
   * Từ điển của riêng câu hỏi đang hiện, do backend gửi kèm.
   *
   * Không bắt buộc: kho từ toàn cục (`GlossaryProvider`) đã phủ hầu hết. Bảng
   * riêng của câu vẫn THẮNG khi trùng, vì nó phản ánh đúng nghĩa trong ngữ cảnh
   * của chính câu đó.
   */
  glossary?: Glossary;
}

/** Một từ tra được: cách đọc (romaji) và nghĩa tiếng Việt. */
interface Lookup {
  romaji?: string;
  meaning: string;
}

export function JapaneseText({ text, style, glossary }: JapaneseTextProps) {
  const { colors, isDark } = useTheme();
  const { glossary: globalGlossary } = useGlossary();
  // Trong vùng đáp án thì tắt hẳn tra từ — tra được nghĩa của đáp án là biết
  // luôn đáp án.
  const locked = useGlossaryLockdown();
  const [selectedWord, setSelectedWord] = useState<
    (Lookup & { word: string }) | null
  >(null);

  // Kho toàn cục làm nền, bảng riêng của câu hỏi ghi đè lên trên.
  const dictionary = useMemo<Record<string, Lookup>>(() => {
    if (locked) return {};
    const merged: Record<string, Lookup> = {};
    for (const [word, entry] of Object.entries(globalGlossary || {})) {
      if (entry?.v || entry?.r) {
        merged[word] = { romaji: entry.r, meaning: entry.v || "" };
      }
    }
    for (const [word, entry] of Object.entries(glossary || {})) {
      if (entry?.v || entry?.r) {
        merged[word] = { romaji: entry.r, meaning: entry.v || "" };
      }
    }
    return merged;
  }, [glossary, globalGlossary, locked]);

  // Tách câu thành các mẩu tra được và các mẩu không tra được. Khớp từ DÀI
  // TRƯỚC để 「おはようございます」 không bị cắt nhầm thành 「おはよう」 + phần thừa.
  const chunks = useMemo(() => {
    const sortedWords = Object.keys(dictionary).sort(
      (a, b) => b.length - a.length,
    );
    const out: { text: string; lookup?: Lookup }[] = [];
    let rest = text || "";

    while (rest.length > 0) {
      const word = sortedWords.find((w) => rest.startsWith(w));
      if (word) {
        out.push({ text: word, lookup: dictionary[word] });
        rest = rest.substring(word.length);
        continue;
      }
      // Gộp các ký tự không tra được lại thành một mẩu cho đỡ số phần tử
      const last = out[out.length - 1];
      if (last && !last.lookup) {
        last.text += rest[0];
      } else {
        out.push({ text: rest[0] });
      }
      rest = rest.substring(1);
    }
    return out;
  }, [text, dictionary]);

  const handleLongPress = (word: string, lookup: Lookup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedWord({ word, ...lookup });
  };

  return (
    <>
      <Text style={style}>
        {chunks.map((chunk, index) => {
          if (chunk.lookup) {
            return (
              <Text
                key={index}
                style={styles.clickableWord}
                onLongPress={() => handleLongPress(chunk.text, chunk.lookup!)}
                onPress={() => handleLongPress(chunk.text, chunk.lookup!)} // Also allow tap for discovery
                suppressHighlighting={true}
              >
                {chunk.text}
              </Text>
            );
          }
          return <Text key={index}>{chunk.text}</Text>;
        })}
      </Text>

      {/* Tooltip Modal */}
      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedWord(null)}
        >
          <View
            style={[
              styles.tooltipContainer,
              {
                backgroundColor: isDark ? "#1F2430" : "#FFFFFF",
                borderWidth: isDark ? 1 : 0,
                borderColor: "rgba(255,255,255,0.12)",
              },
            ]}
          >
            <Text
              style={[
                styles.tooltipWord,
                { color: isDark ? "#F9FAFB" : Colors.textPrimary },
              ]}
            >
              {selectedWord?.word}
            </Text>
            {selectedWord?.romaji ? (
              <Text
                style={[
                  styles.tooltipRomaji,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.55)"
                      : Colors.textSecondary,
                  },
                ]}
              >
                {selectedWord.romaji}
              </Text>
            ) : null}
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : colors.border,
                },
              ]}
            />
            <Text
              style={[
                styles.tooltipMeaning,
                { color: isDark ? "#E5E7EB" : Colors.textSecondary },
              ]}
            >
              {selectedWord?.meaning}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  clickableWord: {
    color: Colors.accent,
    textDecorationLine: "underline",
    textDecorationStyle: "dashed",
    textDecorationColor: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    minWidth: 220,
    alignItems: "center",
    ...Shadows.xl,
  },
  tooltipWord: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    marginBottom: Spacing.four,
  },
  tooltipRomaji: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    marginTop: -Spacing.three,
    marginBottom: Spacing.four,
  },
  divider: {
    width: "100%",
    height: 2,
    marginBottom: Spacing.four,
  },
  tooltipMeaning: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
});
