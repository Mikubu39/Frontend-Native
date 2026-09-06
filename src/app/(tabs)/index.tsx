/**
 * THESIS: A world map you traverse, not a checklist you tick — each lesson is
 * a landmark on an authored path, the progress visible in the rail beneath your feet.
 *
 * OWN-WORLD: Deep violet–magenta palette (Colors.primary / Colors.secondary),
 * gold accent (Colors.accent). Hexagon nodes with three distinct state identities.
 * Dual-rail SVG connector with animated progress dots. Dark topic banners with
 * edge-lit gradient. Dot-texture background. No generic circle-progress widgets.
 *
 * STORY: The learner sees how far they've come, where they're headed, and feels
 * momentum — not a form to fill out.
 *
 * FIRST VIEWPORT: Thin blurred stats header. Below: scrollable serpentine map
 * with hexagonal nodes connected by glowing dual-rail tracks. Active node
 * floats and pulses. Completed nodes filled with brand gradient + checkmark.
 * Locked nodes desaturated. Tap opens a rich bottom popover.
 *
 * FORM: Full visual replacement. Serpentine layout, SVG path logic, popup
 * behavior, energy/lock checks — all preserved.
 *
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, DESIGN.md, and every shipping raster carrying
 * its provenance.
 */

import {
  TOPIC_DIVIDER_HEIGHT,
  TopicDivider,
  TopicHeaderBar,
  GuidebookSheet,
} from "@/components/lessons";
import { StreakModal } from "@/components/gamification";
import { useToast } from "@/contexts/toast-context";
import * as Haptics from "expo-haptics";
import { SpotlightTarget } from "@/components/tutorial";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModalCard } from "@/components/ui/modal-card";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useTutorial } from "@/contexts/tutorial-context";
import { roadmapApi } from "@/services/api/roadmap";
import type { RoadmapLessonResponse, RoadmapTopicResponse } from "@/types";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  G,
  LinearGradient as SvgGradient,
  Path,
  Polygon,
  Stop,
} from "react-native-svg";

// ─── Map layout constants ────────────────────────────────────────────────────
const NODE_SIZE = 72;
const NODE_SPACING = 128;
const START_Y = 80;
const HEX_RADIUS = 36; // outer radius of hexagon

/**
 * Dự phòng khi API lộ trình chưa kèm `entryCostEnergy` (backend cũ).
 * Phải khớp `LessonUnlockPolicy.DEFAULT_ENTRY_COST_ENERGY` phía server — con số
 * này hiện ngay trên popover trước khi người học bấm BẮT ĐẦU.
 */
const DEFAULT_ENTRY_COST_ENERGY = 10;
/** Khoảng đệm cuối mỗi đoạn bản đồ, chừa chỗ cho popover của node cuối. */
const SECTION_TAIL = 80;

/**
 * Chiều cao của một đoạn chủ đề trên bản đồ.
 *
 * Tính được bằng công thức (không cần đo layout) vì mọi thành phần đều có kích
 * thước cố định. Nhờ vậy màn hình biết trước offset của từng chủ đề để (a) xác
 * định chủ đề đang trong khung nhìn cho thanh dính, (b) cấp `getItemLayout` cho
 * FlatList — thứ giúp danh sách không phải đo từng đoạn cao hàng nghìn pixel
 * khi cuộn nhanh.
 */
function topicSectionHeight(lessonCount: number, hasDivider: boolean) {
  return (
    (hasDivider ? TOPIC_DIVIDER_HEIGHT : 0) +
    START_Y +
    lessonCount * NODE_SPACING +
    SECTION_TAIL
  );
}

/**
 * Thanh dính đổi nội dung khi mép trên của một chủ đề đã trôi qua khỏi nó chừng
 * này pixel — tức đúng lúc vạch ngăn mang tên chủ đề chui xuống dưới thanh.
 */
const TOPIC_SWITCH_LEAD = TOPIC_DIVIDER_HEIGHT + 40;

/** Serpentine offset pattern — left/center/right weave */
const getOffset = (index: number) => {
  const pattern = [0, 52, 80, 52, 0, -52, -80, -52];
  return pattern[index % pattern.length];
};

// SVG path generator — dual rail approach.
// Đặt ở module scope (thay vì useCallback trong component) để TopicSection có
// thể memo hoá kết quả: một hàm được tạo lại mỗi lần render sẽ vô hiệu hoá memo.
function generatePaths(lessons: RoadmapLessonResponse[], centerX: number) {
  if (lessons.length === 0) return { fullPath: "", activePath: "" };

  let fullPath = "";
  let activePath = "";

  let progressIndex = -1;
  for (let i = 0; i < lessons.length; i++) {
    if (
      lessons[i].status === "COMPLETED" ||
      lessons[i].status === "UNLOCKED" ||
      lessons[i].status === "IN_PROGRESS"
    ) {
      progressIndex = i;
    } else {
      break;
    }
  }

  lessons.forEach((lesson, index) => {
    const x = centerX + getOffset(index);
    const y = START_Y + index * NODE_SPACING + NODE_SIZE / 2;

    if (index === 0) {
      fullPath += `M ${x} ${y}`;
      if (index <= progressIndex) activePath += `M ${x} ${y}`;
    } else {
      const prevX = centerX + getOffset(index - 1);
      const prevY = START_Y + (index - 1) * NODE_SPACING + NODE_SIZE / 2;
      const cp1x = prevX;
      const cp1y = (prevY + y) / 2;
      const cp2x = x;
      const cp2y = (prevY + y) / 2;
      const curve = ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      fullPath += curve;
      if (index <= progressIndex) {
        if (activePath === "") activePath += `M ${prevX} ${prevY}`;
        activePath += curve;
      }
    }
  });

  return { fullPath, activePath };
}

