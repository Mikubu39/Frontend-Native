/**
 * Tour hướng dẫn lần đầu — kiểm thử tích hợp.
 *
 * Điều cần bảo vệ:
 *  1. Người mới (chưa có cờ trong storage) được tour tự bật; người cũ thì không.
 *  2. Bấm "Tiếp tục"/"Quay lại" đi đúng thứ tự các bước và nội dung đúng bước.
 *  3. Phần tử được đăng ký thật sự bị đo và vùng sáng nằm đúng chỗ (kèm đệm).
 *  4. Tour tự điều hướng sang màn hình của bước — nó đi xuyên Học ↔ Luyện tập.
 *  5. Phần tử nằm ngoài khung nhìn thì màn hình được nhờ cuộn nó vào giữa.
 *  6. Kết thúc hoặc bỏ qua đều ghi cờ, để lần mở app sau không làm phiền nữa.
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SpotlightTarget } from "@/components/tutorial";
import { AuthContext } from "@/contexts/auth-context";
import { TutorialProvider, useTutorial } from "@/contexts/tutorial-context";
import { HOME_TUTORIAL_STEPS } from "@/data/tutorial-steps";
import { storage } from "@/services/storage";
import type { TutorialTargetId, TutorialTargetRect } from "@/types";

jest.mock("@/services/storage", () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("expo-router", () => ({
  router: { navigate: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

// Lottie là native module — thay bằng View để test không phải tải file animation.
jest.mock("lottie-react-native", () => {
  const { View } = require("react-native");
  return { __esModule: true, default: View };
});

const { router } = require("expo-router");

const mockedGet = storage.get as jest.Mock;
const mockedSet = storage.set as jest.Mock;
const mockedNavigate = router.navigate as jest.Mock;

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Thẻ "Cửa hàng" giả trên thanh tab, đứng ở một toạ độ biết trước. */
const SHOP_RECT: TutorialTargetRect = { x: 100, y: 700, width: 60, height: 44 };

/** Bước đầu tiên gắn với một phần tử thật — dùng để dò chỉ số trong tour. */
const stepIndexOf = (id: string) =>
  HOME_TUTORIAL_STEPS.findIndex((step) => step.id === id);

/**
 * Đăng ký một phần tử giả với toạ độ cho trước, thay cho việc dựng cả màn Học.
 * Test renderer không cấp instance native nên ref thật không đo được — thứ cần
 * kiểm ở đây là đường đi từ "đăng ký" tới "vùng sáng", không phải bản thân ref.
 */
function Harness({
  autoStart = true,
  targetId = "tab-shop" as TutorialTargetId,
  rect = SHOP_RECT,
  scroller,
}: {
  autoStart?: boolean;
  targetId?: TutorialTargetId;
  rect?: TutorialTargetRect;
  scroller?: jest.Mock;
}) {
  const { registerTarget, registerScroller, maybeAutoStart, hasSeenTutorial } =
    useTutorial();

  useEffect(() => {
    registerTarget(targetId, {
      measureInWindow: (callback: (...args: number[]) => void) =>
        callback(rect.x, rect.y, rect.width, rect.height),
    });
  }, [registerTarget, targetId, rect]);

  useEffect(() => {
    if (scroller) registerScroller(scroller);
  }, [registerScroller, scroller]);

  useEffect(() => {
    if (autoStart && hasSeenTutorial !== null) maybeAutoStart();
  }, [autoStart, hasSeenTutorial, maybeAutoStart]);

  return null;
}

function renderTour(props?: React.ComponentProps<typeof Harness>) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <TutorialProvider>
        <Harness {...props} />
      </TutorialProvider>
    </SafeAreaProvider>,
  );
}

type Screen = Awaited<ReturnType<typeof renderTour>>;

/** Bấm nút chính cho tới khi tour đứng ở bước `id`. */
async function advanceTo(screen: Screen, id: string) {
  const target = stepIndexOf(id);
  for (let i = 0; i < target; i++) {
    const step = HOME_TUTORIAL_STEPS[i];
    await waitFor(() =>
      expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
        step.title,
      ),
    );
    fireEvent.press(screen.getByText(step.ctaLabel ?? "Tiếp tục"));
  }
  await waitFor(() =>
    expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
      HOME_TUTORIAL_STEPS[target].title,
    ),
  );
}

const [STEP_WELCOME, STEP_SECOND, STEP_THIRD] = HOME_TUTORIAL_STEPS;

beforeEach(() => {
  jest.clearAllMocks();
  mockedSet.mockResolvedValue(undefined);
});

