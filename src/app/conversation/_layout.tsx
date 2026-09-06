import { Stack } from "expo-router";
import { useTheme } from "@/contexts/theme-context";

export default function ConversationLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
        animationDuration: 300,
      }}
    />
  );
}
