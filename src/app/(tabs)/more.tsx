import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  color: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

interface MenuSection {
  title: string;
  data: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Học tập & Luyện tập',
    data: [
      {
        id: 'm1',
        title: 'Học chữ cái',
        subtitle: 'Hiragana, Katakana & Kanji',
        icon: 'language-outline',
        route: '/characters',
        color: Colors.accent,
      },
      {
        id: 'm2',
        title: 'Trung tâm luyện tập',
        subtitle: 'Ôn tập lỗi sai và luyện phát âm',
        icon: 'barbell-outline',
        route: '/review',
        color: '#10B981', // Emerald green
      },
    ]
  },
  {
    title: 'Cộng đồng',
    data: [
      {
        id: 'm3',
        title: 'Bạn bè & Theo dõi',
        subtitle: 'Tìm kiếm và theo dõi tiến độ',
        icon: 'people-outline',
        route: '/friends',
        color: '#3B82F6', // Blue
      },
      {
        id: 'm4',
        title: 'Bảng xếp hạng',
        subtitle: 'Thi đua cùng bạn bè',
        icon: 'trophy-outline',
        route: '/(tabs)/leaderboard',
        color: '#F59E0B', // Amber
      },
    ]
  },
  {
    title: 'Hệ thống',
    data: [
      {
        id: 'm5',
        title: 'Cài đặt',
        icon: 'settings-outline',
        color: Colors.textSecondary,
        onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển.'),
      },
      {
        id: 'm6',
        title: 'Trợ giúp & Phản hồi',
        icon: 'help-circle-outline',
        color: Colors.textSecondary,
        onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển.'),
      },
      {
        id: 'm7',
        title: 'Đăng xuất',
        icon: 'log-out-outline',
        color: Colors.error,
        isDestructive: true,
        onPress: () => Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive' }
        ]),
      },
    ]
  }
];

export default function MoreMenuScreen() {
  const router = useRouter();

  const handlePress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Khám phá</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <StaggeredList staggerDelay={50}>
            {/* Profile Card */}
            <AnimatedPressable 
              style={styles.profileCard} 
              onPress={() => router.push('/(tabs)/profile')}
              pressScale={0.98}
            >
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={60} color={Colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Người dùng Nihongo</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Trình độ: N5</Text>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </View>
            </AnimatedPressable>

            {/* Menu Sections */}
            {MENU_SECTIONS.map((section, sectionIdx) => (
              <View key={`section-${sectionIdx}`} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionCard}>
                  {section.data.map((item, index) => {
                    const isLast = index === section.data.length - 1;
                    return (
                      <AnimatedPressable
                        key={item.id}
                        style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                        onPress={() => handlePress(item)}
                        pressScale={0.98}
                      >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                          <Ionicons name={item.icon} size={22} color={item.color} />
                        </View>
                        <View style={styles.menuItemContent}>
                          <Text style={[styles.itemTitle, item.isDestructive && { color: Colors.error }]}>
                            {item.title}
                          </Text>
                          {item.subtitle && (
                            <Text style={styles.itemDesc}>{item.subtitle}</Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={'rgba(0,0,0,0.1)'} />
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </View>
            ))}
            
            <View style={styles.footerSpacer} />
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  
  // Profile Card Styles
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.four,
    marginBottom: Spacing.six,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    marginRight: Spacing.four,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Styles
  sectionContainer: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.three,
    marginLeft: Spacing.two,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    backgroundColor: '#FFFFFF',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footerSpacer: {
    height: 40,
  }
});
