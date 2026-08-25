/**
 * ComposeBar - Inline "what's on your mind" input at the top of the feed.
 * Posts a USER_STATUS via POST /api/v1/posts (content max 500 chars, enforced
 * both here and by BE).
 */

import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { resolveMediaUrl } from "@/utils/media";

const MAX_LENGTH = 500;

interface ComposeBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  posting: boolean;
  avatarUrl?: string;
  displayName?: string;
  cardColor: string;
  textColor: string;
  placeholderColor: string;
}

export function ComposeBar({
  value,
  onChangeText,
  onSubmit,
  posting,
  avatarUrl,
  displayName,
  cardColor,
  textColor,
  placeholderColor,
}: ComposeBarProps) {
  const resolvedAvatar = resolveMediaUrl(avatarUrl);
  const canSubmit = value.trim().length > 0 && !posting;

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.row}>
        {resolvedAvatar ? (
          <Image source={{ uri: resolvedAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {(displayName || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Hôm nay bạn học được gì?"
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          maxLength={MAX_LENGTH}
          multiline
        />
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.counter, { color: placeholderColor }]}>
          {value.length}/{MAX_LENGTH}
        </Text>
        <AnimatedPressable
          testID="compose-send-button"
          style={[styles.sendBtn, !canSubmit && styles.sendBtnDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
          pressScale={0.95}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={16} color="#FFFFFF" />
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    minHeight: 40,
    maxHeight: 100,
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  counter: {
    fontSize: FontSizes.xs,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
