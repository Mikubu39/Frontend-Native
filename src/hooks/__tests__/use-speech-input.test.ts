import { act, renderHook } from "@testing-library/react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useSpeechInput } from "../use-speech-input";

function getEventHandler(eventName: string) {
  const calls = (useSpeechRecognitionEvent as jest.Mock).mock.calls;
  const match = [...calls].reverse().find(([name]) => name === eventName);
  if (!match) {
    throw new Error(`no handler registered for "${eventName}"`);
  }
  return match[1] as (event?: unknown) => void;
}

describe("useSpeechInput", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (
      ExpoSpeechRecognitionModule.requestPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("times out and surfaces an error if the native module never fires an event", async () => {
    const { result } = await renderHook(() =>
      useSpeechInput({ onFinalTranscript: jest.fn() }),
    );

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe("listening");

    await act(async () => {
      jest.advanceTimersByTime(8001);
      // Đợi một microtask để React flush passive effect đồng bộ result.current.
      await Promise.resolve();
    });

    expect(ExpoSpeechRecognitionModule.abort).toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/quá lâu/);
  });

  it("does not surface a timeout error once the session already ended normally", async () => {
    const { result } = await renderHook(() =>
      useSpeechInput({ onFinalTranscript: jest.fn() }),
    );

    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      getEventHandler("end")();
      await Promise.resolve();
    });
    expect(result.current.status).toBe("idle");

    (ExpoSpeechRecognitionModule.abort as jest.Mock).mockClear();
    await act(async () => {
      jest.advanceTimersByTime(8001);
      await Promise.resolve();
    });

    expect(ExpoSpeechRecognitionModule.abort).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});
