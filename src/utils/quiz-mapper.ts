import { StartLessonQuestion } from '@/types/api';
import { KanaQuestion, ListeningQuestion, PictureQuestion, QuizAnswer, QuizQuestion, SpeakingQuestion, VocabQuestion } from '@/types/quiz';

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

    const hint = q.metadataJson?.hint || undefined;

    // Based on questionType from backend, determine the frontend QuizType
    switch (q.questionType) {
      case 'SELECT_IMAGE':
        return {
          id: questionId,
          type: 'picture',
          instruction: 'Chọn hình ảnh đúng',
          word: q.content,
          hint,
          audioUrl: q.audioUrl,
          images: answers,
        } as PictureQuestion;

      case 'LISTEN_AND_SELECT':
        return {
          id: questionId,
          type: 'listening',
          instruction: 'Nghe và chọn đáp án đúng',
          hint,
          audioUrl: q.audioUrl || '',
          answers,
        } as ListeningQuestion;

      case 'LISTEN_AND_ARRANGE': {
        const sortedOptions = [...(q.options || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const correctOrder = sortedOptions.map((opt) => opt.content || '');

        let characters = [...correctOrder].sort(() => Math.random() - 0.5);
        if (characters.join('') === correctOrder.join('') && characters.length > 1) {
          characters = [characters[1], characters[0], ...characters.slice(2)];
        }

        return {
          id: questionId,
          type: 'kana',
          instruction: 'Nghe và sắp xếp câu',
          hint,
          imageUrl: q.imageUrl || '',
          audioUrl: q.audioUrl,
          characters,
          correctOrder,
        } as KanaQuestion;
      }

      case 'SPEAKING':
        return {
          id: questionId,
          type: 'speaking',
          instruction: 'Đọc to câu sau',
          textToSpeak: (q.options || [])[0]?.content || q.content || '',
          translation: hint || '',
          hint,
        } as SpeakingQuestion;

      case 'TRANSLATE_TO_VN':
      case 'TRANSLATE_TO_JP':
      default: {
        let cleanWord = q.content || '';
        if (cleanWord.includes(':')) {
          const parts = cleanWord.split(':');
          cleanWord = parts.slice(1).join(':').trim();
        }
        return {
          id: questionId,
          type: 'vocab',
          instruction: q.questionType === 'TRANSLATE_TO_VN' ? 'Dịch sang tiếng Việt' : 'Dịch sang tiếng Nhật',
          word: cleanWord || q.content,
          hint,
          imageUrl: q.imageUrl || '',
          answers,
        } as VocabQuestion;
      }
    }
  });
}
