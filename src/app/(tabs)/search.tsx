/**
 * Shop Screen - Enhanced with animated cards, shimmer on premium banner,
 * larger icons, and press animations on buy buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows, AnimationPresets } from '@/constants/theme';

interface ShopItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: number;
  currencyIcon: string;
  purchased: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 's1',
    icon: '🛡️',
    title: 'Bảo hộ Streak',
    description: 'Giữ nguyên chuỗi Streak của bạn nếu lỡ quên học 1 ngày.',
    price: 200,
    currencyIcon: '💎',
    purchased: false,
  },
  {
    id: 's2',
    icon: '❤️',
    title: 'Nạp đầy Tim',
    description: 'Bổ sung ngay 5 tim để tiếp tục các bài học của bạn.',
    price: 350,
    currencyIcon: '💎',
    purchased: false,
  },
  {
    id: 's3',
    icon: '🎩',
    title: 'Y phục Quý phái',
    description: 'Mặc cho cú mascot 🦉 một bộ lễ phục cực kỳ lịch lãm.',
    price: 400,
    currencyIcon: '💎',
    purchased: true,
  },
  {
    id: 's4',
    icon: '⚡',
    title: 'Gấp đôi hoặc không',
    description: 'Đặt cược 50 💎 để nhận lại 100 💎 sau chuỗi 7 ngày học.',
    price: 50,
    currencyIcon: '💎',
    purchased: false,
  },
];

export default function ShopScreen() {
  const buttonPulse = useSharedValue(1);

  React.useEffect(() => {
    buttonPulse.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }]
  }));

  return (
    <AnimatedScreen>
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gem Counter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cửa hàng</Text>
        <View style={styles.gemCounter}>
          <Text style={styles.gemEmoji}>💎</Text>
          <Text style={styles.gemText}>520</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium Super Banner */}
        <Animated.View entering={FadeIn.duration(300)}>
          <LinearGradient
            colors={[Colors.primary, '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.superBanner}
          >
            <View style={styles.superHeader}>
              <Text style={styles.superIcon}>🦉⚡</Text>
              <View style={styles.superContent}>
                <Text style={styles.superTitle}>Super Kotodama</Text>
                <Text style={styles.superDesc}>
                  Học không quảng cáo, vô hạn Tim và các tính năng độc quyền!
                </Text>
              </View>
            </View>
            <Animated.View style={buttonStyle}>
              <AnimatedPressable style={styles.superButton} onPress={() => {}} pressScale={0.97}>
                <Text style={styles.superButtonText}>DÙNG THỬ 2 TUẦN MIỄN PHÍ</Text>
              </AnimatedPressable>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Section title */}
        <Animated.Text
          entering={FadeIn.delay(100).duration(250)}
          style={styles.sectionTitle}
        >
          Vật phẩm hỗ trợ
        </Animated.Text>

        {/* Items List */}
        <StaggeredList staggerDelay={80} initialDelay={300}>
          {SHOP_ITEMS.map((item) => (
            <AnimatedPressable
              key={item.id}
              style={styles.itemCard}
              onPress={() => {}}
              pressScale={0.98}
            >
              <View style={styles.itemIconContainer}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              
              {/* Buy/Purchased Action Button */}
              {item.purchased ? (
                <View style={styles.purchasedTag}>
                  <Text style={styles.purchasedText}>ĐÃ MUA</Text>
                </View>
              ) : (
                <AnimatedPressable style={styles.buyButton} onPress={() => {}} pressScale={0.93}>
                  <View style={styles.buyButtonShadow} />
                  <View style={styles.buyButtonContent}>
                    <Text style={styles.buyButtonText}>
                      {item.price} {item.currencyIcon}
                    </Text>
                  </View>
                </AnimatedPressable>
              )}
            </AnimatedPressable>
          ))}
        </StaggeredList>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  gemCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: 6,
    ...Shadows.sm,
  },
  gemEmoji: {
    fontSize: 18,
  },
  gemText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  superBanner: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    flexDirection: 'column',
    gap: Spacing.four,
    marginBottom: Spacing.six,
    ...Shadows.lg,
  },
  superHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  superIcon: {
    fontSize: 52,
  },
  superContent: {
    flex: 1,
  },
  superTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  superDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 20,
  },
  superButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    width: '100%',
    ...Shadows.sm,
  },
  superButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  itemIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  purchasedTag: {
    backgroundColor: Colors.lockedBg,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasedText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
  },
  // 3D Small Buy Button Style
  buyButton: {
    width: 90,
    height: 44,
    position: 'relative',
  },
  buyButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
    bottom: -3,
    backgroundColor: '#CC9300',
    borderRadius: BorderRadius.md,
  },
  buyButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
});

