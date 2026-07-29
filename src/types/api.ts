/**
 * API response, request, and DTO types for User-facing features.
 */

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// ============== AUTH DTOs ==============
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    displayName: string;
    username: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  displayName?: string;
}

// ============== USER DTOs ==============
export interface UpdatePhoneRequest {
  phoneNumber: string;
}

export interface SyncContactsRequest {
  phoneNumbers: string[];
}

export interface UserOverviewResponse {
  id: number;
  displayName: string;
  avatarUrl: string;
  level: number;
}

export interface UserSearchResponse {
  id: number;
  displayName: string;
  avatarUrl: string;
  level: number;
  isFollowing: boolean;
}

export interface UserProfileResponse {
  id: number;
  displayName: string;
  username: string;
  avatarUrl: string;
  level: number;
  isFollowing: boolean;
}

export interface UpdateProfileRequest {
  displayName: string;
  username: string;
}

// ============== ROADMAP DTOs ==============
export type RoadmapLessonStatus = 'LOCKED' | 'UNLOCKED' | 'COMPLETED';

export interface RoadmapLessonResponse {
  lessonId: number;
  title: string;
  lessonType: string;
  orderIndex: number;
  status: RoadmapLessonStatus;
  starsEarned?: number;
}

export interface RoadmapTopicResponse {
  topicId: number;
  topicTitle: string;
  lessons: RoadmapLessonResponse[];
}

// ============== LESSON ATTEMPT DTOs ==============
export interface StartLessonOption {
  optionId: number;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  metadataJson?: any;
  isCorrect?: boolean;
  order?: number;
}

export interface StartLessonQuestion {
  questionId: number;
  questionType: string;
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  metadataJson?: any;
  options: StartLessonOption[];
}

export interface StartLessonResponse {
  lessonId: number;
  lessonType: string;
  totalEnergyDeducted: number;
  isReplay: boolean;
  questions: StartLessonQuestion[];
}

export interface SubmitLessonRequest {
  totalQuestions: number;
  totalCorrect: number;
  totalMistakes: number;
  timeTakenSeconds?: number;
  heartsRemaining?: number;
  isReplay?: boolean;
}

export interface SubmitLessonResponse {
  status: string;
  expEarned: number;
  starsEarned: number;
  isTopicCompleted: boolean;
  message: string;
  currentEnergy: number;
}

export interface CancelLessonResponse {
  energyRefunded: number;
  currentEnergy: number;
  status: string;
}

// ============== UPLOADS DTOs ==============
export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  contentType: string;
  size: number;
}
