<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <header>
      <h1 class="text-3xl font-light text-slate-900 dark:text-white mb-2">Settings</h1>
      <p class="text-slate-500">管理账号与全局下载偏好</p>
    </header>

    <div class="flex border-b border-slate-200 dark:border-slate-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="currentTab = tab.id"
        class="px-6 py-3 text-sm font-medium transition-colors border-b-2"
        :class="currentTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="currentTab === 'account'" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <AccountCard />
      <SystemCard />
    </div>

    <div v-else-if="currentTab === 'preference'" class="max-w-3xl animate-fade-in space-y-8">

      <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">默认下载行为</h2>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">编码偏好</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="prefStore.config.useHevc" @change="e => update('useHevc', (e.target as HTMLInputElement).checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-slate-600 dark:text-slate-400">优先 HEVC (H.265)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="prefStore.config.useAv1" @change="e => update('useAv1', (e.target as HTMLInputElement).checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-slate-600 dark:text-slate-400">优先 AV1</span>
              </label>
            </div>
            <p class="text-xs text-slate-400 mt-1">若未选中，将默认使用 AVC (H.264) 以获得最佳兼容性。</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">默认模式</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="prefStore.config.audioOnly" @change="e => update('audioOnly', (e.target as HTMLInputElement).checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-slate-600 dark:text-slate-400">仅下载音频</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">文件名模板 (File Pattern)</label>
            <input
              :value="prefStore.config.filePattern"
              @change="e => update('filePattern', (e.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in patternTags" :key="tag.val" @click="insertTag(tag.val)" class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors">
                {{ tag.label }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">示例: &lt;videoTitle&gt; - &lt;bvid&gt;</p>
          </div>

          <div>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">启用多线程下载</span>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" :checked="prefStore.config.multiThread" @change="e => update('multiThread', (e.target as HTMLInputElement).checked)" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </label>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { usePreferenceStore } from '@/stores/preference';
  import type { GlobalPreference } from '@repo/shared';
  // 引入之前的 AccountCard 组件逻辑 (为节省篇幅，假设已拆分为组件，此处直接内联逻辑或引用)
  import AccountCard from '@/components/settings/AccountCard.vue'; // Step 5 的逻辑
  import SystemCard from '@/components/settings/SystemCard.vue';   // Step 5 的逻辑

  const userStore = useUserStore();
  const prefStore = usePreferenceStore();

  const tabs = [
    { id: 'account', label: '账号与系统' },
    { id: 'preference', label: '下载设置' }
  ];
  const currentTab = ref('account');

  const patternTags = [
    { label: '视频标题', val: '<videoTitle>' },
    { label: '发布时间', val: '<pubDate>' },
    { label: 'BV号', val: '<bvid>' },
    { label: '清晰度', val: '<dfn>' },
    { label: '分P', val: '<pageNumber>' },
  ];

  const update = (key: keyof GlobalPreference, value: any) => {
    prefStore.updateConfig({ [key]: value });
  };

  const insertTag = (tag: string) => {
    const newVal = (prefStore.config.filePattern || '') + tag;
    update('filePattern', newVal);
  };

  onMounted(() => {
    userStore.fetchProfile();
    prefStore.fetchConfig();
  });
</script>

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
