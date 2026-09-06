/**
 * Quiz Context
 *
 * Manages current quiz state, answers, and scoring.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { QuizQuestion, QuizResult } from "@/types";

interface QuizContextType {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  result: QuizResult | null;
  setQuestions: (questions: QuizQuestion[]) => void;
  submitAnswer: (questionId: string, answerId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestionsState] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const setQuestions = useCallback((q: QuizQuestion[]) => {
    setQuestionsState(q);
  }, []);

  const submitAnswer = useCallback((questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const finishQuiz = useCallback(() => {
    let correctCount = 0;
    let wrongCount = 0;

    for (const q of questions) {
      const userAnswer = answers[q.id];
      if (q.type === "vocab") {
        const correct = q.answers.find((a) => a.isCorrect);
        if (correct && userAnswer === correct.id) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    }

    setResult({
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      correctCategories: [
        { name: "Vocabulary", stars: Math.min(correctCount, 3) },
      ],
      wrongCategories: wrongCount > 0 ? ["Review needed"] : [],
    });
  }, [questions, answers]);

  const reset = useCallback(() => {
    setQuestionsState([]);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
  }, []);

  const value = useMemo<QuizContextType>(
    () => ({
      questions,
      currentIndex,
      answers,
      result,
      setQuestions,
      submitAnswer,
      nextQuestion,
      prevQuestion,
      finishQuiz,
      reset,
    }),
    [
      questions,
      currentIndex,
      answers,
      result,
      setQuestions,
      submitAnswer,
      nextQuestion,
      prevQuestion,
      finishQuiz,
      reset,
    ],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextType {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
