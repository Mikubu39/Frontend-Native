/**
 * Thanh chủ đề của màn hình lộ trình.
 *
 * Điều cần bảo vệ: cả bản đồ chỉ có ĐÚNG MỘT thanh chủ đề, và nội dung của nó
 * đổi theo chủ đề đang cuộn tới (kiểu Duolingo) — chứ không phải mỗi chủ đề
 * kèm một banner riêng như trước. Đây là loại lỗi rất dễ tái phát khi ai đó
 * thêm thông tin vào `TopicSection`, nên nó được khoá lại bằng test.
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { roadmapApi } from "@/services/api/roadmap";
import type { RoadmapTopicResponse } from "@/types";
import LearnScreen from "../index";

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/services/api/roadmap", () => ({
  roadmapApi: { getRoadmap: jest.fn() },
}));

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return { BlurView: View };
});

const mockedUseGamification = useGamification as unknown as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedGetRoadmap = roadmapApi.getRoadmap as jest.Mock;

/** Ba chủ đề, đủ để có vạch ngăn và để thanh dính phải đổi ít nhất hai lần. */
const TOPICS: RoadmapTopicResponse[] = [
  {
    topicId: 1,
    topicTitle: "Chào hỏi cơ bản",
    lessons: [
      {
        lessonId: 1,
        title: "Konnichiwa",
        lessonType: "NORMAL",
        orderIndex: 1,
        status: "COMPLETED",
      },
      {
        lessonId: 2,
        title: "Ohayou",
        lessonType: "NORMAL",
        orderIndex: 2,
        status: "UNLOCKED",
      },
    ],
  },
  {
    topicId: 2,
    topicTitle: "Số đếm",
    lessons: [
      {
        lessonId: 3,
        title: "Ichi ni san",
        lessonType: "NORMAL",
        orderIndex: 1,
        status: "LOCKED",
      },
    ],
  },
  {
    topicId: 3,
    topicTitle: "Gia đình",
    lessons: [
      {
        lessonId: 4,
        title: "Chichi haha",
        lessonType: "NORMAL",
        orderIndex: 1,
        status: "LOCKED",
      },
    ],
  },
];

/**
 * Một chủ đề duy nhất — FlatList (`initialNumToRender={1}`) dựng trọn mọi node
 * trong một lần render, nên khẳng định được trạng thái của từng bài.
 *
 * Dữ liệu mô phỏng người học MỚI TINH: chưa xong bài nào, nhưng lộ trình có sẵn
 * một `JUMP_TEST` ở cuối — mà backend cho JUMP_TEST luôn UNLOCKED bất kể ở đâu.
 * Đây đúng là hình dạng dữ liệu làm lộ cả hai lỗi trạng thái.
 */
const TOPIC_WITH_JUMP_TEST: RoadmapTopicResponse[] = [
  {
    topicId: 1,
    topicTitle: "Chào hỏi cơ bản",
    lessons: [
      {
        lessonId: 1,
        title: "Bài đầu tiên",
        lessonType: "NORMAL",
        orderIndex: 1,
        status: "UNLOCKED",
      },
      {
        lessonId: 2,
        title: "Bài chưa mở",
        lessonType: "NORMAL",
        orderIndex: 2,
        status: "LOCKED",
      },
      {
        lessonId: 3,
        title: "Kiểm tra nhảy cóc",
        lessonType: "JUMP_TEST",
        orderIndex: 3,
        status: "UNLOCKED",
      },
    ],
  },
];

function scrollTo(list: any, y: number) {
  fireEvent.scroll(list, {
    nativeEvent: {
      contentOffset: { x: 0, y },
      contentSize: { width: 400, height: 5000 },
      layoutMeasurement: { width: 400, height: 800 },
    },
  });
}

async function setup(topics: RoadmapTopicResponse[] = TOPICS) {
  mockedUseTheme.mockReturnValue({
    isDark: true,
    colors: {
      background: "#101020",
      text: "#FFFFFF",
      textSecondary: "#AAAAAA",
    },
  });
  mockedUseGamification.mockReturnValue({
    energy: 5,
    maxEnergy: 25,
    exp: 0,
    streak: 3,
    coins: 100,
    refillEnergy: jest.fn(),
    watchAdToRefill: jest.fn(),
  });
  mockedGetRoadmap.mockResolvedValue(topics);

  const utils = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 400, height: 800 },
        insets: { top: 24, left: 0, right: 0, bottom: 0 },
      }}
    >
      <LearnScreen />
    </SafeAreaProvider>,
  );

  await waitFor(() => expect(mockedGetRoadmap).toHaveBeenCalled());
  return utils;
}

