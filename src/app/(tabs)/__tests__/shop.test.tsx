import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ShopScreen from "../shop";
import { shopApi } from "@/services/api/shop";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import type { InventoryItemDto, ShopItemDto } from "@/types/api";

jest.mock("@/services/api/shop", () => ({
  shopApi: {
    getShopItems: jest.fn(),
    getInventory: jest.fn(),
    buyItem: jest.fn(),
    consumeItem: jest.fn(),
  },
}));

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/contexts/toast-context", () => ({
  useToast: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

const mockedApi = shopApi as jest.Mocked<typeof shopApi>;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const showSuccess = jest.fn();
const showError = jest.fn();
const setGamificationState = jest.fn();
const fetchGamificationData = jest.fn().mockResolvedValue(undefined);

const item = (
  overrides: Partial<ShopItemDto> & { id: number },
): ShopItemDto => ({
  name: "Item",
  description: "Mô tả",
  itemType: "CONSUMABLE",
  effectType: "STREAK_FREEZE",
  effectValue: 1,
  priceCoins: 100,
  priceGems: 0,
  iconUrl: "/icons/placeholder.png",
  sortOrder: 1,
  limitedTime: false,
  availableFrom: null,
  availableUntil: null,
  ...overrides,
});

const STREAK_FREEZE = item({
  id: 1,
  name: "Streak Freeze",
  description: "Bảo vệ chuỗi ngày học khi bạn nghỉ 1 ngày",
  priceCoins: 200,
});

const ENERGY_REFILL = item({
  id: 2,
  name: "Energy Refill",
  description: "Hồi đầy năng lượng ngay lập tức",
  effectType: "ENERGY_REFILL",
  effectValue: 25,
  priceCoins: 400,
});

const DOUBLE_XP = item({
  id: 3,
  name: "Double XP Boost",
  description: "Nhận gấp đôi EXP trong 30 phút",
  itemType: "POWERUP",
  effectType: "DOUBLE_XP",
  effectValue: 30,
  priceCoins: 150,
});

const OWNED_FREEZE: InventoryItemDto = {
  inventoryId: 11,
  itemId: 1,
  name: "Streak Freeze",
  itemType: "CONSUMABLE",
  effectType: "STREAK_FREEZE",
  quantity: 2,
  active: true,
  expiresAt: null,
  acquiredAt: "2026-08-01T00:00:00",
};

function renderShop() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ShopScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();

  mockedUseGamification.mockReturnValue({
    coins: 300,
    activeEffects: [],
    setGamificationState,
    fetchGamificationData,
  });
  mockedUseToast.mockReturnValue({ showSuccess, showError });
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      text: "#1A1A2E",
      textSecondary: "#6B7280",
      background: "#FFF8E7",
      backgroundElement: "#FFF3D0",
      backgroundSelected: "#FFE082",
      card: "#FFFFFF",
      cardElevated: "#FFFFFF",
      border: "#E5E7EB",
      borderSubtle: "#F3F4F6",
      tabBarBg: "#FFFFFF",
      tabBarBorder: "rgba(255,255,255,0.8)",
    },
  });

  mockedApi.getShopItems.mockResolvedValue({
    CONSUMABLE: [STREAK_FREEZE, ENERGY_REFILL],
    POWERUP: [DOUBLE_XP],
  });
  mockedApi.getInventory.mockResolvedValue([OWNED_FREEZE]);
});

describe("ShopScreen", () => {
  it("stocks the shelves and spotlights the rarest item on the counter", async () => {
    const { getByText, getAllByText } = await renderShop();

    await waitFor(() => expect(getByText("Streak Freeze")).toBeTruthy());

    // Purse and the default shelf.
    expect(getByText("300")).toBeTruthy();
    expect(getAllByText("Energy Refill").length).toBeGreaterThan(0);
    // Energy refill (400 xu) is the featured item as it is the most expensive.
    expect(getByText("Hàng nổi bật")).toBeTruthy();
    // Rarity is derived from price: 200 xu is "Hiếm", 400 xu is "Sử thi".
    expect(getByText("Hiếm")).toBeTruthy();
    expect(getByText("Sử thi")).toBeTruthy();
  });

  it("buys an affordable item from the purchase sheet", async () => {
    mockedApi.buyItem.mockResolvedValue({
      inventoryId: 11,
      itemName: "Streak Freeze",
      effectType: "STREAK_FREEZE",
      coinsSpent: 200,
      currentCoins: 100,
      message: "Mua thành công: Streak Freeze",
    });

    const { getByText } = await renderShop();
    await waitFor(() => expect(getByText("Streak Freeze")).toBeTruthy());

    fireEvent.press(getByText("Streak Freeze"));

    await waitFor(() => expect(getByText("Giữ chuỗi")).toBeTruthy());
    fireEvent.press(getByText("Mua"));

    await waitFor(() => expect(mockedApi.buyItem).toHaveBeenCalledWith(1));
    expect(setGamificationState).toHaveBeenCalledWith({ coins: 100 });
    expect(showSuccess).toHaveBeenCalledWith(
      "Đã mua Streak Freeze",
      "Mua thành công: Streak Freeze",
    );
  });

  it("points at how to earn the gap when the purse is short", async () => {
    const { getByText, queryByText, getAllByText } = await renderShop();
    await waitFor(() =>
      expect(getAllByText("Energy Refill").length).toBeGreaterThan(0),
    );

    fireEvent.press(
      getAllByText("Energy Refill")[1] || getAllByText("Energy Refill")[0],
    );

    // 400 xu wanted, 300 held.
    await waitFor(() => expect(getByText("Kiếm thêm 100 xu")).toBeTruthy());
    fireEvent.press(getByText("Kiếm thêm 100 xu"));

    await waitFor(() => expect(getByText("Chưa đủ xu")).toBeTruthy());
    expect(mockedApi.buyItem).not.toHaveBeenCalled();

    fireEvent.press(getByText("Học một bài"));
    expect(mockPush).toHaveBeenCalledWith("/(tabs)");
    await waitFor(() => expect(queryByText("Chưa đủ xu")).toBeNull());
  });

  it("uses an item straight from the bag", async () => {
    mockedApi.consumeItem.mockResolvedValue({
      itemName: "Streak Freeze",
      effectType: "STREAK_FREEZE",
      effectDescription: "Đã kích hoạt Streak Freeze.",
      currentCoins: 300,
      currentEnergy: 25,
      streakFreezeCount: 1,
      message: "Sử dụng thành công: Streak Freeze",
    });

    const { getByText, queryByText, getAllByText } = await renderShop();
    await waitFor(() => expect(getByText("Streak Freeze")).toBeTruthy());

    fireEvent.press(getByText("Túi đồ"));

    // The owned item is on this shelf, but Energy Refill is still on the counter.
    await waitFor(() => expect(getAllByText("Energy Refill").length).toBe(1)); // only 1 on counter
    expect(getByText("×2")).toBeTruthy();

    fireEvent.press(getByText("Streak Freeze"));
    await waitFor(() => expect(getByText("Dùng ngay")).toBeTruthy());
    fireEvent.press(getByText("Dùng ngay"));

    await waitFor(() => expect(mockedApi.consumeItem).toHaveBeenCalledWith(11));
    expect(fetchGamificationData).toHaveBeenCalled();
  });
});
