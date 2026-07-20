/**
 * Profile Screen Tab - Enhanced with gradient header banner,
 * animated progress bars, avatar glow, and colored stat cards.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows, AnimationPresets } from '@/constants/theme';
import { Alert } from 'react-native';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
  accentColor: string;
}

function StatBox({ label, value, icon, accentColor }: StatBoxProps) {
  return (
    <AnimatedPressable style={[styles.statBox, { borderLeftColor: accentColor, borderLeftWidth: 3 }]} onPress={() => {}} pressScale={0.97}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </AnimatedPressable>
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
  { id: 'a1', icon: '🔥', title: 'Lửa rừng', description: 'Đạt chuỗi 7 ngày Streak', progress: 7, target: 7 },
  { id: 'a2', icon: '🎓', title: 'Học giả', description: 'Học 100 từ vựng mới', progress: 45, target: 100 },
  { id: 'a3', icon: '🏆', title: 'Vô địch', description: 'Lọt vào top 3 của giải đấu', progress: 1, target: 1 },
  { id: 'a4', icon: '🌟', title: 'Huyền thoại', description: 'Hoàn thành 10 bài học huyền thoại', progress: 3, target: 10 },
];

/** Animated achievement progress bar */
function AnimatedProgressFill({ progress, isCompleted }: { progress: number; isCompleted: boolean }) {
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withDelay(
      400,
      withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animWidth.value}%` as any,
  }));

  return (
    <View style={styles.progressBarBg}>
      <Animated.View
        style={[
          styles.progressBarFill,
          { backgroundColor: isCompleted ? Colors.accent : Colors.primary },
          fillStyle,
        ]}
      />
    </View>
  );
}

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
      {/* Gradient Profile Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <AnimatedPressable style={styles.signOutBtn} onPress={handleSignOut} pressScale={0.95}>
          <Text style={styles.signOutBtnText}>Đăng xuất</Text>
        </AnimatedPressable>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.userCard}>
            <View style={styles.avatarBg}>
              <Text style={styles.avatarEmoji}>🦉</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{user?.displayName || 'Học viên Kotodama'}</Text>
              <Text style={styles.userName}>@{user?.email?.split('@')[0] || 'kotodama_user'}</Text>
              <Text style={styles.joinDate}>Tham gia từ tháng 6 năm 2026</Text>
            </View>
            <AnimatedPressable onPress={() => router.push('/profile/edit')} pressScale={0.9} style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Sửa</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* Statistics Grid */}
        <Animated.Text
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.sectionTitle}
        >
          Thống kê
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.statsGrid}
        >
          <StatBox icon="🔥" label="Ngày Streak" value={7} accentColor="#F59E0B" />
          <StatBox icon="⚡" label="Tổng số XP" value={980} accentColor={Colors.primary} />
          <StatBox icon="🛡️" label="Giải đấu" value="Emerald" accentColor="#10B981" />
          <StatBox icon="👑" label="Vương miện" value={12} accentColor={Colors.secondary} />
        </Animated.View>

        {/* Achievements Section */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.sectionTitle}
        >
          Thành tích
        </Animated.Text>
        <StaggeredList staggerDelay={80} initialDelay={400}>
          {ACHIEVEMENTS.map((item) => {
            const isCompleted = item.progress >= item.target;
            const progressPercent = Math.min((item.progress / item.target) * 100, 100);

            return (
              <AnimatedPressable key={item.id} style={styles.achievementCard} onPress={() => {}} pressScale={0.98}>
                <View style={styles.achievementIconBg}>
                  <Text style={styles.achievementIcon}>{item.icon}</Text>
                </View>
                
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                  <Text style={styles.achievementDesc}>{item.description}</Text>
                  
                  {/* Animated Progress Row */}
                  <View style={styles.progressRow}>
                    <AnimatedProgressFill progress={progressPercent} isCompleted={isCompleted} />
                    <Text style={styles.progressText}>
                      {item.progress} / {item.target}
                    </Text>
                  </View>
                </View>
              </AnimatedPressable>
            );
          })}
        </StaggeredList>
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
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.six,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  signOutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signOutBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.six,
    ...Shadows.md,
  },
  avatarBg: {
    width: 76,
    height: 76,
    borderRadius: 46,
    backgroundColor: Colors.cream,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow(Colors.accent),
  },
  avatarEmoji: {
    fontSize: 44,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  userName: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  joinDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editProfileBtn: {
    backgroundColor: Colors.lockedBg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
  },
  editProfileText: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    ...Shadows.sm,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
    marginTop: 2,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  achievementIconBg: {
    width: 56,
    height: 56,
    borderRadius: 36,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 30,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: FontSizes.lg,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 16,
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },
});