describe("Tour hướng dẫn lần đầu", () => {
  it("tự bật cho người mới và đi đúng thứ tự các bước", async () => {
    mockedGet.mockResolvedValue(null);
    const screen = await renderTour();

    await waitFor(() =>
      expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
        STEP_WELCOME.title,
      ),
    );
    expect(
      screen.getByText(`Bước 1/${HOME_TUTORIAL_STEPS.length}`),
    ).toBeTruthy();

    fireEvent.press(screen.getByText(STEP_WELCOME.ctaLabel!));
    await waitFor(() =>
      expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
        STEP_SECOND.title,
      ),
    );

    // Bước 3, rồi quay lại bước 2 — nút "Quay lại" chỉ có từ bước thứ hai.
    fireEvent.press(screen.getByText("Tiếp tục"));
    await waitFor(() =>
      expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
        STEP_THIRD.title,
      ),
    );
    fireEvent.press(screen.getByText("Quay lại"));
    await waitFor(() =>
      expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
        STEP_SECOND.title,
      ),
    );
  });

  it("khoét vùng sáng đúng vị trí phần tử đã đăng ký, có đệm 8px", async () => {
    mockedGet.mockResolvedValue(null);
    const screen = await renderTour();

    await advanceTo(screen, "tab-shop");

    const ring = await screen.findByTestId("tutorial-spotlight-ring");
    await waitFor(() =>
      expect(ring).toHaveStyle({
        left: SHOP_RECT.x - 8,
        top: SHOP_RECT.y - 8,
        width: SHOP_RECT.width + 16,
        height: SHOP_RECT.height + 16,
      }),
    );
  });

  it("điều hướng sang Trung tâm luyện tập khi tới các bước của màn đó", async () => {
    mockedGet.mockResolvedValue(null);
    const screen = await renderTour({ targetId: "review-mistakes" });

    await advanceTo(screen, "review-mistakes");

    expect(mockedNavigate).toHaveBeenCalledWith("/review");
    // Các bước trước đó đều ở màn Học, và chỉ điều hướng một lần cho cả cụm.
    expect(mockedNavigate.mock.calls.map((call: string[]) => call[0])).toEqual([
      "/(tabs)",
      "/review",
    ]);
  });

  it("nhờ màn hình cuộn phần tử bị khuất vào khung nhìn rồi mới chiếu", async () => {
    mockedGet.mockResolvedValue(null);
    const scroller = jest.fn();
    // y = 40 nằm trên dải an toàn (110px đầu màn hình) nên bị coi là khuất.
    const offscreen: TutorialTargetRect = {
      x: 30,
      y: 40,
      width: 320,
      height: 90,
    };
    const screen = await renderTour({
      targetId: "review-mistakes",
      rect: offscreen,
      scroller,
    });

    await advanceTo(screen, "review-mistakes");
    await waitFor(() => expect(scroller).toHaveBeenCalledWith(offscreen));
  });

  it("bỏ qua giữa chừng thì đóng tour và ghi cờ đã xem", async () => {
    mockedGet.mockResolvedValue(null);
    const screen = await renderTour();

    await waitFor(() => screen.getByTestId("tutorial-title"));
    fireEvent.press(screen.getByText("Bỏ qua"));

    await waitFor(() =>
      expect(screen.queryByTestId("tutorial-overlay")).toBeNull(),
    );
    expect(mockedSet).toHaveBeenCalledWith("tutorial_home_done", "true");
  });

  it("đi hết tour thì đóng và ghi cờ đã xem", async () => {
    mockedGet.mockResolvedValue(null);
    const screen = await renderTour();

    for (let i = 0; i < HOME_TUTORIAL_STEPS.length; i++) {
      const step = HOME_TUTORIAL_STEPS[i];
      const isLast = i === HOME_TUTORIAL_STEPS.length - 1;
      await waitFor(() =>
        expect(screen.getByTestId("tutorial-title")).toHaveTextContent(
          step.title,
        ),
      );
      fireEvent.press(
        screen.getByText(
          step.ctaLabel ?? (isLast ? "Bắt đầu học" : "Tiếp tục"),
        ),
      );
    }

    await waitFor(() =>
      expect(screen.queryByTestId("tutorial-overlay")).toBeNull(),
    );
    expect(mockedSet).toHaveBeenCalledWith("tutorial_home_done", "true");
  });

  it("không làm phiền người đã xem tour", async () => {
    mockedGet.mockResolvedValue("true");
    const screen = await renderTour();

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
    expect(screen.queryByTestId("tutorial-overlay")).toBeNull();
  });

  it("SpotlightTarget render bình thường khi không có provider", async () => {
    const screen = await render(
      <SpotlightTarget targetId="tab-shop">
        <></>
      </SpotlightTarget>,
    );
    expect(screen.toJSON()).toBeTruthy();
  });

  it("markAsSeen đánh dấu đã xem và lưu cả cờ user id lẫn cờ toàn cục", async () => {
    mockedGet.mockResolvedValue(null);
    const mockAuth: any = {
      user: { id: "user-789", email: "user@example.com", displayName: "User" },
      isAuthenticated: true,
      isLoading: false,
    };

    function MarkSeenHarness() {
      const { markAsSeen } = useTutorial();
      useEffect(() => {
        markAsSeen();
      }, [markAsSeen]);
      return null;
    }

    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AuthContext.Provider value={mockAuth}>
          <TutorialProvider>
            <MarkSeenHarness />
          </TutorialProvider>
        </AuthContext.Provider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(mockedSet).toHaveBeenCalledWith(
        "tutorial_home_done_user-789",
        "true",
      );
      expect(mockedSet).toHaveBeenCalledWith("tutorial_home_done", "true");
    });
  });

  it("nhận diện cờ đã xem riêng theo user id", async () => {
    mockedGet.mockImplementation((key: string) => {
      if (key === "tutorial_home_done_user-123") return Promise.resolve("true");
      return Promise.resolve(null);
    });

    const mockAuth: any = {
      user: { id: "user-123", email: "user@example.com", displayName: "User" },
      isAuthenticated: true,
      isLoading: false,
    };

    const screen = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AuthContext.Provider value={mockAuth}>
          <TutorialProvider>
            <Harness />
          </TutorialProvider>
        </AuthContext.Provider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith("tutorial_home_done_user-123");
    });
    expect(screen.queryByTestId("tutorial-overlay")).toBeNull();
  });
});
