import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw = {
  path: '/settings',
  name: 'Settings',
  component: () => import('@/views/SettingsView.vue'),
  meta: {
    title: '系统设置',
    icon: 'settings'
  }
}

export default routes
