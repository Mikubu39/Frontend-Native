/**
 * Profile Screen Tab - Redesigned to match Duolingo Profile Tab
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  target: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    icon: '🔥',
    title: 'Lửa rừng',
    description: 'Đạt chuỗi 7 ngày Streak',
    progress: 7,
    target: 7,
  },
  {
    id: 'a2',
    icon: '🎓',
    title: 'Học giả',
    description: 'Học 100 từ vựng mới',
    progress: 45,
    target: 100,
  },
  {
    id: 'a3',
    icon: '🏆',
    title: 'Vô địch',
    description: 'Lọt vào top 3 của giải đấu',
    progress: 1,
    target: 1,
  },
  {
    id: 'a4',
    icon: '🌟',
    title: 'Huyền thoại',
    description: 'Hoàn thành 10 bài học huyền thoại',
    progress: 3,
    target: 10,
  },
];

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/welcome');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Profile Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatarEmoji}>🦉</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{user?.displayName || 'Học viên Kotodama'}</Text>
            <Text style={styles.userName}>@{user?.email?.split('@')[0] || 'kotodama_user'}</Text>
            <Text style={styles.joinDate}>Tham gia từ tháng 6 năm 2026</Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <Text style={styles.sectionTitle}>Thống kê</Text>
        <View style={styles.statsGrid}>
          <StatBox icon="🔥" label="Ngày Streak" value={7} />
          <StatBox icon="⚡" label="Tổng số XP" value={980} />
          <StatBox icon="🛡️" label="Giải đấu" value="Emerald" />
          <StatBox icon="👑" label="Vương miện" value={12} />
        </View>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>Thành tích</Text>
        <View style={styles.achievementsContainer}>
          {ACHIEVEMENTS.map((item) => {
            const isCompleted = item.progress >= item.target;
            const progressPercent = Math.min((item.progress / item.target) * 100, 100);

            return (
              <View key={item.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{item.icon}</Text>
                
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                  <Text style={styles.achievementDesc}>{item.description}</Text>
                  
                  {/* Progress Row */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${progressPercent}%`,
                            backgroundColor: isCompleted ? Colors.accent : Colors.primary 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {item.progress} / {item.target}
                    </Text>
                  </View>
                </View>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  signOutBtn: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  signOutBtnText: {
    color: Colors.error,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  userCard: {
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
  avatarBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 42,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  userName: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  joinDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.six,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
  },
  achievementsContainer: {
    gap: Spacing.four,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  achievementDesc: {
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
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.lockedBg,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    width: 45,
    textAlign: 'right',
  },
});
