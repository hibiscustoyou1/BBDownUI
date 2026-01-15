import api from '@/api';
import type { ApiResponse, GlobalPreference } from '@repo/shared';

export const getPreference = async () => {
  const { data } = await api.get<ApiResponse<GlobalPreference>>('/preferences');
  return data;
};

export const updatePreference = async (patch: Partial<GlobalPreference>) => {
  const { data } = await api.patch<ApiResponse<GlobalPreference>>('/preferences', patch);
  return data;
};
