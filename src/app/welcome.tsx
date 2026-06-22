/**
 * Welcome / Entry Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Mascot & Brand Header */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotEmoji}>🦉</Text>
          <Text style={styles.brandTitle}>Kotodama</Text>
          <Text style={styles.brandSubtitle}>
            Học tiếng Nhật tự nhiên, miễn phí và hiệu quả!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
          >
            <View style={styles.primaryButtonShadow} />
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonText}>BẮT ĐẦU NGAY</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryButtonShadow} />
            <View style={styles.secondaryButtonContent}>
              <Text style={styles.secondaryButtonText}>TÔI ĐÃ CÓ TÀI KHOẢN</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.eight,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
    width: '100%',
  },
  mascotEmoji: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  // 3D Primary Button Style
  primaryButton: {
    width: '100%',
    height: 54,
    position: 'relative',
  },
  primaryButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: -4,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.md,
  },
  primaryButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
  // 3D Secondary Button Style (Transparent/Cream background with border)
  secondaryButton: {
    width: '100%',
    height: 54,
    position: 'relative',
  },
  secondaryButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: -4,
    backgroundColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
  },
  secondaryButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
});
