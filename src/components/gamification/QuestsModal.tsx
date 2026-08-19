import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useGamification } from "@/contexts/gamification-context";
import { Ionicons } from "@expo/vector-icons";
import { ModalCard } from "@/components/ui/modal-card";

interface QuestsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function QuestsModal({ visible, onClose }: QuestsModalProps) {
  const { quests, chestStatus, openChest } = useGamification();
  const [openingChest, setOpeningChest] = useState(false);
  const [chestError, setChestError] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<number | null>(null);

  if (!visible) return null;

  const handleOpenChest = async () => {
    setOpeningChest(true);
    setChestError(null);
    try {
      await openChest();
      // On success, we know coins are added. The actual amount isn't returned directly by context unless we capture it,
      // but wait, openChest in context doesn't return the amount to us easily (it just updates state).
      // We can just show a success message.
      setChestReward(1); // placeholder to show success
    } catch (e: any) {
      setChestError(e?.response?.data?.message || "Không thể mở rương");
    } finally {
      setOpeningChest(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Nhiệm vụ hàng ngày</Text>
            <AnimatedPressable onPress={onClose} pressScale={0.9}>
              <Ionicons name="close" size={28} color={Colors.textSecondary} />
            </AnimatedPressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: Spacing.six }}
          >
            {quests.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có nhiệm vụ nào</Text>
            ) : (
              quests.map((q) => (
                <View key={q.questId} style={styles.questCard}>
                  <Text style={styles.questIcon}>
                    {q.questType === "COMPLETE_LESSONS"
                      ? "📚"
                      : q.questType === "CORRECT_ANSWERS"
                        ? "✅"
                        : "🌟"}
                  </Text>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{q.title}</Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(100, (q.currentProgress / q.targetValue) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {q.currentProgress} / {q.targetValue}
                    </Text>
                  </View>
                  {q.completed && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.success}
                    />
                  )}
                </View>
              ))
            )}

            <View style={styles.chestSection}>
              <Text style={styles.chestTitle}>Rương Thưởng</Text>

              {chestReward ? (
                <View style={styles.chestRewardBox}>
                  <Text style={{ fontSize: 40 }}>🎉</Text>
                  <Text style={styles.rewardText}>Bạn đã nhận được Xu!</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.chestIcon}>
                    {chestStatus?.alreadyOpenedToday
                      ? "📦"
                      : chestStatus?.available
                        ? "🎁"
                        : "🔒"}
                  </Text>
                  <Text style={styles.chestStatusText}>
                    {chestStatus?.alreadyOpenedToday
                      ? "Bạn đã mở rương hôm nay. Trở lại vào ngày mai!"
                      : `${chestStatus?.questsCompleted || 0} / ${chestStatus?.questsRequired || 3} nhiệm vụ`}
                  </Text>

                  {chestError && (
                    <Text style={styles.errorText}>{chestError}</Text>
                  )}

                  <GradientButton
                    title={openingChest ? "ĐANG MỞ..." : "MỞ RƯƠNG"}
                    disabled={
                      !chestStatus?.available ||
                      chestStatus?.alreadyOpenedToday ||
                      openingChest
                    }
                    onPress={handleOpenChest}
                    style={{ marginTop: Spacing.three, width: "100%" }}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    minHeight: "70%",
    padding: Spacing.five,
    ...Shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginVertical: Spacing.six,
  },
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  questIcon: {
    fontSize: 32,
    marginRight: Spacing.three,
  },
  questInfo: {
    flex: 1,
    marginRight: Spacing.three,
  },
  questTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.two,
  },
  progressContainer: {
    height: 8,
    backgroundColor: Colors.lockedBg,
    borderRadius: 4,
    marginBottom: Spacing.one,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.secondary,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  chestSection: {
    alignItems: "center",
    marginTop: Spacing.six,
    padding: Spacing.four,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.sm,
  },
  chestTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.accent,
    marginBottom: Spacing.two,
  },
  chestIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  chestStatusText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    textAlign: "center",
  },
  chestRewardBox: {
    alignItems: "center",
    padding: Spacing.four,
  },
  rewardText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.success,
    marginTop: Spacing.two,
  },
});
