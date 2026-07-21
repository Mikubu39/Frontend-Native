import { BorderRadius, Colors, FontSizes, FontWeights, Spacing, Shadows } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';

import { userService } from '@/services/api/user';
import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import { UserOverviewResponse } from '@/types/user-api';

interface FriendOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
}

const OPTIONS: FriendOption[] = [
  { id: 'find', icon: 'search-outline', title: 'Tìm bạn bè', subtitle: 'Tìm đối tác học tập cùng nhau', color: '#3B82F6' },
  { id: 'sync', icon: 'phone-portrait-outline', title: 'Đồng bộ danh bạ', subtitle: 'Tìm bạn bè từ điện thoại', color: Colors.primary },
  { id: 'share', icon: 'qr-code-outline', title: 'Mã QR của tôi', subtitle: 'Chia sẻ mã kết bạn', color: '#10B981' },
  { id: 'voucher', icon: 'gift-outline', title: 'Mã khuyến mãi', subtitle: 'Nhận phần thưởng khi mời', color: '#F59E0B' },
];

export default function FriendsScreen() {
  const router = useRouter();
  const [syncResults, setSyncResults] = useState<UserOverviewResponse[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncContacts = async () => {
    try {
      setIsSyncing(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền truy cập danh bạ để tìm bạn bè.');
        setIsSyncing(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        const phoneNumbers = data
          .map(c => c.phoneNumbers?.[0]?.number)
          .filter(Boolean) as string[];
        
        // Remove spaces and special characters for a clean match
        const cleanedNumbers = phoneNumbers.map(num => num.replace(/[^a-zA-Z0-9+]/g, ''));
        
        // Send both raw and cleaned formats to maximize matching chance (increased limit to 1000 to not cut off test contacts)
        const toSync = Array.from(new Set([...phoneNumbers, ...cleanedNumbers])).slice(0, 1000);
        
        console.log("Found raw contacts:", phoneNumbers.length);
        console.log("Sending to backend:", toSync.length);

        const results = await userService.syncContacts({ phoneNumbers: toSync });
        console.log("Backend returned results:", results);
        setSyncResults(results);
      } else {
        setSyncResults([]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể đồng bộ danh bạ.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOptionPress = (id: string) => {
    if (id === 'find') {
      router.push('/friends/search');
    } else if (id === 'sync') {
      handleSyncContacts();
    } else if (id === 'share') {
      router.push('/profile/qr');
    } else {
      Alert.alert('Thông báo', 'Tính năng đang phát triển.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Thêm Bạn Bè</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.options}>
        <StaggeredList staggerDelay={50}>
          {OPTIONS.map((option) => (
            <AnimatedPressable
              key={option.id}
              style={styles.optionCard}
              activeOpacity={1}
              onPress={() => handleOptionPress(option.id)}
              disabled={option.id === 'sync' && isSyncing}
              pressScale={0.98}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              {option.id === 'sync' && isSyncing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </View>
              )}
            </AnimatedPressable>
          ))}
        </StaggeredList>
      </View>

      <Modal visible={syncResults !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kết quả đồng bộ</Text>
              <TouchableOpacity onPress={() => setSyncResults(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={syncResults || []}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.userCard}
                  onPress={() => {
                    setSyncResults(null);
                    router.push({
                      pathname: '/profile/view-search-profile',
                      params: {
                        id: item.id?.toString() || '',
                        username: (item as any).username || item.id?.toString(),
                        displayName: item.displayName || 'Người dùng',
                        avatarUrl: item.avatarUrl || '',
                        level: item.level?.toString() || '1',
                        isFollowing: 'false'
                      }
                    });
                  }}
                >
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {item.displayName ? String(item.displayName).charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.fullName}>{item.displayName || 'Người dùng'}</Text>
                    <Text style={styles.userLevel}>Lv {item.level || 1}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: Spacing.four }} />
                  <Text style={styles.emptyText}>Không tìm thấy bạn bè nào dùng ứng dụng này trong danh bạ của bạn.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  options: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  optionText: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  listContainer: {
    padding: Spacing.four,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.four,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  avatarText: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  userLevel: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: FontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.sixteen,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
