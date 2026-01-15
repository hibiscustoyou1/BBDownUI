import api from '@/api';
import type { ApiResponse, BiliVideoSnippet, SearchParams, VideoPlayInfo } from '@repo/shared';

export const searchVideos = async (params: SearchParams) => {
  const { data } = await api.get<ApiResponse<BiliVideoSnippet[]>>('/bilibili/search', { params });
  return data;
};

// 新增解析方法
export const resolveVideo = async (bvid: string) => {
  const { data } = await api.get<ApiResponse<VideoPlayInfo>>(`/bilibili/resolve/${bvid}`);
  return data;
};
