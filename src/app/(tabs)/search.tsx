/**
 * Shop Screen - Redesigned to match Duolingo Shop
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

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
  return (
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
        <View style={styles.superBanner}>
          <Text style={styles.superIcon}>🦉⚡</Text>
          <View style={styles.superContent}>
            <Text style={styles.superTitle}>Super Kotodama</Text>
            <Text style={styles.superDesc}>Học không quảng cáo, vô hạn Tim và các tính năng độc quyền!</Text>
            <TouchableOpacity style={styles.superButton} activeOpacity={0.8}>
              <Text style={styles.superButtonText}>DÙNG THỬ 2 TUẦN MIỄN PHÍ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Vật phẩm hỗ trợ</Text>

        {/* Items List */}
        <View style={styles.itemsList}>
          {SHOP_ITEMS.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              
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
                <TouchableOpacity style={styles.buyButton} activeOpacity={0.8}>
                  <View style={styles.buyButtonShadow} />
                  <View style={styles.buyButtonContent}>
                    <Text style={styles.buyButtonText}>
                      {item.price} {item.currencyIcon}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
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
  gemCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: 4,
  },
  gemEmoji: {
    fontSize: 16,
  },
  gemText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  superBanner: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
    marginBottom: Spacing.six,
  },
  superIcon: {
    fontSize: 48,
  },
  superContent: {
    flex: 1,
  },
  superTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
  },
  superDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    lineHeight: 18,
  },
  superButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  superButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  itemsList: {
    gap: Spacing.four,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  itemIcon: {
    fontSize: 36,
  },
  itemInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  purchasedTag: {
    backgroundColor: '#F5F5F5',
    borderColor: Colors.locked,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasedText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  // 3D Small Buy Button Style
  buyButton: {
    width: 90,
    height: 40,
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
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
  },
});
