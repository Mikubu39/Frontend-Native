/**
 * Daily Quests Screen - Redesigned to match Duolingo Quests
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface QuestItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardIcon: string;
  completed: boolean;
}

const DAILY_QUESTS: QuestItem[] = [
  {
    id: 'q1',
    title: 'Người chăm chỉ',
    description: 'Kiếm 50 XP',
    progress: 30,
    target: 50,
    rewardIcon: '⚡',
    completed: false,
  },
  {
    id: 'q2',
    title: 'Học đúng giờ',
    description: 'Học 15 phút hôm nay',
    progress: 15,
    target: 15,
    rewardIcon: '💎',
    completed: true,
  },
  {
    id: 'q3',
    title: 'Điểm tuyệt đối',
    description: 'Đạt điểm 100% trong 2 bài học',
    progress: 1,
    target: 2,
    rewardIcon: '🎁',
    completed: false,
  },
];

export default function QuestsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhiệm vụ hàng ngày</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Monthly Challenge Header Card */}
        <View style={styles.monthlyCard}>
          <Text style={styles.monthlyBadge}>🏆</Text>
          <View style={styles.monthlyInfo}>
            <Text style={styles.monthlyTitle}>Thử thách tháng 6</Text>
            <Text style={styles.monthlyDesc}>Hoàn thành 30 nhiệm vụ để giành Cúp Vàng!</Text>
            
            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(18 / 30) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>18 / 30 nhiệm vụ đã xong</Text>
          </View>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>

        {/* Quest List */}
        <View style={styles.questList}>
          {DAILY_QUESTS.map((quest) => {
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

            return (
              <View key={quest.id} style={[styles.questCard, quest.completed && styles.questCardCompleted]}>
                <Text style={styles.questIcon}>{quest.rewardIcon}</Text>
                
                <View style={styles.questContent}>
                  <View style={styles.questTextRow}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    {quest.completed && <Text style={styles.completedBadge}>Xong</Text>}
                  </View>
                  <Text style={styles.questDesc}>{quest.description}</Text>
                  
                  {/* Progress Row */}
                  <View style={styles.progressRow}>
                    <View style={styles.questProgressBarBg}>
                      <View 
                        style={[
                          styles.questProgressBarFill, 
                          { 
                            width: `${progressPercent}%`,
                            backgroundColor: quest.completed ? Colors.success : Colors.secondary 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.questProgressText}>
                      {quest.progress} / {quest.target}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Chest Rewards section */}
        <View style={styles.chestsContainer}>
          <Text style={styles.sectionTitle}>Rương phần thưởng</Text>
          <View style={styles.chestsRow}>
            <View style={styles.chestItem}>
              <Text style={styles.chestEmoji}>📦</Text>
              <Text style={styles.chestLabel}>Rương Đồng</Text>
              <Text style={styles.chestStatus}>Đã mở</Text>
            </View>
            
            <View style={styles.chestItem}>
              <Text style={styles.chestEmoji}>🎁</Text>
              <Text style={styles.chestLabel}>Rương Bạc</Text>
              <Text style={styles.chestStatusLocked}>Mở lúc 18h</Text>
            </View>
            
            <View style={styles.chestItem}>
              <Text style={styles.chestEmoji}>👑</Text>
              <Text style={styles.chestLabel}>Rương Vàng</Text>
              <Text style={styles.chestStatusLocked}>Khóa</Text>
            </View>
          </View>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  monthlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderWidth: 2,
    borderColor: Colors.lockedBg,
    marginBottom: Spacing.six,
  },
  monthlyBadge: {
    fontSize: 54,
  },
  monthlyInfo: {
    flex: 1,
  },
  monthlyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  monthlyDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.lockedBg,
    borderRadius: 5,
    marginTop: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  questList: {
    gap: Spacing.four,
    marginBottom: Spacing.six,
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  questCardCompleted: {
    backgroundColor: '#F9F9F9',
  },
  questIcon: {
    fontSize: 32,
  },
  questContent: {
    flex: 1,
  },
  questTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    color: Colors.success,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  questProgressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.lockedBg,
    borderRadius: 4,
  },
  questProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  questProgressText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    width: 45,
    textAlign: 'right',
  },
  chestsContainer: {
    marginTop: Spacing.two,
  },
  chestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  chestItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  chestEmoji: {
    fontSize: 36,
  },
  chestLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.two,
  },
  chestStatus: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chestStatusLocked: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: FontWeights.bold,
    marginTop: 4,
  },
});
