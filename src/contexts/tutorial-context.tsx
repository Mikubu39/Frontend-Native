/**
 * Tutorial Context — điều phối tour coach-mark cho người dùng mới.
 *
 * Trách nhiệm:
 *  - Giữ danh sách bước và vị trí hiện tại.
 *  - Điều hướng tới màn hình của bước (`step.route`) — tour đi xuyên nhiều màn.
 *  - Nhận "đăng ký" các phần tử cần chiếu sáng (`registerTarget`) rồi đo toạ độ
 *    tuyệt đối bằng `measureInWindow`; nếu phần tử nằm ngoài khung nhìn thì nhờ
 *    màn hình cuộn nó vào giữa (`registerScroller`) rồi đo lại.
 *  - Nhớ việc đã xem tour trong storage để lần sau không làm phiền nữa.
 *
 * Provider tự render luôn lớp phủ (cùng khuôn mẫu với `ToastProvider`), nên chỉ
 * cần bọc một lần ở root layout là mọi màn hình đều dùng được.
 */

import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dimensions, type View } from "react-native";

import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay";
import { HOME_TUTORIAL_STEPS } from "@/data/tutorial-steps";
import { storage } from "@/services/storage";
import type {
  TutorialContextValue,
  TutorialScrollIntoView,
  TutorialTargetId,
  TutorialTargetRect,
} from "@/types";

const TUTORIAL_STORAGE_KEY = "tutorial_home_done";

/**
 * Số lần thử đo lại trước khi bỏ qua vùng sáng. Phải rộng tay: sau khi tour
 * chuyển màn, phần tử của bước mới cần vài trăm ms mới gắn xong vào cây view.
 */
const MEASURE_MAX_ATTEMPTS = 20;
const MEASURE_RETRY_MS = 150;
/** Chờ animation cuộn xong rồi mới đo lại. */
const SCROLL_SETTLE_MS = 450;

/** Dải an toàn theo trục dọc: ngoài dải này coi như phần tử bị khuất. */
const VIEWPORT_TOP_GUARD = 110;
const VIEWPORT_BOTTOM_GUARD = 190;

type MeasurableNode = Pick<View, "measureInWindow">;

/**
 * Giá trị trơ dùng khi cây component không có provider (ví dụ test dựng riêng
 * một màn hình). Nhờ nó `SpotlightTarget` nhúng được vào bất kỳ đâu mà không
 * bắt mọi test phải bọc thêm provider.
 */
