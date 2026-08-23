import { Colors } from "@/constants/theme";
import { useImageFallback } from "@/hooks/use-image-fallback";
import { resolveMediaUrl } from "@/utils/media";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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
  backgroundColor = "#F5ECFF",
  borderWidth = 0,
  borderColor = Colors.primaryLight,
}: AvatarDisplayProps) {
  // URL avatar từ backend là đường dẫn tương đối (`/uploads/images/avatars/...`).
  // `useImageFallback`: avatar bị xoá trên server thì rơi về con gấu trúc, thay
  // vì để lại một vòng tròn trống không giải thích được.
  const { uri: resolvedUri, onError } = useImageFallback(resolveMediaUrl(uri));

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
      {resolvedUri ? (
        <Image
          testID="avatar-image"
          source={{ uri: resolvedUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
          onError={onError}
        />
      ) : (
        <Text
          style={[
            styles.fallback,
            // lineHeight phải co theo size: để cứng 60 thì ở avatar nhỏ (40px)
            // dòng chữ cao hơn cả khung, đẩy emoji lệch xuống và bị cắt mất.
            { fontSize: Math.max(size * 0.52, 28), lineHeight: size },
          ]}
        >
          🐼
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    textAlign: "center",
  },
});
