<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <header>
      <h1 class="text-3xl font-light text-slate-900 dark:text-white mb-2">My Tasks</h1>
      <p class="text-slate-500">实时监控下载进度与管理历史记录</p>
    </header>

    <div v-if="loading && !tasks.Running.length && !tasks.Finished.length" class="py-10 text-center text-slate-400">
      加载中...
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            进行中
            <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              {{ tasks.Running.length }}
            </span>
          </h2>
        </div>

        <div v-if="tasks.Running.length === 0" class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-700">
          <p class="text-slate-400 text-sm">暂无下载任务</p>
          <router-link to="/" class="inline-block mt-4 text-indigo-600 text-sm hover:underline">去发现视频</router-link>
        </div>

        <TransitionGroup name="list" tag="div" class="space-y-3">
          <TaskItem
            v-for="task in tasks.Running"
            :key="task.Aid"
            :task="task"
            is-running
          />
        </TransitionGroup>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">
            已完成
            <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              {{ tasks.Finished.length }}
            </span>
          </h2>
        </div>

        <div v-if="tasks.Finished.length === 0" class="text-center py-8 text-slate-400 text-sm">
          暂无历史记录
        </div>

        <div class="space-y-3">
          <TaskItem
            v-for="task in tasks.Finished"
            :key="task.Aid"
            :task="task"
            @delete="handleDelete"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getAllTasks, removeTask } from '@/api/modules/task';
  import type { DownloadTaskCollection } from '@repo/shared';
  import TaskItem from '@/components/TaskItem.vue';

  const tasks = ref<DownloadTaskCollection>({ Running: [], Finished: [] });
  const loading = ref(true);
  let timer: any = null;

  const fetchTasks = async () => {
    try {
      const res = await getAllTasks();
      if (res.code === 200 && res.data) {
        tasks.value = res.data;
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (aid: string) => {
    if (!confirm('确定要删除这条记录吗？(不会删除已下载的文件)')) return;
    try {
      const res = await removeTask(aid);
      if (res.code === 200) {
        // 乐观 UI 更新：立即从列表中移除
        tasks.value.Finished = tasks.value.Finished.filter(t => t.Aid !== aid);
        // 触发一次刷新
        fetchTasks();
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  onMounted(() => {
    fetchTasks();
    // 每 2 秒轮询一次
    timer = setInterval(fetchTasks, 2000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
</script>

<style>
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }

  .list-leave-active {
    position: absolute;
  }
</style>
