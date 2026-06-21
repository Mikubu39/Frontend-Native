/**
 * Signup Screen
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthForm } from '@/components/auth/auth-form';
import { SocialAuthSection } from '@/components/auth/social-auth-section';
import { Colors, Spacing } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AuthHeader
          activeTab={1}
          onTabChange={(index) => {
            if (index === 0) router.replace('/(auth)/login');
          }}
        />

        <AuthForm
          mode="signup"
          username={username}
          email={email}
          password={password}
          onUsernameChange={setUsername}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={() => router.replace('/(onboarding)/goal')}
          onToggleMode={() => router.replace('/(auth)/login')}
        />

        <SocialAuthSection
          onGooglePress={() => router.replace('/(onboarding)/goal')}
          onFacebookPress={() => router.replace('/(onboarding)/goal')}
          onApplePress={() => router.replace('/(onboarding)/goal')}
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
