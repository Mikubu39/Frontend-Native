import { Colors } from "@/constants/theme";
import { useImageFallback } from "@/hooks/use-image-fallback";
import { resolveAvatarUri } from "@/utils/media";
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
  // Chuẩn hoá theo avatar nhân vật DiceBear (bỏ qua Google photo, fallback avatar hoạt hình)
  const finalUri = resolveAvatarUri(uri);

  // `useImageFallback`: avatar bị lỗi tải mạng/xoá trên server thì rơi về emoji gấu trúc 🐼
  const { uri: resolvedUri, onError } = useImageFallback(finalUri);

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
