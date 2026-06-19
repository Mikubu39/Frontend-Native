/**
 * Application-wide configuration and environment variables.
 *
 * Access environment variables through this file instead of using
 * process.env directly, for type safety and default values.
 */

export const config = {
  /** API base URL from environment, with fallback */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com",

  /** App name */
  appName: "Frontend",

  /** App version */
  appVersion: "1.0.0",

  /** Is running in development mode */
  isDev: __DEV__,

  /** Feature flags */
  features: {
    enableAnalytics: !__DEV__,
    enableCrashReporting: !__DEV__,
    enableDarkMode: true,
  },
} as const;
