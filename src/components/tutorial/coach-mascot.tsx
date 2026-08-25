/**
 * CoachMascot — linh vật Lottie đứng cạnh bong bóng hướng dẫn.
 *
 * `require` của Metro phải là hằng số nên bảng ánh xạ được khai báo tĩnh ở đây,
 * bước hướng dẫn chỉ cần chọn tên.
 */

import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { TutorialMascot } from "@/types";

const MASCOT_SOURCES: Record<TutorialMascot, ReturnType<typeof require>> = {
  hi: require("@/assets/animations/hi_mascot.json"),
  happy: require("@/assets/animations/happy_mascot.json"),
  school: require("@/assets/animations/school_mascot.json"),
  winner: require("@/assets/animations/winner_mascot.json"),
  confuse: require("@/assets/animations/confuse_mascot.json"),
};

interface CoachMascotProps {
  mascot: TutorialMascot;
  size?: number;
}

export function CoachMascot({ mascot, size = 92 }: CoachMascotProps) {
  return (
    <View
      style={[styles.root, { width: size, height: size }]}
      pointerEvents="none"
      testID="coach-mascot"
    >
      {/* Vầng sáng phía sau để linh vật không chìm vào lớp phủ tối */}
      <View
        style={[
          styles.halo,
          {
            width: size * 0.86,
            height: size * 0.86,
            borderRadius: (size * 0.86) / 2,
          },
        ]}
      />
      <LottieView
        source={MASCOT_SOURCES[mascot]}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    backgroundColor: Colors.primary + "33",
  },
});
