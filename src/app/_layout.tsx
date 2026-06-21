/**
 * Root Layout - Stack navigator: Splash → Auth → Onboarding → Tabs
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider } from '@/contexts/auth-context';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { QuizProvider } from '@/contexts/quiz-context';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

function SplashAnimation({ onFinish }: { onFinish: () => void }) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Phase 1: Circle expands from bottom
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Phase 2: Title appears
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // Phase 3: Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
      // Fade out
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const maxDimension = Math.max(width, height) * 2;

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeOut }]}>
      {/* Cream background */}
      <View style={styles.creamBg} />

      {/* Expanding gradient circle */}
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [{ scale: circleScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF00FF', '#8B5CF6', '#E88D67', '#FFB800']}
          style={[
            styles.gradientCircle,
            {
              width: maxDimension,
              height: maxDimension,
              borderRadius: maxDimension / 2,
            },
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
            transform: [{ scale: titleScale }],
          },
        ]}
      >
        <Text style={styles.splashTitle}>Kotodama</Text>
        <Animated.Text style={[styles.splashSubtitle, { opacity: subtitleOpacity }]}>
          Learn Japanese naturally
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashAnimation onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <OnboardingProvider>
        <QuizProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.cream },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="lesson" />
            <Stack.Screen name="quiz" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="voice" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="profile" />
            <Stack.Screen name="friends" />
            <Stack.Screen name="reward" options={{ presentation: 'modal' }} />
          </Stack>
        </QuizProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creamBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cream,
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gradientCircle: {
    position: 'absolute',
    bottom: -200,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  splashTitle: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
});
