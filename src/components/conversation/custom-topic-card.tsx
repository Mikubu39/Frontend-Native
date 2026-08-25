/**
 * Ô nhập chủ đề tự do, đặt ngay đầu màn chọn chủ đề.
 *
 * Vì sao đặt lên ĐẦU chứ không phải cuối danh sách
 * ------------------------------------------------
 * Đây là thứ kiến trúc cũ (máy trạng thái với kịch bản soạn tay) không thể
 * làm được, và cũng là lý do đáng giá nhất để chuyển sang LLM. Giấu nó dưới
 * đáy danh sách thì gần như không ai tìm ra.
 *
 * Ô nhập bắt đầu ở dạng THU GỌN: người mới học mở app lên thường chưa biết
 * mình muốn nói về cái gì, nên danh sách dựng sẵn phải là thứ đập vào mắt
 * trước. Ai đã biết mình muốn gì thì chạm một lần là ô mở ra.
 */

import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { MAX_CUSTOM_TOPIC_LENGTH } from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

interface CustomTopicCardProps {
  onStart: (topic: string) => void;
}

/** Gợi ý mồi - người học chạm là điền luôn, không phải tự nghĩ từ con số 0. */
const EXAMPLES = ["Đi khám bệnh", "Phỏng vấn xin việc", "Ở ga tàu"];

export function CustomTopicCard({ onStart }: CustomTopicCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const canStart = trimmed.length > 0;

  const handleStart = useCallback(() => {
    if (!canStart) return;
    onStart(trimmed);
  }, [canStart, trimmed, onStart]);

  if (!expanded) {
    return (
      <AnimatedPressable
        onPress={() => setExpanded(true)}
        pressScale={0.97}
        accessibilityRole="button"
        accessibilityLabel="Tự chọn chủ đề muốn luyện"
        style={[
          styles.collapsed,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: Colors.accent + "1A" }]}>
          <Ionicons name="sparkles" size={18} color={Colors.accent} />
        </View>
        <View style={styles.collapsedText}>
          <Text style={[styles.title, { color: colors.text }]}>
            Chủ đề của riêng bạn
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gõ bất kỳ tình huống nào, AI sẽ dựng cuộc trò chuyện cho bạn
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
        />
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.expanded,
        { backgroundColor: colors.card, borderColor: Colors.accent },
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name="sparkles" size={16} color={Colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>
          Bạn muốn luyện tình huống nào?
        </Text>
      </View>

      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Ví dụ: đặt phòng khách sạn"
        placeholderTextColor={colors.textSecondary}
        maxLength={MAX_CUSTOM_TOPIC_LENGTH}
        autoFocus
        returnKeyType="go"
        onSubmitEditing={handleStart}
        accessibilityLabel="Chủ đề muốn luyện"
        style={[
          styles.input,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <View style={styles.examples}>
        {EXAMPLES.map((example) => (
          <AnimatedPressable
            key={example}
            onPress={() => setValue(example)}
            pressScale={0.96}
            accessibilityRole="button"
            accessibilityLabel={`Dùng chủ đề mẫu: ${example}`}
            style={[
              styles.exampleChip,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
              {example}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      <View style={styles.actions}>
        <AnimatedPressable
          onPress={() => {
            setExpanded(false);
            setValue("");
          }}
          pressScale={0.95}
          accessibilityRole="button"
          accessibilityLabel="Huỷ chủ đề tự chọn"
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Huỷ
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleStart}
          disabled={!canStart}
          pressScale={0.95}
          accessibilityRole="button"
          accessibilityLabel="Bắt đầu luyện chủ đề này"
          accessibilityState={{ disabled: !canStart }}
          style={[
            styles.startButton,
            { backgroundColor: canStart ? Colors.accent : colors.border },
          ]}
        >
          <Text style={styles.startText}>Bắt đầu</Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  collapsedText: {
    flex: 1,
  },
  expanded: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: FontSizes.md,
  },
  examples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  exampleChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  exampleText: {
    fontSize: FontSizes.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.three,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cancelText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  startButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.full,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
