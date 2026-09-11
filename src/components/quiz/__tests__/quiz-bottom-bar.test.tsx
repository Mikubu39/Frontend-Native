/**
 * Regression test: nhãn ăn mừng combo streak (vd "🔥 12 câu đúng liên tiếp!
 * Tuyệt vời!") không được tràn ra khỏi viền panel feedback — Text phải co lại
 * (flexShrink) và xuống dòng (flexWrap) thay vì bị cắt/tràn.
 */
import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { QuizBottomBar } from "../quiz-bottom-bar";

describe("QuizBottomBar — nhãn feedback combo streak không tràn viền", () => {
  const noop = () => {};

  it("Text feedbackLabel có flexShrink và flexWrap để không tràn ra ngoài panel", async () => {
    const longCombo = "🔥 12 câu đúng liên tiếp! Tuyệt vời!";
    const { getByText } = await render(
      <QuizBottomBar
        hasInteracted={true}
        hasSubmitted={true}
        isCorrect={true}
        correctAnswerText={null}
        onCheck={noop}
        onNext={noop}
        correctFeedbackLabel={longCombo}
      />,
    );

    const label = getByText(longCombo);
    const flatStyle = StyleSheet.flatten(label.props.style);

    expect(flatStyle.flexShrink).toBe(1);
    expect(flatStyle.flexWrap).toBe("wrap");
  });

  it("vẫn hiển thị nhãn mặc định 'Tuyệt vời!' khi không có combo", async () => {
    const { getByText } = await render(
      <QuizBottomBar
        hasInteracted={true}
        hasSubmitted={true}
        isCorrect={true}
        correctAnswerText={null}
        onCheck={noop}
        onNext={noop}
      />,
    );

    expect(getByText("Tuyệt vời!")).toBeTruthy();
  });

  it("hiển thị nút 'Không thể nói lúc này?' khi onSkipSpeaking được truyền và chưa submit", async () => {
    const mockSkip = jest.fn();
    const { getByText } = await render(
      <QuizBottomBar
        hasInteracted={false}
        hasSubmitted={false}
        isCorrect={false}
        correctAnswerText={null}
        onCheck={noop}
        onNext={noop}
        onSkipSpeaking={mockSkip}
      />,
    );

    const skipBtn = getByText("Không thể nói lúc này?");
    expect(skipBtn).toBeTruthy();

    const { fireEvent } = require("@testing-library/react-native");
    fireEvent.press(skipBtn);
    expect(mockSkip).toHaveBeenCalledTimes(1);
  });

  it("ẩn nút 'Không thể nói lúc này?' khi đã submit", async () => {
    const mockSkip = jest.fn();
    const { queryByText } = await render(
      <QuizBottomBar
        hasInteracted={true}
        hasSubmitted={true}
        isCorrect={true}
        correctAnswerText={null}
        onCheck={noop}
        onNext={noop}
        onSkipSpeaking={mockSkip}
      />,
    );

    expect(queryByText("Không thể nói lúc này?")).toBeNull();
  });
});
