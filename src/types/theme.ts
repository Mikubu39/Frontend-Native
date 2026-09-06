export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  text: string;
  textSecondary: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  card: string;
  cardElevated: string;
  border: string;
  borderSubtle: string;
  tabBarBg: string;
  tabBarBorder: string;
  overlay: string;
  overlaySubtle: string;
  overlayLight: string;
  borderTransparent: string;
  cardQuiz: string;
  cardQuizBorder: string;
}

export interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: "light" | "dark";
  isDark: boolean;
  colors: ThemeColors;
}
