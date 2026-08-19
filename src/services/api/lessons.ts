import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  StartLessonResponse,
  SubmitLessonRequest,
  SubmitLessonResponse,
  CancelLessonResponse,
} from "@/types";

export const lessonAttemptApi = {
  /**
   * Start a lesson attempt (deducts energy & returns questions).
   */
  startLesson: async (
    lessonId: number | string,
  ): Promise<StartLessonResponse> => {
    return apiClient.post<StartLessonResponse>(
      API_ENDPOINTS.LESSONS.START(lessonId),
    );
  },

  /**
   * Submit completed lesson answers (calculates EXP, unlocks next lesson).
   */
  submitLesson: async (
    lessonId: number | string,
    data: SubmitLessonRequest,
  ): Promise<SubmitLessonResponse> => {
    return apiClient.post<SubmitLessonResponse>(
      API_ENDPOINTS.LESSONS.SUBMIT(lessonId),
      data,
    );
  },

  /**
   * Cancel an in-progress lesson (refunds deducted energy).
   */
  cancelLesson: async (
    lessonId: number | string,
  ): Promise<CancelLessonResponse> => {
    return apiClient.post<CancelLessonResponse>(
      API_ENDPOINTS.LESSONS.CANCEL(lessonId),
    );
  },
};
