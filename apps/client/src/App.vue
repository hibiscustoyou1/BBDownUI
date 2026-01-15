<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
    <Sidebar v-if="!route.meta.hideLayout" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 overflow-y-auto p-0 scroll-smooth" :class="{ 'p-4 md:p-8': !route.meta.hideLayout }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <template v-if="!route.meta.hideLayout">
      <DownloadModal
        :is-open="isDownloadModalOpen"
        @close="isDownloadModalOpen = false"
      />
      <SmartResolveModal
        :is-open="isSmartModalOpen"
        :bvid="selectedBvid"
        @close="isSmartModalOpen = false"
        @success="handleTaskSuccess"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import Sidebar from './components/Sidebar.vue'; // Assuming this exists based on context
  import DownloadModal from './components/DownloadModal.vue';
  import SmartResolveModal from './components/SmartResolveModal.vue';
  import { ref, provide } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  // Global Modal State (Simple Event Bus alternative)
  const isDownloadModalOpen = ref(false);
  const isSmartModalOpen = ref(false);
  const selectedBvid = ref('');

  // Provide open methods to children
  const openDownloadModal = () => { isDownloadModalOpen.value = true; };
  const openSmartModal = (bvid: string) => {
    selectedBvid.value = bvid;
    isSmartModalOpen.value = true;
  };

  provide('openDownloadModal', openDownloadModal);
  provide('openSmartModal', openSmartModal);

  const handleTaskSuccess = () => {
    // refresh tasks or notify
  };
</script>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
