import { Colors } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarDisplayProps {
  uri?: string;
  size?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

export function AvatarDisplay({
  uri,
  size = 108,
  backgroundColor = '#F5ECFF',
  borderWidth = 0,
  borderColor = Colors.primaryLight,
}: AvatarDisplayProps) {
  const hasValidUri = !!uri && /^https?:\/\//i.test(uri);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth,
          borderColor,
        },
      ]}
    >
      {hasValidUri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.max(size * 0.52, 28) }]}>🐼</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    textAlign: 'center',
    lineHeight: 60,
  },
});
