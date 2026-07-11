/**
 * Learn / Home Screen - Redesigned with animated nodes,
 * gradient header, pulse effects on active node, and staggered entrance.
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { CircleProgress } from '@/components/ui/circle-progress';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { LEARNING_PATH } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows, AnimationPresets } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Constants for deterministic node mapping
const NODE_SIZE = 88;
const NODE_SPACING = 155; // Vertical distance between nodes
const START_Y = 40;       // Starting padding top of the map
const CENTER_X = width / 2;

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
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          borderWidth: 3,
          borderColor: Colors.accent,
          top: -8,
          left: -8,
        },
        glowStyle,
      ]}
    />
  );
}

export default function LearnScreen() {
  const router = useRouter();

  // Find the active node index (first one that isn't locked)
  const activeNodeIndex = LEARNING_PATH.findIndex(node => !node.isLocked);

  // Generate SVG path command (smooth winding curve)
  const generateSvgPath = () => {
    if (LEARNING_PATH.length === 0) return '';
    let path = '';
    
    LEARNING_PATH.forEach((_, index) => {
      const x = CENTER_X + getOffset(index);
      const y = START_Y + index * NODE_SPACING + NODE_SIZE / 2;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Use a quadratic bezier curve for a smoother winding look
        const prevX = CENTER_X + getOffset(index - 1);
        const prevY = START_Y + (index - 1) * NODE_SPACING + NODE_SIZE / 2;
        
        // Control point is mid-way in Y, but follows the horizontal flow
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        
        path += ` Q ${prevX} ${cpY}, ${x} ${y}`;
      }
    });
    
    return path;
  };

  const totalMapHeight = START_Y + LEARNING_PATH.length * NODE_SPACING + 60;

  return (
    <AnimatedScreen>
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Gradient Header Stats */}
      <LinearGradient
        colors={['#FFFFFF', '#FFF8E7']}
        style={styles.header}
      >
        <AnimatedPressable style={styles.flagButton} onPress={() => {}} pressScale={0.9}>
          <Text style={styles.flagEmoji}>🇯🇵</Text>
        </AnimatedPressable>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome5 name="fire" size={20} color="#FF9600" solid />
            <Text style={styles.statText}>7</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome5 name="gem" size={20} color="#1CB0F6" solid />
            <Text style={[styles.statText, { color: '#1CB0F6' }]}>520</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome5 name="heart" size={20} color="#FF4B4B" solid />
            <Text style={[styles.statText, { color: '#FF4B4B' }]}>5</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Scroll Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Unit Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
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
            <AnimatedPressable style={styles.guidebookButton} onPress={() => {}} pressScale={0.95}>
              <Text style={styles.guidebookIcon}>📖</Text>
              <Text style={styles.guidebookText}>HƯỚNG DẪN</Text>
            </AnimatedPressable>
          </LinearGradient>
        </Animated.View>

        {/* Map Path Container */}
        <View style={[styles.mapContainer, { height: totalMapHeight }]}>
          {/* Background SVG Curve */}
          <Svg style={StyleSheet.absoluteFillObject}>
            <Path
              d={generateSvgPath()}
              fill="none"
              stroke={Colors.lockedBg}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Draw active portion of the line up to the active node */}
            {activeNodeIndex > 0 && (
              <Path
                d={generateSvgPath().split(' ').slice(0, (activeNodeIndex * 6) + 3).join(' ')}
                fill="none"
                stroke={Colors.accent}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>

          {/* Render Nodes Absolutely */}
          {LEARNING_PATH.map((node, index) => {
            const isLocked = node.isLocked;
            const isActive = index === activeNodeIndex;
            const progress = node.total > 0 ? node.progress / node.total : 0;
            
            const x = CENTER_X + getOffset(index);
            const y = START_Y + index * NODE_SPACING;

            return (
              <Animated.View 
                key={node.id}
                entering={FadeInDown
                  .delay(200 + index * AnimationPresets.staggerDelay)
                  .duration(300)
                }
                style={[
                  styles.nodeAbsoluteWrapper,
                  {
                    left: x - NODE_SIZE / 2,
                    top: y,
                  }
                ]}
              >
                {/* Speech Bubble Tooltip for Active Node */}
                {isActive && (
                  <Animated.View
                    entering={FadeInDown.delay(600).duration(300)}
                    style={styles.tooltipContainer}
                  >
                    <View style={styles.tooltipBody}>
                      <Text style={styles.tooltipTitle}>BÀI TIẾP THEO</Text>
                      <AnimatedPressable
                        style={styles.tooltipButton}
                        onPress={() => router.push(`/quiz/ready?lessonId=${node.id}`)}
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
                    isLocked ? styles.nodeCircleLocked : styles.nodeCircleActive
                  ]}
                  onPress={() => !isLocked && router.push(`/quiz/ready?lessonId=${node.id}`)}
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
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Shadows.sm,
  },
  flagButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    padding: Spacing.five,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
