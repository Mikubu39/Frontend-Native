/**
 * Onboarding Context
 *
 * Manages onboarding flow state (goal, interests, level).
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  OnboardingGoal,
  OnboardingLevelId,
  OnboardingStep,
  OnboardingState,
} from "@/types";
import { useOptionalAuth } from "@/contexts/auth-context";
import { storage } from "@/services/storage";

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
  currentStep: "goal",
  selectedGoal: null,
  selectedInterests: [],
  selectedLevel: null,
};

const ONBOARDING_PROGRESS_PREFIX = "onboarding_progress_";

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  // Không import useAuth() (bắt buộc có Provider) để tránh vỡ khi
  // OnboardingProvider được test/dùng độc lập — chỉ optional.
  const auth = useOptionalAuth();
  const userId = auth?.user?.id;
  // Tránh ghi đè storage bằng initialState trước khi kịp đọc state đã lưu.
  const hasLoadedForUser = useRef<string | undefined>(undefined);

  // Khôi phục tiến trình (onboarding) đã lưu của đúng user này — dùng khi app
  // bị tắt (kill) giữa chừng lúc đang chọn goal/interests/level hoặc đang làm
  // bài kiểm tra đầu vào, để index.tsx biết đưa user quay lại đúng bước.
  useEffect(() => {
    if (!userId) return;
    hasLoadedForUser.current = undefined;
    (async () => {
      try {
        const saved = await storage.get(ONBOARDING_PROGRESS_PREFIX + userId);
        if (saved) {
          setState(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load onboarding progress", e);
      } finally {
        hasLoadedForUser.current = userId;
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!userId || hasLoadedForUser.current !== userId) return;
    storage
      .set(ONBOARDING_PROGRESS_PREFIX + userId, JSON.stringify(state))
      .catch(() => {});
  }, [state, userId]);

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
    if (userId) {
      storage.remove(ONBOARDING_PROGRESS_PREFIX + userId).catch(() => {});
    }
  }, [userId]);

  const isComplete =
    state.selectedGoal !== null &&
    state.selectedInterests.length > 0 &&
    state.selectedLevel !== null;

  const value = useMemo<OnboardingContextType>(
    () => ({
      state,
      setGoal,
      toggleInterest,
      setLevel,
      setStep,
      isComplete,
      reset,
    }),
    [state, setGoal, toggleInterest, setLevel, setStep, isComplete, reset],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
