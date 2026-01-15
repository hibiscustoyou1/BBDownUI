import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw = {
  path: '/login',
  name: 'login',
  component: () => import('@/views/LoginView.vue'),
  meta: { hideLayout: true } // 标记不需要侧边栏
}

export default routes