// ─── Hexagon path helper ─────────────────────────────────────────────────────
/** Returns SVG polygon points string for a flat-top hexagon centered at (cx, cy) */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

// Pre-computed polygon points — avoided calculating trigonometry on every render
const HEX_POINTS_OUTER = hexPoints(NODE_SIZE / 2, NODE_SIZE / 2, HEX_RADIUS);
const HEX_POINTS_INNER = hexPoints(
  NODE_SIZE / 2,
  NODE_SIZE / 2,
  HEX_RADIUS - 5,
);
const HEX_POINTS_SHIMMER = hexPoints(
  NODE_SIZE / 2,
  NODE_SIZE / 2 - 4,
  HEX_RADIUS - 10,
);

// ─── ActiveFloatingWrapper ───────────────────────────────────────────────────
/** Chỉ bọc duy nhất node đang hoạt động (isActive) để không tạo SharedValue cho 95 node tĩnh. */
function ActiveFloatingWrapper({ children }: { children: React.ReactNode }) {
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-7, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [floatY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return <Animated.View style={floatStyle}>{children}</Animated.View>;
}

// ─── ActiveNodeGlow ──────────────────────────────────────────────────────────
function ActiveNodeGlow({ size }: { size: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.45, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, scale]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size + 28,
          height: size + 28,
          borderRadius: (size + 28) / 2,
          backgroundColor: Colors.primary,
          top: -(28 / 2),
          left: -(28 / 2),
        },
        glowStyle,
      ]}
    />
  );
}

// ─── HexNode ─────────────────────────────────────────────────────────────────
type NodeStatus = "COMPLETED" | "UNLOCKED" | "IN_PROGRESS" | "LOCKED";

/**
 * Một node hình lục giác trên bản đồ.
 *
 * Tối ưu hoá siêu tốc:
 * - Hình lục giác được vẽ trong SVG tổng của TopicSection, HexNode là lớp phủ tương tác thuần.
 * - Zero SVG component overhead trong HexNode (giảm 120+ SvgView instances trên Android xuống 0).
 * - Duy nhất 1 node `isActive` mới gắn `ActiveFloatingWrapper` & `ActiveNodeGlow`.
 */
