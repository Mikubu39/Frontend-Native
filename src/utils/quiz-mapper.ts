import { StartLessonQuestion } from '@/types/api';
import { ListeningQuestion, PictureQuestion, QuizAnswer, QuizQuestion, VocabQuestion } from '@/types/quiz';

/**
 * Maps Backend API Questions to Frontend UI Quiz Questions.
 */
export function mapApiQuestionsToQuizQuestions(apiQuestions: StartLessonQuestion[]): QuizQuestion[] {
  return apiQuestions.map((q, index) => {
    const questionId = String(q.questionId || index);

    // Map options to QuizAnswer
    const answers: QuizAnswer[] = (q.options || []).map((opt) => ({
      id: String(opt.optionId),
      text: opt.content || '',
      imageUrl: opt.imageUrl,
      audioUrl: opt.audioUrl,
      isCorrect: !!opt.isCorrect,
    }));

    // Based on questionType from backend, determine the frontend QuizType
    switch (q.questionType) {
      case 'SELECT_IMAGE':
        return {
          id: questionId,
          type: 'picture',
          instruction: 'Chọn hình ảnh đúng',
          word: q.content,
          audioUrl: q.audioUrl,
          images: answers,
        } as PictureQuestion;

      case 'LISTEN_AND_SELECT':
        return {
          id: questionId,
          type: 'listening',
          instruction: 'Nghe và chọn đáp án đúng',
          audioUrl: q.audioUrl || '',
          answers,
        } as ListeningQuestion;

      case 'TRANSLATE_TO_VN':
      case 'TRANSLATE_TO_JP':
      default:
        // Default to 'vocab' multiple choice
        return {
          id: questionId,
          type: 'vocab',
          instruction: q.questionType === 'TRANSLATE_TO_VN' ? 'Dịch sang tiếng Việt' : 'Dịch sang tiếng Nhật',
          imageUrl: q.imageUrl || '',
          answers,
        } as VocabQuestion;
    }
  });
}
