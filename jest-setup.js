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

// React 19's act() environment flag is only toggled for the duration of a
// synchronous act() call; our screens update state from async effects that
// resolve after that window, which triggers spurious "not configured to
// support act()" warnings. Keeping the flag on for the whole test run is
// the fix recommended by React/RTL for this scenario.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