const INERT: TutorialContextValue = {
  isActive: false,
  steps: [],
  stepIndex: 0,
  currentStep: null,
  spotlight: null,
  hasSeenTutorial: true,
  registerTarget: () => {},
  registerScroller: () => {},
  startTutorial: () => {},
  maybeAutoStart: () => {},
  goNext: () => {},
  goBack: () => {},
  skipTutorial: () => {},
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const steps = HOME_TUTORIAL_STEPS;

  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<TutorialTargetRect | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean | null>(null);

  const targetsRef = useRef(new Map<TutorialTargetId, MeasurableNode>());
  const scrollerRef = useRef<TutorialScrollIntoView | null>(null);

  // ── Đọc cờ đã-xem một lần khi khởi động ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    storage
      .get(TUTORIAL_STORAGE_KEY)
      .then((value) => {
        if (!cancelled) setHasSeenTutorial(value === "true");
      })
      .catch(() => {
        // Không đọc được storage thì coi như đã xem — thà bỏ sót tour còn hơn
        // dội hướng dẫn vào mặt người dùng cũ mỗi lần mở app.
        if (!cancelled) setHasSeenTutorial(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const registerTarget = useCallback(
    (id: TutorialTargetId, node: unknown | null) => {
      if (node) {
        targetsRef.current.set(id, node as MeasurableNode);
      } else {
        targetsRef.current.delete(id);
      }
    },
    [],
  );

  const registerScroller = useCallback((fn: TutorialScrollIntoView | null) => {
    scrollerRef.current = fn;
  }, []);

  const currentStep = isActive ? (steps[stepIndex] ?? null) : null;
  const targetId = currentStep?.target ?? null;
  const route = currentStep?.route ?? null;

  // ── Điều hướng tới màn hình của bước ──────────────────────────────────────
  /** Route đã điều hướng tới, để không gọi lại khi nhiều bước dùng chung màn. */
  const navigatedRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      navigatedRouteRef.current = null;
      return;
    }
    if (!route || route === navigatedRouteRef.current) return;
    navigatedRouteRef.current = route;
    // KHÔNG xoá `scrollerRef` ở đây. Các màn trong `(tabs)` đã mở thì vẫn còn
    // sống, effect đăng ký của chúng sẽ không chạy lại sau khi điều hướng — xoá
    // ở đây là mất luôn khả năng cuộn. Mỗi màn tự đăng ký/gỡ theo vòng đời và
    // theo tiêu điểm của chính nó.
    router.navigate(route as never);
  }, [isActive, route]);

  // ── Đo phần tử của bước hiện tại ──────────────────────────────────────────
  useEffect(() => {
    // Xoá vùng sáng cũ ngay khi đổi bước, nếu không lỗ khoét của bước trước sẽ
    // đứng nguyên vài khung hình trong lúc chờ đo phần tử mới. Trả lại chính
    // `prev` khi vốn đã rỗng để không tạo một lượt render thừa mỗi bước.
    setSpotlight((prev) => (prev === null ? prev : null));
    if (!isActive || !targetId) return;

    let cancelled = false;
    let attempts = 0;
    let hasScrolled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const retry = () => {
      attempts += 1;
      if (attempts >= MEASURE_MAX_ATTEMPTS) {
        // Phần tử không tồn tại trên màn hình này — bước vẫn hiện, chỉ là không
        // có vùng sáng, bong bóng rơi về giữa màn hình.
        setSpotlight(null);
        return;
      }
      timer = setTimeout(measure, MEASURE_RETRY_MS);
    };

    const measure = () => {
      if (cancelled) return;
      const node = targetsRef.current.get(targetId);
      if (!node?.measureInWindow) {
        retry();
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        if (cancelled) return;
        if (!width || !height) {
          retry();
          return;
        }

        // Phần tử nằm khuất ngoài khung nhìn: nhờ màn hình cuộn nó vào giữa rồi
        // đo lại. Chỉ cuộn đúng một lần mỗi bước để không rơi vào vòng lặp.
        const windowHeight = Dimensions.get("window").height;
        const isOffscreen =
          y < VIEWPORT_TOP_GUARD ||
          y + height > windowHeight - VIEWPORT_BOTTOM_GUARD;

        if (isOffscreen && scrollerRef.current && !hasScrolled) {
          hasScrolled = true;
          scrollerRef.current({ x, y, width, height });
          timer = setTimeout(measure, SCROLL_SETTLE_MS);
          return;
        }

        setSpotlight({ x, y, width, height });
      });
    };

    measure();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isActive, stepIndex, targetId]);

  // ── Điều khiển ────────────────────────────────────────────────────────────
  const markSeen = useCallback(() => {
    setHasSeenTutorial(true);
    storage.set(TUTORIAL_STORAGE_KEY, "true").catch(() => {});
  }, []);

  const startTutorial = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
  }, []);

  const maybeAutoStart = useCallback(() => {
    if (hasSeenTutorial === false) {
      setStepIndex(0);
      setIsActive(true);
    }
  }, [hasSeenTutorial]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setStepIndex(0);
    markSeen();
  }, [markSeen]);

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      endTour();
      return;
    }
    setStepIndex(stepIndex + 1);
  }, [endTour, stepIndex, steps.length]);

  const goBack = useCallback(() => {
    setStepIndex((index) => Math.max(0, index - 1));
  }, []);

  const skipTutorial = useCallback(() => {
    endTour();
  }, [endTour]);

  const value: TutorialContextValue = {
    isActive,
    steps,
    stepIndex,
    currentStep,
    spotlight,
    hasSeenTutorial,
    registerTarget,
    registerScroller,
    startTutorial,
    maybeAutoStart,
    goNext,
    goBack,
    skipTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  );
}

/**
 * Không ném lỗi khi thiếu provider — trả về giá trị trơ. Các màn hình gắn
 * `SpotlightTarget` phải render được cả khi không có tour (test, storybook…).
 */
export function useTutorial(): TutorialContextValue {
  return useContext(TutorialContext) ?? INERT;
}
