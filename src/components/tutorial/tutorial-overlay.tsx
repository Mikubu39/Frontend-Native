/**
 * TutorialOverlay — lớp phủ coach-mark của tour hướng dẫn.
 *
 * Cấu tạo (từ dưới lên):
 *  1. Một `<Svg>` phủ kín màn hình, tô màu tối bằng path có `fillRule="evenodd"`
 *     nên phần lỗ khoét quanh phần tử được chừa sáng.
 *  2. Vòng sáng nhấp nháy viền quanh lỗ khoét để mắt bị kéo về đó.
 *  3. Bong bóng giải thích + linh vật Lottie đứng cạnh, tự né lên trên hay
 *     xuống dưới tuỳ chỗ trống quanh vùng sáng.
 *
 * Lớp phủ chặn thao tác xuống app bên dưới — tour đi theo một mạch, người dùng
 * không lạc giữa chừng. Nút "Bỏ qua" luôn hiện để thoát bất cứ lúc nào.
 */

import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { CoachMascot } from "@/components/tutorial/coach-mascot";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTutorial } from "@/contexts/tutorial-context";
import type { TutorialStep, TutorialTargetRect } from "@/types";

const SCRIM_COLOR = "rgba(12, 8, 28, 0.82)";
const MASCOT_SIZE = 88;
const CARD_MARGIN = Spacing.four;
const GAP_TO_HOLE = 18;
/** Chiều cao ước lượng trước khi bong bóng kịp `onLayout` lần đầu. */
const CARD_HEIGHT_FALLBACK = 250;

interface Hole {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

/** Nới rộng vùng đo thành lỗ khoét thật sự (có đệm, bo góc hoặc tròn). */
function toHole(rect: TutorialTargetRect, step: TutorialStep): Hole {
  const padding = step.padding ?? 8;

  if (step.shape === "circle") {
    const size = Math.max(rect.width, rect.height) + padding * 2;
    return {
      x: rect.x + rect.width / 2 - size / 2,
      y: rect.y + rect.height / 2 - size / 2,
      width: size,
      height: size,
      radius: size / 2,
    };
  }

  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width,
    height,
    radius: Math.min(16, width / 2, height / 2),
  };
}

