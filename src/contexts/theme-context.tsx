/**
 * Theme Context - Manages Light, Dark, and System theme mode with persistence.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { storage } from "@/services/storage";
import type { ThemeMode, ThemeColors, ThemeContextValue } from "@/types";

const THEME_STORAGE_KEY = "user_theme_mode";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // Load saved theme on launch
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await storage.get(THEME_STORAGE_KEY);
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.warn("Failed to load saved theme mode:", error);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    storage.set(THEME_STORAGE_KEY, mode).catch((err) => {
      console.warn("Failed to persist theme mode:", err);
    });
  }, []);

  const effectiveTheme: "light" | "dark" = useMemo(() => {
    if (themeMode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const isDark = effectiveTheme === "dark";

  const colors: ThemeColors = useMemo(() => {
    return Colors[effectiveTheme];
  }, [effectiveTheme]);

  const value: ThemeContextValue = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      theme: effectiveTheme,
      isDark,
      colors,
    }),
    [themeMode, setThemeMode, effectiveTheme, isDark, colors],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
