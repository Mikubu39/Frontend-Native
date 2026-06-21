/**
 * Login Screen
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthForm } from '@/components/auth/auth-form';
import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AuthHeader
          activeTab={0}
          onTabChange={(index) => {
            if (index === 1) router.replace('/(auth)/signup');
          }}
        />

        <AuthForm
          mode="login"
          username={username}
          email={email}
          password={password}
          onUsernameChange={setUsername}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={() => router.replace('/(tabs)')}
          onToggleMode={() => router.replace('/(auth)/signup')}
          onForgotPassword={() => {}}
        />

        <SocialAuthSection
          onGooglePress={() => router.replace('/(tabs)')}
          onFacebookPress={() => router.replace('/(tabs)')}
          onApplePress={() => router.replace('/(tabs)')}
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
  scroll: {
    flexGrow: 1,
    gap: Spacing.six,
    paddingBottom: Spacing.eight,
  },
});
