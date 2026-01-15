<template>
  <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full transition-colors duration-300">

    <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700/50">
      <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
        <span class="i-carbon-download text-2xl"></span>
        BBDown UI
      </div>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group"
        :class="$route.path === item.path
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'"
      >
        <component :is="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-slate-100 dark:border-slate-700/50 space-y-2">
      <router-link
        to="/settings"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
      >
        <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <span class="i-carbon-settings"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">设置</p>
          <p class="text-xs text-slate-400 truncate">管理账号与偏好</p>
        </div>
      </router-link>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group text-left"
      >
        <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </div>
        <span class="text-sm font-medium">退出系统</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { h } from 'vue';
  import { useUserStore } from '@/stores/user';

  const userStore = useUserStore();

  const IconDiscovery = h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h('path', { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })]);
  const IconTasks = h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h('path', { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" })]);
  const IconLibrary = h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2" }, [h('path', { "stroke-linecap": "round", "stroke-linejoin": "round", d: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" })]);

  const navItems = [
    { path: '/', label: '发现视频', icon: IconDiscovery },
    { path: '/tasks', label: '下载任务', icon: IconTasks },
    { path: '/library', label: '媒体库', icon: IconLibrary },
  ];

  const handleLogout = () => {
    if (confirm('确定要退出管理系统吗？')) {
      userStore.logout();
    }
  };
</script>
