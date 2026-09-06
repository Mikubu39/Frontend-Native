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
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop",
  },
  {
    id: "art",
    label: "Nghệ thuật",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=200&fit=crop",
  },
  {
    id: "food",
    label: "Ẩm thực",
    imageUrl:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300&h=200&fit=crop",
  },
  {
    id: "manga",
    label: "Manga / Anime",
    imageUrl:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=200&fit=crop",
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
