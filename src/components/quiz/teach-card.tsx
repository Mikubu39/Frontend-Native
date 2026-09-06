/**
 * TeachCardView — thẻ giới thiệu kiến thức mới, hiện TRƯỚC khi vào phần hỏi.
 *
 * Đây là mảnh còn thiếu khiến bài 1 hỏi "Chữ 「あ」 đọc là gì?" với người chưa
 * học chữ nào. Thẻ dạy đủ bốn mặt của một đơn vị kiến thức: mặt chữ, cách đọc,
 * nghĩa và âm thanh — âm thanh tự phát ngay khi thẻ hiện ra, đúng kiểu Duolingo
 * giới thiệu từ mới.
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { AudioButton } from "@/components/ui/audio-button";
import { useAudio } from "@/hooks/use-audio";
import { useImageFallback } from "@/hooks/use-image-fallback";
import { useTheme } from "@/contexts/theme-context";
import type { TeachCard } from "@/types/lesson-intro";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";

interface TeachCardViewProps {
  card: TeachCard;
  /** Vị trí trong bộ thẻ, dùng cho dòng "Chữ mới 2/5". */
  index: number;
  total: number;
}

const KIND_LABEL: Record<TeachCard["kind"], string> = {
  kana: "CHỮ MỚI",
  vocab: "TỪ MỚI",
  phrase: "MẪU CÂU MỚI",
};

/** Mặt chữ đơn cần to hơn hẳn so với cả một câu, nếu không sẽ bị tràn dòng. */
function getJapaneseFontSize(card: TeachCard): number {
  if (card.kind === "kana") return 108;
  if (card.kind === "phrase") return card.japanese.length > 12 ? 30 : 38;
  return 56;
}

export function TeachCardView({ card, index, total }: TeachCardViewProps) {
  const { colors, isDark } = useTheme();
  const { isPlaying, play } = useAudio(card.audioUrl, card.japanese);

  // Nghe mặt chữ ngay khi nhìn thấy nó là cách ghi nhớ hiệu quả nhất, nên
  // audio tự phát mỗi khi chuyển sang thẻ mới.
  useEffect(() => {
    play();
  }, [card.id, play]);

  const { uri: imageUri, onError: onImageError } = useImageFallback(
    card.imageUrl,
  );

  const cardBg = colors.cardQuiz;
  const cardBorder = colors.cardQuizBorder;
  const primaryText = colors.text;
  const mutedText = colors.textSecondary;

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[
          styles.kindPill,
          {
            backgroundColor: Colors.primary + "22",
            borderColor: Colors.primary + "55",
          },
        ]}
      >
        <Text style={[styles.kindText, { color: Colors.primaryLight }]}>
          {KIND_LABEL[card.kind]} {index + 1}/{total}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(320).springify()}
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        {/* Ảnh chỉ là phần minh hoạ: hỏng thì bỏ hẳn, chữ và âm thanh vẫn đủ dạy. */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            accessibilityIgnoresInvertColors
            onError={onImageError}
          />
        ) : null}

        <Text
          accessibilityLabel={`Chữ ${card.japanese}`}
          style={[
            styles.japanese,
            { color: primaryText, fontSize: getJapaneseFontSize(card) },
          ]}
        >
          {card.japanese}
        </Text>

        {card.romaji ? (
          <View
            style={[
              styles.romajiPill,
              {
                backgroundColor: isDark
                  ? "rgba(94,111,168,0.18)"
                  : Colors.primary + "0F",
                borderColor: Colors.primary + "44",
              },
            ]}
          >
            <Text style={[styles.romaji, { color: Colors.primaryLight }]}>
              {card.romaji}
            </Text>
          </View>
        ) : null}

        {card.meaning ? (
          <Text style={[styles.meaning, { color: primaryText }]}>
            {card.meaning}
          </Text>
        ) : null}

        <View style={styles.audioRow}>
          <AudioButton
            variant="speaker"
            size="medium"
            isPlaying={isPlaying}
            onPress={() => play()}
          />
          <Text style={[styles.audioHint, { color: mutedText }]}>
            {isPlaying ? "Đang phát…" : "Chạm để nghe lại"}
          </Text>
        </View>
      </Animated.View>

      <Text style={[styles.footerHint, { color: mutedText }]}>
        Ghi nhớ rồi bấm Tiếp tục — ngay sau đây bạn sẽ được hỏi lại phần này.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.four,
  },
  kindPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  kindText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  card: {
    width: "100%",
    alignItems: "center",
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.three,
  },
  image: {
    width: 132,
    height: 132,
    borderRadius: BorderRadius.lg,
  },
  japanese: {
    fontWeight: FontWeights.bold,
    textAlign: "center",
    lineHeight: undefined,
  },
  romajiPill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  romaji: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  meaning: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    textAlign: "center",
  },
  audioRow: {
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  audioHint: {
    fontSize: FontSizes.sm,
  },
  footerHint: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
});