/** Path chữ nhật bo góc — lỗ khoét thứ hai của scrim (fill-rule evenodd). */
function roundedRectPath({ x, y, width, height, radius }: Hole): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  return [
    `M${x + r},${y}`,
    `H${x + width - r}`,
    `A${r},${r} 0 0 1 ${x + width},${y + r}`,
    `V${y + height - r}`,
    `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
    `H${x + r}`,
    `A${r},${r} 0 0 1 ${x},${y + height - r}`,
    `V${y + r}`,
    `A${r},${r} 0 0 1 ${x + r},${y}`,
    "Z",
  ].join(" ");
}

// ─── Vòng sáng nhấp nháy ─────────────────────────────────────────────────────
function PulseRing({ hole }: { hole: Hole }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = 0;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse, hole.x, hole.y, hole.width, hole.height]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.75 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.28 }],
  }));

  const box = {
    position: "absolute" as const,
    left: hole.x,
    top: hole.y,
    width: hole.width,
    height: hole.height,
    borderRadius: hole.radius,
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Viền cố định ôm sát lỗ khoét */}
      <View
        style={[box, { borderWidth: 2.5, borderColor: Colors.accent }]}
        testID="tutorial-spotlight-ring"
      />
      {/* Vòng lan toả ra ngoài */}
      <Animated.View
        style={[
          box,
          { borderWidth: 2, borderColor: Colors.accentLight },
          ringStyle,
        ]}
      />
    </View>
  );
}

// ─── Lớp phủ ─────────────────────────────────────────────────────────────────
export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    spotlight,
    stepIndex,
    steps,
    goNext,
    goBack,
    skipTutorial,
  } = useTutorial();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_FALLBACK);

  /*
   * Gốc toạ độ của chính lớp phủ, tính theo cửa sổ.
   *
   * `measureInWindow` của phần tử đích trả về toạ độ so với CỬA SỔ, còn lỗ khoét
   * lại vẽ theo hệ toạ độ của View này. Hai hệ đó chỉ trùng nhau khi lớp phủ bắt
   * đầu đúng ở góc (0,0) của cửa sổ — không đúng khi gốc app nằm dưới thanh
   * trạng thái. Đo chính mình rồi trừ đi là cách tự chỉnh đúng trên mọi máy,
   * thay vì đoán chiều cao status bar.
   */
  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      rootRef.current?.measureInWindow((x, y) => {
        setOrigin((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [isActive, stepIndex, width, height]);

  if (!isActive || !currentStep) return null;

  const hole = spotlight
    ? toHole(
        {
          ...spotlight,
          x: spotlight.x - origin.x,
          y: spotlight.y - origin.y,
        },
        currentStep,
      )
    : null;

  // ── Chọn chỗ đặt bong bóng ────────────────────────────────────────────────
  const topLimit = insets.top + Spacing.three;
  const bottomLimit = Math.max(
    topLimit,
    height - insets.bottom - Spacing.three - cardHeight,
  );

  let cardTop: number;
  let placedBelow = true;

  if (!hole) {
    cardTop = Math.max(topLimit, (height - cardHeight) / 2);
  } else {
    const below = hole.y + hole.height + GAP_TO_HOLE;
    const above = hole.y - GAP_TO_HOLE - cardHeight;
    const preferred = currentStep.placement ?? "auto";

    if (preferred === "top") {
      placedBelow = false;
    } else if (preferred === "bottom") {
      placedBelow = true;
    } else {
      placedBelow = below <= bottomLimit;
    }

    // Phía đã chọn không đủ chỗ thì lật sang phía kia, thay vì đè lên vùng sáng.
    if (placedBelow && below > bottomLimit && above >= topLimit) {
      placedBelow = false;
    } else if (!placedBelow && above < topLimit && below <= bottomLimit) {
      placedBelow = true;
    }

    cardTop = Math.min(
      Math.max(placedBelow ? below : above, topLimit),
      bottomLimit,
    );
  }

  // Mũi tên chỉ về vùng sáng, ghim theo tâm ngang của lỗ khoét.
  const arrowLeft = hole
    ? Math.min(
        Math.max(hole.x + hole.width / 2 - CARD_MARGIN - 9, 24),
        Math.max(24, width - CARD_MARGIN * 2 - 42),
      )
    : null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const outerPath = `M0,0 H${width} V${height} H0 Z`;

  return (
    <View
      ref={rootRef}
      collapsable={false}
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      testID="tutorial-overlay"
      accessibilityViewIsModal
    >
      <Animated.View
        entering={FadeIn.duration(220)}
        style={StyleSheet.absoluteFill}
      >
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path
            d={hole ? `${outerPath} ${roundedRectPath(hole)}` : outerPath}
            fill={SCRIM_COLOR}
            fillRule="evenodd"
          />
          {/*
            Vệt sáng phủ lên đúng vùng được chiếu. Nội dung bên dưới có thể là
            nền tối (thanh tab ở chế độ tối, bản đồ lộ trình) — không có vệt này
            thì lỗ khoét trông chẳng khác gì phần bị che.
          */}
          {hole && (
            <Path d={roundedRectPath(hole)} fill="rgba(255,255,255,0.14)" />
          )}
        </Svg>
        {/* Bắt trọn thao tác chạm để không lọt xuống app bên dưới. */}
        <View style={StyleSheet.absoluteFill} pointerEvents="auto" />
      </Animated.View>

      {hole && <PulseRing hole={hole} />}

      <Animated.View
        key={currentStep.id}
        entering={FadeInDown.duration(220)}
        onLayout={(event) => {
          const measured = Math.round(event.nativeEvent.layout.height);
          if (measured > 0 && measured !== cardHeight) setCardHeight(measured);
        }}
        style={[styles.cardWrap, { top: cardTop }]}
      >
        {/* Linh vật đứng ngay cạnh mép trên bong bóng */}
        <View style={styles.mascotRow} pointerEvents="none">
          <CoachMascot mascot={currentStep.mascot} size={MASCOT_SIZE} />
          <View style={styles.nameTag}>
            <Text style={styles.nameTagText}>Koto</Text>
          </View>
        </View>

        <View style={styles.card}>
          {/* Mũi tên chỉ về vùng sáng */}
          {arrowLeft !== null && (
            <View
              style={[
                styles.arrow,
                placedBelow
                  ? [styles.arrowUp, { top: -9, left: arrowLeft }]
                  : [styles.arrowDown, { bottom: -9, left: arrowLeft }],
              ]}
            />
          )}

          <Text style={styles.stepCounter}>
            Bước {stepIndex + 1}/{steps.length}
          </Text>
          <Text style={styles.title} testID="tutorial-title">
            {currentStep.title}
          </Text>
          <Text style={styles.body}>{currentStep.body}</Text>

          {/* Chấm tiến độ */}
          <View style={styles.dotsRow}>
            {steps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.dot,
                  index < stepIndex && styles.dotDone,
                  index === stepIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <AnimatedPressable
              onPress={isFirst ? skipTutorial : goBack}
              pressScale={0.94}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel={isFirst ? "Bỏ qua hướng dẫn" : "Quay lại"}
            >
              <Text style={styles.secondaryText}>
                {isFirst ? "Bỏ qua" : "Quay lại"}
              </Text>
            </AnimatedPressable>

            <GradientButton
              title={
                currentStep.ctaLabel ?? (isLast ? "Bắt đầu học" : "Tiếp tục")
              }
              onPress={goNext}
              style={styles.primaryButton}
            />
          </View>

          {!isFirst && !isLast && (
            <AnimatedPressable
              onPress={skipTutorial}
              pressScale={0.96}
              style={styles.skipRow}
              accessibilityRole="button"
              accessibilityLabel="Bỏ qua hướng dẫn"
            >
              <Text style={styles.skipText}>Bỏ qua hướng dẫn</Text>
            </AnimatedPressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardWrap: {
    position: "absolute",
    left: CARD_MARGIN,
    right: CARD_MARGIN,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
    marginLeft: Spacing.two,
    // Kéo linh vật đè lên mép trên bong bóng — đứng cạnh chứ không tách rời.
    marginBottom: -18,
    zIndex: 2,
  },
  nameTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 22,
  },
  nameTagText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: Colors.primary + "33",
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  arrowUp: {
    borderBottomWidth: 10,
    borderBottomColor: Colors.surface,
  },
  arrowDown: {
    borderTopWidth: 10,
    borderTopColor: Colors.surface,
  },
  stepCounter: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: Colors.secondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.one,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.locked,
  },
  dotDone: {
    backgroundColor: Colors.primaryLight,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.secondary,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  secondaryButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  secondaryText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
  },
  skipRow: {
    alignItems: "center",
    paddingTop: Spacing.one,
  },
  skipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
});
