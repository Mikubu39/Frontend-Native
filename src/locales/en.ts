/**
 * English string resources for the Kotodama app.
 */

export const en = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Try again',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    noData: 'No data',
    next: 'NEXT',
    back: 'Back',
    close: 'Close',
    ready: 'READY',
    finish: 'FINISH',
    continue: 'Continue',
  },
  auth: {
    signIn: 'Log In',
    signUp: 'Sign up',
    signOut: 'Sign Out',
    username: 'Username',
    email: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    orDivider: 'or',
    alreadyHaveAccount: 'Already have account?',
  },
  onboarding: {
    goalTitle: 'What is your goal?',
    interestsTitle: 'What are your interests?',
    levelTitle: 'What is your level?',
    startLearning: 'START LEARNING',
  },
  quiz: {
    chooseCorrectAnswer: 'Choose correct answer',
    chooseCorrectPicture: 'Choose correct picture',
    chooseCorrectKanjis: 'Choose correct Kanjis',
    goodJob: 'Good job!',
    correct: 'Correct',
    wrong: 'Wrong',
    tryAgain: 'Try again',
    readyTitle: 'Are you ready to learn 20 questions of WORD?',
  },
  tabs: {
    learn: 'Learn',
    search: 'Search',
    review: 'Review',
    dictionary: 'Dictionary',
    more: 'More',
  },
  learn: {
    level: 'Level',
  },
  review: {
    title: 'Review lessons',
    week: 'Week',
    stage: 'Stage',
  },
  dictionary: {
    title: 'My dictionary',
    words: 'Words',
    phrases: 'Phrases',
    history: 'History',
  },
  voice: {
    tapToRecord: 'Tap to record',
    tapToListen: 'Tap to listen',
    seeDescription: 'See the description',
    yourScore: 'Your score',
    outOf100: 'out of 100',
  },
  profile: {
    completeProfile: 'Complete profile',
  },
  friends: {
    addFriends: 'Add Friends',
    findBuddies: 'Find buddies',
    share: 'Share',
    promoteVoucher: 'Promote voucher',
  },
  reward: {
    congratulations: 'Congratulations!',
    freeLesson: 'You got a free online lesson',
    startOnlineLesson: 'Start online lesson',
    useLater: 'I will use later',
  },
} as const;
