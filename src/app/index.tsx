import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useOnboarding } from "@/contexts/onboarding-context";

export default function Index() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const { state: onboardingState } = useOnboarding();

  if (isLoading) {
    return null; // Or a loading indicator screen
  }

  if (isAuthenticated) {
    if (needsOnboarding) {
      // Tài khoản vừa tạo (signUp) chưa đi hết (onboarding)/placement — nếu
      // app bị tắt giữa chừng, đưa lại đúng bước còn dang dở thay vì nhảy
      // thẳng vào /(tabs). placementApi.start() tự resume attempt dở nếu có,
      // nên chỉ cần đưa về đúng màn, không cần biết đang ở câu hỏi nào.
      if (!onboardingState.selectedGoal) {
        return <Redirect href="/(onboarding)/goal" />;
      }
      if (onboardingState.selectedInterests.length === 0) {
        return <Redirect href="/(onboarding)/interests" />;
      }
      return <Redirect href="/(onboarding)/level" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
