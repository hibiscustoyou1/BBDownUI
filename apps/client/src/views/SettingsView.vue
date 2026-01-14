<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <header>
      <h1 class="text-3xl font-light text-slate-900 dark:text-white mb-2">Settings</h1>
      <p class="text-slate-500">管理账号与系统配置</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <span class="i-carbon-user"></span> 账号状态
        </h2>

        <div v-if="userStore.loading" class="animate-pulse flex items-center gap-4">
          <div class="w-16 h-16 bg-slate-200 rounded-full"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            <div class="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>

        <div v-else-if="userStore.profile.isLogin" class="flex flex-col items-center text-center space-y-4 py-4">
          <div class="relative">
            <img :src="userStore.profile.face" class="w-24 h-24 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30" />
            <div class="absolute bottom-0 right-0 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              Lv.{{ userStore.profile.level }}
            </div>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ userStore.profile.uname }}</h3>
            <p class="text-sm text-slate-500 mt-1">UID: {{ userStore.profile.mid }}</p>
          </div>

          <button
            @click="handleLogout"
            class="mt-4 px-6 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            退出登录
          </button>
        </div>

        <div v-else class="flex flex-col items-center space-y-6 py-4">
          <p class="text-slate-500 text-sm">请使用 Bilibili 手机端扫码登录</p>

          <div class="relative w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
            <img v-if="qrCodeUrl" :src="qrCodeImg" class="w-full h-full p-2" />
            <div v-else class="animate-pulse w-full h-full bg-slate-200"></div>

            <div v-if="qrStatus === 'expired'" class="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
              <span class="text-slate-500 text-sm mb-2">二维码已失效</span>
              <button @click="initQRCode" class="text-indigo-600 font-medium text-sm">点击刷新</button>
            </div>
          </div>

          <p class="text-xs text-slate-400">
            状态: <span class="font-medium text-indigo-500">{{ statusText }}</span>
          </p>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">系统信息</h2>
        <div class="space-y-4 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
            <span class="text-slate-500">版本</span>
            <span class="font-mono text-slate-800 dark:text-slate-200">v0.5.0</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
            <span class="text-slate-500">后端服务</span>
            <span class="text-emerald-500 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 运行中
            </span>
          </div>
          <div class="py-2">
            <span class="text-slate-500 block mb-1">下载目录</span>
            <code class="block bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded text-slate-600 dark:text-slate-400 break-all text-xs font-mono">
              /app/downloads (Container)
            </code>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useUserStore } from '@/stores/user';
  import api from '@/api';
  import QRCode from 'qrcode'; // 需安装 pnpm add qrcode @types/qrcode

  const userStore = useUserStore();
  const qrCodeUrl = ref('');
  const qrCodeImg = ref('');
  const qrStatus = ref<'waiting' | 'scanned' | 'success' | 'expired'>('waiting');
  const statusText = ref('等待扫码...');
  let pollTimer: any = null;

  const initQRCode = async () => {
    if (userStore.profile.isLogin) return;

    try {
      const { data } = await api.get('/auth/qrcode');
      if (data.code === 200) {
        qrCodeUrl.value = data.data.url;
        const key = data.data.qrcode_key;

        // Render QR
        qrCodeImg.value = await QRCode.toDataURL(data.data.url);
        qrStatus.value = 'waiting';
        statusText.value = '请扫码';

        startPolling(key);
      }
    } catch (e) {
      statusText.value = '获取二维码失败';
    }
  };

  const startPolling = (key: string) => {
    if (pollTimer) clearInterval(pollTimer);

    pollTimer = setInterval(async () => {
      try {
        const { data } = await api.post('/auth/qrcode/check', { key });
        if (data.code === 200) {
          if (data.data.status === 'success') {
            clearInterval(pollTimer);
            qrStatus.value = 'success';
            statusText.value = '登录成功!';
            await userStore.fetchProfile(); // Refresh global state
          }
        } else {
          // Handle expiration logic if backend returns specific code
          // For now simple assumption
        }
      } catch (e) {
        // ignore
      }
    }, 3000);
  };

  const handleLogout = async () => {
    await userStore.logout();
    initQRCode(); // Re-init login flow
  };

  onMounted(() => {
    if (!userStore.profile.isLogin) {
      initQRCode();
    }
  });

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
  });
</script>
