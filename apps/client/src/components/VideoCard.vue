<template>
  <div
    class="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col"
  >
    <div class="aspect-video w-full overflow-hidden relative bg-slate-200">
      <img
        :src="video.pic"
        :alt="video.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
        {{ video.duration }}
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1">
      <h3
        class="font-medium text-sm line-clamp-2 mb-2 text-slate-800 dark:text-slate-200 leading-snug"
        :title="video.title"
      >
        {{ video.title }}
      </h3>

      <div class="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span class="flex items-center gap-1">
          <span class="i-carbon-user"></span> {{ video.author }}
        </span>
        <span>{{ formatPubDate(video.pubdate) }}</span>
      </div>

      <button
        @click="$emit('download', video)"
        class="mt-3 w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        下载视频
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { BiliVideoSnippet } from '@repo/shared';
  import { format } from 'date-fns';

  defineProps<{
    video: BiliVideoSnippet
  }>();

  defineEmits<{
    (e: 'download', video: BiliVideoSnippet): void
  }>();

  const formatPubDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'yyyy-MM-dd');
  };
</script>