const HexNode = React.memo(function HexNode({
  lesson,
  index,
  isActive,
  isPopupVisible,
  onPress,
  onStart,
  centerX,
}: {
  lesson: RoadmapLessonResponse;
  index: number;
  isActive: boolean;
  isPopupVisible: boolean;
  onPress: (lesson: RoadmapLessonResponse) => void;
  onStart: (lesson: RoadmapLessonResponse) => void;
  centerX: number;
}) {
  const { isDark } = useTheme();
  const { showError } = useToast();
  const isLocked = lesson.status === "LOCKED";
  const isCompleted = lesson.status === "COMPLETED";
  const isJumpTest = lesson.lessonType === "JUMP_TEST";

  const node = {
    id: lesson.lessonId,
    title: lesson.title,
    status: lesson.status as NodeStatus,
    lessonType: lesson.lessonType,
    starsEarned: lesson.starsEarned,
    entryCostEnergy: lesson.entryCostEnergy,
  };

  const handlePress = useCallback(() => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
      showError(
        "Bài học đang khóa",
        "Hãy hoàn thành các bài học trước để mở khóa nhé! 🔒",
      );
      return;
    }
    onPress(lesson);
  }, [isLocked, lesson, onPress, showError]);

  const handleStart = useCallback(() => onStart(lesson), [onStart, lesson]);

  const x = centerX + getOffset(index);
  const y = START_Y + index * NODE_SPACING;

  const lessonIconName: keyof typeof Ionicons.glyphMap =
    node.lessonType === "TOPIC_REVIEW"
      ? "bulb"
      : isJumpTest
        ? "trophy"
        : "star";

  const buttonContent = (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Bài học: ${node.title}. ${
        isLocked ? "Đã khóa" : isCompleted ? "Đã hoàn thành" : "Đang mở khóa"
      }`}
      accessibilityHint={
        isLocked
          ? "Hãy hoàn thành bài học trước để mở khóa"
          : "Bấm để xem chi tiết bài học"
      }
      style={({ pressed }) => [
        styles.hexButton,
        pressed && styles.hexButtonPressed,
      ]}
    >
      {/* Center icon/label overlay */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLocked ? (
          <FontAwesome5 name="lock" size={18} color="rgba(255,255,255,0.3)" />
        ) : isCompleted ? (
          <View style={{ alignItems: "center" }}>
            <FontAwesome5 name="check" size={16} color="#FFFFFF" solid />
            <Ionicons
              name={lessonIconName}
              size={16}
              color="#FFFFFF"
              style={styles.nodeIconEmoji}
            />
          </View>
        ) : (
          <Ionicons
            name={lessonIconName}
            size={isActive ? 26 : 22}
            color={Colors.accent}
            style={styles.nodeIconEmoji}
          />
        )}
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.nodeAbsoluteWrapper,
        {
          left: x - NODE_SIZE / 2,
          top: y,
          zIndex: isPopupVisible ? 100 : isActive ? 10 : 2,
        },
      ]}
    >
      {/* Glow ring for active node */}
      {isActive && <ActiveNodeGlow size={NODE_SIZE} />}

      {/* Node đang mở khoá là mốc của tour hướng dẫn */}
      {isActive ? (
        <SpotlightTarget targetId="lesson-node" enabled={true}>
          <ActiveFloatingWrapper>{buttonContent}</ActiveFloatingWrapper>
        </SpotlightTarget>
      ) : (
        buttonContent
      )}

      {/* Lesson Popover */}
      {isPopupVisible && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.popoverContainer}
        >
          <View style={styles.popoverArrow} />
          <View
            style={[
              styles.popoverBody,
              {
                backgroundColor: isDark
                  ? "rgba(20,20,38,0.98)"
                  : "rgba(255,255,255,0.98)",
                borderColor: isDark
                  ? "rgba(59, 76, 130,0.25)"
                  : "rgba(59, 76, 130,0.2)",
              },
            ]}
          >
            {/* Badge row */}
            <View style={styles.popoverBadgeRow}>
              <View
                style={[
                  styles.popoverBadge,
                  isJumpTest && { backgroundColor: "#FF9600" },
                ]}
              >
                <Text style={styles.popoverBadgeText}>
                  {isJumpTest
                    ? "KIỂM TRA VƯỢT CẤP"
                    : node.lessonType === "TOPIC_REVIEW"
                      ? "BÀI ÔN TẬP"
                      : "BÀI HỌC"}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.popoverTitle,
                { color: isDark ? "#FFFFFF" : Colors.textPrimary },
              ]}
              numberOfLines={2}
            >
              {node.title}
            </Text>
            <Text
              style={[
                styles.popoverSub,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.6)"
                    : Colors.textSecondary,
                },
              ]}
            >
              {isJumpTest
                ? "Vượt qua thử thách để mở khóa chủ đề tiếp theo! (3 ❤️)"
                : `${node.entryCostEnergy ?? DEFAULT_ENTRY_COST_ENERGY} ⚡ năng lượng`}
            </Text>

            <GradientButton
              title={isJumpTest ? "BẮT ĐẦU VƯỢT CẤP →" : "BẮT ĐẦU →"}
              onPress={handleStart}
              style={{ width: "100%", paddingVertical: 11, marginTop: 4 }}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
});

// ─── TimedReviewBadge ────────────────────────────────────────────────────────────────────
const TIMED_REVIEW_BADGE_SIZE = 72;

/**
 * Mascot cạnh đường đi cho bài "ôn tập tính giờ" (TIMED_REVIEW).
 *
 * Khác `HexNode`: không chiếm 1 vị trí trên path — chỉ đặt cạnh node gần nhất.
 * Tối ưu bằng `Pressable` thuần cho trải nghiệm cuộn mượt mà.
 */
const TimedReviewBadge = React.memo(function TimedReviewBadge({
  lesson,
  x,
  y,
  isPopupVisible,
  onPress,
  onStart,
}: {
  lesson: RoadmapLessonResponse;
  x: number;
  y: number;
  isPopupVisible: boolean;
  onPress: (lesson: RoadmapLessonResponse) => void;
  onStart: (lesson: RoadmapLessonResponse) => void;
}) {
  const { isDark } = useTheme();
  const isLocked = lesson.status === "LOCKED";
  const isCompleted = lesson.status === "COMPLETED";

  const node = {
    id: lesson.lessonId,
    title: lesson.title,
    status: lesson.status as NodeStatus,
    lessonType: lesson.lessonType,
    starsEarned: lesson.starsEarned,
    entryCostEnergy: lesson.entryCostEnergy,
  };

  const handlePress = useCallback(() => onPress(lesson), [onPress, lesson]);
  const handleStart = useCallback(() => onStart(lesson), [onStart, lesson]);

  return (
    <View
      style={[
        styles.timedReviewWrapper,
        {
          left: x - TIMED_REVIEW_BADGE_SIZE / 2,
          top: y,
          zIndex: isPopupVisible ? 100 : 3,
        },
      ]}
    >
      <View>
        <Pressable
          onPress={handlePress}
          disabled={isLocked}
          accessibilityRole="button"
          accessibilityLabel={`Ôn tập tính giờ: ${node.title}. Không bắt buộc.`}
          style={({ pressed }) => [
            styles.timedReviewBubble,
            {
              backgroundColor: isCompleted
                ? "rgba(251,191,36,0.18)"
                : isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.92)",
              borderColor: isCompleted
                ? Colors.accent
                : "rgba(59, 76, 130,0.45)",
              opacity: isLocked ? 0.5 : 1,
              transform: [{ scale: pressed && !isLocked ? 0.93 : 1 }],
            },
          ]}
        >
          <Ionicons
            name="timer-outline"
            size={26}
            color={
              isCompleted ? Colors.accent : isDark ? "#FFFFFF" : Colors.primary
            }
          />
        </Pressable>
        <View style={styles.timedReviewStars}>
          {[1, 2, 3].map((position) => (
            <FontAwesome5
              key={position}
              name="star"
              size={8}
              color={
                position <= (node.starsEarned ?? 0)
                  ? Colors.accent
                  : isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.18)"
              }
              solid
              style={{ marginHorizontal: 1 }}
            />
          ))}
        </View>
      </View>

      {/* Popover — tái dùng đúng style token với HexNode để đồng bộ giao diện */}
      {isPopupVisible && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[
            styles.popoverContainer,
            { top: TIMED_REVIEW_BADGE_SIZE + 16 },
          ]}
        >
          <View style={styles.popoverArrow} />
          <View
            style={[
              styles.popoverBody,
              {
                backgroundColor: isDark
                  ? "rgba(20,20,38,0.98)"
                  : "rgba(255,255,255,0.98)",
                borderColor: isDark
                  ? "rgba(59, 76, 130,0.25)"
                  : "rgba(59, 76, 130,0.2)",
              },
            ]}
          >
            <View style={styles.popoverBadgeRow}>
              <View style={styles.popoverBadge}>
                <Text style={styles.popoverBadgeText}>ÔN TẬP TÍNH GIỜ</Text>
              </View>
              <View style={styles.popoverStars}>
                {[1, 2, 3].map((position) => (
                  <FontAwesome5
                    key={position}
                    name="star"
                    size={11}
                    color={
                      position <= (node.starsEarned ?? 0)
                        ? Colors.accent
                        : isDark
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(0,0,0,0.15)"
                    }
                    solid
                    style={{ marginLeft: 2 }}
                  />
                ))}
              </View>
            </View>

            <Text
              style={[
                styles.popoverTitle,
                { color: isDark ? "#FFFFFF" : Colors.textPrimary },
              ]}
              numberOfLines={2}
            >
              {node.title}
            </Text>
            <Text
              style={[
                styles.popoverSub,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.6)"
                    : Colors.textSecondary,
                },
              ]}
            >
              Không bắt buộc — càng nhanh càng nhiều sao, trả lời sai sẽ bị cộng
              thêm giờ. {node.entryCostEnergy ?? DEFAULT_ENTRY_COST_ENERGY} ⚡
              năng lượng
            </Text>

            <GradientButton
              title="BẮT ĐẦU →"
              onPress={handleStart}
              style={{ width: "100%", paddingVertical: 11, marginTop: 4 }}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
});

// ─── StatPill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  value,
  color,
  onPress,
}: {
  icon: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      pressScale={onPress ? 0.94 : 1}
      style={[styles.statPill, { borderColor: `${color}40` }]}
      accessibilityRole={onPress ? "button" : "text"}
    >
      <FontAwesome5 name={icon} size={13} color={color} solid />
      <Text style={[styles.statPillText, { color }]}>{value}</Text>
    </AnimatedPressable>
  );
}

// Topic color palette — each topic gets a distinct accent, all drawn from the
// existing Ai-zome palette instead of generic Tailwind-scale hexes.
const TOPIC_ACCENTS = [
  { from: Colors.primary, to: Colors.secondary },
  { from: Colors.secondary, to: Colors.accent },
  { from: Colors.success, to: Colors.primaryLight },
  { from: Colors.accent, to: Colors.error },
  { from: Colors.primaryDark, to: Colors.secondaryDark },
];

// ─── TopicSection ────────────────────────────────────────────────────────────
/**
 * Một chủ đề trên bản đồ: banner + đoạn đường có các bài học.
 *
 * Tối ưu hoá tối thượng:
 * - Dựng duy nhất 1 thẻ SVG chứa toàn bộ đường ray VÀ hình lục giác của các bài học.
 * - Triệt tiêu 100% chi phí tạo các Svg con riêng lẻ.
 */
interface TopicSectionProps {
  topic: RoadmapTopicResponse;
  topicIndex: number;
  centerX: number;
  activeLessonId: number | string | null | undefined;
  selectedLessonId: number | null;
  onNodePress: (lesson: RoadmapLessonResponse) => void;
  onStartLesson: (lesson: RoadmapLessonResponse) => void;
}

const TopicSection = React.memo(
  function TopicSection({
    topic,
    topicIndex,
    centerX,
    activeLessonId,
    selectedLessonId,
    onNodePress,
    onStartLesson,
  }: TopicSectionProps) {
    const { isDark } = useTheme();
    const lessons = topic.lessons;

    // TIMED_REVIEW ("ôn tập tính giờ") không bắt buộc và không chiếm 1 vị trí
    // trên đường đi chính — nó là mascot đặt CẠNH node gần nhất, đúng kiểu
    // Duolingo (khác TOPIC_REVIEW/"cái tạ" nằm ngay trên path, xem index.tsx).
    // `pathLessons` là những gì thực sự vẽ path + hexagon; `sideLessons` là
    // các bài TIMED_REVIEW được ghim bên cạnh.
    const pathLessons = React.useMemo(
      () => lessons.filter((l) => l.lessonType !== "TIMED_REVIEW"),
      [lessons],
    );
    const sideLessons = React.useMemo(
      () => lessons.filter((l) => l.lessonType === "TIMED_REVIEW"),
      [lessons],
    );
    // Với mỗi bài TIMED_REVIEW, tìm index (trong pathLessons) của bài path gần
    // nhất đứng TRƯỚC nó theo đúng thứ tự orderIndex gốc — đó là node nó sẽ
    // ghim cạnh vào. Nếu nó đứng trước mọi bài path (hiếm), neo vào node đầu.
    const sideAnchorIndexByLessonId = React.useMemo(() => {
      const map = new Map<number | string, number>();
      let lastPathIndex = -1;
      for (const lesson of lessons) {
        if (lesson.lessonType === "TIMED_REVIEW") {
          map.set(lesson.lessonId, Math.max(lastPathIndex, 0));
        } else {
          lastPathIndex += 1;
        }
      }
      return map;
    }, [lessons]);

    const totalMapHeight =
      START_Y + pathLessons.length * NODE_SPACING + SECTION_TAIL;
    const paths = React.useMemo(
      () => generatePaths(pathLessons, centerX),
      [pathLessons, centerX],
    );
    const accent = TOPIC_ACCENTS[topicIndex % TOPIC_ACCENTS.length];

    return (
      <>
        {/*
        Vạch ngăn mang tên chủ đề sắp bắt đầu. Chủ đề đầu tiên không cần vạch:
        thanh dính ở đầu màn hình đã nói nó là phần nào rồi.
      */}
        {topicIndex > 0 && (
          <TopicDivider
            title={topic.topicTitle}
            topicIndex={topicIndex}
            accentColor={accent.from}
            isDark={isDark}
          />
        )}

        {/* ── Map Section ── */}
        <View
          key={`map-${topic.topicId}`}
          style={[styles.mapContainer, { height: totalMapHeight }]}
        >
          {/* SVG Track + Hexagon Backgrounds (Unified into single hardware draw pass) */}
          <Svg style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient
                id={`activeGrad-${topicIndex}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor={accent.from} stopOpacity="1" />
                <Stop offset="1" stopColor={accent.to} stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="hexGrad-active" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={Colors.primary} />
                <Stop offset="1" stopColor={Colors.secondary} />
              </SvgGradient>
              <SvgGradient id="ringGrad-active" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.9" />
                <Stop
                  offset="1"
                  stopColor={Colors.secondary}
                  stopOpacity="0.9"
                />
              </SvgGradient>
              <SvgGradient id="ringGrad-completed" x1="0" y1="0" x2="1" y2="1">
                <Stop
                  offset="0"
                  stopColor={Colors.primaryLight}
                  stopOpacity="0.9"
                />
                <Stop
                  offset="1"
                  stopColor={Colors.secondary}
                  stopOpacity="0.9"
                />
              </SvgGradient>
            </Defs>

            {/* Outer rail shadow */}
            <G y={5} opacity={0.3}>
              <Path
                d={paths.fullPath}
                fill="none"
                stroke="#000000"
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>

            {/* Inactive track outer */}
            <Path
              d={paths.fullPath}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}
              strokeWidth={20}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inactive track inner line (clean subtle line, avoiding expensive Bezier dash computation) */}
            <Path
              d={paths.fullPath}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active track glow halo */}
            {paths.activePath !== "" && (
              <Path
                d={paths.activePath}
                fill="none"
                stroke={accent.from}
                strokeOpacity={0.25}
                strokeWidth={34}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active track outer */}
            {paths.activePath !== "" && (
              <Path
                d={paths.activePath}
                fill="none"
                stroke={`url(#activeGrad-${topicIndex})`}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active track center highlight */}
            {paths.activePath !== "" && (
              <Path
                d={paths.activePath}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hexagon nodes static vector backgrounds */}
            {pathLessons.map((lesson, index) => {
              const isLocked = lesson.status === "LOCKED";
              const isCompleted = lesson.status === "COMPLETED";
              const isActive = lesson.lessonId === activeLessonId;
              const nodeX = centerX + getOffset(index);
              const nodeY = START_Y + index * NODE_SPACING;
              const ringGradId = isActive
                ? "ringGrad-active"
                : "ringGrad-completed";

              return (
                <G
                  key={`hex-bg-${lesson.lessonId}`}
                  x={nodeX - NODE_SIZE / 2}
                  y={nodeY}
                >
                  {/* Outer ring (border) */}
                  <Polygon
                    points={HEX_POINTS_OUTER}
                    fill={
                      isLocked
                        ? isDark
                          ? Colors.lockedDark
                          : Colors.locked
                        : `url(#${ringGradId})`
                    }
                    opacity={isLocked ? 0.4 : 1}
                  />

                  {/* Inner fill */}
                  <Polygon
                    points={HEX_POINTS_INNER}
                    fill={
                      isCompleted
                        ? "url(#hexGrad-active)"
                        : isLocked
                          ? isDark
                            ? Colors.lockedBgDark
                            : Colors.locked
                          : isDark
                            ? "#1A1B2E"
                            : Colors.lockedBg
                    }
                    opacity={isLocked ? 0.6 : 1}
                  />

                  {/* Inner highlight shimmer line */}
                  {!isLocked && (
                    <Polygon
                      points={HEX_POINTS_SHIMMER}
                      fill="rgba(255,255,255,0.06)"
                    />
                  )}
                </G>
              );
            })}
          </Svg>

          {/* Floating orbs as decorative ambience (static View for zero animation/bridge overhead) */}
          {pathLessons.map((_, index) => {
            if (index % 3 !== 0) return null;
            const nodeOffset = getOffset(index);
            const side = nodeOffset >= 0 ? -1 : 1;
            const orbX = centerX + nodeOffset + side * (60 + (index % 3) * 18);
            const orbY = START_Y + index * NODE_SPACING + 28;
            const size = 18 + (index % 4) * 8;
            return (
              <View
                key={`orb-${topicIndex}-${index}`}
                style={{
                  position: "absolute",
                  left: orbX - size / 2,
                  top: orbY,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: accent.from,
                  opacity: 0.07 + (index % 3) * 0.03,
                }}
              />
            );
          })}

          {/* Render HexNodes */}
          {pathLessons.map((lesson, index) => (
            <HexNode
              key={lesson.lessonId}
              lesson={lesson}
              index={index}
              centerX={centerX}
              isActive={lesson.lessonId === activeLessonId}
              isPopupVisible={selectedLessonId === lesson.lessonId}
              onPress={onNodePress}
              onStart={onStartLesson}
            />
          ))}

          {/* Render TIMED_REVIEW mascots — ghim cạnh node path gần nhất, không
            chiếm chỗ trên đường đi chính. */}
          {sideLessons.map((lesson) => {
            const anchorIndex =
              sideAnchorIndexByLessonId.get(lesson.lessonId) ?? 0;
            const anchorOffset = getOffset(anchorIndex);
            const anchorX = centerX + anchorOffset;
            const anchorY = START_Y + anchorIndex * NODE_SPACING;
            // Ghim về phía "trống" của node neo (đối diện hướng lượn của path)
            // để mascot không đè lên track SVG. Offset 64 px (tăng từ 44) để
            // mascot to hơn (72 px) không chạm vào cạnh hex node.
            const side = anchorOffset >= 0 ? -1 : 1;
            const badgeX = anchorX + side * (NODE_SIZE / 2 + 64);
            const badgeY = anchorY + 6;
            return (
              <TimedReviewBadge
                key={lesson.lessonId}
                lesson={lesson}
                x={badgeX}
                y={badgeY}
                isPopupVisible={selectedLessonId === lesson.lessonId}
                onPress={onNodePress}
                onStart={onStartLesson}
              />
            );
          })}
        </View>
      </>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.topicIndex !== nextProps.topicIndex ||
      prevProps.centerX !== nextProps.centerX ||
      prevProps.activeLessonId !== nextProps.activeLessonId ||
      prevProps.topic.topicId !== nextProps.topic.topicId
    ) {
      return false;
    }

    // Only re-render if the selectedLessonId change actually affects this topic section.
    const hasSelectedPrev =
      prevProps.selectedLessonId !== null &&
      prevProps.topic.lessons.some(
        (l) => l.lessonId === prevProps.selectedLessonId,
      );
    const hasSelectedNext =
      nextProps.selectedLessonId !== null &&
      nextProps.topic.lessons.some(
        (l) => l.lessonId === nextProps.selectedLessonId,
      );

    if (!hasSelectedPrev && !hasSelectedNext) {
      return true; // No change relevant to this section
    }

    return prevProps.selectedLessonId === nextProps.selectedLessonId;
  },
);

