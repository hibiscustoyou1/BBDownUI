<template>
  <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
      <span class="i-carbon-user"></span> 账号状态
    </h2>

    <div v-if="userStore.loading" class="animate-pulse flex items-center gap-4 py-4">
      <div class="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div class="space-y-2 flex-1">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>

    <div v-else-if="userStore.profile.isLogin" class="flex flex-col items-center text-center space-y-4 py-4 animate-fade-in">
      <div class="relative">
        <img :src="userStore.profile.face" class="w-24 h-24 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30 object-cover" />
        <div class="absolute bottom-0 right-0 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
          Lv.{{ userStore.profile.level }}
        </div>
      </div>
      <div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ userStore.profile.uname }}</h3>
        <p class="text-sm text-slate-500 mt-1 font-mono">UID: {{ userStore.profile.mid }}</p>
        <p v-if="userStore.profile.vipStatus" class="text-xs text-pink-500 mt-1 font-medium bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-full inline-block">
          {{ userStore.profile.vipType === 2 ? '年度大会员' : '大会员' }}
        </p>
      </div>

      <button
        @click="handleLogout"
        class="mt-4 px-6 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full sm:w-auto"
      >
        退出登录
      </button>
    </div>

    <div v-else class="flex flex-col items-center space-y-6 py-4 animate-fade-in">
      <p class="text-slate-500 text-sm">请使用 Bilibili 手机端扫码登录</p>

      <div class="relative w-48 h-48 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
        <img v-if="qrCodeImg" :src="qrCodeImg" class="w-full h-full p-2 object-contain" />
        <div v-else class="animate-pulse w-full h-full bg-slate-200 dark:bg-slate-800"></div>

        <div v-if="qrStatus === 'expired'" class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm">
          <span class="text-slate-500 dark:text-slate-400 text-sm mb-2">二维码已失效</span>
          <button @click="initQRCode" class="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-1 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            点击刷新
          </button>
        </div>
      </div>

      <p class="text-xs text-slate-400 flex items-center gap-2">
        状态:
        <span
          class="font-medium transition-colors duration-300"
          :class="{
            'text-indigo-500': qrStatus === 'waiting',
            'text-emerald-500': qrStatus === 'scanned' || qrStatus === 'success',
            'text-red-500': qrStatus === 'expired'
          }"
        >
          {{ statusText }}
        </span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useUserStore } from '@/stores/user';
  import api from '@/api';
  import QRCode from 'qrcode';

  const userStore = useUserStore();
  const qrCodeUrl = ref('');
  const qrCodeImg = ref('');
  const qrStatus = ref<'waiting' | 'scanned' | 'success' | 'expired'>('waiting');
  const statusText = ref('等待扫码...');
  let pollTimer: any = null;

  const initQRCode = async () => {
    if (userStore.profile.isLogin) return;

    if (pollTimer) clearInterval(pollTimer);
    qrCodeImg.value = '';
    statusText.value = '生成二维码中...';

    try {
      const { data } = await api.get('/auth/qrcode');
      if (data.code === 200) {
        qrCodeUrl.value = data.data.url;
        const key = data.data.qrcode_key;

        // Generate QR Image
        qrCodeImg.value = await QRCode.toDataURL(data.data.url, {
          margin: 2,
          width: 200,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        qrStatus.value = 'waiting';
        statusText.value = '请扫码';

        startPolling(key);
      }
    } catch (e) {
      statusText.value = '获取失败，请重试';
      qrStatus.value = 'expired';
    }
  };

  const startPolling = (key: string) => {
    if (pollTimer) clearInterval(pollTimer);

    pollTimer = setInterval(async () => {
      try {
        const { data } = await api.post('/auth/qrcode/check', { key });

        // 假设后端返回结构: { code: 200, data: { status: 'success' | 'pending' | 'expired', msg: '...' } }
        // 注意：这里需要根据后端实际 controller 的实现对应
        if (data.code === 200) {
          if (data.data.status === 'success') {
            clearInterval(pollTimer);
            qrStatus.value = 'success';
            statusText.value = '登录成功!';
            await userStore.fetchProfile(); // Refresh global state
          } else if (data.data.status === 'expired') {
            clearInterval(pollTimer);
            qrStatus.value = 'expired';
            statusText.value = '二维码已过期';
          } else if (data.data.status === 'scanned') {
            qrStatus.value = 'scanned';
            statusText.value = '已扫码，请在手机确认';
          }
        }
      } catch (e) {
        // ignore network errors during poll
      }
    }, 2000);
  };

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;
    await userStore.logout();
    initQRCode();
  };

  // 监听登录状态变化，如果登出了自动初始化二维码
  watch(() => userStore.profile.isLogin, (isLogin) => {
    if (!isLogin) {
      initQRCode();
    } else {
      if (pollTimer) clearInterval(pollTimer);
    }
  });

  onMounted(() => {
    if (!userStore.profile.isLogin && !userStore.loading) {
      initQRCode();
    }
  });

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
  });
</script>

<style scoped>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
