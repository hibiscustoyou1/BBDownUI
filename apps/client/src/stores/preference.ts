import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPreference, updatePreference } from '@/api/modules/preference';
import type { GlobalPreference } from '@repo/shared';

export const usePreferenceStore = defineStore('preference', () => {
  // 默认值兜底
  const config = ref<GlobalPreference>({
    filePattern: '<videoTitle>',
    multiThread: true,
    useHevc: true,
    deleteAfterSuccess: false
  });
  
  const loading = ref(false);
  
  const fetchConfig = async () => {
    loading.value = true;
    try {
      const res = await getPreference();
      if (res.code === 200 && res.data) {
        config.value = res.data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  
  const updateConfig = async (patch: Partial<GlobalPreference>) => {
    try {
      const res = await updatePreference(patch);
      if (res.code === 200 && res.data) {
        config.value = res.data;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  
  return {
    config,
    loading,
    fetchConfig,
    updateConfig
  };
});
