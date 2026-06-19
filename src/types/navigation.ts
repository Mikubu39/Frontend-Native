/**
 * Navigation-related types.
 * Define route params and navigation prop types here.
 */

export type RootStackParamList = {
  "(tabs)": undefined;
  "(auth)": undefined;
  "+not-found": undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
  profile: undefined;
};
