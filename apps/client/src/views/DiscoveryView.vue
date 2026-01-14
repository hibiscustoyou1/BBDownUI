<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-light text-slate-900 mb-2">Discover</h1>
      <div class="relative group">
        <input v-model="keyword" @keyup.enter="handleSearch" type="text" placeholder="输入视频标题、BV号、URL..."
               class="w-full px-4 py-4 bg-white border-2 border-transparent focus:border-indigo-500 shadow-xl shadow-indigo-100 rounded-2xl outline-none transition-all text-lg">
        <button v-if="keyword" @click="handleSearch" class="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">搜索</button>
      </div>
    </header>
    <section>
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-4 gap-6"><div v-for="i in 8" :key="i" class="bg-white rounded-xl h-64 animate-pulse"></div></div>
      <div v-else-if="results.length" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <VideoCard v-for="v in results" :key="v.bvid" :video="v" @download="openModal" />
      </div>
    </section>
    <DownloadModal :is-open="isModalOpen" :video="selectedVideo" :loading="submitting" @close="isModalOpen = false" @submit="handleDownload" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { searchVideos } from '@/api/modules/bili';
  import { addTask } from '@/api/modules/task';
  import type { BiliVideoSnippet, DownloadOptions } from '@repo/shared';
  import VideoCard from '@/components/VideoCard.vue';
  import DownloadModal from '@/components/DownloadModal.vue';

  const keyword = ref('');
  const results = ref<BiliVideoSnippet[]>([]);
  const loading = ref(false);
  const isModalOpen = ref(false);
  const selectedVideo = ref<BiliVideoSnippet | null>(null);
  const submitting = ref(false);

  const handleSearch = async () => {
    if (!keyword.value.trim()) return;
    loading.value = true;
    try {
      const res = await searchVideos({ keyword: keyword.value });
      if (res.code === 200 && res.data) results.value = res.data;
    } finally { loading.value = false; }
  };

  const openModal = (v: BiliVideoSnippet) => { selectedVideo.value = v; isModalOpen.value = true; };

  const handleDownload = async (opt: DownloadOptions) => {
    submitting.value = true;
    try {
      const res = await addTask(opt);
      if (res.code === 200) { alert('任务已添加'); isModalOpen.value = false; }
      else alert(res.msg);
    } finally { submitting.value = false; }
  };
</script>
