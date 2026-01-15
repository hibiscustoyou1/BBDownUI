<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-all duration-300">

      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
          {{ isSetupMode ? '初始化管理员' : 'BBDown UI 登录' }}
        </h1>
        <p class="text-sm text-slate-500 mt-2">
          {{ isSetupMode ? '检测到系统未初始化，请设置管理员密码' : '请输入管理员密码以继续' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ isSetupMode ? '完成设置' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { useRouter } from 'vue-router';

  const userStore = useUserStore();
  const router = useRouter();

  const password = ref('');
  const loading = ref(false);
  const error = ref('');

  // 如果 isSystemInitialized 为 false，则进入 Setup 模式
  const isSetupMode = computed(() => !userStore.isSystemInitialized);

  const handleSubmit = async () => {
    if (!password.value) return;
    loading.value = true;
    error.value = '';

    try {
      if (isSetupMode.value) {
        const success = await userStore.setup(password.value);
        if (success) {
          // Setup done, allow login
          // 实际上 setup 之后可以直接尝试 login，或者让用户重新输密码。
          // 为了体验，我们直接调用 login
          await userStore.login(password.value);
          router.push('/');
        }
      } else {
        await userStore.login(password.value);
        router.push('/');
      }
    } catch (e: any) {
      error.value = e.response?.data?.msg || '操作失败，请检查密码';
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    userStore.checkSystemInit();
  });
</script>
