/**
 * StaggeredList - Wraps children in staggered entrance animations.
 * Each child fades in + slides up with an incremental delay for a polished list feel.
 */

import React from 'react';
import { type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimationPresets } from '@/constants/theme';

interface StaggeredListProps {
  children: React.ReactNode;
  /** Delay between each item in ms (default: 60) */
  staggerDelay?: number;
  /** Initial delay before first item in ms (default: 0) */
  initialDelay?: number;
  /** Animation duration per item in ms (default: 400) */
  duration?: number;
  style?: ViewStyle;
}

export function StaggeredList({
  children,
  staggerDelay = AnimationPresets.staggerDelay,
  initialDelay = 0,
  duration = 400,
  style,
}: StaggeredListProps) {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => (
        <Animated.View
          key={index}
          entering={FadeIn
            .delay(initialDelay + index * staggerDelay)
            .duration(duration)
          }
          style={style}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}
