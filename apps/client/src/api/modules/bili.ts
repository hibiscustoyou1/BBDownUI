import api from '@/api'; // axios instance
import type { ApiResponse, BiliVideoSnippet, SearchParams } from '@repo/shared';

export const searchVideos = async (params: SearchParams) => {
  const { data } = await api.get<ApiResponse<BiliVideoSnippet[]>>('/bilibili/search', { params });
  return data;
};
