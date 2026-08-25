/**
 * Từ điển tra tại chỗ dùng chung cho toàn app.
 *
 * <h3>Vì sao cần</h3>
 * Trước đây mỗi câu hỏi tự mang theo một bảng `glossary` nhỏ do người soạn bài
 * nhập tay, nên chỉ tra được đúng vài từ mà họ nhớ điền. Chữ Nhật ở mọi chỗ
 * khác — màn ôn tập, sổ tay, kết quả bài học — bấm giữ không ra gì.
 *
 * Provider này tải MỘT lần toàn bộ kho từ (`GET /vocabulary/glossary`, ~675 mục)
 * rồi giữ trong bộ nhớ, để bất kỳ `JapaneseText` nào cũng tra được.
 *
 * <h3>Cache</h3>
 * Dùng `AsyncStorage` chứ KHÔNG dùng `@/services/storage`: cái đó chạy trên
 * `expo-secure-store`, vốn giới hạn khoảng 2KB mỗi giá trị trên Android — kho từ
 * lớn gấp nhiều lần nên sẽ bị cắt cụt âm thầm.
 *
 * <h3>Điều quan trọng nhất: KHÔNG được lộ đáp án</h3>
 * Ở câu "Đâu là 「trà」?", nếu người học bấm giữ được vào đáp án `おちゃ` thì họ
 * đọc thẳng ra đáp án. Vì vậy từ điển toàn cục chỉ áp cho phần ĐỀ BÀI. Phần đáp
 * án phải bọc trong {@link GlossaryLockdown} để tắt tra từ cho tới khi đã trả lời.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { vocabularyApi } from "@/services/api/vocabulary";
import type { Glossary } from "@/types/quiz";
import type { VocabularyItem } from "@/types";

const CACHE_KEY = "vocabulary_glossary_v1";

interface GlossaryContextValue {
  /** Bảng tra toàn cục: mặt chữ -> { romaji, nghĩa }. Rỗng khi chưa tải xong. */
  glossary: Glossary;
  /** Đang tải lần đầu (chưa có cả cache lẫn mạng). */
  loading: boolean;
  /** Tải lại từ server, bỏ qua cache. */
  refresh: () => Promise<void>;
}

const GlossaryContext = createContext<GlossaryContextValue>({
  glossary: {},
  loading: false,
  refresh: async () => {},
});

/** Chuyển danh sách từ API sang bảng tra mà `JapaneseText` hiểu. */
function toGlossary(items: VocabularyItem[]): Glossary {
  const out: Glossary = {};
  for (const item of items) {
    if (!item?.surface) continue;
    out[item.surface] = {
      r: item.romaji ?? undefined,
      v: item.meaningVn,
    };
    // Từ có kanji thì cách đọc kana cũng phải tra được: người học gặp 「せんせい」
    // ở bài này và 「先生」 ở bài khác, cùng một từ.
    if (item.reading && item.reading !== item.surface) {
      out[item.reading] = { r: item.romaji ?? undefined, v: item.meaningVn };
    }
  }
  return out;
}

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [glossary, setGlossary] = useState<Glossary>({});
  const [loading, setLoading] = useState(true);

  const fetchFromServer = useCallback(async () => {
    const items = await vocabularyApi.getGlossary();
    const next = toGlossary(items);
    setGlossary(next);
    // Ghi cache best-effort: hỏng cache không được làm hỏng tính năng.
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Đọc cache trước để tra từ dùng được ngay, kể cả khi đang offline.
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          setGlossary(toGlossary(JSON.parse(cached) as VocabularyItem[]));
          setLoading(false);
        }
      } catch {
        // Cache hỏng thì bỏ qua, phía dưới vẫn gọi mạng.
      }

      try {
        if (!cancelled) await fetchFromServer();
      } catch {
        // Mất mạng hoặc chưa đăng nhập: giữ nguyên cache (nếu có). Tra từ là
        // tính năng phụ trợ, không được chặn người học làm bài.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchFromServer]);

  const value = useMemo<GlossaryContextValue>(
    () => ({ glossary, loading, refresh: fetchFromServer }),
    [glossary, loading, fetchFromServer],
  );

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  );
}

/**
 * Bảng tra toàn cục.
 *
 * Không ném lỗi khi thiếu provider mà trả về bảng rỗng — nhờ vậy test dựng riêng
 * một component không phải bọc thêm provider, và `JapaneseText` chỉ đơn giản là
 * không gạch chân từ nào.
 */
export function useGlossary(): GlossaryContextValue {
  return useContext(GlossaryContext);
}

const LockdownContext = createContext(false);

/**
 * Tắt tra từ cho phần cây con bên trong.
 *
 * Bọc quanh khu vực ĐÁP ÁN: tra được nghĩa của đáp án là biết luôn đáp án. Sau
 * khi người học đã trả lời thì truyền `active={false}` để mở khoá — lúc đó tra
 * nghĩa lại đúng là thứ giúp họ hiểu vì sao mình sai.
 */
export function GlossaryLockdown({
  active = true,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <LockdownContext.Provider value={active}>
      {children}
    </LockdownContext.Provider>
  );
}

/** `true` khi đang ở trong vùng cấm tra từ. */
export function useGlossaryLockdown(): boolean {
  return useContext(LockdownContext);
}
