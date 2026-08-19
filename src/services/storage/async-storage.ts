/**
 * Local Storage Service
 *
 * Abstraction layer for local persistent storage.
 * - Trên iOS/Android: dùng expo-secure-store (mã hoá, an toàn).
 * - Trên web: expo-secure-store KHÔNG được hỗ trợ (không có Keychain/Keystore
 *   để dùng), nên tự động chuyển sang localStorage của trình duyệt.
 *
 * Example usage:
 *   import { storage } from '@/services/storage';
 *   await storage.set('token', 'abc123');
 *   const token = await storage.get('token');
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return window.localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("Storage get error:", error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        window.localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("Storage set error:", error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isWeb) {
        window.localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("Storage remove error:", error);
    }
  },

  async clear(): Promise<void> {
    if (isWeb) {
      window.localStorage.clear();
      return;
    }
    console.warn(
      'SecureStore does not support native clear(). Please remove specific keys like "auth_token" directly.',
    );
  },
};
