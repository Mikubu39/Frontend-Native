import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, Spacing, Shadows } from '@/constants/theme';
import { useGamification } from '@/contexts/gamification-context';

export default function StreakExtendedScreen() {
  const router = useRouter();
  const { streak } = useGamification();

  // Animation values
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    rotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 150, easing: Easing.linear }),
        withTiming(5, { duration: 150, easing: Easing.linear }),
        withTiming(0, { duration: 150, easing: Easing.linear })
      ),
      -1, // infinite
      true
    );
  }, []);

  const animatedFireStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ]
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.fireContainer, animatedFireStyle]}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.textContainer}>
          <Text style={styles.title}>Streak đã tăng!</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.subtitle}>Ngày học liên tiếp</Text>
          <Text style={styles.description}>Tuyệt vời! Bạn đang giữ lửa rất tốt. Hãy tiếp tục học mỗi ngày nhé!</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.buttonContainer}>
        <GradientButton
          title="TUYỆT VỜI"
          onPress={() => router.replace('/(tabs)')}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF9600', // Bright orange for fire
    padding: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireContainer: {
    width: 180,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.eight,
    ...Shadows.glow('#FFFFFF'),
  },
  fireEmoji: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Spacing.six,
    borderRadius: 24,
    width: '100%',
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.two,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FF9600',
    marginVertical: Spacing.two,
    textShadowColor: 'rgba(255, 150, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.four,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: Spacing.four,
  },
});
