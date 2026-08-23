/**
 * Application-wide configuration and environment variables.
 *
 * Access environment variables through this file instead of using
 * process.env directly, for type safety and default values.
 */

export const config = {
  /** API base URL from environment, with fallback */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com",

  /**
   * Dịch vụ AI hội thoại (FastAPI + Python) - TÁCH RIÊNG khỏi backend Java.
   *
   * Đây là một tiến trình độc lập vì phần NLP tiếng Nhật sống trong hệ sinh
   * thái Python (scikit-learn), và vì nó cần được triển khai / huấn luyện lại
   * độc lập với backend chính. Xem `ai-service/README.md`.
   *
   * Mặc định trỏ vào emulator Android (10.0.2.2 = localhost của máy host).
   */
  aiBaseUrl: process.env.EXPO_PUBLIC_AI_URL ?? "http://10.0.2.2:8000",

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
