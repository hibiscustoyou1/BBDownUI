import api from '@/api';
import type { ApiResponse } from '@repo/shared';

export const checkInitStatus = async () => {
  const { data } = await api.get<ApiResponse<{ initialized: boolean }>>('/auth/check');
  return data;
};

export const setupSystem = async (password: string) => {
  const { data } = await api.post<ApiResponse>('/auth/setup', { password });
  return data;
};

export const loginSystem = async (password: string) => {
  const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/login', { password });
  return data;
};
