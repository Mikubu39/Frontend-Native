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
import { roadmapApi } from "@/services/api/roadmap";
import type { RoadmapLessonResponse, RoadmapTopicResponse } from "@/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Path, Polygon, Stop } from "react-native-svg";

// ─── Map layout constants ────────────────────────────────────────────────────
const NODE_SIZE = 72;
const NODE_SPACING = 128;
const START_Y = 80;
const HEX_RADIUS = 36; // outer radius of hexagon

/** Serpentine offset pattern — left/center/right weave */
const getOffset = (index: number) => {
  const pattern = [0, 52, 80, 52, 0, -52, -80, -52];
  return pattern[index % pattern.length];
};

// ─── Hexagon path helper ─────────────────────────────────────────────────────
/** Returns SVG polygon points string for a flat-top hexagon centered at (cx, cy) */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

// ─── ActiveNodeGlow ──────────────────────────────────────────────────────────
function ActiveNodeGlow({ size }: { size: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.45, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

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

// ─── AnimatedDots along path ─────────────────────────────────────────────────
function TrackDot({
  index,
  color,
}: {
  index: number;
  color: string;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = (index * 320) % 960;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: 960 - delay - 600 })
      ),
      -1,
      false
    );
  }, [index]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginHorizontal: 3,
        },
        dotStyle,
      ]}
    />
  );
}

// ─── HexNode ─────────────────────────────────────────────────────────────────
type NodeStatus = "COMPLETED" | "UNLOCKED" | "IN_PROGRESS" | "LOCKED";

