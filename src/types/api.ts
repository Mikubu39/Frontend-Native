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

export interface UserMeResponse {
  id: number;
  email: string;
  displayName: string;
  username: string;
  role: string;
  level: number;
  exp: number;
  rankId: number;
  rankName: string;
  coins: number;
  currentEnergy: number;
  maxEnergy: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezeCount: number;
}

// ============== ROADMAP DTOs ==============
export type RoadmapLessonStatus = "LOCKED" | "UNLOCKED" | "COMPLETED" | "IN_PROGRESS";

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
  answers?: {
    questionId: number;
    selectedOptionId: number;
  }[];
}

export interface SubmitLessonResponse {
  status: string;
  expEarned: number;
  starsEarned: number;
  isTopicCompleted: boolean;
  message: string;
  currentEnergy: number;
  coinsEarned?: number;
  isPromoted?: boolean;
  newRankName?: string;
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

// ============== RANK & LEADERBOARD DTOs ==============
export interface RankResponse {
  rankId: number;
  name: string;
  minExpRequired: number;
  orderIndex: number;
}

export interface CurrentRankInfo {
  rankId: number;
  name: string;
  minExpRequired: number;
}

export interface LeaderboardUserDto {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  exp: number;
  position: number;
}

export interface CurrentUserStanding {
  userId: number;
  displayName: string;
  exp: number;
  position: number | null;
  message: string;
}

export interface LeaderboardResponse {
  currentRankInfo: CurrentRankInfo;
  topUsers: LeaderboardUserDto[];
  currentUserStanding: CurrentUserStanding;
}

// ============== SHOP DTOs ==============
export type ItemType = "CONSUMABLE" | "POWERUP" | "COSMETIC";
export type EffectType =
  | "STREAK_FREEZE"
  | "ENERGY_REFILL"
  | "DOUBLE_XP"
  | "DOUBLE_COIN"
  | "TIMER_BOOST"
  | "AVATAR_FRAME"
  | "BADGE"
  | "THEME";

export interface ShopItemDto {
  id: number;
  name: string;
  description: string;
  itemType: ItemType;
  effectType: EffectType;
  effectValue: number;
  priceCoins: number;
  priceGems: number;
  iconUrl: string | null;
  sortOrder: number;
  limitedTime: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
}

export type ShopGroupedResponse = Record<ItemType, ShopItemDto[]>;

export interface InventoryItemDto {
  inventoryId: number;
  itemId: number;
  name: string;
  itemType: ItemType;
  effectType: EffectType;
  quantity: number;
  equipped: boolean;
  active: boolean;
  expiresAt: string | null;
  acquiredAt: string;
}

export interface ShopBuyResponse {
  inventoryId: number;
  itemName: string;
  effectType: string;
  coinsSpent: number;
  currentCoins: number;
  message: string;
}

export interface ShopConsumeResponse {
  itemName: string;
  effectType: string;
  effectDescription: string;
  currentCoins: number;
  currentEnergy: number;
  streakFreezeCount: number;
  message: string;
}

// ============== MISTAKE BANK DTOs ==============
export interface MistakeSummaryResponse {
  activeCount: number;
  reviewableToday: number;
}

export interface MistakeStartResponse {
  questions: StartLessonQuestion[];
  message: string | null;
}

export interface MistakeResultItem {
  questionId: number;
  correct: boolean;
  correctOptionId: number;
  resolved: boolean;
}

export interface MistakeSubmitResponse {
  results: MistakeResultItem[];
  resolvedCount: number;
  energyRewarded: number;
  currentEnergy: number;
}
