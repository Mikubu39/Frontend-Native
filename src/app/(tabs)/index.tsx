/**
 * Learn / Home Screen - Redesigned with animated nodes,
 * gradient header, pulse effects on active node, and staggered entrance.
 */

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { CircleProgress } from '@/components/ui/circle-progress';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useGamification } from '@/contexts/gamification-context';
import { roadmapApi } from '@/services/api/roadmap';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';

// Constants for deterministic node mapping
const NODE_SIZE = 88;
const NODE_SPACING = 135; // Vertical distance between nodes
const START_Y = 40;       // Starting padding top of the map

// Function to calculate horizontal offset
const getOffset = (index: number) => {
  const pattern = [0, 45, 75, 45, 0, -45, -75, -45];
  return pattern[index % pattern.length];
};

/** Pulsing glow ring for active node */
function ActiveNodeGlow({ size }: { size: number }) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.35, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size + 24,
            height: size + 24,
            borderRadius: (size + 24) / 2,
            backgroundColor: Colors.accent,
            top: -12,
            left: -12,
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            borderWidth: 4,
            borderColor: Colors.accent,
            top: -6,
            left: -6,
          },
          glowStyle,
        ]}
      />
    </>
  );
}

function PathNodeItem({
  node,
  index,
  isActive,
  onPress,
  centerX,
}: {
  node: { id: number | string; title: string; isLocked: boolean; progress: number; total: number; icon?: string };
  index: number;
  isActive: boolean;
  onPress: () => void;
  centerX: number;
}) {
  const isLocked = node.isLocked;
  const progress = node.total > 0 ? node.progress / node.total : 0;
  const x = centerX + getOffset(index);
  const y = START_Y + index * NODE_SPACING;

  const floatOffset = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      floatOffset.value = withRepeat(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isActive]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatOffset.value }],
  }));

  return (
    <Animated.View
      key={node.id}
      entering={FadeIn.delay(50 + index * 30).duration(250)}
      style={[
        styles.nodeAbsoluteWrapper,
        {
          left: x - NODE_SIZE / 2,
          top: y,
        },
        isActive && floatStyle,
      ]}
    >
      {/* Speech Bubble Tooltip for Active Node */}
      {isActive && (
        <Animated.View
          entering={FadeIn.delay(300).duration(200)}
          style={styles.tooltipContainer}
        >
          <View style={styles.tooltipBody}>
            <Text style={styles.tooltipTitle}>BÀI TIẾP THEO</Text>
            <AnimatedPressable
              style={styles.tooltipButton}
              onPress={onPress}
              pressScale={0.95}
            >
              <Text style={styles.tooltipButtonText}>BẮT ĐẦU +10 XP</Text>
            </AnimatedPressable>
          </View>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}

      {/* Circular Lesson Node */}
      <AnimatedPressable
        style={[
          styles.nodeCircle,
          isLocked ? styles.nodeCircleLocked : styles.nodeCircleActive,
        ]}
        onPress={onPress}
        disabled={isLocked}
        pressScale={isLocked ? 1 : 0.92}
      >
        {isActive && <ActiveNodeGlow size={NODE_SIZE} />}
        <CircleProgress
          progress={progress}
          size={NODE_SIZE - 8}
          strokeWidth={8}
          color={isLocked ? Colors.locked : Colors.accent}
          trackColor={isLocked ? Colors.lockedBg : 'rgba(255, 255, 255, 0.35)'}
          label={isLocked ? '🔒' : (node.icon || '⭐')}
        />
      </AnimatedPressable>

      {/* Node Title text below circle */}
      <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]} numberOfLines={1}>
        {node.title}
      </Text>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const CENTER_X = width / 2;
  const { energy, exp, streak, coins, maxEnergy } = useGamification();

  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchRoadmap = async () => {
        try {
          const data = await roadmapApi.getRoadmap();
          const flattened = data.flatMap(topic => topic.lessons.map(lesson => ({
            id: lesson.lessonId,
            title: lesson.title,
            isLocked: lesson.status === 'LOCKED',
            progress: lesson.status === 'COMPLETED' ? 1 : 0,
            total: 1,
            icon: lesson.lessonType === 'GRAMMAR' ? '📚' : (lesson.lessonType === 'VOCABULARY' ? '📝' : '⭐')
          })));
          setLearningPath(flattened);
        } catch (error) {
          console.error("Failed to fetch roadmap:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRoadmap();
    }, [])
  );

  // Find the active node index (first one that isn't locked)
  const activeNodeIndex = learningPath.findIndex(node => !node.isLocked);

  // Generate SVG path command (smooth winding curve)
  const generateSvgPath = (endIndex: number = learningPath.length - 1) => {
    if (learningPath.length === 0) return '';
    let path = '';

    // Safety check for empty or out-of-bounds index
    const maxIndex = Math.min(endIndex, learningPath.length - 1);

    learningPath.slice(0, maxIndex + 1).forEach((_, index) => {
      const x = CENTER_X + getOffset(index);
      const y = START_Y + index * NODE_SPACING + NODE_SIZE / 2;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Use a cubic bezier curve for a perfectly smooth winding look
        // Tangents at both start and end points will be strictly vertical
        const prevX = CENTER_X + getOffset(index - 1);
        const prevY = START_Y + (index - 1) * NODE_SPACING + NODE_SIZE / 2;

        const cp1x = prevX;
        const cp1y = (prevY + y) / 2;

        const cp2x = x;
        const cp2y = (prevY + y) / 2;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    });

    return path;
  };

  const renderDecorations = () => {
    return learningPath.map((_, index) => {
      // Add decorations roughly every other node to prevent clutter
      if (index % 2 !== 0 && index % 3 !== 0) return null;

      const nodeOffset = getOffset(index);
      // Place decoration on the opposite side of the node
      const decX = nodeOffset > 0 ? 30 : width - 80;
      const decY = START_Y + index * NODE_SPACING + 20 + (index % 2 === 0 ? 30 : -20);

      const icons = ['☁️', '🌳', '🌸', '✨', '🗻', '🎈', '🕊️', '⛩️'];
      const icon = icons[(index * 3) % icons.length]; // Deterministic randomness

      return (
        <Animated.View
          key={`dec-${index}`}
          entering={FadeIn.delay(index * 100).duration(500)}
          style={{ position: 'absolute', left: decX, top: decY, zIndex: 1, opacity: 0.85 }}
        >
          <Text style={{ fontSize: 38, transform: [{ scaleX: nodeOffset > 0 ? -1 : 1 }] }}>
            {icon}
          </Text>
        </Animated.View>
      );
    });
  };

  const totalMapHeight = START_Y + learningPath.length * NODE_SPACING + 60;
  const insets = useSafeAreaInsets();

  return (
    <AnimatedScreen>
      <View style={styles.container}>
        {/* Glassmorphism Sticky Header */}
        <BlurView
          intensity={80}
          tint="light"
          style={[styles.header, { paddingTop: insets.top + Spacing.four }]}
        >
          <AnimatedPressable style={styles.flagButton} onPress={() => { }} pressScale={0.9}>
            <Text style={styles.flagEmoji}>🇯🇵</Text>
          </AnimatedPressable>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <FontAwesome5 name="fire" size={20} color="#FF9600" solid />
              <Text style={styles.statText}>{streak}</Text>
            </View>

            <View style={styles.statItem}>
              <FontAwesome5 name="gem" size={20} color="#1CB0F6" solid />
              <Text style={[styles.statText, { color: '#1CB0F6' }]}>{coins > 0 ? coins : exp}</Text>
            </View>

            <View style={styles.statItem}>
              <FontAwesome5 name="heart" size={20} color="#FF4B4B" solid />
              <Text style={[styles.statText, { color: '#FF4B4B' }]}>{energy}</Text>
            </View>
          </View>
        </BlurView>

        {/* Main Scroll Content */}
        {isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Unit Banner */}
            <Animated.View entering={FadeIn.delay(50).duration(200)}>
              <LinearGradient
                colors={[Colors.accent, '#E6A300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.unitBanner}
              >
                <View style={styles.unitTextContainer}>
                  <Text style={styles.unitSubtitle}>PHẦN 1: NHẬP MÔN</Text>
                  <Text style={styles.unitTitle}>Chào hỏi, giới thiệu bản thân</Text>
                </View>
                <AnimatedPressable style={styles.guidebookButton} onPress={() => { }} pressScale={0.95}>
                  <Text style={styles.guidebookIcon}>📖</Text>
                  <Text style={styles.guidebookText}>HƯỚNG DẪN</Text>
                </AnimatedPressable>
              </LinearGradient>
            </Animated.View>

            {/* Map Path Container */}
            <View style={[styles.mapContainer, { height: totalMapHeight }]}>
              {/* Gamified Background Decorations */}
              {renderDecorations()}

              {/* Background SVG Curve - Gamified 3D Road */}
              <Svg style={StyleSheet.absoluteFillObject}>
                {/* 3D Road Shadow / Base */}
                <G y={6}>
                  <Path
                    d={generateSvgPath()}
                    fill="none"
                    stroke="#D4D4D4"
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {activeNodeIndex > 0 && (
                    <Path
                      d={generateSvgPath(activeNodeIndex)}
                      fill="none"
                      stroke="#C28A00"
                      strokeWidth={22}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </G>

                {/* Road Top Surface */}
                <Path
                  d={generateSvgPath()}
                  fill="none"
                  stroke="#F0F0F0"
                  strokeWidth={22}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {activeNodeIndex > 0 && (
                  <Path
                    d={generateSvgPath(activeNodeIndex)}
                    fill="none"
                    stroke={Colors.accent}
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>

              {/* Render Nodes Absolutely */}
              {learningPath.map((node, index) => (
                <PathNodeItem
                  key={node.id}
                  node={node}
                  index={index}
                  centerX={CENTER_X}
                  isActive={index === activeNodeIndex}
                  onPress={() => !node.isLocked && router.push(`/quiz/ready?lessonId=${node.id}`)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  flagButton: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.lockedBg,
    ...Shadows.sm,
  },
  flagEmoji: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.five,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statEmoji: {
    fontSize: 24,
  },
  statText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  unitBanner: {
    marginHorizontal: Spacing.five,
    marginTop: Spacing.four,
    padding: Spacing.five,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  unitTextContainer: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  unitSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: 1.2,
  },
  unitTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guidebookButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Shadows.sm,
  },
  guidebookIcon: {
    fontSize: 18,
  },
  guidebookText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
  },
  nodeAbsoluteWrapper: {
    position: 'absolute',
    width: NODE_SIZE,
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCircle: {
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  nodeCircleActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: Colors.accent,
    ...Shadows.md,
  },
  nodeCircleLocked: {
    backgroundColor: Colors.lockedBg,
    borderWidth: 4,
    borderColor: Colors.locked,
  },
  nodeTitle: {
    marginTop: Spacing.two,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: 120,
  },
  nodeTitleLocked: {
    color: Colors.textSecondary,
  },
  tooltipContainer: {
    position: 'absolute',
    top: -90,
    alignSelf: 'center',
    zIndex: 10,
    alignItems: 'center',
    width: 160,
  },
  tooltipBody: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: 6,
    ...Shadows.glow(Colors.secondary),
  },
  tooltipTitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  tooltipButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...Shadows.sm,
  },
  tooltipButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    color: Colors.secondary,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.secondary,
    marginTop: -2,
  },
});
