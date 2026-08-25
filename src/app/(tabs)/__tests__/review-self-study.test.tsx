import React, { useEffect } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import PracticeHubScreen from "../review";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";

const push = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    useEffect(callback, [callback]);
  },
}));

jest.mock("@/components/tutorial", () => ({
  SpotlightTarget: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/contexts/tutorial-context", () => ({
  useTutorial: () => ({ registerScroller: jest.fn() }),
}));
jest.mock("@/services/api/vocabulary", () => ({
  vocabularyApi: { getDue: jest.fn() },
}));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/services/api/mistakes", () => ({
  mistakesApi: { getSummary: jest.fn() },
}));

const mockedVocabularyApi = vocabularyApi as jest.Mocked<typeof vocabularyApi>;
const mockedUseTheme = useTheme as jest.Mock;

describe("Trung tâm luyện tập — khu tự học", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: {
        background: "#FFFFFF",
        card: "#FFFFFF",
        border: "#E5E7EB",
        text: "#111827",
        textSecondary: "#6B7280",
      },
    });
    mockedVocabularyApi.getDue.mockResolvedValue({
      dueCount: 3,
      learnedCount: 10,
      items: [],
    });
  });

  it("chỉ điều hướng tới các luồng ôn độc lập, không tái sử dụng lessonId của bản đồ", async () => {
    const screen = await render(
      <SafeAreaProvider>
        <PracticeHubScreen />
      </SafeAreaProvider>,
    );

    await waitFor(() => expect(mockedVocabularyApi.getDue).toHaveBeenCalled());
    expect(screen.getByText("Hoạt động tự học")).toBeTruthy();
    expect(screen.queryByText("Thử thách thời gian")).toBeNull();

    await fireEvent.press(screen.getByText("Ôn tập từ vựng"));

    expect(push).toHaveBeenCalledWith("/review/vocabulary");
    expect(push).not.toHaveBeenCalledWith("/quiz/ready?lessonId=lp1");
  });
});
