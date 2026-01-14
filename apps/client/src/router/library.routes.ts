import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw = {
  path: '/library',
  name: 'Library',
  component: () => import('@/views/LibraryView.vue'),
  meta: {
    title: '媒体库',
    icon: 'folder'
  }
}

export default routes
