import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getProfile } from '@/api/modules/bilibili'; // 假设之前的 B站 profile 在这里
import { checkInitStatus, loginSystem, setupSystem } from '@/api/modules/auth';
import type { UserProfile } from '@repo/shared';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
  // --- Bilibili Auth State ---
  const profile = ref<UserProfile>({
    isLogin: false,
  });
  
  // --- System Auth State ---
  const token = ref<string>(localStorage.getItem('system_token') || '');
  const isSystemInitialized = ref<boolean>(true); // 默认为 true，加载后更新
  
  // --- Actions ---
  
  // 1. System Auth
  const checkSystemInit = async () => {
    try {
      const res = await checkInitStatus();
      if (res.code === 200 && res.data) {
        isSystemInitialized.value = res.data.initialized;
      }
    } catch (e) {
      console.error('Failed to check system init status', e);
    }
  };
  
  const login = async (password: string) => {
    try {
      const res = await loginSystem(password);
      if (res.code === 200 && res.data?.token) {
        token.value = res.data.token;
        localStorage.setItem('system_token', res.data.token);
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };
  
  const setup = async (password: string) => {
    const res = await setupSystem(password);
    if (res.code === 200) {
      // Setup success, automatically login? Or ask user to login.
      // Usually setup doesn't return token immediately in this design, so let's just return success
      // and let user login.
      isSystemInitialized.value = true;
      return true;
    }
    return false;
  };
  
  const logout = () => {
    token.value = '';
    localStorage.removeItem('system_token');
    router.push('/login');
  };
  
  // 2. Bilibili Auth
  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.code === 200 && res.data) {
        profile.value = res.data;
      } else {
        profile.value = { isLogin: false };
      }
    } catch (e) {
      profile.value = { isLogin: false };
    }
  };
  
  return {
    profile,
    token,
    isSystemInitialized,
    checkSystemInit,
    login,
    setup,
    logout,
    fetchProfile,
  };
});
