import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { userService } from '@/services/api/user';
import { UserSearchResponse } from '@/types/user-api';

export default function FriendsSearchScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<UserSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const users = await userService.searchUsers(keyword.trim());
      setResults(users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (id: number, currentIndex: number) => {
    try {
      const newStatus = await userService.toggleFollow(id);
      const newResults = [...results];
      newResults[currentIndex].isFollowing = newStatus;
      setResults(newResults);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.userCard}
              disabled={true}
            >
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.fullName}>{item.displayName}</Text>
                <Text style={styles.username}>Lv {item.level}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                onPress={() => handleToggleFollow(item.id, index)}
              >
                <Text style={[styles.followBtnText, item.isFollowing && styles.followingBtnText]}>
                  {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && keyword ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  backBtn: {
    padding: Spacing.two,
  },
  backText: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.full,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  searchBtn: {
    padding: Spacing.three,
  },
  searchBtnText: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  loader: {
    marginTop: Spacing.eight,
  },
  listContainer: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  username: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  followingBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  followBtnText: {
    color: 'white',
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  followingBtnText: {
    color: Colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.eight,
  },
});
