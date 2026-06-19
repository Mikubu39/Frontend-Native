/**
 * Lesson node circle on the Duolingo-style path.
 *
 * Matches the app's existing design:
 * - Completed: pink/magenta circle with white checkmark ✓
 * - Locked: gray circle
 * - Current: pink circle with white checkmark + subtle glow
 */

import { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import type { Lesson } from '@/types';

import { COMPLETED_PINK, CURRENT_PINK, LOCKED_GRAY } from './lesson-path-constants';

interface LessonNodeProps {
  lesson: Lesson;
  /** Horizontal offset from center (for S-curve positioning) */
  offsetX: number;
}

/** White checkmark SVG-like shape using View */
function Checkmark() {
  return (
    <View style={checkmarkStyles.container}>
      <View style={checkmarkStyles.longArm} />
      <View style={checkmarkStyles.shortArm} />
    </View>
  );
}

const checkmarkStyles = StyleSheet.create({
  container: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  longArm: {
    position: 'absolute',
    width: 12,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: 1 }],
  },
  shortArm: {
    position: 'absolute',
    width: 7,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    transform: [{ rotate: '45deg' }, { translateX: -3.5 }, { translateY: 2.5 }],
  },
});

export function LessonNode({ lesson, offsetX }: LessonNodeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for current lesson
  useEffect(() => {
    if (lesson.status === 'current') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [lesson.status, pulseAnim]);

  const handlePressIn = () => {
    if (lesson.status === 'locked') return;
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isCompleted = lesson.status === 'completed';
  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  const bgColor = isLocked ? LOCKED_GRAY : (isCurrent ? CURRENT_PINK : COMPLETED_PINK);
  const circleSize = 42;

  return (
    <View style={[styles.wrapper, { transform: [{ translateX: offsetX }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          if (!isLocked) {
            // TODO: Navigate to lesson
            console.log('Navigate to lesson:', lesson.id);
          }
        }}
        disabled={isLocked}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: bgColor,
              transform: [
                { scale: Animated.multiply(scaleAnim, isCurrent ? pulseAnim : new Animated.Value(1)) },
              ],
            },
            isCurrent && styles.currentShadow,
          ]}
        >
          {(isCompleted || isCurrent) && <Checkmark />}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 6,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentShadow: {
    shadowColor: CURRENT_PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
