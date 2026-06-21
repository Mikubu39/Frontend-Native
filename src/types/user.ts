/**
 * User-related type definitions.
 */

export type UserLevel = 'starter' | 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: UserLevel;
  levelNumber: number;
  nativeLanguage: string;
  nativeFlag: string;
  learningLanguage: string;
  learningFlag: string;
  profileCompletion: number;
  xp: number;
  streak: number;
}
