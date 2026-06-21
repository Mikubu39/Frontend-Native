/**
 * Mock onboarding data.
 */

import type { OnboardingGoalOption, OnboardingInterest, OnboardingLevelOption } from '@/types';

export const ONBOARDING_GOALS: OnboardingGoalOption[] = [
  { id: 'jlpt', label: 'JLPT certification' },
  { id: 'hobby', label: 'Hobby' },
  { id: 'traveling', label: 'Traveling' },
  { id: 'talk', label: 'Talk in Japanese' },
  { id: 'work', label: 'Utilize for your work' },
];

export const ONBOARDING_INTERESTS: OnboardingInterest[] = [
  { id: 'travel', label: 'Travel', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop' },
  { id: 'art', label: 'Art', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=200&fit=crop' },
  { id: 'food', label: 'Food', imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300&h=200&fit=crop' },
  { id: 'manga', label: 'Manga', imageUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=200&fit=crop' },
];

export const ONBOARDING_LEVELS: OnboardingLevelOption[] = [
  { id: 'starter', title: 'STARTER', description: 'First time to learn this language' },
  { id: 'beginner', title: 'BEGINNER', description: 'I know some words' },
];

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
