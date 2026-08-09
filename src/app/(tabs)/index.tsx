/**
 * Learn / Home Screen - Redesigned with animated nodes,
 * gradient header, pulse effects on active node, staggered entrance,
 * and sticky scroll-spy tab bar for topics.
 */

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { CircleProgress } from '@/components/ui/circle-progress';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useGamification } from '@/contexts/gamification-context';
import { roadmapApi } from '@/services/api/roadmap';
import type { RoadmapTopicResponse, RoadmapLessonResponse } from '@/types';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalCard } from '@/components/ui/modal-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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
const START_Y = 120;       // Starting padding top of the map

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
  isPopupVisible,
  onPress,
  onStart,
  centerX,
}: {
  node: { id: number | string; title: string; isLocked: boolean; progress: number; total: number; icon?: string };
  index: number;
  isActive: boolean;
  isPopupVisible: boolean;
  onPress: () => void;
  onStart: () => void;
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
    } else {
      floatOffset.value = withTiming(0);
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
          zIndex: isPopupVisible ? 100 : (isActive ? 10 : 2),
        },
        isActive && floatStyle,
      ]}
    >
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

      {/* Lesson Details Popover (Bottom) */}
      {isPopupVisible && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.lessonPopoverContainer}
        >
          <View style={styles.lessonPopoverArrow} />
          <View style={styles.lessonPopoverBody}>
            <Text style={styles.lessonPopoverTitle}>{node.title}</Text>
            <Text style={styles.lessonPopoverSubtitle}>Bài học • 1 ⚡</Text>
            <GradientButton
              title="BẮT ĐẦU"
              onPress={onStart}
              style={{ width: '100%', paddingVertical: 10 }}
            />
          </View>
        </Animated.View>
      )}

    </Animated.View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const CENTER_X = width / 2;
  const { energy, exp, streak, coins, maxEnergy, refillEnergy, watchAdToRefill } = useGamification();

  const [topics, setTopics] = useState<RoadmapTopicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnergyPopup, setShowEnergyPopup] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLessonResponse | null>(null);

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

  const globalActiveLessonId = topics.flatMap(t => t.lessons).find(l => l.status === 'UNLOCKED' && l.lessonType !== 'JUMP_TEST')?.lessonId
    || topics.flatMap(t => t.lessons).find(l => l.status === 'UNLOCKED')?.lessonId;

  const generateSvgPath = (lessons: RoadmapLessonResponse[]) => {
    if (lessons.length === 0) return { fullPath: '', activePath: '' };
    
    let fullPath = '';
    let activePath = '';

    // Calculate how far the active path should go for this topic
    let progressIndex = -1;
    for (let i = 0; i < lessons.length; i++) {
      if (lessons[i].status === 'COMPLETED') {
        progressIndex = i;
      } else if (lessons[i].status === 'UNLOCKED') {
        progressIndex = i;
        break;
      } else {
        break;
      }
    }

    lessons.forEach((lesson, index) => {
      const x = CENTER_X + getOffset(index);
      const y = START_Y + index * NODE_SPACING + NODE_SIZE / 2;
      const isActiveNode = index <= progressIndex;

      if (index === 0) {
        fullPath += `M ${x} ${y}`;
        if (isActiveNode) activePath += `M ${x} ${y}`;
      } else {
        const prevX = CENTER_X + getOffset(index - 1);
        const prevY = START_Y + (index - 1) * NODE_SPACING + NODE_SIZE / 2;

        const cp1x = prevX;
        const cp1y = (prevY + y) / 2;
        const cp2x = x;
        const cp2y = (prevY + y) / 2;
        
        const curve = ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        fullPath += curve;
        if (isActiveNode) {
          if (activePath === '') activePath += `M ${prevX} ${prevY}`;
          activePath += curve;
        }
      }
    });

    return { fullPath, activePath };
  };

  const renderDecorations = (lessons: RoadmapLessonResponse[], topicIndex: number) => {
    return lessons.map((_, index) => {
      if (index % 2 !== 0 && index % 3 !== 0) return null;
      const nodeOffset = getOffset(index);
      const decX = nodeOffset > 0 ? 30 : width - 80;
      const decY = START_Y + index * NODE_SPACING + 20 + (index % 2 === 0 ? 30 : -20);
      const icons = ['☁️', '🌳', '🌸', '✨', '🗻', '🎈', '🕊️', '⛩️'];
      const icon = icons[((topicIndex * 5) + index * 3) % icons.length]; 
      return (
        <Animated.View
          key={`dec-${topicIndex}-${index}`}
          entering={FadeIn.delay(index * 100).duration(500)}
          style={{ position: 'absolute', left: decX, top: decY, zIndex: 1 }}
        >
          <View style={{ opacity: 0.85 }}>
            <Text style={{ fontSize: 38, transform: [{ scaleX: nodeOffset > 0 ? -1 : 1 }] }}>
              {icon}
            </Text>
          </View>
        </Animated.View>
      );
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <AnimatedScreen>
      <View style={styles.container}>
        {/* Sticky Header Container */}
        <BlurView
          intensity={90}
          tint="light"
          style={[styles.headerContainer, { paddingTop: insets.top + Spacing.four }]}
        >
          {/* Top Stats Row */}
          <View style={styles.statsRow}>
            <AnimatedPressable style={styles.flagButton} onPress={() => { }} pressScale={0.9}>
              <Text style={styles.flagEmoji}>🇯🇵</Text>
            </AnimatedPressable>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <FontAwesome5 name="fire" size={20} color="#FF9600" solid />
                <Text style={styles.statText}>{streak}</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesome5 name="coins" size={20} color="#FFC107" solid />
                <Text style={[styles.statText, { color: '#FFC107' }]}>{coins}</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesome5 name="battery-full" size={20} color="#00E676" solid />
                <Text style={[styles.statText, { color: '#00E676' }]}>{energy}</Text>
              </View>
            </View>
          </View>
        </BlurView>

        {showEnergyPopup && (
          <ModalCard onClose={() => setShowEnergyPopup(false)}>
            <View style={{ alignItems: 'center', gap: Spacing.four, marginTop: Spacing.four }}>
              <Text style={{ fontSize: 48 }}>⚡</Text>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, color: Colors.textPrimary, textAlign: 'center' }}>
                Hết năng lượng!
              </Text>
              <Text style={{ fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                Bạn cần năng lượng để bắt đầu bài học mới. Năng lượng tối đa là 5. Hãy mua bằng xu hoặc xem quảng cáo để hồi phục.
              </Text>
              {adError && (
                <Text style={{ fontSize: FontSizes.sm, color: Colors.error, textAlign: 'center' }}>
                  {adError}
                </Text>
              )}
              <View style={{ width: '100%', gap: Spacing.two, marginTop: Spacing.two }}>
                <GradientButton
                  title="MUA FULL (400 COIN)"
                  onPress={async () => {
                    try {
                      await refillEnergy();
                      setShowEnergyPopup(false);
                    } catch (e: any) {
                      setAdError(e?.response?.data?.message || 'Khong du coins');
                    }
                  }}
                  style={{ width: '100%' }}
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
                      setAdError(e?.response?.data?.message || 'Lỗi kết nối quảng cáo');
                    }
                  }}
                  style={{ width: '100%' }}
                />
                <GradientButton
                  title="ĐỂ SAU"
                  variant="outline"
                  onPress={() => {
                    setShowEnergyPopup(false);
                    setAdError(null);
                  }}
                  style={{ width: '100%', borderWidth: 0 }}
                />
              </View>
            </View>
          </ModalCard>
        )}

        {/* ModalCard for selectedLesson has been removed and replaced by popover */}

        {/* Main Scroll Content */}
        {isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent]}
            showsVerticalScrollIndicator={false}
          >
            {topics.flatMap((topic, topicIndex) => {
              const lessons = topic.lessons;

              const totalMapHeight = START_Y + lessons.length * NODE_SPACING + 60;
              const paths = generateSvgPath(lessons);

              return [
                <View key={`header-${topic.topicId}`} style={styles.topicHeaderWrapper}>
                  {/* Unit Banner - will be sticky */}
                    <LinearGradient
                      colors={[Colors.accent, '#E6A300']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.unitBanner}
                    >
                      <View style={styles.unitTextContainer}>
                        <Text style={styles.unitSubtitle}>PHẦN {topicIndex + 1}</Text>
                        <Text style={styles.unitTitle}>{topic.topicTitle}</Text>
                      </View>
                      <AnimatedPressable style={styles.guidebookButton} onPress={() => { }} pressScale={0.95}>
                        <Text style={styles.guidebookIcon}>📖</Text>
                        <Text style={styles.guidebookText}>HƯỚNG DẪN</Text>
                      </AnimatedPressable>
                    </LinearGradient>
                  </View>,

                <View key={`map-${topic.topicId}`} style={[styles.mapContainer, { height: totalMapHeight }]}>
                  {/* Map Path Container */}
                    {renderDecorations(lessons, topicIndex)}

                    {/* Background SVG Curve - Gamified 3D Road */}
                    <Svg style={StyleSheet.absoluteFillObject}>
                      {/* 3D Road Shadow / Base */}
                      <G y={6}>
                        <Path
                          d={paths.fullPath}
                          fill="none"
                          stroke="#D4D4D4"
                          strokeWidth={22}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {paths.activePath !== '' && (
                          <Path
                            d={paths.activePath}
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
                        d={paths.fullPath}
                        fill="none"
                        stroke="#F0F0F0"
                        strokeWidth={22}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {paths.activePath !== '' && (
                        <Path
                          d={paths.activePath}
                          fill="none"
                          stroke={Colors.accent}
                          strokeWidth={22}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </Svg>

                    {/* Render Nodes Absolutely */}
                    {lessons.map((lesson, index) => {
                      const isLocked = lesson.status === 'LOCKED';
                      const progress = lesson.status === 'COMPLETED' ? 1 : 0;
                      return (
                        <PathNodeItem
                          key={lesson.lessonId}
                          node={{
                            id: lesson.lessonId,
                            title: lesson.title,
                            isLocked,
                            progress,
                            total: 1,
                            icon: lesson.lessonType === 'GRAMMAR' ? '📚' : (lesson.lessonType === 'VOCABULARY' ? '📝' : '⭐')
                          }}
                          index={index}
                          centerX={CENTER_X}
                          isActive={lesson.lessonId === globalActiveLessonId}
                          isPopupVisible={selectedLesson?.lessonId === lesson.lessonId}
                          onPress={() => {
                            if (isLocked) return;
                            if (energy < 1) {
                              setShowEnergyPopup(true);
                            } else {
                              if (selectedLesson?.lessonId === lesson.lessonId) {
                                setSelectedLesson(null);
                              } else {
                                setSelectedLesson(lesson);
                              }
                            }
                          }}
                          onStart={() => {
                            setSelectedLesson(null);
                            router.push(`/quiz/ready?lessonId=${lesson.lessonId}`);
                          }}
                        />
                      );
                    })}
                </View>
              ];
            })}
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
  headerContainer: {
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.7)',
    backgroundColor: Colors.cream,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.two,
  },
  tabBar: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.accent,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.accent,
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
    gap: Spacing.four,
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
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topicHeaderWrapper: {
    backgroundColor: Colors.cream,
    paddingBottom: Spacing.two,
    paddingTop: Spacing.two,
    zIndex: 10,
  },
  unitBanner: {
    marginHorizontal: Spacing.five,
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
    fontSize: FontSizes.lg,
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
  lessonPopoverContainer: {
    position: 'absolute',
    top: NODE_SIZE + 10,
    alignSelf: 'center',
    zIndex: 20,
    alignItems: 'center',
    width: 260,
  },
  lessonPopoverArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    marginBottom: -2,
  },
  lessonPopoverBody: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    width: '100%',
    ...Shadows.lg,
  },
  lessonPopoverTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'left',
    marginBottom: 4,
  },
  lessonPopoverSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.accent,
    fontWeight: FontWeights.bold,
    textAlign: 'left',
    marginBottom: Spacing.three,
  },
});
