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

// TODO: Install and configure your preferred storage solution:
// - expo-secure-store: for sensitive data (tokens, credentials)
// - @react-native-async-storage/async-storage: for general key-value storage

export const storage = {
  async get(key: string): Promise<string | null> {
    // TODO: implement with your chosen storage library
    console.warn(`storage.get('${key}') not implemented`);
    return null;
  },

  async set(key: string, value: string): Promise<void> {
    // TODO: implement
    console.warn(`storage.set('${key}') not implemented`);
  },

  async remove(key: string): Promise<void> {
    // TODO: implement
    console.warn(`storage.remove('${key}') not implemented`);
  },

  async clear(): Promise<void> {
    // TODO: implement
    console.warn("storage.clear() not implemented");
  },
};
