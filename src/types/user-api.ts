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
