/**
 * Login Screen - Enhanced with animated form entrance,
 * animated mascot, and press-animated buttons.
 */

import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StyledTextInput } from '@/components/ui/text-input';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <AnimatedPressable onPress={() => router.replace('/welcome')} style={styles.closeButton} pressScale={0.9}>
            <Text style={styles.closeButtonText}>✕</Text>
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Title & Mascot Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.titleSection}
        >
          <View style={styles.mascotContainer}>
            <LottieView
              source={require('@/assets/animations/hi_mascot.json')}
              autoPlay
              loop
              style={styles.mascot}
            />
          </View>
          <Text style={styles.titleText}>Đăng nhập</Text>
        </Animated.View>

        {/* Inputs */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.formContainer}
        >
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

          {/* 3D Login Button */}
          <AnimatedPressable
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            pressScale={0.97}
          >
            <View style={styles.submitButtonShadow} />
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable style={styles.forgotButton} onPress={() => { }} pressScale={0.95}>
            <Text style={styles.forgotText}>QUÊN MẬT KHẨU</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Social Auth */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
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
        </Animated.View>
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
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: Colors.cream,
  },
  closeButtonText: {
    fontSize: 20,
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
    width: 150,
    height: 150,
    marginBottom: Spacing.two,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: FontSizes.title,
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
    height: 56,
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
    top: 5,
    bottom: -5,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
  },
  submitButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
});
