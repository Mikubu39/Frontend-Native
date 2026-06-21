/**
 * Navigation-related types.
 * Define route params and navigation prop types here.
 */

export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'lesson/[id]': { id: string };
  'quiz/ready': { lessonId: string };
  'quiz/[id]': { id: string };
  'quiz/result': undefined;
  'voice/translate': undefined;
  'voice/listen': undefined;
  'voice/record': undefined;
  'profile/index': undefined;
  'profile/edit': undefined;
  'friends/index': undefined;
  'friends/find-buddies': undefined;
  'schedule': undefined;
  'reward': undefined;
  '+not-found': undefined;
};

export type TabParamList = {
  index: undefined;
  search: undefined;
  review: undefined;
  dictionary: undefined;
  more: undefined;
};
