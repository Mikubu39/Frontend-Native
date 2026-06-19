/**
 * i18n / Localization
 *
 * Centralized string resources for multi-language support.
 * Expand this with a library like expo-localization + i18next for full i18n.
 *
 * Example usage:
 *   import { strings } from '@/locales';
 *   <Text>{strings.common.loading}</Text>
 */

export const strings = {
  common: {
    loading: "Đang tải...",
    error: "Đã xảy ra lỗi",
    retry: "Thử lại",
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    search: "Tìm kiếm",
    noData: "Không có dữ liệu",
  },
  auth: {
    signIn: "Đăng nhập",
    signUp: "Đăng ký",
    signOut: "Đăng xuất",
    email: "Email",
    password: "Mật khẩu",
    forgotPassword: "Quên mật khẩu?",
  },
  tabs: {
    home: "Trang chủ",
    explore: "Khám phá",
    profile: "Hồ sơ",
  },
} as const;
