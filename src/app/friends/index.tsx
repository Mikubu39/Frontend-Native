/**
 * Add Friends Screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import { userService } from '@/services/api/user';

const OPTIONS = [
  { id: 'find', icon: '👥', title: 'Find buddies', subtitle: 'Find partners to study together' },
  { id: 'sync', icon: '📱', title: 'Sync Contacts', subtitle: 'Find friends from your phone' },
  { id: 'share', icon: '📤', title: 'My QR Code', subtitle: 'Share your code to friends' },
  { id: 'voucher', icon: '🎁', title: 'Promote voucher', subtitle: 'Get rewards for inviting' },
];

export default function FriendsScreen() {
  const router = useRouter();

  const handleSyncContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền truy cập danh bạ để tìm bạn bè.');
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        const phoneNumbers = data
          .map(c => c.phoneNumbers?.[0]?.number)
          .filter(Boolean) as string[];
        // Cắt bớt nếu danh bạ quá dài
        const toSync = phoneNumbers.slice(0, 100);
        
        await userService.syncContacts({ phoneNumbers: toSync });
        Alert.alert('Thành công', 'Đã đồng bộ danh bạ. Các bạn bè dùng app sẽ hiện trong mục tìm kiếm.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể đồng bộ danh bạ.');
    }
  };

  const handleOptionPress = (id: string) => {
    if (id === 'find') {
      router.push('/friends/search');
    } else if (id === 'sync') {
      handleSyncContacts();
    } else if (id === 'share') {
      router.push('/profile/qr');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={styles.optionCard} 
            activeOpacity={0.7}
            onPress={() => handleOptionPress(option.id)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    gap: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  options: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    gap: Spacing.one,
  },
  optionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: FontSizes.xxl,
    color: Colors.textSecondary,
  },
});
