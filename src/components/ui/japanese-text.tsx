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

  // Tách câu thành các mẩu tra được và mẩu không tra được bằng Quy Hoạch Động (DP).
  // Đánh trọng số bậc 2 (wLen * wLen) để ưu tiên phân đoạn các từ hoàn chỉnh dài hơn,
  // triệt tiêu tận gốc các bẫy nuốt ký tự (như nuốt "は" + "いくら" thành "はい" + "くら").
  const chunks = useMemo(() => {
    const rawText = text || "";
    if (!rawText) return [];

    const n = rawText.length;
    const dp: { score: number; tokens: { text: string; lookup?: Lookup }[] }[] =
      Array.from({ length: n + 1 }, () => ({ score: 0, tokens: [] }));

    const PUNCT_REGEX = /[。、！？?!\s.,「」『』()\[\]:：]/;

    for (let i = 0; i < n; i++) {
      const cur = dp[i];
      const char = rawText[i];

      // 1. Ký tự dấu câu: giữ nguyên, gộp vào đoạn text thường nếu trước đó là text thường
      if (PUNCT_REGEX.test(char)) {
        const candScore = cur.score + 1;
        if (candScore > dp[i + 1].score) {
          const last = cur.tokens[cur.tokens.length - 1];
          let nextTokens: { text: string; lookup?: Lookup }[];
          if (last && !last.lookup) {
            nextTokens = [
              ...cur.tokens.slice(0, -1),
              { text: last.text + char },
            ];
          } else {
            nextTokens = [...cur.tokens, { text: char }];
          }
          dp[i + 1] = { score: candScore, tokens: nextTokens };
        }
        continue;
      }

      // 2. Ký tự đơn không tra được (unmatched)
      if (cur.score >= dp[i + 1].score) {
        const last = cur.tokens[cur.tokens.length - 1];
        let nextTokens: { text: string; lookup?: Lookup }[];
        if (last && !last.lookup) {
          nextTokens = [...cur.tokens.slice(0, -1), { text: last.text + char }];
        } else {
          nextTokens = [...cur.tokens, { text: char }];
        }
        dp[i + 1] = { score: cur.score, tokens: nextTokens };
      }

      // 3. Khớp từ vựng trong từ điển: ưu tiên các từ hoàn chỉnh dài hơn
      const rest = rawText.slice(i);
      for (const word in dictionary) {
        if (rest.startsWith(word)) {
          const wLen = word.length;
          const candScore = cur.score + wLen * wLen;
          if (candScore > dp[i + wLen].score) {
            dp[i + wLen] = {
              score: candScore,
              tokens: [...cur.tokens, { text: word, lookup: dictionary[word] }],
            };
          }
        }
      }
    }

    return dp[n].tokens;
  }, [text, dictionary]);

  const handleLongPress = (word: string, lookup: Lookup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedWord({ word, ...lookup });
  };

  return (
    <>
      <Text style={style}>
        {chunks.map((chunk, index) => {
          const isCurrentClickable = !!chunk.lookup;
          const nextChunk = chunks[index + 1];
          const isNextClickable = !!nextChunk?.lookup;
          const shouldInsertSeparator = isCurrentClickable && isNextClickable;

          if (isCurrentClickable) {
            return (
              <React.Fragment key={index}>
                <Text
                  style={styles.clickableWord}
                  onLongPress={() => handleLongPress(chunk.text, chunk.lookup!)}
                  onPress={() => handleLongPress(chunk.text, chunk.lookup!)} // Also allow tap for discovery
                  suppressHighlighting={true}
                >
                  {chunk.text}
                </Text>
                {shouldInsertSeparator && (
                  <Text style={styles.wordSeparator}>{"\u2009"}</Text>
                )}
              </React.Fragment>
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
                backgroundColor: colors.card,
                borderWidth: isDark ? 1 : 0,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.tooltipWord, { color: colors.text }]}>
              {selectedWord?.word}
            </Text>
            {selectedWord?.romaji ? (
              <Text
                style={[styles.tooltipRomaji, { color: colors.textSecondary }]}
              >
                {selectedWord.romaji}
              </Text>
            ) : null}
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <Text
              style={[styles.tooltipMeaning, { color: colors.textSecondary }]}
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
  wordSeparator: {
    textDecorationLine: "none",
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
