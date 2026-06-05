import { apiClient } from "./client";
import {
  normalizeMenuItem,
  normalizeMenuSection,
  unwrapList,
} from "./normalizers";

export interface MenuQuery {
  page?: number;
  limit?: number;
  isAvailable?: boolean;
  isCombo?: boolean;
}

export async function getMenuSections(branchId: string) {
  const { data } = await apiClient.get(`/branches/${branchId}/menu/sections`);
  return unwrapList<any>(data).map(normalizeMenuSection);
}

export async function getMenuItems(
  branchId: string,
  sectionId?: string,
  params: MenuQuery = {},
) {
  if (sectionId) {
    const { data } = await apiClient.get(
      `/branches/${branchId}/menu/sections/${sectionId}/items`,
      {
        params: { ...params },
      },
    );
    return unwrapList<any>(data).map(normalizeMenuItem);
  }

  try {
    const { data } = await apiClient.get(`/branches/${branchId}/menu/items`, {
      params,
    });
    return unwrapList<any>(data).map(normalizeMenuItem);
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status !== 404) {
      throw error;
    }

    const sections = await getMenuSections(branchId);
    const items = await Promise.all(
      sections.map(async (section) => {
        const { data } = await apiClient.get(
          `/branches/${branchId}/menu/sections/${section.id}/items`,
          {
            params,
          },
        );
        return unwrapList<any>(data).map(normalizeMenuItem);
      }),
    );

    return items.flat();
  }
}

export async function createMenuSection(
  branchId: string,
  payload: { name: string; displayOrder?: number; isActive?: boolean },
) {
  const { data } = await apiClient.post(
    `/branches/${branchId}/menu/sections`,
    payload,
  );
  return data;
}

export async function updateMenuSection(
  branchId: string,
  sectionId: string,
  payload: { name?: string; displayOrder?: number; isActive?: boolean },
) {
  const { data } = await apiClient.patch(
    `/branches/${branchId}/menu/sections/${sectionId}`,
    payload,
  );
  return data;
}

export async function deleteMenuSection(branchId: string, sectionId: string) {
  const { data } = await apiClient.delete(
    `/branches/${branchId}/menu/sections/${sectionId}`,
  );
  return data;
}

export async function createMenuItem(
  branchId: string,
  payload: {
    name: string;
    description?: string;
    basePrice: number;
    sectionId: string;
    allergens?: string[];
    imageUrl?: string;
    isAvailable?: boolean;
  },
) {
  const { data } = await apiClient.post(
    `/branches/${branchId}/menu/items`,
    payload,
  );
  return normalizeMenuItem(data);
}

export async function updateMenuItem(
  branchId: string,
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch(
    `/branches/${branchId}/menu/items/${id}`,
    payload,
  );
  return normalizeMenuItem(data);
}

export async function deleteMenuItem(branchId: string, id: string) {
  const { data } = await apiClient.delete(
    `/branches/${branchId}/menu/items/${id}`,
  );
  return data;
}

export async function createCombo(
  branchId: string,
  payload: {
    name: string;
    description?: string;
    basePrice: number;
    sectionId: string;
    imageUrl?: string;
    allergens?: string[];
    isAvailable?: boolean;
    comboItemIds: string[];
  },
) {
  const { data } = await apiClient.post(
    `/branches/${branchId}/menu/items/combo`,
    payload,
  );
  return normalizeMenuItem(data);
}
