/**
 * Learn / Home Screen - Redesigned to match Duolingo style
 * Features a winding vertical path of lesson nodes connected by a smooth SVG line.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CircleProgress } from '@/components/ui/circle-progress';
import { LEARNING_PATH } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Constants for deterministic node mapping
const NODE_SIZE = 84;
const NODE_SPACING = 150; // Vertical distance between nodes
const START_Y = 40;       // Starting padding top of the map
const CENTER_X = width / 2;

// Function to calculate horizontal offset
const getOffset = (index: number) => {
  const pattern = [0, 45, 75, 45, 0, -45, -75, -45];
  return pattern[index % pattern.length];
};

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Stats */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.flagButton}>
          <Text style={styles.flagEmoji}>🇯🇵</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statText}>7</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💎</Text>
            <Text style={styles.statText}>520</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statText}>5</Text>
          </View>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Unit Banner */}
        <View style={styles.unitBanner}>
          <View style={styles.unitTextContainer}>
            <Text style={styles.unitSubtitle}>PHẦN 1: NHẬP MÔN</Text>
            <Text style={styles.unitTitle}>Chào hỏi, giới thiệu bản thân</Text>
          </View>
          <TouchableOpacity style={styles.guidebookButton} activeOpacity={0.8}>
            <Text style={styles.guidebookIcon}>📖</Text>
            <Text style={styles.guidebookText}>HƯỚNG DẪN</Text>
          </TouchableOpacity>
        </View>

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
              <View 
                key={node.id} 
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
                  <View style={styles.tooltipContainer}>
                    <View style={styles.tooltipBody}>
                      <Text style={styles.tooltipTitle}>BÀI TIẾP THEO</Text>
                      <TouchableOpacity
                        style={styles.tooltipButton}
                        onPress={() => router.push(`/quiz/ready?lessonId=${node.id}`)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.tooltipButtonText}>BẮT ĐẦU +10 XP</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tooltipArrow} />
                  </View>
                )}

                {/* Circular Lesson Node */}
                <TouchableOpacity
                  style={[
                    styles.nodeCircle, 
                    isLocked ? styles.nodeCircleLocked : styles.nodeCircleActive
                  ]}
                  onPress={() => !isLocked && router.push(`/quiz/ready?lessonId=${node.id}`)}
                  disabled={isLocked}
                  activeOpacity={0.9}
                >
                  <CircleProgress
                    progress={progress}
                    size={NODE_SIZE - 8}
                    strokeWidth={8}
                    color={isLocked ? Colors.locked : Colors.accent}
                    trackColor={isLocked ? Colors.lockedBg : 'rgba(255, 255, 255, 0.35)'}
                    label={isLocked ? '🔒' : (node.icon || '⭐')}
                  />
                </TouchableOpacity>

                {/* Node Title text below circle */}
                <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]} numberOfLines={1}>
                  {node.title}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
  },
  flagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  flagEmoji: {
    fontSize: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  statEmoji: {
    fontSize: 22,
  },
  statText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  unitBanner: {
    backgroundColor: Colors.accent,
    padding: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#CC9300',
  },
  unitTextContainer: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  unitSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: 'rgba(0, 0, 0, 0.5)',
    letterSpacing: 1,
  },
  unitTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  guidebookButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  guidebookIcon: {
    fontSize: 16,
  },
  guidebookText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeCircleActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: Colors.accent,
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
    top: -85,
    alignSelf: 'center',
    zIndex: 10,
    alignItems: 'center',
    width: 150,
  },
  tooltipBody: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#C81B75',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
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
