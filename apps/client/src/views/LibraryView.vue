<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-light text-slate-900 dark:text-white mb-2">Library</h1>
        <p class="text-slate-500">服务器文件管理 ({{ files.length }})</p>
      </div>
      <button
        @click="fetchFiles"
        class="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        title="刷新列表"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </header>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="files.length === 0" class="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
      <p class="text-slate-500">暂无本地文件</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="file in files"
        :key="file.name"
        class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 break-all leading-snug" :title="file.name">
              {{ file.name }}
            </h3>
          </div>
        </div>

        <div class="mt-auto flex items-end justify-between">
          <div class="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
            <p>{{ formatBytes(file.size) }}</p>
            <p>{{ formatDate(file.mtime) }}</p>
          </div>

          <button
            @click="handleDelete(file)"
            class="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded transition-colors"
            title="永久删除"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { getLibraryFiles, deleteLibraryFile } from '@/api/modules/file';
  import type { FileInfo } from '@repo/shared';
  import { formatBytes } from '@/utils/format';
  import { format } from 'date-fns';

  const files = ref<FileInfo[]>([]);
  const loading = ref(true);

  const fetchFiles = async () => {
    loading.value = true;
    try {
      const res = await getLibraryFiles();
      if (res.code === 200 && res.data) {
        files.value = res.data;
      }
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`警告：此操作不可恢复！\n\n确定要删除服务器上的文件吗？\n${file.name}`)) return;

    try {
      const res = await deleteLibraryFile(file.name);
      if (res.code === 200) {
        files.value = files.value.filter(f => f.name !== file.name);
      } else {
        alert(res.msg);
      }
    } catch (e) {
      alert('请求失败');
    }
  };

  const formatDate = (ms: number) => format(new Date(ms), 'yyyy-MM-dd HH:mm');

  onMounted(fetchFiles);
</script>
