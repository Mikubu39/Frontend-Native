/**
 * AuthForm - Login/Signup form fields.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StyledTextInput } from '@/components/ui/text-input';
import { GradientButton } from '@/components/ui/gradient-button';
import { PasswordValidator } from '@/components/ui/password-validator';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface AuthFormProps {
  mode: 'login' | 'signup';
  username: string;
  email: string;
  password: string;
  onUsernameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
  onForgotPassword?: () => void;
  passwordError?: string;
  loading?: boolean;
}

export function AuthForm({
  mode,
  username,
  email,
  password,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onForgotPassword,
  passwordError,
  loading,
}: AuthFormProps) {
  const isLogin = mode === 'login';

  return (
    <View style={styles.container}>
      <StyledTextInput
        label="Username"
        placeholder="Username"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
      />

      {!isLogin && (
        <StyledTextInput
          label="Email address"
          placeholder="kotodama@gmail.com"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}

      <StyledTextInput
        label="Password"
        placeholder="kotodamastudy"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        error={passwordError}
      />

      {isLogin && onForgotPassword && (
        <TouchableOpacity onPress={onForgotPassword} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      )}

      {!isLogin && <PasswordValidator password={password} />}

      <GradientButton
        title={isLogin ? 'Log In' : 'Sign up'}
        onPress={onSubmit}
        loading={loading}
        style={styles.submitButton}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Already have account? ' : 'Already have account? '}
        </Text>
        <TouchableOpacity onPress={onToggleMode}>
          <Text style={styles.toggleLink}>{isLogin ? 'Log in' : 'Log in'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
  },
  forgotRow: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: Colors.secondary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  toggleLink: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
