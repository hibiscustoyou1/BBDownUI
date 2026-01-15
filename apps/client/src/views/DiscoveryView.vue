<template>
  <div class="max-w-7xl mx-auto space-y-8">

    <header class="max-w-2xl">
      <h1 class="text-3xl font-light text-slate-900 dark:text-white mb-2">Discover</h1>
      <p class="text-slate-500 mb-6">搜索 Bilibili 视频或粘贴链接直接下载</p>

      <div class="relative group">
        <input
          v-model="keyword"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="输入视频标题、BV号、URL..."
          class="w-full pl-12 pr-24 py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none rounded-2xl outline-none transition-all text-lg placeholder:text-slate-400"
        >
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          @click="handleSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95"
        >
          搜索
        </button>
      </div>
    </header>

    <section>
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white dark:bg-slate-800 rounded-xl p-4 h-64 animate-pulse"></div>
      </div>

      <div v-else-if="results.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <VideoCard
          v-for="video in results"
          :key="video.bvid"
          :video="video"
          @download="openSmartModal"
        />
      </div>

      <div v-else-if="!loading && keyword" class="text-center py-20 text-slate-400">
        未找到相关内容
      </div>
    </section>

    <SmartResolveModal
      :is-open="isModalOpen"
      :bvid="selectedBvid"
      @close="isModalOpen = false"
      @success="handleTaskAdded"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { searchVideos } from '@/api/modules/bilibili';
  import type { BiliVideoSnippet } from '@repo/shared';
  import VideoCard from '@/components/VideoCard.vue';
  import SmartResolveModal from '@/components/SmartResolveModal.vue';

  const keyword = ref('');
  const results = ref<BiliVideoSnippet[]>([]);
  const loading = ref(false);

  const isModalOpen = ref(false);
  const selectedBvid = ref('');

  const handleSearch = async () => {
    if (!keyword.value.trim()) return;

    // 1. 直达逻辑：检测是否为 BV 号或 URL
    const bvMatch = keyword.value.match(/(BV[a-zA-Z0-9]+)/);
    if (bvMatch) {
      selectedBvid.value = bvMatch[1];
      isModalOpen.value = true;
      return;
    }

    const urlMatch = keyword.value.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (urlMatch) {
      selectedBvid.value = urlMatch[1];
      isModalOpen.value = true;
      return;
    }

    // 2. 常规搜索
    loading.value = true;
    results.value = [];

    try {
      const res = await searchVideos({ keyword: keyword.value, page: 1 });
      if (res.code === 200 && res.data) {
        results.value = res.data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const openSmartModal = (video: BiliVideoSnippet) => {
    selectedBvid.value = video.bvid;
    isModalOpen.value = true;
  };

  const handleTaskAdded = () => {
    // 可选：显示全局 Toast
  };
</script>
