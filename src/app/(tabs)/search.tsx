/**
 * Shop Screen - Fetches real items from Backend Shop API
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { StaggeredList } from "@/components/ui/staggered-list";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { shopApi } from "@/services/api/shop";
import { ShopItemDto, InventoryItemDto, ItemType } from "@/types/api";

export default function ShopScreen() {
  const buttonPulse = useSharedValue(1);
  const { coins, setGamificationState, fetchGamificationData } =
    useGamification();
  const { showSuccess, showError } = useToast();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [shopItems, setShopItems] = useState<Record<ItemType, ShopItemDto[]>>({
    CONSUMABLE: [],
    POWERUP: [],
    COSMETIC: [],
  });
  const [inventory, setInventory] = useState<InventoryItemDto[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        shopApi.getShopItems(),
        shopApi.getInventory(),
      ]);
      // Make sure all keys exist even if backend returns empty for some
      setShopItems({
        CONSUMABLE: itemsRes.CONSUMABLE || [],
        POWERUP: itemsRes.POWERUP || [],
        COSMETIC: itemsRes.COSMETIC || [],
      });
      setInventory(invRes);
    } catch (e) {
      console.error("Failed to load shop:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    buttonPulse.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const handleBuy = async (item: ShopItemDto) => {
    setBuyingId(item.id);
    try {
      const res = await shopApi.buyItem(item.id);
      showSuccess("Mua thành công!", res.message);
      setGamificationState({ coins: res.currentCoins });
      fetchData(); // Refresh inventory
    } catch (e: any) {
      showError("Mua thất bại", e?.response?.data?.message || "Không đủ coins");
    } finally {
      setBuyingId(null);
    }
  };

  const handleConsume = async (invItem: InventoryItemDto) => {
    try {
      const res = await shopApi.consumeItem(invItem.inventoryId);
      showSuccess("Sử dụng thành công!", res.message);
      fetchGamificationData(); // Update energy/streak/coins from BE globally
      fetchData(); // Refresh inventory
    } catch (e: any) {
      showError("Lỗi", e?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEquip = async (invItem: InventoryItemDto) => {
    try {
      await shopApi.equipItem(invItem.inventoryId);
      showSuccess(
        "Thành công",
        `Đã ${invItem.equipped ? "tháo" : "trang bị"} ${invItem.name}`,
      );
      fetchData(); // Refresh inventory
    } catch (e: any) {
      showError("Lỗi", e?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getInventoryItem = (itemId: number) => {
    return inventory.find((i) => i.itemId === itemId);
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));

  const renderSection = (title: string, items: ShopItemDto[]) => {
    if (items.length === 0) return null;

    return (
      <View style={{ marginBottom: Spacing.six }}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(250)}
          style={[styles.sectionTitle, { color: colors.text }]}
        >
          {title}
        </Animated.Text>
        <StaggeredList staggerDelay={80} initialDelay={300}>
          {items.map((item) => {
            const inv = getInventoryItem(item.id);
            const isBuying = buyingId === item.id;
            const canBuy = coins >= item.priceCoins;

            return (
              <AnimatedPressable
                key={item.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => {}}
                pressScale={0.98}
              >
                <View
                  style={[
                    styles.itemIconContainer,
                    { backgroundColor: isDark ? "#232338" : Colors.cream },
                  ]}
                >
                  {item.iconUrl ? (
                    <Text style={styles.itemIcon}>🎁</Text> // Fallback emoji if no valid image, could use Image here
                  ) : (
                    <Text style={styles.itemIcon}>✨</Text>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.itemDesc, { color: colors.textSecondary }]}
                  >
                    {item.description}
                  </Text>
                  {inv && (
                    <Text style={styles.inventoryText}>
                      Trong túi: {inv.quantity}{" "}
                      {inv.equipped ? "(Đang dùng)" : ""}
                    </Text>
                  )}
                </View>

                <View style={{ gap: Spacing.two, alignItems: "flex-end" }}>
                  {/* Buy Button */}
                  <AnimatedPressable
                    style={styles.buyButton}
                    onPress={() => handleBuy(item)}
                    pressScale={0.93}
                    disabled={isBuying || !canBuy}
                  >
                    <View style={styles.buyButtonShadow} />
                    <View
                      style={[
                        styles.buyButtonContent,
                        !canBuy && { backgroundColor: colors.textSecondary },
                      ]}
                    >
                      <Text style={styles.buyButtonText}>
                        {isBuying ? "..." : `${item.priceCoins} 🪙`}
                      </Text>
                    </View>
                  </AnimatedPressable>

                  {/* Consume / Equip Button if in inventory */}
                  {inv && inv.quantity > 0 && item.itemType !== "COSMETIC" && (
                    <AnimatedPressable
                      style={styles.actionButton}
                      onPress={() => handleConsume(inv)}
                    >
                      <Text style={styles.actionButtonText}>Dùng</Text>
                    </AnimatedPressable>
                  )}
                  {inv && inv.quantity > 0 && item.itemType === "COSMETIC" && (
                    <AnimatedPressable
                      style={[
                        styles.actionButton,
                        inv.equipped && { backgroundColor: Colors.success },
                      ]}
                      onPress={() => handleEquip(inv)}
                    >
                      <Text style={styles.actionButtonText}>
                        {inv.equipped ? "Tháo" : "Mặc"}
                      </Text>
                    </AnimatedPressable>
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </StaggeredList>
      </View>
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Cửa hàng
          </Text>
          <View style={styles.gemCounter}>
            <Text style={styles.gemEmoji}>🪙</Text>
            <Text style={styles.gemText}>{coins}</Text>
          </View>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Super Banner */}
            <Animated.View entering={FadeIn.duration(300)}>
              <LinearGradient
                colors={[Colors.primary, "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.superBanner}
              >
                <View style={styles.superHeader}>
                  <Text style={styles.superIcon}>🦉⚡</Text>
                  <View style={styles.superContent}>
                    <Text style={styles.superTitle}>Super Kotodama</Text>
                    <Text style={styles.superDesc}>
                      Học không quảng cáo, vô hạn Tim và tính năng độc quyền!
                    </Text>
                  </View>
                </View>
                <Animated.View style={buttonStyle}>
                  <AnimatedPressable
                    style={styles.superButton}
                    onPress={() => {}}
                    pressScale={0.97}
                  >
                    <Text style={styles.superButtonText}>
                      DÙNG THỬ 2 TUẦN MIỄN PHÍ
                    </Text>
                  </AnimatedPressable>
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {renderSection(
              "Vật phẩm Hỗ trợ (Consumables)",
              shopItems.CONSUMABLE,
            )}
            {renderSection("Bùa Lợi (Power-ups)", shopItems.POWERUP)}
            {renderSection("Trang Trí (Cosmetics)", shopItems.COSMETIC)}
          </ScrollView>
        )}
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  gemCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: 6,
    ...Shadows.sm,
  },
  gemEmoji: {
    fontSize: 18,
  },
  gemText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  superBanner: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    flexDirection: "column",
    gap: Spacing.four,
    marginBottom: Spacing.six,
    ...Shadows.lg,
  },
  superHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  superIcon: {
    fontSize: 52,
  },
  superContent: {
    flex: 1,
  },
  superTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
  },
  superDesc: {
    fontSize: FontSizes.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    lineHeight: 20,
  },
  superButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.four,
    alignItems: "center",
    width: "100%",
    ...Shadows.sm,
  },
  superButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  itemIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIcon: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  inventoryText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: "bold",
  },
  buyButton: {
    width: 80,
    height: 36,
    position: "relative",
  },
  buyButtonShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 3,
    bottom: -3,
    backgroundColor: "#CC9300",
    borderRadius: BorderRadius.md,
  },
  buyButtonContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.xs,
    fontWeight: "bold",
  },
});
