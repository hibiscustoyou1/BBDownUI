import api from '@/api';
import type { ApiResponse, DownloadTaskCollection, DownloadOptions } from '@repo/shared';

// 获取所有任务 (Running + Finished)
export const getAllTasks = async () => {
  const { data } = await api.get<ApiResponse<DownloadTaskCollection>>('/tasks');
  return data;
};

export const addTask = async (payload: DownloadOptions) => {
  const { data } = await api.post<ApiResponse>('/tasks', payload);
  return data;
};

// 删除指定任务
export const removeTask = async (aid: string) => {
  const { data } = await api.delete<ApiResponse>(`/tasks/${aid}`);
  return data;
};

// (可选) 清空所有已完成任务 - 需后端支持，Step 1 已在 Service 实现但在 Controller 未暴露，暂且留空或只单独删除
