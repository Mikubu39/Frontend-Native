import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";

export default function VoiceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream },
        animation: "slide_from_right",
        animationDuration: 300,
      }}
    />
  );
}
