/**
 * Onboarding Context
 *
 * Manages onboarding flow state (goal, interests, level).
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { OnboardingGoal, OnboardingLevelId, OnboardingStep, OnboardingState } from '@/types';

interface OnboardingContextType {
  state: OnboardingState;
  setGoal: (goal: OnboardingGoal) => void;
  toggleInterest: (interestId: string) => void;
  setLevel: (level: OnboardingLevelId) => void;
  setStep: (step: OnboardingStep) => void;
  isComplete: boolean;
  reset: () => void;
}

const initialState: OnboardingState = {
  currentStep: 'goal',
  selectedGoal: null,
  selectedInterests: [],
  selectedLevel: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setGoal = useCallback((goal: OnboardingGoal) => {
    setState((prev) => ({ ...prev, selectedGoal: goal }));
  }, []);

  const toggleInterest = useCallback((interestId: string) => {
    setState((prev) => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interestId)
        ? prev.selectedInterests.filter((id) => id !== interestId)
        : [...prev.selectedInterests, interestId],
    }));
  }, []);

  const setLevel = useCallback((level: OnboardingLevelId) => {
    setState((prev) => ({ ...prev, selectedLevel: level }));
  }, []);

  const setStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isComplete = state.selectedGoal !== null
    && state.selectedInterests.length > 0
    && state.selectedLevel !== null;

  return (
    <OnboardingContext.Provider
      value={{ state, setGoal, toggleInterest, setLevel, setStep, isComplete, reset }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
