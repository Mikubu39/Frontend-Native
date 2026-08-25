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
    // tsconfig.json overrides `@/assets/*` to the repo-root `assets/` folder
    // (more specific than the generic `@/* -> src/*` rule below it), and
    // Metro honors that at runtime. jest-expo's auto-generated mapper only
    // picks up the generic rule, so this narrower one must come first.
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
