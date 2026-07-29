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

import * as SecureStore from 'expo-secure-store';

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore set error:', error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore remove error:', error);
    }
  },

  async clear(): Promise<void> {
    console.warn('SecureStore does not support native clear(). Please remove specific keys like "auth_token" directly.');
  },
};
