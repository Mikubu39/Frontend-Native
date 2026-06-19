/**
 * Section header card for lesson categories.
 *
 * Matches the app's existing design:
 * - White card background with yellow/gold rounded border
 * - Bold category title (e.g. "Grammar", "Reading")
 */

import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';

import { CARD_BG, CARD_BORDER, TEXT_PRIMARY } from './lesson-path-constants';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
});