describe("Lộ trình — thanh chủ đề dính", () => {
  beforeEach(() => jest.clearAllMocks());

  it("chỉ dựng đúng một thanh chủ đề cho cả bản đồ", async () => {
    const { findAllByText } = await setup();

    // "HƯỚNG DẪN" chỉ tồn tại trên thanh dính. Nhiều hơn một nghĩa là banner
    // theo từng chủ đề đã quay lại.
    const guideButtons = await findAllByText("HƯỚNG DẪN");
    expect(guideButtons).toHaveLength(1);
  });

  it("mở màn ở chủ đề đầu tiên", async () => {
    const { findByText } = await setup();

    expect(await findByText("PHẦN 1")).toBeTruthy();
    expect(await findByText("Chào hỏi cơ bản")).toBeTruthy();
  });

  it("đổi nội dung thanh khi cuộn sang chủ đề kế tiếp", async () => {
    const { findByText, getByTestId, queryByText } = await setup();

    await findByText("Chào hỏi cơ bản");

    // Chủ đề 1 có 2 bài → cao 80 + 2*128 + 80 = 416px. Cuộn qua mốc đó là
    // vạch ngăn "Số đếm" đã trôi lên dưới thanh.
    scrollTo(getByTestId("roadmap-list"), 500);

    await waitFor(() => {
      expect(queryByText("PHẦN 2")).toBeTruthy();
    });
    expect(queryByText("Số đếm")).toBeTruthy();
    expect(queryByText("PHẦN 1")).toBeNull();
  });

  it("cuộn ngược lên thì thanh trả về chủ đề trước đó", async () => {
    const { findByText, getByTestId, queryByText } = await setup();

    await findByText("Chào hỏi cơ bản");
    const list = getByTestId("roadmap-list");

    scrollTo(list, 500);
    await waitFor(() => expect(queryByText("PHẦN 2")).toBeTruthy());

    scrollTo(list, 0);
    await waitFor(() => expect(queryByText("PHẦN 1")).toBeTruthy());
    expect(queryByText("PHẦN 2")).toBeNull();
  });
});

describe("Lộ trình — trạng thái bài học trên bản đồ", () => {
  beforeEach(() => jest.clearAllMocks());

  it("giữ nguyên bài LOCKED nằm trước một bài đã hoàn thành", async () => {
    // Client từng ép mọi bài đứng trước bài COMPLETED xa nhất thành COMPLETED.
    // Vì JUMP_TEST hoàn thành được ở bất kỳ đâu, luật đó vẽ dấu tích xanh lên
    // cả loạt bài vẫn đang khoá — bấm vào thì backend trả LessonLockedException.
    const jumpTestPassed: RoadmapTopicResponse[] = [
      {
        ...TOPIC_WITH_JUMP_TEST[0],
        lessons: TOPIC_WITH_JUMP_TEST[0].lessons.map((l) =>
          l.lessonId === 3 ? { ...l, status: "COMPLETED" as const } : l,
        ),
      },
    ];

    const { findByLabelText } = await setup(jumpTestPassed);

    expect(await findByLabelText(/Bài chưa mở\. Đã khóa/)).toBeTruthy();
  });

  it("đánh dấu bài đầu tiên là bài đang học, không phải JUMP_TEST ở cuối", async () => {
    // Quét ngược (mã cũ) chọn bài UNLOCKED CUỐI cùng — mà JUMP_TEST thì luôn
    // UNLOCKED — nên node "đang học" nhảy tuốt xuống cuối lộ trình.
    const { findByLabelText } = await setup(TOPIC_WITH_JUMP_TEST);

    const first = await findByLabelText(/Bài đầu tiên/);
    const jumpTest = await findByLabelText(/Kiểm tra nhảy cóc/);

    expect(first).toBeSelected();
    expect(jumpTest).not.toBeSelected();
  });
});
