import { Stack } from "expo-router";
import { useTheme } from "@/contexts/theme-context";

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "ios_from_right",
        animationDuration: 280,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="goal" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="level" />
      <Stack.Screen name="placement" />
    </Stack>
  );
}
