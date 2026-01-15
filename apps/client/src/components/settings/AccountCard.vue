<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
      <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
      账号状态
    </h3>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 overflow-hidden relative">
          <svg v-if="!userStore.profile.isLogin" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <img v-else src="https://ui-avatars.com/api/?name=Bili&background=random" alt="Avatar" class="w-full h-full object-cover">
        </div>

        <div>
          <h4 class="font-bold text-slate-800 dark:text-white">
            {{ userStore.profile.isLogin ? '已登录 Bilibili' : '未登录' }}
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ userStore.profile.isLogin ? 'Cookie 有效，可下载高画质视频' : '仅限下载低画质/免费视频' }}
          </p>
        </div>
      </div>

      <button
        v-if="!userStore.profile.isLogin"
        @click="startLogin"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
      >
        扫码登录
      </button>

      <button
        v-else
        @click="handleBiliLogout"
        :disabled="logoutLoading"
        class="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-200 dark:border-red-800"
      >
        {{ logoutLoading ? '退出中...' : '退出登录' }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { logoutBilibili } from '@/api/modules/auth';

  const userStore = useUserStore();
  const logoutLoading = ref(false);

  const startLogin = () => {
    // Trigger global event or local modal
    // For simplicity, assume parent handles it or this component has modal logic
    // This logic should match previous implementation
    alert('请点击登录页面的扫码功能 (Placeholder)');
  };

  const handleBiliLogout = async () => {
    if (!confirm('确定要退出 B 站账号吗？这将无法下载会员视频。')) return;
    logoutLoading.value = true;
    try {
      await logoutBilibili();
      await userStore.fetchProfile(); // Refresh status
    } catch (e) {
      alert('退出失败');
    } finally {
      logoutLoading.value = false;
    }
  };

  onMounted(() => {
    userStore.fetchProfile();
  });
</script>
