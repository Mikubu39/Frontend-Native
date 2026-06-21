/**
 * Onboarding flow type definitions.
 */

export type OnboardingGoal =
  | 'jlpt'
  | 'hobby'
  | 'traveling'
  | 'talk'
  | 'work';

export interface OnboardingGoalOption {
  id: OnboardingGoal;
  label: string;
}

export interface OnboardingInterest {
  id: string;
  label: string;
  imageUrl: string;
}

export type OnboardingLevelId = 'starter' | 'beginner' | 'jlpt';

export interface OnboardingLevelOption {
  id: OnboardingLevelId;
  title: string;
  description: string;
}

export type OnboardingStep = 'goal' | 'interests' | 'level';

export interface OnboardingState {
  currentStep: OnboardingStep;
  selectedGoal: OnboardingGoal | null;
  selectedInterests: string[];
  selectedLevel: OnboardingLevelId | null;
  jlptLevel?: string;
}
