/**
 * Profile Screen
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileHeader } from '@/components/profile/profile-header';
import { CompleteProfileCard } from '@/components/profile/complete-profile-card';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader
        displayName="Kotodama User"
        level={2}
        nativeFlag="🇻🇳"
        learningFlag="🇯🇵"
      />

      <CompleteProfileCard
        completion={65}
        onContinue={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
});
