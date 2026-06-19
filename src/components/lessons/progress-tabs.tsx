/**
 * Progress/Calendar tab switcher.
 *
 * Matches the app's design:
 * - "Progress" tab active with yellow underline
 * - "Calendar" tab inactive
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TAB_ACTIVE, TEXT_PRIMARY, TEXT_SECONDARY } from './lesson-path-constants';

type TabKey = 'progress' | 'calendar';

interface ProgressTabsProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

export function ProgressTabs({ activeTab = 'progress', onTabChange }: ProgressTabsProps) {
  const [selected, setSelected] = useState<TabKey>(activeTab);

  const handlePress = (tab: TabKey) => {
    setSelected(tab);
    onTabChange?.(tab);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.tab}
        onPress={() => handlePress('progress')}
      >
        <Text
          style={[
            styles.tabText,
            selected === 'progress' && styles.tabTextActive,
          ]}
        >
          Progress
        </Text>
        {selected === 'progress' && <View style={styles.activeIndicator} />}
      </Pressable>

      <Pressable
        style={styles.tab}
        onPress={() => handlePress('calendar')}
      >
        <Text
          style={[
            styles.tabText,
            selected === 'calendar' && styles.tabTextActive,
          ]}
        >
          Calender
        </Text>
        {selected === 'calendar' && <View style={styles.activeIndicator} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 12,
    marginBottom: 8,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  tabTextActive: {
    color: TEXT_PRIMARY,
  },
  activeIndicator: {
    marginTop: 4,
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: TAB_ACTIVE,
  },
});
