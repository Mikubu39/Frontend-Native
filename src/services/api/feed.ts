import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  CreateCommentRequest,
  CreatePostRequest,
  CursorPage,
  FeedPostResponse,
  PostCommentResponse,
} from "@/types/api";

export const feedApi = {
  /** Bài của mình + người đang follow, mới nhất trước. */
  getFeed: async (cursor?: string): Promise<CursorPage<FeedPostResponse>> => {
    return apiClient.get(API_ENDPOINTS.FEED.GET, { cursor });
  },

  createPost: async (data: CreatePostRequest): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.POSTS.CREATE, data);
  },

  deletePost: async (postId: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.POSTS.DELETE(postId));
  },

  /** Idempotent - gọi lặp lại không lỗi, không tăng đôi likeCount. */
  likePost: async (postId: number): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.POSTS.LIKE(postId));
  },

  unlikePost: async (postId: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.POSTS.LIKE(postId));
  },

  getComments: async (
    postId: number,
    cursor?: string,
  ): Promise<CursorPage<PostCommentResponse>> => {
    return apiClient.get(API_ENDPOINTS.POSTS.COMMENTS(postId), { cursor });
  },

  addComment: async (
    postId: number,
    data: CreateCommentRequest,
  ): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.POSTS.COMMENTS(postId), data);
  },

  deleteComment: async (commentId: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
  },
};
