import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  avatarOptions,
  type AvatarConfig,
  type RgbColor,
  DEFAULT_AVATAR_CONFIG,
  buildAvatarUrl,
  hexToRgb,
  rgbToHex,
} from '@/data/avatar-options';
import { AvatarDisplay } from '@/components/user/avatar-display';

interface AvatarPickerModalProps {
  visible: boolean;
  initialConfig?: AvatarConfig;
  onClose: () => void;
  onSave: (config: AvatarConfig) => void;
}

export function AvatarPickerModal({
  visible,
  initialConfig,
  onClose,
  onSave,
}: AvatarPickerModalProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig ?? DEFAULT_AVATAR_CONFIG);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const justOpened = visible && !wasVisibleRef.current;
    if (justOpened) {
      // Chỉ nạp lại config lúc modal VỪA MỞ, không phải mỗi khi component cha re-render
      // (nếu để effect này chạy theo initialConfig thì nó sẽ reset lựa chọn của user liên tục,
      // vì initialConfig là object mới được tạo lại mỗi lần cha render).
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
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.optionRow}>
        {items.map((item) => {
          const isActive = config[keyName] === item;
          return (
            <Pressable
              key={`${keyName}-${item}`}
              style={[styles.optionChip, isActive && styles.optionChipActive]}
              onPress={() => updateConfig(keyName, item)}
            >
              <Text style={[styles.optionChipText, isActive && styles.optionChipTextActive]}>
                {formatter ? formatter(item) : item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderColorGroup = (title: string, keyName: keyof AvatarConfig, presets: string[]) => (
    <View style={styles.group} key={keyName}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.optionRow}>
        {presets.map((hex) => {
          const isActive = config[keyName] === hex;
          return (
            <Pressable key={`${keyName}-${hex}`} onPress={() => updateConfig(keyName, hex)} style={styles.colorSwatchWrap}>
              <View style={[styles.colorSwatch, { backgroundColor: hex }, isActive && styles.colorSwatchActive]} />
            </Pressable>
          );
        })}
      </View>
      <RgbColorPicker value={config[keyName]} onChange={(hex) => updateConfig(keyName, hex)} />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Chọn avatar</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.previewWrap}>
            <AvatarDisplay uri={previewUrl} size={126} backgroundColor="#F3E8FF" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {renderColorGroup('Màu da', 'skin', avatarOptions.skin)}
            {renderOptionGroup('Kiểu tóc', 'hair', avatarOptions.hair, (value) => value.toUpperCase())}
            {renderOptionGroup('Râu', 'facialHair', avatarOptions.facialHair, (value) =>
              value === 'none' ? 'KHÔNG' : value.toUpperCase()
            )}
            {renderColorGroup('Màu áo', 'outfit', avatarOptions.outfit)}
            {renderOptionGroup('Phụ kiện', 'accessory', avatarOptions.accessory, (value) => value.toUpperCase())}
            {renderColorGroup('Màu nền', 'background', avatarOptions.background)}
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
function RgbColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
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
    <View style={styles.rgbPicker}>
      <View style={styles.rgbPreviewRow}>
        <View style={[styles.rgbPreviewBox, { backgroundColor: rgbToHex(rgb) }]} />
        <Text style={styles.rgbPreviewText}>{rgbToHex(rgb)}</Text>
      </View>

      <RgbSlider label="R" trackColor="#EF4444" value={rgb.r} onChange={(v) => handleChannelChange('r', v)} />
      <RgbSlider label="G" trackColor="#22C55E" value={rgb.g} onChange={(v) => handleChannelChange('g', v)} />
      <RgbSlider label="B" trackColor="#3B82F6" value={rgb.b} onChange={(v) => handleChannelChange('b', v)} />
    </View>
  );
}

function RgbSlider({
  label,
  trackColor,
  value,
  onChange,
}: {
  label: string;
  trackColor: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.rgbSliderRow}>
      <Text style={[styles.rgbSliderLabel, { color: trackColor }]}>{label}</Text>
      <Slider
        style={styles.rgbSlider}
        minimumValue={0}
        maximumValue={255}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={trackColor}
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor={trackColor}
      />
      <Text style={styles.rgbSliderValue}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    maxHeight: '85%',
    ...Shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  closeText: {
    fontSize: 26,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  previewWrap: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F3E8FF',
  },
  optionChipText: {
    color: Colors.textSecondary,
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
    borderColor: 'rgba(0,0,0,0.08)',
  },
  colorSwatchActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  rgbPicker: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  rgbPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  rgbPreviewBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  rgbPreviewText: {
    fontSize: 13,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  rgbSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});