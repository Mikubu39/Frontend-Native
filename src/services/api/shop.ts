import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  ShopGroupedResponse,
  ShopBuyResponse,
  InventoryItemDto,
  ShopConsumeResponse,
} from "@/types/api";

export const shopApi = {
  getShopItems: async (): Promise<ShopGroupedResponse> => {
    return apiClient.get<ShopGroupedResponse>(API_ENDPOINTS.SHOP.GET_ALL);
  },

  buyItem: async (itemId: number | string): Promise<ShopBuyResponse> => {
    return apiClient.post<ShopBuyResponse>(API_ENDPOINTS.SHOP.BUY(itemId));
  },

  getInventory: async (): Promise<InventoryItemDto[]> => {
    return apiClient.get<InventoryItemDto[]>(API_ENDPOINTS.SHOP.INVENTORY);
  },

  consumeItem: async (
    inventoryId: number | string,
  ): Promise<ShopConsumeResponse> => {
    return apiClient.post<ShopConsumeResponse>(
      API_ENDPOINTS.SHOP.CONSUME(inventoryId),
    );
  },
};
