import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import {
  avatarOptions,
  type AvatarConfig,
  type RgbColor,
  DEFAULT_AVATAR_CONFIG,
  buildAvatarUrl,
  hexToRgb,
  rgbToHex,
} from "@/data/avatar-options";
import { AvatarDisplay } from "@/components/user/avatar-display";
import { useTheme } from "@/contexts/theme-context";

interface AvatarPickerModalProps {
  visible: boolean;
  initialConfig?: AvatarConfig;
  onClose: () => void;
  onSave: (config: AvatarConfig) => void;
}

// Bảng dịch các tùy chọn sang tiếng Việt
const translations: Record<string, string> = {
  // Kiểu tóc
  short: "Ngắn",
  long: "Dài",
  curly: "Xoăn",
  bob: "Bob",
  bun: "Búi",
  // Râu
  none: "Không",
  beard: "Râu quai nón",
  moustache: "Râu mép",
  // Phụ kiện
  glasses: "Kính",
  hat: "Mũ",
};

const translateOption = (value: string): string => {
  return translations[value.toLowerCase()] || value.toUpperCase();
};

export function AvatarPickerModal({
  visible,
  initialConfig,
  onClose,
  onSave,
}: AvatarPickerModalProps) {
  const { colors, isDark } = useTheme();
  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig ?? DEFAULT_AVATAR_CONFIG,
  );
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const justOpened = visible && !wasVisibleRef.current;
    if (justOpened) {
      setConfig(initialConfig ?? DEFAULT_AVATAR_CONFIG);
    }
    wasVisibleRef.current = visible;
  }, [visible, initialConfig]);

  const previewUrl = useMemo(() => buildAvatarUrl(config), [config]);

  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const renderOptionGroup = (
    title: string,
    keyName: keyof AvatarConfig,
    items: string[],
    formatter?: (value: string) => string,
  ) => (
    <View style={styles.group} key={keyName}>
      <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.optionRow}>
        {items.map((item) => {
          const isActive = config[keyName] === item;
          return (
            <Pressable
              key={`${keyName}-${item}`}
              style={[
                styles.optionChip,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
                isActive && [
                  styles.optionChipActive,
                  {
                    backgroundColor: isDark
                      ? "rgba(59, 76, 130, 0.2)"
                      : "#E8EAF4",
                  },
                ],
              ]}
              onPress={() => updateConfig(keyName, item)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: colors.textSecondary },
                  isActive && styles.optionChipTextActive,
                ]}
              >
                {formatter ? formatter(item) : item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderColorGroup = (
    title: string,
    keyName: keyof AvatarConfig,
    presets: string[],
  ) => (
    <View style={styles.group} key={keyName}>
      <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.optionRow}>
        {presets.map((hex) => {
          const isActive = config[keyName] === hex;
          return (
            <Pressable
              key={`${keyName}-${hex}`}
              onPress={() => updateConfig(keyName, hex)}
              style={styles.colorSwatchWrap}
            >
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: hex },
                  isActive && styles.colorSwatchActive,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <RgbColorPicker
        value={config[keyName]}
        onChange={(hex) => updateConfig(keyName, hex)}
        colors={colors}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              Chọn avatar
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          <View style={styles.previewWrap}>
            <AvatarDisplay
              uri={previewUrl}
              size={126}
              backgroundColor={isDark ? "rgba(59, 76, 130, 0.2)" : "#E8EAF4"}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {renderColorGroup("Màu da", "skin", avatarOptions.skin)}
            {renderOptionGroup(
              "Kiểu tóc",
              "hair",
              avatarOptions.hair,
              translateOption
            )}
            {renderOptionGroup(
              "Râu",
              "facialHair",
              avatarOptions.facialHair,
              translateOption
            )}
            {renderColorGroup("Màu áo", "outfit", avatarOptions.outfit)}
            {renderOptionGroup(
              "Phụ kiện",
              "accessory",
              avatarOptions.accessory,
              translateOption
            )}
            {renderColorGroup(
              "Màu nền",
              "background",
              avatarOptions.background,
            )}
          </ScrollView>

          <Pressable
            style={styles.saveButton}
            onPress={() => {
              onSave(config);
              onClose();
            }}
          >
            <Text style={styles.saveButtonText}>Lưu avatar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Bảng chỉnh màu bằng 3 thanh trượt R/G/B - kéo tay để chỉnh, không cần biết
 * mã màu là gì. Hiện ô preview lớn + giá trị số từng kênh để tham khảo.
 */
function RgbColorPicker({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (hex: string) => void;
  colors: any;
}) {
  const [rgb, setRgb] = useState<RgbColor>(() => hexToRgb(value));

  // Đồng bộ lại khi value đổi từ bên ngoài (vd bấm 1 ô màu preset có sẵn).
  useEffect(() => {
    setRgb(hexToRgb(value));
  }, [value]);

  const handleChannelChange = (channel: keyof RgbColor, next: number) => {
    const nextRgb = { ...rgb, [channel]: next };
    setRgb(nextRgb);
    onChange(rgbToHex(nextRgb));
  };

  return (
    <View
      style={[
        styles.rgbPicker,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.rgbPreviewRow}>
        <View
          style={[
            styles.rgbPreviewBox,
            {
              backgroundColor: rgbToHex(rgb),
              borderColor: colors.borderTransparent,
            },
          ]}
        />
        <Text style={[styles.rgbPreviewText, { color: colors.textSecondary }]}>
          {rgbToHex(rgb)}
        </Text>
      </View>

      <RgbSlider
        label="R"
        trackColor="#EF4444"
        value={rgb.r}
        onChange={(v) => handleChannelChange("r", v)}
      />
      <RgbSlider
        label="G"
        trackColor="#22C55E"
        value={rgb.g}
        onChange={(v) => handleChannelChange("g", v)}
      />
      <RgbSlider
        label="B"
        trackColor="#3B82F6"
        value={rgb.b}
        onChange={(v) => handleChannelChange("b", v)}
      />
    </View>
  );
}

function RgbSlider({
  label,
  trackColor,
  value,
  onChange,
  colors,
}: {
  label: string;
  trackColor: string;
  value: number;
  onChange: (value: number) => void;
  colors?: any;
}) {
  const widthRef = useRef(0);

  const handleTouch = (e: any) => {
    if (widthRef.current > 0) {
      // locationX is relative to the element receiving the touch
      let v = (e.nativeEvent.locationX / widthRef.current) * 255;
      onChange(Math.max(0, Math.min(255, v)));
    }
  };

  return (
    <View style={styles.rgbSliderRow}>
      <Text style={[styles.rgbSliderLabel, { color: trackColor }]}>
        {label}
      </Text>

      <View
        style={styles.rgbSlider}
        onLayout={(e) => (widthRef.current = e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <View
          style={{
            height: 6,
            backgroundColor: "#E5E7EB",
            borderRadius: 3,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 6,
              backgroundColor: trackColor,
              borderRadius: 3,
              width: `${(value / 255) * 100}%`,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: trackColor,
              left: `${(value / 255) * 100}%`,
              transform: [{ translateX: -9 }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
              elevation: 3,
            }}
          />
        </View>
      </View>

      <Text
        style={[
          styles.rgbSliderValue,
          colors && { color: colors.textSecondary },
        ]}
      >
        {Math.round(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    maxHeight: "85%",
    ...Shadows.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  closeText: {
    fontSize: 26,
    lineHeight: 26,
  },
  previewWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
  },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  groupTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionChipActive: {
    borderColor: Colors.primary,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: FontWeights.semibold,
  },
  optionChipTextActive: {
    color: Colors.primary,
  },
  colorSwatchWrap: {
    padding: 3,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
  },
  colorSwatchActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  rgbPicker: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  rgbPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  rgbPreviewBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
  },
  rgbPreviewText: {
    fontSize: 13,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.5,
  },
  rgbSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rgbSliderLabel: {
    width: 16,
    fontSize: 13,
    fontWeight: FontWeights.bold,
  },
  rgbSlider: {
    flex: 1,
    height: 32,
  },
  rgbSliderValue: {
    width: 32,
    textAlign: "right",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});