// ─── StickyTopicHeader ──────────────────────────────────────────────────────
interface StickyTopicHeaderProps {
  topics: RoadmapTopicResponse[];
  sectionLayout: { heights: number[]; offsets: number[] };
  scrollListenerRef: React.MutableRefObject<((y: number) => void) | null>;
}

const StickyTopicHeader = React.memo(function StickyTopicHeader({
  topics,
  sectionLayout,
  scrollListenerRef,
}: StickyTopicHeaderProps) {
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const offsetsRef = useRef<number[]>(sectionLayout.offsets);
  offsetsRef.current = sectionLayout.offsets;

  useEffect(() => {
    scrollListenerRef.current = (y: number) => {
      const offsets = offsetsRef.current;
      if (offsets.length === 0) return;

      const probe = y + TOPIC_SWITCH_LEAD;
      let index = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (probe >= offsets[i]) index = i;
        else break;
      }
      setActiveTopicIndex((prev) => (prev === index ? prev : index));
    };
    return () => {
      scrollListenerRef.current = null;
    };
  }, [scrollListenerRef]);

  if (topics.length === 0) return null;
  const activeTopic = topics[Math.min(activeTopicIndex, topics.length - 1)];
  if (!activeTopic) return null;

  const activeAccent =
    TOPIC_ACCENTS[
      Math.min(activeTopicIndex, topics.length - 1) % TOPIC_ACCENTS.length
    ];

  return (
    <>
      <TopicHeaderBar
        topicIndex={activeTopicIndex}
        title={activeTopic.topicTitle}
        completedCount={
          activeTopic.lessons.filter((l) => l.status === "COMPLETED").length
        }
        totalCount={activeTopic.lessons.length}
        accentColor={activeAccent.from}
        onGuidePress={() => setIsGuideVisible(true)}
      />
      <GuidebookSheet
        visible={isGuideVisible}
        topicIndex={activeTopicIndex}
        topicTitle={activeTopic.topicTitle}
        accentColor={activeAccent.from}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
});

