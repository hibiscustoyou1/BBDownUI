<template>
  <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
      <span class="i-carbon-settings"></span> 系统信息
    </h2>

    <div class="space-y-4 text-sm">

      <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
        <span class="text-slate-500 dark:text-slate-400">系统版本</span>
        <span class="font-mono text-slate-800 dark:text-slate-200 font-medium">v0.6.0</span>
      </div>

      <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
        <span class="text-slate-500 dark:text-slate-400">后端服务</span>
        <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          运行中
        </span>
      </div>

      <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
        <span class="text-slate-500 dark:text-slate-400">BBDown内核</span>
        <span class="text-slate-800 dark:text-slate-200 font-mono">检测中...</span>
      </div>

      <div class="py-2">
        <span class="text-slate-500 dark:text-slate-400 block mb-2">默认下载目录</span>
        <div class="relative group">
          <code class="block bg-slate-50 dark:bg-slate-900 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 break-all text-xs font-mono border border-slate-100 dark:border-slate-700">
            /app/downloads (Container)
          </code>
          <div class="absolute -top-8 left-0 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Docker 容器内部路径
          </div>
        </div>
      </div>

      <div class="pt-4 flex gap-4">
        <a href="https://github.com/nilaoda/BBDown" target="_blank" class="text-xs text-indigo-500 hover:underline flex items-center gap-1">
          BBDown Github
        </a>
        <a href="#" class="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
          检查更新
        </a>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
  // 目前主要是静态展示，后续 v0.6.0 后期可接入 /api/system/info 接口获取真实 BBDown 版本
</script>
