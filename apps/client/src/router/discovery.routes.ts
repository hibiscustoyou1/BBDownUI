import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw = {
  path: '/',
  name: 'Discovery',
  component: () => import('@/views/DiscoveryView.vue'),
  meta: {
    title: '发现资源',
    icon: 'search'
  }
}

export default routes
