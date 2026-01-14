<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="statusColorClass"
        >
          <svg v-if="isRunning" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <svg v-else-if="task.IsSuccessful" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div class="min-w-0">
          <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" :title="task.Title || task.Url">
            {{ task.Title || '获取信息中...' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ task.Aid }}</p>
        </div>
      </div>

      <button
        v-if="!isRunning"
        @click="$emit('delete', task.Aid)"
        class="text-slate-400 hover:text-red-500 transition-colors p-1"
        title="移除记录"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <div v-if="isRunning" class="space-y-2">
      <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{{ formatPercent(task.Progress) }}</span>
        <span>{{ formatSpeed(task.DownloadSpeed) }}</span>
      </div>
      <div class="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-all duration-500 ease-out"
          :style="{ width: `${task.Progress * 100}%` }"
        ></div>
      </div>
    </div>

    <div v-else class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
      <span v-if="task.IsSuccessful" class="text-emerald-600 dark:text-emerald-400">下载成功</span>
      <span v-else class="text-red-600 dark:text-red-400">下载失败</span>
      <span>{{ formatBytes(task.TotalDownloadedBytes) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { DownloadTask } from '@repo/shared';
  import { formatBytes, formatSpeed, formatPercent } from '@/utils/format';

  const props = defineProps<{
    task: DownloadTask;
    isRunning?: boolean;
  }>();

  defineEmits<{
    (e: 'delete', aid: string): void
  }>();

  const statusColorClass = computed(() => {
    if (props.isRunning) return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    if (props.task.IsSuccessful) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
  });
</script>
