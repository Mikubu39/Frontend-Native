import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { UploadResponse } from "@/types";

export const uploadApi = {
  /**
   * Upload an image file (avatar / question image).
   */
  uploadImage: async (formData: FormData): Promise<UploadResponse> => {
    return apiClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOADS.IMAGE,
      formData,
    );
  },

  /**
   * Upload an audio file.
   */
  uploadAudio: async (formData: FormData): Promise<UploadResponse> => {
    return apiClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOADS.AUDIO,
      formData,
    );
  },

  /**
   * Upload multiple image files.
   */
  uploadBatchImage: async (formData: FormData): Promise<UploadResponse[]> => {
    return apiClient.post<UploadResponse[]>(
      API_ENDPOINTS.UPLOADS.BATCH_IMAGE,
      formData,
    );
  },

  /**
   * Upload multiple audio files.
   */
  uploadBatchAudio: async (formData: FormData): Promise<UploadResponse[]> => {
    return apiClient.post<UploadResponse[]>(
      API_ENDPOINTS.UPLOADS.BATCH_AUDIO,
      formData,
    );
  },
};
