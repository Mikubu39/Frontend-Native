import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { InAppToast } from "@/components/ui/in-app-toast";
import type { ToastOptions, ToastContextValue } from "@/types";

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "success", title, message, duration });
    },
    [showToast],
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "error", title, message, duration });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "info", title, message, duration });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: "warning", title, message, duration });
    },
    [showToast],
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess,
      showError,
      showInfo,
      showWarning,
      hideToast,
    }),
    [showToast, showSuccess, showError, showInfo, showWarning, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <InAppToast toast={toast} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

const NOOP_TOAST: ToastContextValue = {
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  hideToast: () => {},
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return context ?? NOOP_TOAST;
}
