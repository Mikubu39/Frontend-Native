/**
 * WritingCanvas - Gesture-based drawing canvas to practice writing characters.
 * Uses react-native-svg for cross-platform vector path rendering.
 * Figma screen 18
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { GradientButton } from '../ui/gradient-button';

interface Point {
  x: number;
  y: number;
}

interface WritingCanvasProps {
  character?: string;
  romaji?: string;
  onComplete?: () => void;
}

export function WritingCanvas({ character = 'あ', romaji = 'a', onComplete }: WritingCanvasProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const handleTouchStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const newPoint = { x: locationX, y: locationY };
    setCurrentPath([newPoint]);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const newPoint = { x: locationX, y: locationY };
    setCurrentPath((prev) => [...prev, newPoint]);
  };

  const handleTouchEnd = () => {
    if (currentPath.length > 0) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath([]);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  // Convert points array to SVG path data (d attribute)
  const getPathData = (points: Point[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      if (idx === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      return `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.characterLabel}>Practice Writing:</Text>
        <Text style={styles.charText}>{character} ({romaji})</Text>
      </View>

      {/* Canvas */}
      <View
        style={styles.canvasContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stroke guidelines */}
        <View style={styles.guidelineRow} pointerEvents="none" />
        <View style={styles.guidelineCol} pointerEvents="none" />
        <Text style={styles.ghostText} pointerEvents="none">{character}</Text>

        <Svg style={StyleSheet.absoluteFill}>
          {/* Render already drawn paths */}
          {paths.map((p, idx) => (
            <Path
              key={`path-${idx}`}
              d={getPathData(p)}
              fill="none"
              stroke={Colors.primary}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Render active drawing path */}
          {currentPath.length > 0 && (
            <Path
              d={getPathData(currentPath)}
              fill="none"
              stroke={Colors.primary}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={clearCanvas} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>

        {onComplete && (
          <GradientButton
            title="SUBMIT"
            onPress={onComplete}
            style={styles.submitButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
  },
  characterLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  charText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  canvasContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  ghostText: {
    position: 'absolute',
    alignSelf: 'center',
    top: '15%',
    fontSize: 160,
    fontWeight: FontWeights.regular,
    color: 'rgba(139, 92, 246, 0.08)',
  },
  guidelineRow: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
  },
  guidelineCol: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  clearButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.locked,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  clearText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  submitButton: {
    flex: 1,
  },
});