function HexNode({
  node,
  index,
  isActive,
  isPopupVisible,
  onPress,
  onStart,
  centerX,
}: {
  node: {
    id: number | string;
    title: string;
    status: NodeStatus;
    lessonType?: string;
  };
  index: number;
  isActive: boolean;
  isPopupVisible: boolean;
  onPress: () => void;
  onStart: () => void;
  centerX: number;
}) {
  const { isDark, colors } = useTheme();
  const isLocked = node.status === "LOCKED";
  const isCompleted = node.status === "COMPLETED";
  const x = centerX + getOffset(index);
  const y = START_Y + index * NODE_SPACING;

  const floatY = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      floatY.value = withRepeat(
        withTiming(-7, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      floatY.value = withTiming(0, { duration: 400 });
    }
  }, [isActive]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const lessonIcon =
    node.lessonType === "GRAMMAR"
      ? "📚"
      : node.lessonType === "VOCABULARY"
      ? "📝"
      : node.lessonType === "KANJI"
      ? "🈷️"
      : "⭐";

  return (
    <Animated.View
      entering={FadeIn.delay(40 + index * 25).duration(300)}
      style={[
        styles.nodeAbsoluteWrapper,
        {
          left: x - NODE_SIZE / 2,
          top: y,
          zIndex: isPopupVisible ? 100 : isActive ? 10 : 2,
        },
        isActive && floatStyle,
      ]}
    >
      {/* Glow ring for active node */}
      {isActive && <ActiveNodeGlow size={NODE_SIZE} />}

      <AnimatedPressable
        onPress={onPress}
        disabled={isLocked}
        pressScale={isLocked ? 1 : 0.9}
        accessibilityRole="button"
        accessibilityLabel={`Bài học: ${node.title}. ${
          isLocked
            ? "Đã khóa"
            : isCompleted
            ? "Đã hoàn thành"
            : "Đang mở khóa"
        }`}
        accessibilityHint={
          isLocked
            ? "Hãy hoàn thành bài học trước để mở khóa"
            : "Bấm để xem chi tiết bài học"
        }
        style={{ width: NODE_SIZE, height: NODE_SIZE, alignItems: "center", justifyContent: "center" }}
      >
        <Svg width={NODE_SIZE} height={NODE_SIZE} viewBox={`0 0 ${NODE_SIZE} ${NODE_SIZE}`}>
          <Defs>
            <SvgGradient id={`hexGrad-${node.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={isLocked ? "#8B8FA8" : Colors.primary} />
              <Stop offset="1" stopColor={isLocked ? "#5C6070" : Colors.secondary} />
            </SvgGradient>
            {/* Outer shadow ring */}
            <SvgGradient id={`ringGrad-${node.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={isActive ? Colors.primary : isCompleted ? Colors.primaryLight : "#4B4F64"} stopOpacity="0.9" />
              <Stop offset="1" stopColor={isActive ? Colors.secondary : isCompleted ? Colors.secondary : "#2E3044"} stopOpacity="0.9" />
            </SvgGradient>
          </Defs>

          {/* Outer ring (border) */}
          <Polygon
            points={hexPoints(NODE_SIZE / 2, NODE_SIZE / 2, HEX_RADIUS)}
            fill={`url(#ringGrad-${node.id})`}
            opacity={isLocked ? 0.4 : 1}
          />

          {/* Inner fill */}
          <Polygon
            points={hexPoints(NODE_SIZE / 2, NODE_SIZE / 2, HEX_RADIUS - 5)}
            fill={
              isCompleted
                ? `url(#hexGrad-${node.id})`
                : isLocked
                ? (isDark ? "#252736" : "#D1D5DB")
                : (isDark ? "#1A1B2E" : "#F3F4F6")
            }
            opacity={isLocked ? 0.6 : 1}
          />

          {/* Inner highlight shimmer line */}
          {!isLocked && (
            <Polygon
              points={hexPoints(NODE_SIZE / 2, NODE_SIZE / 2 - 4, HEX_RADIUS - 10)}
              fill="rgba(255,255,255,0.06)"
            />
          )}
        </Svg>

        {/* Center icon/label overlay */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {isLocked ? (
              <FontAwesome5 name="lock" size={18} color="rgba(255,255,255,0.3)" />
            ) : isCompleted ? (
              <View style={{ alignItems: "center" }}>
                <FontAwesome5 name="check" size={16} color="#FFFFFF" solid />
                <Text style={styles.nodeIconEmoji}>{lessonIcon}</Text>
              </View>
            ) : (
              <Text style={[styles.nodeIconEmoji, isActive && styles.nodeIconActive]}>
                {lessonIcon}
              </Text>
            )}
          </View>
        </View>
      </AnimatedPressable>

      {/* Lesson Popover */}
      {isPopupVisible && (
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(18)}
          style={styles.popoverContainer}
        >
          <View style={styles.popoverArrow} />
          <View style={[
            styles.popoverBody,
            {
              backgroundColor: isDark ? "rgba(20,20,38,0.98)" : "rgba(255,255,255,0.98)",
              borderColor: isDark ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.2)",
            },
          ]}>
            {/* Badge row */}
            <View style={styles.popoverBadgeRow}>
              <View style={styles.popoverBadge}>
                <Text style={styles.popoverBadgeText}>
                  {node.lessonType ?? "BÀI HỌC"}
                </Text>
              </View>
              <View style={styles.popoverStars}>
                {[1, 2, 3].map((s) => (
                  <FontAwesome5
                    key={s}
                    name="star"
                    size={11}
                    color={Colors.accent}
                    solid
                    style={{ marginLeft: 2 }}
                  />
                ))}
              </View>
            </View>

            <Text style={[styles.popoverTitle, { color: isDark ? "#FFFFFF" : Colors.textPrimary }]} numberOfLines={2}>
              {node.title}
            </Text>
            <Text style={[styles.popoverSub, { color: isDark ? "rgba(255,255,255,0.6)" : Colors.textSecondary }]}>1 ⚡ năng lượng</Text>

            <GradientButton
              title="BẮT ĐẦU →"
              onPress={onStart}
              style={{ width: "100%", paddingVertical: 11, marginTop: 4 }}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

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

// ─── LearnScreen ─────────────────────────────────────────────────────────────
export default function LearnScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const CENTER_X = width / 2;
  const { energy, exp, streak, coins, maxEnergy, refillEnergy, watchAdToRefill } =
    useGamification();

  const [topics, setTopics] = useState<RoadmapTopicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnergyPopup, setShowEnergyPopup] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLessonResponse | null>(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const fetchRoadmap = async () => {
        try {
          const data = await roadmapApi.getRoadmap();
          setTopics(data);
        } catch (error) {
          console.error("Failed to fetch roadmap:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoadmap();
    }, [])
  );

  // Derive statuses — any lesson before the furthest COMPLETED is treated as COMPLETED
  const processedTopics = React.useMemo(() => {
    let highestCompletedIndex = -1;
    const flatLessons = topics.flatMap((t) => t.lessons);
    for (let i = flatLessons.length - 1; i >= 0; i--) {
      if (flatLessons[i].status === "COMPLETED") {
        highestCompletedIndex = i;
        break;
      }
    }
    let globalIndex = 0;
    return topics.map((topic) => {
      const processedLessons = topic.lessons.map((lesson) => {
        let derivedStatus = lesson.status;
        if (globalIndex <= highestCompletedIndex) derivedStatus = "COMPLETED";
        globalIndex++;
        return { ...lesson, status: derivedStatus };
      });
      return { ...topic, lessons: processedLessons };
    });
  }, [topics]);

  const allLessons = processedTopics.flatMap((t) => t.lessons);

  const globalActiveLessonId = React.useMemo(() => {
    const furthestInProgress = [...allLessons]
      .reverse()
      .find((l) => l.status === "IN_PROGRESS");
    if (furthestInProgress) return furthestInProgress.lessonId;

    let lastCompletedIndex = -1;
    for (let i = allLessons.length - 1; i >= 0; i--) {
      if (allLessons[i].status === "COMPLETED") {
        lastCompletedIndex = i;
        break;
      }
    }
    if (
      lastCompletedIndex !== -1 &&
      lastCompletedIndex < allLessons.length - 1
    ) {
      const next = allLessons[lastCompletedIndex + 1];
      if (next.status === "UNLOCKED" || next.status === "IN_PROGRESS")
        return next.lessonId;
    }
    return [...allLessons]
      .reverse()
      .find((l) => l.status === "UNLOCKED")?.lessonId;
  }, [allLessons]);

  // SVG path generator — dual rail approach
  const generatePaths = useCallback(
    (lessons: RoadmapLessonResponse[]) => {
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
        const x = CENTER_X + getOffset(index);
        const y = START_Y + index * NODE_SPACING + NODE_SIZE / 2;

        if (index === 0) {
          fullPath += `M ${x} ${y}`;
          if (index <= progressIndex) activePath += `M ${x} ${y}`;
        } else {
          const prevX = CENTER_X + getOffset(index - 1);
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
    },
    [CENTER_X]
  );

  // Topic color palette — each topic gets a distinct accent
  const TOPIC_ACCENTS = [
    { from: Colors.primary, to: Colors.secondary },
    { from: "#0EA5E9", to: "#6366F1" },
    { from: "#10B981", to: "#059669" },
    { from: "#F59E0B", to: "#EF4444" },
    { from: "#8B5CF6", to: "#EC4899" },
  ];

  return (
    <AnimatedScreen>
      <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.background }]}>
        {/* ── Dot-texture background ── */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {Array.from({ length: 32 }, (_, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: "rgba(139,92,246,0.18)",
                left: ((i * 113) % (width - 20)) + 10,
                top: ((i * 177) % 900) + 40,
              }}
            />
          ))}
        </View>

        {/* ── Sticky Header ── */}
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.two,
              borderBottomColor: "rgba(139,92,246,0.2)",
            },
          ]}
        >
          {/* Language selector */}
          <View style={styles.headerRow}>
            <AnimatedPressable
              style={styles.langPill}
              onPress={() => {}}
              pressScale={0.92}
              accessibilityRole="button"
              accessibilityLabel="Ngôn ngữ: Tiếng Nhật"
            >
              <Text style={{ fontSize: 18 }}>🇯🇵</Text>
              <Text style={[styles.langPillText, { color: isDark ? "#FFFFFF" : colors.text }]}>日本語</Text>
              <FontAwesome5 name="chevron-down" size={9} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
            </AnimatedPressable>

            <View style={styles.statsRow}>
              <StatPill icon="fire" value={streak} color="#FF9600" />
              <StatPill icon="coins" value={coins} color={Colors.accent} />
              <StatPill
                icon="bolt"
                value={`${energy}/${maxEnergy}`}
                color="#4ADE80"
                onPress={() => { if (energy < 1) setShowEnergyPopup(true); }}
              />
            </View>
          </View>
        </BlurView>

        {/* ── Energy Popup ── */}
        {showEnergyPopup && (
          <ModalCard onClose={() => setShowEnergyPopup(false)}>
            <View style={{ alignItems: "center", gap: Spacing.four, marginTop: Spacing.four }}>
              <Text style={{ fontSize: 52 }}>⚡</Text>
              <Text
                style={{
                  fontSize: FontSizes.xl,
                  fontWeight: FontWeights.extrabold,
                  color: Colors.textPrimary,
                  textAlign: "center",
                }}
              >
                Hết năng lượng!
              </Text>
              <Text
                style={{
                  fontSize: FontSizes.md,
                  color: Colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Bạn cần năng lượng để bắt đầu bài học mới. Năng lượng tối đa là 5. Hãy mua bằng xu hoặc xem quảng cáo để hồi phục.
              </Text>
              {adError && (
                <Text
                  style={{ fontSize: FontSizes.sm, color: Colors.error, textAlign: "center" }}
                >
                  {adError}
                </Text>
              )}
              <View style={{ width: "100%", gap: Spacing.two, marginTop: Spacing.two }}>
                <GradientButton
                  title="MUA FULL (400 COIN)"
                  onPress={async () => {
                    try {
                      await refillEnergy();
                      setShowEnergyPopup(false);
                    } catch (e: any) {
                      setAdError(e?.response?.data?.message || "Không đủ coins");
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
                      setAdError(e?.response?.data?.message || "Lỗi kết nối quảng cáo");
                    }
                  }}
                  style={{ width: "100%" }}
                />
                <GradientButton
                  title="ĐỂ SAU"
                  variant="outline"
                  onPress={() => { setShowEnergyPopup(false); setAdError(null); }}
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
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải lộ trình…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {processedTopics.flatMap((topic, topicIndex) => {
              const lessons = topic.lessons;
              const totalMapHeight = START_Y + lessons.length * NODE_SPACING + 80;
              const paths = generatePaths(lessons);
              const accent = TOPIC_ACCENTS[topicIndex % TOPIC_ACCENTS.length];

              return [
                // ── Topic Banner ──
                <Animated.View
                  key={`header-${topic.topicId}`}
                  entering={FadeInDown.delay(topicIndex * 60).duration(350)}
                  style={[
                    styles.bannerWrapper,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                    },
                  ]}
                >
                  <View style={[styles.bannerAccentBar, { backgroundColor: accent.from }]} />
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerTextBlock}>
                      <Text style={[styles.bannerEyebrow, { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }]}>PHẦN {topicIndex + 1}</Text>
                      <Text style={[styles.bannerTitle, { color: isDark ? "#FFFFFF" : colors.text }]} numberOfLines={2}>
                        {topic.topicTitle}
                      </Text>
                      <Text style={[styles.bannerMeta, { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }]}>
                        {lessons.filter((l) => l.status === "COMPLETED").length}/{lessons.length} bài học
                      </Text>
                    </View>
                    <AnimatedPressable
                      style={[
                        styles.guidebookBtn,
                        {
                          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                        },
                      ]}
                      onPress={() => {}}
                      pressScale={0.92}
                    >
                      <Text style={{ fontSize: 16 }}>📖</Text>
                      <Text style={[styles.guidebookBtnText, { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }]}>HƯỚNG DẪN</Text>
                    </AnimatedPressable>
                  </View>
                </Animated.View>,

                // ── Map Section ──
                <View
                  key={`map-${topic.topicId}`}
                  style={[styles.mapContainer, { height: totalMapHeight }]}
                >
                  {/* SVG Track */}
                  <Svg style={StyleSheet.absoluteFillObject}>
                    <Defs>
                      <SvgGradient id={`activeGrad-${topicIndex}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={accent.from} stopOpacity="1" />
                        <Stop offset="1" stopColor={accent.to} stopOpacity="1" />
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
                    {/* Inactive track inner line (dash-like) */}
                    <Path
                      d={paths.fullPath}
                      fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="8 12"
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
                  </Svg>

                  {/* Floating orbs as decorative ambience */}
                  {lessons.map((_, index) => {
                    if (index % 3 !== 0) return null;
                    const nodeOffset = getOffset(index);
                    const side = nodeOffset >= 0 ? -1 : 1;
                    const orbX = CENTER_X + nodeOffset + side * (60 + (index % 3) * 18);
                    const orbY = START_Y + index * NODE_SPACING + 28;
                    const size = 18 + (index % 4) * 8;
                    return (
                      <Animated.View
                        key={`orb-${topicIndex}-${index}`}
                        entering={FadeIn.delay(index * 80).duration(600)}
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
                  {lessons.map((lesson, index) => (
                    <HexNode
                      key={lesson.lessonId}
                      node={{
                        id: lesson.lessonId,
                        title: lesson.title,
                        status: lesson.status as NodeStatus,
                        lessonType: lesson.lessonType,
                      }}
                      index={index}
                      centerX={CENTER_X}
                      isActive={lesson.lessonId === globalActiveLessonId}
                      isPopupVisible={selectedLesson?.lessonId === lesson.lessonId}
                      onPress={() => {
                        if (lesson.status === "LOCKED") return;
                        if (energy < 1) {
                          setShowEnergyPopup(true);
                        } else {
                          setSelectedLesson(
                            selectedLesson?.lessonId === lesson.lessonId ? null : lesson
                          );
                        }
                      }}
                      onStart={() => {
                        setSelectedLesson(null);
                        router.push(`/quiz/ready?lessonId=${lesson.lessonId}`);
                      }}
                    />
                  ))}
                </View>,
              ];
            })}
          </ScrollView>
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
    backgroundColor: "rgba(139,92,246,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
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
    paddingTop: Spacing.four,
  },

  // ── Topic Banner ──
  bannerWrapper: {
    marginHorizontal: Spacing.five,
    marginBottom: Spacing.two,
    marginTop: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    flexDirection: "row",
  },
  bannerAccentBar: {
    width: 4,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  bannerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  bannerTextBlock: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  bannerEyebrow: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  bannerTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  bannerMeta: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.sans,
    color: "rgba(255,255,255,0.35)",
    marginTop: 4,
  },
  guidebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  guidebookBtnText: {
    fontSize: 10,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.6,
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
  nodeIconEmoji: {
    fontSize: 22,
  },
  nodeIconActive: {
    fontSize: 26,
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
    borderColor: "rgba(139,92,246,0.25)",
    ...Shadows.lg,
  },
  popoverBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  popoverBadge: {
    backgroundColor: "rgba(139,92,246,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.4)",
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
});
