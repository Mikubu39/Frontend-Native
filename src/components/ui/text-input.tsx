import {
  AnimationPresets,
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.View;

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function StyledTextInput({
  label,
  error,
  style,
  secureTextEntry,
  ...props
}: StyledTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useSharedValue(0);

  const isPassword = secureTextEntry !== undefined && secureTextEntry !== false;

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: AnimationPresets.duration.fast,
    });
  }, [isFocused]);

  const borderAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [Colors.inputBorder, Colors.primary],
    );

    return {
      borderColor,
      borderWidth: isFocused ? 2 : 1.5,
    };
  });

  const shadowAnimStyle = useAnimatedStyle(() => ({
    shadowOpacity: focusAnim.value * 0.15,
    shadowRadius: focusAnim.value * 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    elevation: focusAnim.value * 4,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AnimatedView
        style={[
          styles.inputWrapper,
          borderAnimStyle,
          shadowAnimStyle,
          error && styles.inputError,
        ]}
      >
        <View style={styles.inputContainer}>
          <RNTextInput
            style={[styles.input, style, isPassword && { paddingRight: 50 }]}
            placeholderTextColor={Colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </AnimatedView>
      {error && (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>ⓘ</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 52,
    paddingHorizontal: Spacing.four,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.lg,
  },
  eyeIcon: {
    position: "absolute",
    right: Spacing.four,
    height: "100%",
    justifyContent: "center",
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  errorIcon: {
    color: Colors.error,
    fontSize: FontSizes.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
