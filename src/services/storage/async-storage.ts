/**
 * Local Storage Service
 *
 * Abstraction layer for local persistent storage.
 * Replace with @react-native-async-storage/async-storage or expo-secure-store
 * depending on your needs.
 *
 * Example usage:
 *   import { storage } from '@/services/storage';
 *   await storage.set('token', 'abc123');
 *   const token = await storage.get('token');
 */

// Sử dụng bộ nhớ tạm (In-memory) để vượt qua lỗi NativeModule của Expo Go
// Lưu ý: Khi đóng app mở lại sẽ bị đăng xuất. Khi nào build app thật sẽ dùng lại SecureStore.
const memoryStore = new Map<string, string>();

export const storage = {
  async get(key: string): Promise<string | null> {
    return memoryStore.get(key) || null;
  },

  async set(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
  },

  async remove(key: string): Promise<void> {
    memoryStore.delete(key);
  },

  async clear(): Promise<void> {
    memoryStore.clear();
  },
};
