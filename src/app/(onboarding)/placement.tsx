/**
 * Placement Test Screen - Assesses user's level before starting.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, FontWeights } from '@/constants/theme';
import {
  QuizHeader,
  VocabQuestionCard,
  KanaQuestionCard,
  PictureQuestionCard,
  KanjiFillQuestionCard,
} from '@/components/quiz';
import { GradientButton } from '@/components/ui/gradient-button';
import type { QuizQuestion } from '@/types';

// A short mock placement test
const PLACEMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'p1',
    type: 'vocab',
    instruction: 'Nghĩa của từ "ありがとう" (Arigatou) là gì?',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b3097314?w=400&h=300&fit=crop',
    answers: [
      { id: 'a1', text: 'Xin chào', isCorrect: false },
      { id: 'a2', text: 'Cảm ơn', isCorrect: true },
      { id: 'a3', text: 'Tạm biệt', isCorrect: false },
      { id: 'a4', text: 'Xin lỗi', isCorrect: false },
    ],
  },
  {
    id: 'p2',
    type: 'kana',
    instruction: 'Ghép các ký tự sau để tạo thành từ "Sushi"',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    characters: ['し', 'す', 'さ', 'せ'],
    correctOrder: ['す', 'し'],
  },
  {
    id: 'p3',
    type: 'picture',
    instruction: 'Chọn hình ảnh tương ứng với từ "Nước" (Mizu)',
    word: '水',
    images: [
      { id: 'i1', text: 'Lửa', imageUrl: 'https://images.unsplash.com/photo-1521250260408-f9d9ee48dcc8?w=200&h=200&fit=crop', isCorrect: false },
      { id: 'i2', text: 'Nước', imageUrl: 'https://images.unsplash.com/photo-1533580554988-f58da7509d6f?w=200&h=200&fit=crop', isCorrect: true },
      { id: 'i3', text: 'Đất', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop', isCorrect: false },
      { id: 'i4', text: 'Gió', imageUrl: 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=200&h=200&fit=crop', isCorrect: false },
    ],
  },
  {
    id: 'p4',
    type: 'kanji-fill',
    instruction: 'Điền trợ từ thích hợp vào chỗ trống',
    sentence: '私_学生です。(Tôi là học sinh.)',
    blanks: [1],
    kanjiBank: ['は', 'の', 'が', 'を'],
    correctFills: { 1: 'は' },
  },
  {
    id: 'p5',
    type: 'vocab',
    instruction: 'Cách đọc chính xác của "先生" (Giáo viên) là gì?',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
    answers: [
      { id: 'a1', text: 'がくせい (Gakusei)', isCorrect: false },
      { id: 'a2', text: 'せんせい (Sensei)', isCorrect: true },
      { id: 'a3', text: 'いしゃ (Isha)', isCorrect: false },
      { id: 'a4', text: 'かいしゃいん (Kaishain)', isCorrect: false },
    ],
  }
];

export default function PlacementScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const currentQuestion = PLACEMENT_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / PLACEMENT_QUESTIONS.length;
  const isLastQuestion = currentIndex >= PLACEMENT_QUESTIONS.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      // In a real app, evaluate score here. For now, route to tabs
      router.replace('/(tabs)');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setCurrentIsCorrect(false);
      setHasInteracted(false);
    }
  };

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case 'vocab':
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find((a) => a.id === answerId);
              setCurrentIsCorrect(answer?.isCorrect ?? false);
              setHasInteracted(true);
            }}
          />
        );
      case 'kana':
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, arrangedString) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case 'picture':
        return (
          <PictureQuestionCard
            question={currentQuestion}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={(answerId, isCorrect) => {
              setSelectedAnswerId(answerId);
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(true);
            }}
          />
        );
      case 'kanji-fill':
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, fills) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      <QuizHeader progress={progress} onClose={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Kiểm tra đầu vào</Text>
          <Text style={styles.subtitle}>Hãy cùng xác định điểm bắt đầu phù hợp nhất cho bạn.</Text>
          {renderQuestionCard()}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <GradientButton
          title={isLastQuestion ? 'HOÀN THÀNH & BẮT ĐẦU HỌC' : 'TIẾP TỤC'}
          onPress={handleNext}
          disabled={!hasInteracted}
          style={styles.nextButton}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  bottomBar: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
    backgroundColor: Colors.cream,
  },
  nextButton: {
    width: '100%',
  },
});
