import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { StyledTextInput } from '@/components/ui/text-input';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';
import { userService } from '@/services/api/user';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.email?.split('@')[0] || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName || !username) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tên hiển thị và username.');
      return;
    }
    
    setLoading(true);
    try {
      await userService.updateProfile({
        displayName,
        username,
      });
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      // Note: We'd normally also update the user context here if the backend returns the new token/user.
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => router.back()}>←</Text>
        <Text style={styles.headerTitle}>Chỉnh sửa Hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <StyledTextInput
            placeholder="Tên hiển thị"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <StyledTextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Dùng để kết bạn và hiển thị trên mã QR.</Text>
        </View>

        <GradientButton 
          title={loading ? 'Đang cập nhật...' : 'Lưu thay đổi'} 
          onPress={handleSave} 
          disabled={loading} 
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
  },
  backBtn: {
    fontSize: FontSizes.xxl,
    width: 40,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  content: {
    padding: Spacing.six,
    gap: Spacing.six,
  },
  formGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: -4,
  }
});
