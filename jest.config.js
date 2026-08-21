module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.style-mock.js",
    // Metro resolves this across the whole node_modules tree; plain Node
    // (and therefore Jest) resolution only sees it nested under `expo`.
    "^expo-asset$": "<rootDir>/node_modules/expo/node_modules/expo-asset",
  },
};
