import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { LESSON_TIPS } from '@/data/quiz';

export default function QuizReadyScreen() {
  const router = useRouter();
  const { lessonId = 'lp1' } = useLocalSearchParams<{ lessonId: string }>();
  const [showTranslation1, setShowTranslation1] = useState(false);
  const [showTranslation2, setShowTranslation2] = useState(false);

  const tip = LESSON_TIPS[lessonId as keyof typeof LESSON_TIPS] || LESSON_TIPS.lp5;

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.flag}>
        <Text style={styles.flagEmoji}>💡</Text>
      </View>

      <View style={styles.tipHeader}>
        <Text style={styles.tipSubtitle}>{tip.subtitle}</Text>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>

      <View style={styles.card}>
        {tip.formula ? (
          <View style={styles.formulaContainer}>
            <Text style={styles.formulaText}>{tip.formula}</Text>
          </View>
        ) : null}

        <Text style={styles.explanation}>
          {tip.explanation}
        </Text>

        <Text style={styles.sectionLabel}>Ví dụ thực hành:</Text>

        {tip.examples.map((ex, index) => {
          const isShow = index === 0 ? showTranslation1 : showTranslation2;
          const setIsShow = index === 0 ? setShowTranslation1 : setShowTranslation2;
          
          return (
            <TouchableOpacity 
              key={index}
              style={styles.exampleRow} 
              onPress={() => setIsShow(!isShow)}
              activeOpacity={0.8}
            >
              <View style={styles.exampleContent}>
                <Text style={styles.japaneseText}>{ex.japanese}</Text>
                <Text style={styles.translationText}>
                  {isShow ? ex.translation : 'タップして翻訳を表示 (Nhấp để xem dịch)'}
                </Text>
              </View>
              <Text style={styles.speakerEmoji}>🔊</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <GradientButton
        title="BẮT ĐẦU LUYỆN TẬP"
        onPress={() => router.replace(`/quiz/q1?lessonId=${lessonId}`)}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.six,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: Spacing.six,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  flag: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  flagEmoji: {
    fontSize: 24,
  },
  tipHeader: {
    alignItems: 'center',
    gap: 4,
  },
  tipSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  tipTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  formulaContainer: {
    backgroundColor: Colors.cream,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  formulaText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
  },
  explanation: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  highlight: {
    color: Colors.secondary,
    fontWeight: FontWeights.extrabold,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lockedBg,
    marginBottom: Spacing.three,
  },
  exampleContent: {
    flex: 1,
  },
  japaneseText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  translationText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  speakerEmoji: {
    fontSize: 20,
    marginLeft: Spacing.two,
  },
  button: {
    width: '100%',
  },
});
