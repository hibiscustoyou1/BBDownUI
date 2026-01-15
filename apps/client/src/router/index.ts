import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user';

const routes = []

const modules = import.meta.glob('./*.routes.ts', { eager: true })

for (const path in modules) {
  const mod = modules[path] as any
  const route = mod.default
  if (Array.isArray(route)) {
    routes.push(...route)
  } else {
    routes.push(route)
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 确保 store 已初始化（主要为了 token）
  // pinia 状态在 js 加载时已就绪，但 localStorage 读取是同步的
  
  if (to.name !== 'login' && !userStore.token) {
    next({ name: 'login' });
  } else if (to.name === 'login' && userStore.token) {
    next({ name: 'discovery' }); // 已登录则跳过 login
  } else {
    next();
  }
});

export default router
