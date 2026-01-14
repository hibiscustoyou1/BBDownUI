import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api';
import type { ApiResponse, UserProfile } from '@repo/shared';

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({ isLogin: false });
  const loading = ref(false);
  
  const fetchProfile = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<ApiResponse<UserProfile>>('/auth/me');
      if (data.code === 200 && data.data) {
        profile.value = data.data;
      }
    } catch (e) {
      console.error(e);
      profile.value = { isLogin: false };
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    await api.post('/auth/logout');
    profile.value = { isLogin: false };
  };
  
  return {
    profile,
    loading,
    fetchProfile,
    logout
  };
});
