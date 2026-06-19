/**
 * Top header bar for the lessons screen.
 *
 * Matches the app's design:
 * - Left: red record dot
 * - Center: "Level 2" dropdown pill
 * - Right: profile avatar circle
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TEXT_PRIMARY, TEXT_SECONDARY } from './lesson-path-constants';

export function LessonsHeader() {
  return (
    <View style={styles.container}>
      {/* Red dot */}
      <View style={styles.redDot} />

      {/* Level dropdown pill */}
      <Pressable style={styles.levelPill}>
        <Text style={styles.levelText}>Level 2</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </Pressable>

      {/* Profile avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarIcon}>👤</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  redDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#D5D5D5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  dropdownArrow: {
    fontSize: 8,
    color: TEXT_PRIMARY,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9E9E9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
