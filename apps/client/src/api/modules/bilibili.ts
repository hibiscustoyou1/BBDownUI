import api from '@/api';
import type { ApiResponse, BiliVideoSnippet, SearchParams, VideoPlayInfo, UserProfile } from '@repo/shared';

export const searchVideos = async (params: SearchParams) => {
  const { data } = await api.get<ApiResponse<BiliVideoSnippet[]>>('/bilibili/search', { params });
  return data;
};

export const resolveVideo = async (bvid: string) => {
  const { data } = await api.get<ApiResponse<VideoPlayInfo>>(`/bilibili/resolve/${bvid}`);
  return data;
};

// [新增] 获取用户资料/登录状态
export const getProfile = async () => {
  const { data } = await api.get<ApiResponse<UserProfile>>('/auth/profile');
  return data;
};
