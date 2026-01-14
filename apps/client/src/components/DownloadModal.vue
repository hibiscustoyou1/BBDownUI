<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
    <div class="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-fade-in-up">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">下载配置</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-500 uppercase mb-1">目标链接</label>
          <input v-model="form.Url" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none" :readonly="!!video" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.VideoOnly" class="rounded text-indigo-500"> <span class="text-sm">仅视频</span></label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.AudioOnly" class="rounded text-indigo-500"> <span class="text-sm">仅音频</span></label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.UseHevc" class="rounded text-indigo-500"> <span class="text-sm">优先 HEVC</span></label>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button type="button" @click="close" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-70">
            {{ loading ? '提交中...' : '添加任务' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { watch, reactive } from 'vue';
  import type { BiliVideoSnippet, DownloadOptions } from '@repo/shared';
  const props = defineProps<{ isOpen: boolean; video?: BiliVideoSnippet | null; loading?: boolean; }>();
  const emit = defineEmits<{ (e: 'close'): void; (e: 'submit', options: DownloadOptions): void; }>();
  const form = reactive<DownloadOptions>({ Url: '', UseHevc: true, MultiThread: true } as any);
  watch(() => props.video, (v) => { if (v) form.Url = `https://www.bilibili.com/video/${v.bvid}`; });
  const close = () => emit('close');
  const submit = () => emit('submit', { ...form });
</script>
