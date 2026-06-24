/**
 * Login Screen - Redesigned to match Duolingo style
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { StyledTextInput } from '@/components/ui/text-input';
import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';
import LottieView from 'lottie-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUser || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }
    setLoading(true);
    try {
      await signIn(emailOrUser, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Thất bại', 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header navigation bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/welcome')} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Title & Mascot Section */}
        <View style={styles.titleSection}>
          <View style={styles.mascotContainer}>
            <LottieView
              source={require('@/assets/animations/hi_mascot.json')}
              autoPlay
              loop
              style={styles.mascot}
            />
          </View>
          <Text style={styles.titleText}>Đăng nhập</Text>
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          <StyledTextInput
            placeholder="Email hoặc tên đăng nhập"
            value={emailOrUser}
            onChangeText={setEmailOrUser}
            autoCapitalize="none"
          />

          <StyledTextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* 3D Blue/Purple Login Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.submitButtonShadow} />
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotButton} onPress={() => {}}>
            <Text style={styles.forgotText}>QUÊN MẬT KHẨU</Text>
          </TouchableOpacity>
        </View>

        {/* Social Auth */}
        <SocialAuthSection
          onGooglePress={async () => {
            await signInWithGoogle();
            router.replace('/(tabs)');
          }}
          onFacebookPress={async () => {
            await signIn('facebook@user.com', 'fbpwd');
            router.replace('/(tabs)');
          }}
          onApplePress={async () => {
            await signIn('apple@user.com', 'applepwd');
            router.replace('/(tabs)');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing.eight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  closeButtonText: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  headerPlaceholder: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    alignItems: 'center',
  },
  mascotContainer: {
    width: 140,
    height: 140,
    marginBottom: Spacing.two,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
  },
  formContainer: {
    paddingHorizontal: Spacing.six,
    gap: Spacing.four,
  },
  submitButton: {
    width: '100%',
    height: 52,
    marginTop: Spacing.four,
    position: 'relative',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: -4,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.md,
  },
  submitButtonContent: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: Spacing.two,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
});