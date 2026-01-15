<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
      <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
      账号状态
    </h3>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 overflow-hidden relative border border-slate-200 dark:border-slate-600">
          <svg v-if="!userStore.profile.isLogin" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <img v-else :src="userStore.profile.face || 'https://ui-avatars.com/api/?name=Bili&background=random'" alt="Avatar" class="w-full h-full object-cover">
        </div>

        <div>
          <h4 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {{ userStore.profile.isLogin ? (userStore.profile.uname || '已登录 Bilibili') : '未登录' }}
            <span v-if="userStore.profile.isLogin && userStore.profile.vipStatus" class="px-1.5 py-0.5 bg-pink-100 text-pink-600 text-[10px] rounded font-bold uppercase tracking-wider">VIP</span>
          </h4>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ userStore.profile.isLogin ? 'Cookie 有效，可下载高画质视频' : '仅限下载低画质/免费视频' }}
          </p>
        </div>
      </div>

      <button
        v-if="!userStore.profile.isLogin"
        @click="startLogin"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
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

    <div v-if="showQrcodeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-scale-up">
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Bilibili 扫码登录</h3>
        <p class="text-sm text-slate-500 mb-6">请使用 Bilibili 手机客户端扫码</p>

        <div class="flex justify-center mb-6">
          <div v-if="qrcodeUrl" class="p-2 bg-white rounded-xl border border-slate-200">
            <vue-qrcode :value="qrcodeUrl" :options="{ width: 200, margin: 1 }" />
          </div>
          <div v-else class="w-[218px] h-[218px] bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
            <span class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        </div>

        <p class="text-sm font-medium mb-6" :class="statusClass">{{ statusText }}</p>

        <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, onUnmounted } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { logoutBilibili } from '@/api/modules/auth';
  import api from '@/api'; // 直接引用 axios 实例请求 qrcode
  import VueQrcode from '@chenfengyuan/vue-qrcode'; // 需要安装这个库

  const userStore = useUserStore();
  const logoutLoading = ref(false);

  // QRCode State
  const showQrcodeModal = ref(false);
  const qrcodeUrl = ref('');
  const qrcodeKey = ref('');
  const statusText = ref('等待扫码...');
  const statusClass = ref('text-slate-500');
  let pollTimer: any = null;

  // API Calls (Local definition for simplicity or import from auth.ts)
  const getQrcode = async () => {
    const { data } = await api.get('/auth/qrcode');
    return data.data; // { url, qrcode_key }
  };

  const pollQrcode = async (key: string) => {
    const { data } = await api.post('/auth/qrcode/check', { qrcode_key: key });
    return data.data; // { code, message, url }
  };

  const startLogin = async () => {
    showQrcodeModal.value = true;
    qrcodeUrl.value = '';
    statusText.value = '正在加载二维码...';

    try {
      const data = await getQrcode();
      if (data && data.url) {
        qrcodeUrl.value = data.url;
        qrcodeKey.value = data.qrcode_key;
        statusText.value = '请扫码...';
        startPolling();
      } else {
        statusText.value = '获取二维码失败';
      }
    } catch (e) {
      statusText.value = '网络错误';
    }
  };

  const startPolling = () => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        const res = await pollQrcode(qrcodeKey.value);
        // code: 0=成功, 86101=未扫码, 86090=已扫码未确认, 86038=已失效
        if (res.code === 0) {
          clearInterval(pollTimer);
          statusText.value = '登录成功！';
          statusClass.value = 'text-green-500';
          setTimeout(() => {
            closeModal();
            userStore.fetchProfile(); // Refresh global state
          }, 1000);
        } else if (res.code === 86090) {
          statusText.value = '已扫码，请在手机上确认';
          statusClass.value = 'text-indigo-500';
        } else if (res.code === 86038) {
          clearInterval(pollTimer);
          statusText.value = '二维码已失效，请重新打开';
          statusClass.value = 'text-red-500';
        }
      } catch (e) {
        // ignore network glitches
      }
    }, 3000);
  };

  const closeModal = () => {
    showQrcodeModal.value = false;
    if (pollTimer) clearInterval(pollTimer);
    qrcodeUrl.value = '';
  };

  const handleBiliLogout = async () => {
    if (!confirm('确定要退出 B 站账号吗？这将无法下载会员视频。')) return;
    logoutLoading.value = true;
    try {
      await logoutBilibili();
      await userStore.fetchProfile();
    } catch (e) {
      alert('退出失败');
    } finally {
      logoutLoading.value = false;
    }
  };

  onMounted(() => {
    userStore.fetchProfile();
  });

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
  });
</script>

<style scoped>
  .animate-scale-up {
    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
</style>
