/**
 * Learn / Home Screen - Learning path with circular progress nodes.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleProgress } from '@/components/ui/circle-progress';
import { LEARNING_PATH } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

export default function LearnScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={Colors.gradients.home}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.flag}>
            <Text style={styles.flagEmoji}>🇯🇵</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Level 1</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.profileBtn}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.pathContainer}
          showsVerticalScrollIndicator={false}
        >
          {LEARNING_PATH.map((node, index) => {
            const isLocked = node.isLocked;
            const progress = node.total > 0 ? node.progress / node.total : 0;

            return (
              <View key={node.id} style={styles.nodeWrapper}>
                {index > 0 && <View style={styles.connector} />}
                <TouchableOpacity
                  style={[styles.node, isLocked && styles.nodeLocked]}
                  onPress={() => !isLocked && router.push(`/lesson/${node.id}`)}
                  disabled={isLocked}
                  activeOpacity={0.8}
                >
                  <CircleProgress
                    progress={progress}
                    size={100}
                    strokeWidth={8}
                    color={isLocked ? Colors.locked : Colors.accent}
                    trackColor={isLocked ? Colors.lockedBg : 'rgba(255,255,255,0.3)'}
                    label={isLocked ? '🔒' : `${Math.round(progress * 100)}%`}
                  />
                  <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}>
                    {node.title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.four,
  },
  flag: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textOnDark,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  pathContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.eight,
    paddingBottom: 100,
  },
  nodeWrapper: {
    alignItems: 'center',
  },
  connector: {
    width: 3,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: Spacing.two,
  },
  node: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  nodeLocked: {
    opacity: 0.6,
  },
  nodeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textOnDark,
  },
  nodeTitleLocked: {
    color: 'rgba(255,255,255,0.5)',
  },
});
