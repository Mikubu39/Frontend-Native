/**
 * PurseEmptyDialog - Shown when a purchase is short on xu. It names the gap
 * and points at the fastest way to close it instead of just refusing.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ShopPalette } from "@/constants/shop";
import {
  AnimationPresets,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { formatCoins } from "@/utils/shop";
import { CoinMark } from "./coin-mark";
import { ShopButton } from "./shop-button";

interface PurseEmptyDialogProps {
  shortfall: number;
  onGoLearn: () => void;
  onClose: () => void;
}

export function PurseEmptyDialog({
  shortfall,
  onGoLearn,
  onClose,
}: PurseEmptyDialogProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(AnimationPresets.duration.fast)}
      style={styles.overlay}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Đóng"
      >
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <Animated.View entering={FadeInDown.duration(260).springify()}>
        <LinearGradient
          colors={[ShopPalette.lacquer, ShopPalette.lacquerDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.purse}>
            <CoinMark size={34} dimmed />
            <View style={styles.slash} />
          </View>

          <Text style={styles.title}>Chưa đủ xu</Text>
          <Text style={styles.body}>
            Còn thiếu{" "}
            <Text style={styles.amount}>{formatCoins(shortfall)} xu</Text>. Học
            xong một bài là có thêm — nhanh nhất là bài đang dở trên bản đồ.
          </Text>

          <View style={styles.actions}>
            <ShopButton label="Học một bài" icon="book" onPress={onGoLearn} />
            <ShopButton
              label="Để sau"
              tone="ghost"
              ghostColor={ShopPalette.inkOnLacquerMuted}
              onPress={onClose}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.six,
    zIndex: 110,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: ShopPalette.lacquerEdge,
    padding: Spacing.six,
    gap: Spacing.three,
    alignItems: "center",
    ...Shadows.float,
  },
  purse: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: ShopPalette.lacquerEdge,
  },
  slash: {
    position: "absolute",
    width: 46,
    height: 2,
    backgroundColor: ShopPalette.vermilion,
    transform: [{ rotate: "-40deg" }],
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.inkOnLacquer,
  },
  body: {
    fontSize: FontSizes.sm,
    lineHeight: 21,
    textAlign: "center",
    color: ShopPalette.inkOnLacquerMuted,
    fontWeight: FontWeights.medium,
  },
  amount: {
    color: ShopPalette.goldLeaf,
    fontWeight: FontWeights.extrabold,
  },
  actions: {
    width: "100%",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
