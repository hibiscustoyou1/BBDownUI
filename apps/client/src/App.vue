<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-sans">
    <aside class="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
        <span class="text-xl font-bold text-indigo-600">BiliHub</span>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <router-link to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50" active-class="bg-indigo-50 text-indigo-600">
          发现资源
        </router-link>
        <router-link to="/tasks" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50" active-class="bg-indigo-50 text-indigo-600">
          下载任务
        </router-link>
      </nav>
    </aside>
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
        <router-view />
      </div>
    </main>
  </div>
</template>
