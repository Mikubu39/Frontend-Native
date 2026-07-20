import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import QRCode from 'react-native-qrcode-svg';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function MyQRScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const username = user?.email?.split('@')[0] || 'user';
  const profileUrl = `nihongoapp://profile/@${username}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thêm tôi trên Kotodama: ${profileUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => router.back()}>←</Text>
        <Text style={styles.headerTitle}>Mã QR của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.username}>@{username}</Text>
          
          <View style={styles.qrWrapper}>
            <QRCode
              value={profileUrl}
              size={200}
              color={Colors.primary}
              backgroundColor="#FFFFFF"
            />
          </View>
          
          <Text style={styles.hint}>Quét mã để kết bạn với tôi</Text>
        </View>

        <GradientButton 
          title="Chia sẻ mã QR" 
          onPress={handleShare} 
        />
      </View>
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
  },
  backBtn: {
    fontSize: FontSizes.xxl,
    width: 40,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.eight,
    marginTop: Spacing.eight,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.eight,
    alignItems: 'center',
    width: '100%',
    ...Shadows.md,
  },
  displayName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  username: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.six,
  },
  qrWrapper: {
    padding: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.six,
    textAlign: 'center',
  }
});
