import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw = {
  path: '/tasks',
  name: 'Tasks',
  component: () => import('@/views/TasksView.vue'), // Step 3 将创建此文件，目前先指向一个存在的或创建空文件
  meta: {
    title: '下载任务',
    icon: 'download'
  }
}

export default routes
