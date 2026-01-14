import api from '@/api';
import type { ApiResponse, DownloadOptions } from '@repo/shared';

export const addTask = async (payload: DownloadOptions) => {
  const { data } = await api.post<ApiResponse>('/tasks', payload);
  return data;
};

// 后续 Step 3 会用到
export const getRunningTasks = async () => {
  const { data } = await api.get<ApiResponse>('/tasks'); // 假设后端 /tasks 返回集合
  return data;
}
