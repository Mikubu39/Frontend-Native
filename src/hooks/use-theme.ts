import { useTheme as useThemeFromContext } from "@/contexts/theme-context";

export function useTheme() {
  const { colors } = useThemeFromContext();
  return colors;
}