// ─── LearnScreen ─────────────────────────────────────────────────────────────
export default function LearnScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const CENTER_X = width / 2;
  const {
    energy,
    streak,
    streakStatus,
    exp,
    coins,
    maxEnergy,
    refillEnergy,
    watchAdToRefill,
  } = useGamification();
  const { maybeAutoStart, markAsSeen } = useTutorial();

  const streakPillConfig = useMemo(() => {
    switch (streakStatus) {
      case "ACTIVE":
        return {
          color: Colors.streakActive,
          icon: "fire",
        };
      case "FROZEN":
        return {
          color: Colors.streakFrozen,
          icon: "fire",
        };
      case "UNLIT":
      default:
        return {
          color: isDark ? "#9CA3AF" : "#64748B",
          icon: "fire",
        };
    }
  }, [streakStatus, isDark]);

  const [topics, setTopics] = useState<RoadmapTopicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnergyPopup, setShowEnergyPopup] = useState(false);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] =
    useState<RoadmapLessonResponse | null>(null);
  const scrollListenerRef = useRef<((y: number) => void) | null>(null);
  const insets = useSafeAreaInsets();

  // `energy` đọc qua ref để hai handler dưới đây giữ được identity ổn định —
  // nếu chúng đổi mỗi lần render thì React.memo của TopicSection vô tác dụng.
  const energyRef = useRef(energy);
  energyRef.current = energy;

  const handleNodePress = useCallback((lesson: RoadmapLessonResponse) => {
    if (lesson.status === "LOCKED") return;
    if (energyRef.current < 1) {
      setShowEnergyPopup(true);
      return;
    }
    setSelectedLesson((prev) =>
      prev?.lessonId === lesson.lessonId ? null : lesson,
    );
  }, []);

  const handleStartLesson = useCallback(
    (lesson: RoadmapLessonResponse) => {
      setSelectedLesson(null);
      // Truyền kèm tiêu đề/loại bài thật: màn hình chuẩn bị không tra được
      // chúng từ id vì API lộ trình không trả lại dữ liệu này ở bước sau.
      router.push(
        `/quiz/ready?lessonId=${lesson.lessonId}` +
          `&title=${encodeURIComponent(lesson.title)}` +
          `&lessonType=${encodeURIComponent(lesson.lessonType ?? "NORMAL")}`,
      );
    },
    [router],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchRoadmap = async () => {
        try {
          const data = await roadmapApi.getRoadmap();
          if (!isMounted) return;
          setTopics((prev) => {
            if (prev.length !== data.length) return data;
            // Lightweight check: compare topic IDs + lesson counts first
            const prevKey = prev
              .map((t) => `${t.topicId}:${t.lessons.length}`)
              .join(",");
            const nextKey = data
              .map((t) => `${t.topicId}:${t.lessons.length}`)
              .join(",");
            if (prevKey !== nextKey) return data;
            // Deep check only when structure matches (rare after learning a lesson)
            if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
            return data;
          });
        } catch (error) {
          console.error("Failed to fetch roadmap:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchRoadmap();
      return () => {
        isMounted = false;
      };
    }, []),
  );

  /*
   * Tour hướng dẫn lần đầu.
   *
   * Chỉ chạy sau khi lộ trình đã tải xong: các mốc được chiếu sáng (node bài học,
   * viên chỉ số) phải có mặt trên cây view thì `measureInWindow` mới ra toạ độ
   * thật.
   * - Nếu tài khoản đã có tiến độ học tập (có bài COMPLETED, EXP > 0 hoặc Streak > 0),
   *   tự động đánh dấu đã xem trong ngầm và bỏ qua tour.
   * - Ngược lại (người mới tinh), gọi `maybeAutoStart` sau 450ms.
   */
  const hasLearningProgress = React.useMemo(() => {
    const hasCompleted = topics.some((t) =>
      t.lessons.some((l) => l.status === "COMPLETED"),
    );
    return hasCompleted || (exp ?? 0) > 0 || (streak ?? 0) > 0;
  }, [topics, exp, streak]);

  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (isLoading || hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;
    if (hasLearningProgress) {
      markAsSeen();
      return;
    }
    const timer = setTimeout(maybeAutoStart, 450);
    return () => clearTimeout(timer);
  }, [isLoading, hasLearningProgress, markAsSeen, maybeAutoStart]);

  /**
   * Vị trí bắt đầu và chiều cao của từng đoạn chủ đề trên trục cuộn.
   */
  const sectionLayout = React.useMemo(() => {
    const heights: number[] = [];
    const offsets: number[] = [];
    let cursor = 0;
    topics.forEach((topic, index) => {
      const pathLessonCount = topic.lessons.filter(
        (l) => l.lessonType !== "TIMED_REVIEW",
      ).length;
      const height = topicSectionHeight(pathLessonCount, index > 0);
      offsets.push(cursor);
      heights.push(height);
      cursor += height;
    });
    return { heights, offsets };
  }, [topics]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollListenerRef.current?.(y);
    },
    [],
  );

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: sectionLayout.heights[index] ?? 0,
      offset: sectionLayout.offsets[index] ?? 0,
      index,
    }),
    [sectionLayout],
  );

  const allLessons = React.useMemo(
    () => topics.flatMap((t) => t.lessons),
    [topics],
  );

  const globalActiveLessonId = React.useMemo(() => {
    const inProgress = allLessons.find((l) => l.status === "IN_PROGRESS");
    if (inProgress) return inProgress.lessonId;

    let lastSequentialCompletedIndex = -1;
    for (let i = 0; i < allLessons.length; i++) {
      if (allLessons[i].status === "COMPLETED") {
        lastSequentialCompletedIndex = i;
      } else {
        break;
      }
    }

    const next = allLessons[lastSequentialCompletedIndex + 1];
    if (next && (next.status === "UNLOCKED" || next.status === "IN_PROGRESS")) {
      return next.lessonId;
    }
    return allLessons.find((l) => l.status === "UNLOCKED")?.lessonId;
  }, [allLessons]);

  const renderItem = useCallback(
    ({ item, index }: { item: RoadmapTopicResponse; index: number }) => (
      <TopicSection
        topic={item}
        topicIndex={index}
        centerX={CENTER_X}
        activeLessonId={globalActiveLessonId}
        selectedLessonId={selectedLesson?.lessonId ?? null}
        onNodePress={handleNodePress}
        onStartLesson={handleStartLesson}
      />
    ),
    [
      CENTER_X,
      globalActiveLessonId,
      selectedLesson,
      handleNodePress,
      handleStartLesson,
    ],
  );
  const contentContainerStyle = React.useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 100 }],
    [insets.bottom],
  );

  return (
    <AnimatedScreen skipEntering>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? colors.background : colors.background },
        ]}
      >
        {/* ── Sticky Header ── */}
        {Platform.OS === "android" ? (
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + Spacing.two,
                borderBottomColor: "rgba(59, 76, 130,0.2)",
                backgroundColor: isDark
                  ? "rgba(18,18,30,0.98)"
                  : "rgba(255,255,255,0.98)",
              },
            ]}
          >
            {/* Language selector */}
            <View style={styles.headerRow}>
              <View
                style={styles.langPill}
                accessibilityRole="text"
                accessibilityLabel="Ngôn ngữ: Tiếng Nhật"
              >
                <Text style={{ fontSize: 18 }}>🇯🇵</Text>
                <Text
                  style={[
                    styles.langPillText,
                    { color: isDark ? "#FFFFFF" : colors.text },
                  ]}
                >
                  日本語
                </Text>
              </View>

              <View style={styles.statsRow}>
                <StatPill
                  icon={streakPillConfig.icon}
                  value={streak}
                  color={streakPillConfig.color}
                  onPress={() => setIsStreakModalVisible(true)}
                />
                <StatPill icon="coins" value={coins} color={Colors.accent} />
                <StatPill
                  icon="bolt"
                  value={`${energy}/${maxEnergy}`}
                  color="#4ADE80"
                  onPress={() => {
                    if (energy < 1) setShowEnergyPopup(true);
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <BlurView
            intensity={isDark ? 60 : 80}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.header,
              {
                paddingTop: insets.top + Spacing.two,
                borderBottomColor: "rgba(59, 76, 130,0.2)",
              },
            ]}
          >
            {/* Language selector */}
            <View style={styles.headerRow}>
              <View
                style={styles.langPill}
                accessibilityRole="text"
                accessibilityLabel="Ngôn ngữ: Tiếng Nhật"
              >
                <Text style={{ fontSize: 18 }}>🇯🇵</Text>
                <Text
                  style={[
                    styles.langPillText,
                    { color: isDark ? "#FFFFFF" : colors.text },
                  ]}
                >
                  日本語
                </Text>
              </View>

              <View style={styles.statsRow}>
                <StatPill
                  icon={streakPillConfig.icon}
                  value={streak}
                  color={streakPillConfig.color}
                  onPress={() => setIsStreakModalVisible(true)}
                />
                <StatPill icon="coins" value={coins} color={Colors.accent} />
                <StatPill
                  icon="bolt"
                  value={`${energy}/${maxEnergy}`}
                  color="#4ADE80"
                  onPress={() => {
                    if (energy < 1) setShowEnergyPopup(true);
                  }}
                />
              </View>
            </View>
          </BlurView>
        )}

        {/* ── Thanh chủ đề dính (một thanh duy nhất, cập nhật độc lập khi cuộn) ── */}
        {!isLoading && (
          <StickyTopicHeader
            topics={topics}
            sectionLayout={sectionLayout}
            scrollListenerRef={scrollListenerRef}
          />
        )}

        {/* ── Energy Popup ── */}
        {showEnergyPopup && (
          <ModalCard onClose={() => setShowEnergyPopup(false)}>
            <View
              style={{
                alignItems: "center",
                gap: Spacing.four,
                marginTop: Spacing.four,
              }}
            >
              <Text style={{ fontSize: 52 }}>⚡</Text>
              <Text
                style={{
                  fontSize: FontSizes.xl,
                  fontWeight: FontWeights.extrabold,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Hết năng lượng!
              </Text>
              <Text
                style={{
                  fontSize: FontSizes.md,
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Bạn cần năng lượng để bắt đầu bài học mới. Năng lượng tối đa là{" "}
                {maxEnergy}. Hãy mua bằng xu hoặc xem quảng cáo để hồi phục.
              </Text>
              {adError && (
                <Text
                  style={{
                    fontSize: FontSizes.sm,
                    color: Colors.error,
                    textAlign: "center",
                  }}
                >
                  {adError}
                </Text>
              )}
              <View
                style={{
                  width: "100%",
                  gap: Spacing.two,
                  marginTop: Spacing.two,
                }}
              >
                <GradientButton
                  title="MUA FULL (400 COIN)"
                  onPress={async () => {
                    try {
                      await refillEnergy();
                      setShowEnergyPopup(false);
                    } catch (e: any) {
                      setAdError(
                        e?.response?.data?.message || "Không đủ coins",
                      );
                    }
                  }}
                  style={{ width: "100%" }}
                />
                <GradientButton
                  title="XEM QUẢNG CÁO (+5 NL)"
                  variant="outline"
                  onPress={async () => {
                    try {
                      setAdError(null);
                      await watchAdToRefill();
                      setShowEnergyPopup(false);
                    } catch (e: any) {
                      setAdError(
                        e?.response?.data?.message || "Lỗi kết nối quảng cáo",
                      );
                    }
                  }}
                  style={{ width: "100%" }}
                />
                <GradientButton
                  title="ĐỂ SAU"
                  variant="outline"
                  onPress={() => {
                    setShowEnergyPopup(false);
                    setAdError(null);
                  }}
                  style={{ width: "100%", borderWidth: 0 }}
                />
              </View>
            </View>
          </ModalCard>
        )}

        {/* ── Main Content ── */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Đang tải lộ trình…
            </Text>
          </View>
        ) : (
          <FlatList
            testID="roadmap-list"
            data={topics}
            keyExtractor={(topic) => String(topic.topicId)}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            getItemLayout={getItemLayout}
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            windowSize={7}
            removeClippedSubviews={false}
            renderItem={renderItem}
          />
        )}

        {isStreakModalVisible && (
          <StreakModal
            visible={isStreakModalVisible}
            onClose={() => setIsStreakModalVisible(false)}
          />
        )}
      </View>
    </AnimatedScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    zIndex: 100,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.three,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(59, 76, 130,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(59, 76, 130,0.3)",
  },
  langPillText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statPillText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
  },

  // ── Loading ──
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.sans,
  },

  // ── Scroll ──
  scrollContent: {
    paddingTop: 0,
  },

  // ── Map ──
  mapContainer: {
    position: "relative",
    width: "100%",
  },

  // ── Node ──
  nodeAbsoluteWrapper: {
    position: "absolute",
    width: NODE_SIZE,
    alignItems: "center",
    zIndex: 2,
  },
  hexButton: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  hexButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.88,
  },
  nodeIconEmoji: {
    fontSize: 22,
  },

  // ── Popover ──
  popoverContainer: {
    position: "absolute",
    top: NODE_SIZE + 8,
    alignSelf: "center",
    zIndex: 20,
    alignItems: "center",
    width: 268,
  },
  popoverArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(30,30,50,0.98)",
    marginBottom: -1,
  },
  popoverBody: {
    backgroundColor: "rgba(20,20,38,0.98)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(59, 76, 130,0.25)",
    ...Shadows.lg,
  },
  popoverBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  popoverBadge: {
    backgroundColor: "rgba(59, 76, 130,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(59, 76, 130,0.4)",
  },
  popoverBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryLight,
    letterSpacing: 0.8,
  },
  popoverStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  popoverTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  popoverSub: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.sans,
    color: "rgba(255,255,255,0.4)",
    marginBottom: Spacing.three,
  },

  // ── TimedReviewBadge (mascot cạnh đường đi) ──
  timedReviewWrapper: {
    position: "absolute",
    width: TIMED_REVIEW_BADGE_SIZE,
    alignItems: "center",
  },
  timedReviewBubble: {
    width: TIMED_REVIEW_BADGE_SIZE,
    height: TIMED_REVIEW_BADGE_SIZE,
    borderRadius: TIMED_REVIEW_BADGE_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  timedReviewStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
});
