import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

export default function FriendsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "slide_from_right",
        animationDuration: 300,
      }}
    />
  );
}
