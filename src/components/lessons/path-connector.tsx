/**
 * Dotted connector between two lesson nodes on the path.
 * Renders small dots that follow the S-curve between offsets.
 * Uses the app's gray color for consistency.
 */

import { StyleSheet, View } from 'react-native';

import { LOCKED_GRAY } from './lesson-path-constants';

interface PathConnectorProps {
  fromOffset: number;
  toOffset: number;
}

export function PathConnector({ fromOffset, toOffset }: PathConnectorProps) {
  const dotCount = 3;

  return (
    <View style={styles.container}>
      {Array.from({ length: dotCount }).map((_, i) => {
        const progress = (i + 1) / (dotCount + 1);
        const x = fromOffset + (toOffset - fromOffset) * progress;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              { transform: [{ translateX: x }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'space-evenly',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: LOCKED_GRAY,
    opacity: 0.5,
  },
});
