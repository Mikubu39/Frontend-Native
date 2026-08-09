import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

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

  const renderSection = (title: string, items: { icon: any, label: string, isDestructive?: boolean, onPress: () => void }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.item, index < items.length - 1 && styles.itemBorder]}
            onPress={item.onPress}
          >
            <View style={styles.itemLeft}>
              <Ionicons 
                name={item.icon} 
                size={22} 
                color={item.isDestructive ? Colors.error : Colors.primary} 
                style={styles.itemIcon} 
              />
              <Text style={[styles.itemLabel, item.isDestructive && styles.itemLabelDestructive]}>
                {item.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderSection('Tài khoản', [
          { icon: 'person-circle-outline', label: 'Thông tin tài khoản', onPress: () => router.push('/profile/edit') },
          { icon: 'lock-closed-outline', label: 'Đổi mật khẩu', onPress: () => {} },
          { icon: 'globe-outline', label: 'Ngôn ngữ', onPress: () => {} }
        ])}

        {renderSection('Tuỳ chọn', [
          { icon: 'notifications-outline', label: 'Thông báo', onPress: () => {} },
          { icon: 'volume-high-outline', label: 'Âm thanh và hiệu ứng', onPress: () => {} },
          { icon: 'accessibility-outline', label: 'Trợ năng', onPress: () => {} }
        ])}

        {renderSection('Khác', [
          { icon: 'help-circle-outline', label: 'Trợ giúp', onPress: () => {} },
          { icon: 'information-circle-outline', label: 'Về Kotodama', onPress: () => {} },
          { icon: 'log-out-outline', label: 'Đăng xuất', isDestructive: true, onPress: handleSignOut }
        ])}
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
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: Spacing.two,
    marginLeft: -Spacing.two,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.five,
    paddingBottom: Spacing.eight,
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.three,
    marginLeft: Spacing.two,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    backgroundColor: '#FFFFFF',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: Spacing.four,
  },
  itemLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  itemLabelDestructive: {
    color: Colors.error,
  }
});
