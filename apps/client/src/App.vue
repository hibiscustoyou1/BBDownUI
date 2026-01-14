<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-sans">

    <aside class="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
          BiliHub
        </span>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          :class="'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent transition-all"
            :class="{'ring-indigo-500': userStore.profile.isLogin}"
          >
            <img v-if="userStore.profile.face" :src="userStore.profile.face" class="w-full h-full object-cover" />
            <svg v-else class="w-full h-full text-slate-400 p-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
              {{ userStore.profile.isLogin ? userStore.profile.uname : '未登录' }}
            </p>
            <p v-if="userStore.profile.isLogin" class="text-[10px] text-indigo-500 font-medium">
              Lv.{{ userStore.profile.level }}
            </p>
            <router-link v-else to="/settings" class="text-[10px] text-slate-400 hover:text-indigo-500 transition-colors">
              点击设置登录
            </router-link>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useUserStore } from '@/stores/user';

  const userStore = useUserStore();

  // 初始化时获取用户信息 (Step 5)
  onMounted(() => {
    userStore.fetchProfile();
  });

  const navItems = [
    { label: '发现资源', path: '/' },
    { label: '下载任务', path: '/tasks' },
    { label: '媒体库', path: '/library' },
    { label: '系统设置', path: '/settings' },
  ];
</script>

<style>
  /* 简单的路由切换动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
