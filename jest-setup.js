import "@testing-library/jest-native/extend-expect";

// You can add global mocks here for navigation, async-storage, etc.
// Example:
// jest.mock('@react-native-async-storage/async-storage', () =>
//   require('@react-native-async-storage/async-storage/jest/async-storage-mock')
// );

jest.mock("react-native-reanimated", () => {
  const mock = require("react-native-reanimated/mock");
  // The shipped mock omits a few hooks; add the ones our components use.
  return { ...mock, useReducedMotion: () => false };
});

// Speech is a NATIVE module: it has no JS implementation to fall back on, so
// importing it under Jest throws "Cannot find native module". Both are mocked
// globally rather than per-test because any screen offering speech input would
// otherwise fail to even load.
//
// The mocks are deliberately inert (no events fired). Speech is an optional
// input path — the tests assert that typing still works and that the UI never
// depends on speech being available. Speech behaviour itself is verified on a
// real device, since an emulator's microphone cannot exercise it meaningfully.
// expo-av cũng là NATIVE module ("ExponentAV"): chỉ cần một barrel export chạm
// tới `use-audio` là cả suite chết ngay lúc import, kể cả test không đụng gì
// tới âm thanh. Mock ở đây thay vì trong từng file test để mọi màn hình đều
// mount được; hành vi phát audio thật được kiểm trên máy/emulator.
jest.mock("expo-av", () => {
  const sound = {
    unloadAsync: jest.fn().mockResolvedValue(undefined),
    stopAsync: jest.fn().mockResolvedValue(undefined),
    playAsync: jest.fn().mockResolvedValue(undefined),
    setOnPlaybackStatusUpdate: jest.fn(),
  };
  return {
    Audio: {
      setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
      Sound: { createAsync: jest.fn().mockResolvedValue({ sound }) },
    },
    InterruptionModeAndroid: { DoNotMix: 1, DuckOthers: 2 },
    InterruptionModeIOS: { DoNotMix: 1, DuckOthers: 2 },
  };
});

// expo-audio (package mới thay thế expo-av cho playback trong use-audio.ts).
// Cùng lý do như expo-av: native module, không có JS fallback trong jest.
jest.mock("expo-audio", () => ({
  AudioPlayer: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    currentTime: 0,
    duration: 0,
    playing: false,
  })),
  createAudioPlayer: jest.fn().mockReturnValue({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    currentTime: 0,
    duration: 0,
    playing: false,
  }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  },
  useSpeechRecognitionEvent: jest.fn(),
}));

// React 19's act() environment flag is only toggled for the duration of a
// synchronous act() call; our screens update state from async effects that
// resolve after that window, which triggers spurious "not configured to
// support act()" warnings. Keeping the flag on for the whole test run is
// the fix recommended by React/RTL for this scenario.

// AsyncStorage là native module nên trong jest nó là null. Thư viện có sẵn mock
// chính thức (lưu trong bộ nhớ), dùng nó thay vì tự viết giả.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// expo-camera là native module: mock CameraView và useCameraPermissions để test chạy độc lập.
jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    CameraView: (props) =>
      React.createElement(View, { testID: "mock-camera-view", ...props }),
    useCameraPermissions: jest.fn(() => [
      { granted: true, canAskAgain: true, status: "granted" },
      jest.fn().mockResolvedValue({ granted: true }),
    ]),
  };
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
