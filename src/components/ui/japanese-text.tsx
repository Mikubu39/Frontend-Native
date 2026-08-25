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

interface JapaneseTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  /**
   * Từ điển của riêng câu hỏi đang hiện, do backend gửi kèm.
   *
   * Người học chưa biết một chữ tiếng Nhật nào, nên phải chạm được vào bất kỳ
   * từ nào trên màn hình để xem cách đọc và nghĩa. Bảng `DICTIONARY` cứng bên
   * dưới chỉ có hơn hai chục từ nên gần như không bao giờ khớp — bảng này mới
   * là nguồn chính, và nó thắng khi cả hai cùng có một từ.
   */
  glossary?: Glossary;
}

/** Một từ tra được: cách đọc (romaji) và nghĩa tiếng Việt. */
interface Lookup {
  romaji?: string;
  meaning: string;
}

// Simple local dictionary for the prototype
const DICTIONARY: Record<string, string> = {
  こんにちは: "Xin chào (Dùng ban ngày)",
  ありがとう: "Cám ơn",
  さようなら: "Tạm biệt",
  先生: "Giáo viên (Sensei)",
  わたし: "Tôi / Tớ / Mình",
  学生: "Học sinh",
  おばあさん: "Bà ngoại / Bà nội",
  おばさん: "Cô / Dì",
  はじめまして: "Rất hân hạnh được gặp bạn",
  です: "là (kính ngữ)",
  これ: "Đây / Cái này",
  本: "Sách",
  にほんご: "Tiếng Nhật",
  いぬ: "Chó",
  がくせい: "Học sinh",
  せんせい: "Giáo viên",
  あなた: "Bạn / Anh / Chị",
  よろしくおねがいします: "Rất mong nhận được sự giúp đỡ",
};

export function JapaneseText({ text, style, glossary }: JapaneseTextProps) {
  const [selectedWord, setSelectedWord] = useState<
    (Lookup & { word: string }) | null
  >(null);

  // Từ điển của câu này thắng bảng cứng, vì nó lấy thẳng từ nội dung bài học.
  const dictionary = useMemo<Record<string, Lookup>>(() => {
    const merged: Record<string, Lookup> = {};
    for (const [word, meaning] of Object.entries(DICTIONARY)) {
      merged[word] = { meaning };
    }
    for (const [word, entry] of Object.entries(glossary || {})) {
      if (entry?.v || entry?.r) {
        merged[word] = { romaji: entry.r, meaning: entry.v || "" };
      }
    }
    return merged;
  }, [glossary]);

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
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipWord}>{selectedWord?.word}</Text>
            {selectedWord?.romaji ? (
              <Text style={styles.tooltipRomaji}>{selectedWord.romaji}</Text>
            ) : null}
            <View style={styles.divider} />
            <Text style={styles.tooltipMeaning}>{selectedWord?.meaning}</Text>
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
    backgroundColor: "#FFFFFF",
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    minWidth: 220,
    alignItems: "center",
    ...Shadows.xl,
  },
  tooltipWord: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  tooltipRomaji: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    marginTop: -Spacing.three,
    marginBottom: Spacing.four,
  },
  divider: {
    width: "100%",
    height: 2,
    backgroundColor: Colors.lockedBg,
    marginBottom: Spacing.four,
  },
  tooltipMeaning: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
