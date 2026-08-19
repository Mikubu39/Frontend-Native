export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  hideToast: () => void;
}
