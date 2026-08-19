import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream },
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
