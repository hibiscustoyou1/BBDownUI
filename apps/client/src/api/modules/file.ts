import api from '@/api';
import type { ApiResponse, FileInfo } from '@repo/shared';

export const getLibraryFiles = async () => {
  const { data } = await api.get<ApiResponse<FileInfo[]>>('/files');
  return data;
};

export const deleteLibraryFile = async (fileName: string) => {
  const { data } = await api.delete<ApiResponse>(`/files/${encodeURIComponent(fileName)}`);
  return data;
};
