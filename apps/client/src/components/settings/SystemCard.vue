<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
      <span class="w-1 h-5 bg-emerald-500 rounded-full"></span>
      系统信息
    </h3>

    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <div>
            <div class="text-sm font-medium text-slate-800 dark:text-white">BBDown Core</div>
            <div class="text-xs text-slate-500">下载引擎版本</div>
          </div>
        </div>
        <div class="text-sm font-mono font-bold" :class="versionClass">
          {{ versionText }}
        </div>
      </div>

      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <div class="text-sm font-medium text-slate-800 dark:text-white">BBDown UI</div>
            <div class="text-xs text-slate-500">Web 界面版本</div>
          </div>
        </div>
        <div class="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
          v0.7.0
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { getBBDownVersion } from '@/api/modules/task';

  const bbdownVersion = ref<string>('');
  const loading = ref(true);

  const versionText = computed(() => {
    if (loading.value) return '检测中...';
    if (!bbdownVersion.value || bbdownVersion.value === 'Unknown') return '未检测到';
    return bbdownVersion.value;
  });

  const versionClass = computed(() => {
    if (loading.value) return 'text-slate-400';
    if (!bbdownVersion.value || bbdownVersion.value === 'Unknown') return 'text-red-500';
    return 'text-emerald-600 dark:text-emerald-400';
  });

  onMounted(async () => {
    try {
      const res = await getBBDownVersion();
      if (res.code === 200 && res.data) {
        bbdownVersion.value = res.data;
      } else {
        bbdownVersion.value = 'Unknown';
      }
    } catch (e) {
      bbdownVersion.value = 'Unknown';
    } finally {
      loading.value = false;
    }
  });
</script>
