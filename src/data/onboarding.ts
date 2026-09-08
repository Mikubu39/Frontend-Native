/**
 * Mock onboarding data.
 */

import type {
  OnboardingGoalOption,
  OnboardingInterest,
  OnboardingLevelOption,
} from "@/types";

export const ONBOARDING_GOALS: OnboardingGoalOption[] = [
  { id: "jlpt", label: "Đạt chứng chỉ JLPT" },
  { id: "hobby", label: "Sở thích cá nhân" },
  { id: "traveling", label: "Du lịch" },
  { id: "talk", label: "Giao tiếp tiếng Nhật" },
  { id: "work", label: "Phục vụ công việc" },
];

export const ONBOARDING_INTERESTS: OnboardingInterest[] = [
  {
    id: "travel",
    label: "Du lịch",
    imageSource: require("@/assets/images/onboarding/travel.jpg"),
  },
  {
    id: "art",
    label: "Nghệ thuật",
    imageSource: require("@/assets/images/onboarding/art.jpg"),
  },
  {
    id: "food",
    label: "Ẩm thực",
    imageSource: require("@/assets/images/onboarding/food.jpg"),
  },
  {
    id: "manga",
    label: "Manga / Anime",
    imageSource: require("@/assets/images/onboarding/manga.jpg"),
  },
];

export const ONBOARDING_LEVELS: OnboardingLevelOption[] = [
  {
    id: "starter",
    title: "Tôi mới bắt đầu từ con số 0",
    description: "Lần đầu tiên học tiếng Nhật, bắt đầu từ bảng chữ cái",
  },
  {
    id: "beginner",
    title: "Tôi đã biết một chút tiếng Nhật",
    description: "Làm bài kiểm tra đầu vào để xác định điểm xuất phát",
  },
];

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];
