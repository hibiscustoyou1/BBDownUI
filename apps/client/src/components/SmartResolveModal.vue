<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

    <div class="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">

      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/50">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span class="i-carbon-download"></span> 视频解析结果
        </h2>
        <button @click="close" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500 text-sm animate-pulse">正在获取元数据与流信息...</p>
      </div>

      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">解析失败</h3>
        <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">{{ error }}</p>
        <button @click="retry" class="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">重试</button>
      </div>

      <div v-else-if="videoInfo" class="flex flex-col lg:flex-row h-full overflow-hidden">

        <div class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

          <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg font-mono text-xs space-y-2 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 select-text">
            <div class="flex gap-2">
              <span class="text-slate-400 select-none w-16 text-right whitespace-nowrap">- 视频标题:</span>
              <span class="font-bold text-slate-800 dark:text-white flex-1 break-all">{{ videoInfo.title }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-slate-400 select-none w-16 text-right whitespace-nowrap">- 发布时间:</span>
              <span>{{ new Date(videoInfo.pubdate * 1000).toLocaleString() }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-slate-400 select-none w-16 text-right whitespace-nowrap">- UP主页:</span>
              <a :href="`https://space.bilibili.com/${videoInfo.owner.mid}`" target="_blank" class="text-indigo-500 hover:underline flex-1 truncate">
                https://space.bilibili.com/{{ videoInfo.owner.mid }}
              </a>
            </div>
            <div class="flex gap-2">
              <span class="text-slate-400 select-none w-16 text-right whitespace-nowrap">- 视频时长:</span>
              <span>{{ formatDurationFull(videoInfo.duration) }}</span>
            </div>
          </div>

          <div v-if="videoInfo.pages && videoInfo.pages.length > 1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span class="w-1 h-4 bg-indigo-500 rounded-full"></span>
                分P列表 ({{ videoInfo.pages.length }})
              </h3>
              <div class="flex gap-3">
                <button @click="selectAllPages" class="text-xs text-indigo-500 hover:text-indigo-600 font-medium">全选</button>
                <button @click="selectedPages = []" class="text-xs text-slate-400 hover:text-slate-600">清空</button>
              </div>
            </div>
            <div class="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 scrollbar-thin">
              <div v-for="p in videoInfo.pages" :key="p.cid" class="flex items-center px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <input type="checkbox" :value="p.page" v-model="selectedPages" class="rounded text-indigo-600 focus:ring-indigo-500 mr-3 cursor-pointer">
                <span class="text-xs text-slate-500 font-mono w-10 mr-2">P{{ p.page }}</span>
                <span class="text-xs text-slate-700 dark:text-slate-300 truncate flex-1" :title="p.part">{{ p.part }}</span>
                <span class="text-[10px] text-slate-400 font-mono ml-2">{{ formatDuration(p.duration) }}</span>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 mt-1 pl-1">
              已选择: <span class="font-medium text-slate-600 dark:text-slate-300">{{ selectedPages.length > 0 ? (selectedPages.length === videoInfo.pages.length ? 'ALL (全部)' : `${selectedPages.length} 个分P`) : '无' }}</span>
            </p>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-1 h-4 bg-emerald-500 rounded-full"></span>
                <span>视频流信息</span>
              </div>
              <span class="text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">点击行以选定</span>
            </h3>

            <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
              <div class="grid grid-cols-12 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-[10px] text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                <div class="col-span-3">画质</div>
                <div class="col-span-2">分辨率</div>
                <div class="col-span-2">编码</div>
                <div class="col-span-1 text-center">帧率</div>
                <div class="col-span-2 text-right">码率</div>
                <div class="col-span-2 text-right">预估大小</div>
              </div>

              <div class="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[400px] overflow-y-auto scrollbar-thin">
                <template v-for="q in videoInfo.qualities" :key="q.id">
                  <div
                    v-for="stream in (q.streams || [])"
                    :key="stream.codec"
                    @click="selectStream(q, stream)"
                    class="grid grid-cols-12 px-4 py-3 items-center text-xs cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30 group border-l-4"
                    :class="isSelected(q.id, stream.codec) ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-l-indigo-500' : 'border-l-transparent'"
                  >
                    <div class="col-span-3 font-medium truncate flex items-center gap-2" :class="isSelected(q.id, stream.codec) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'">
                      <div class="w-3 h-3 rounded-full border flex items-center justify-center"
                           :class="isSelected(q.id, stream.codec) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'">
                        <div v-if="isSelected(q.id, stream.codec)" class="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span :title="q.label">{{ q.label }}</span>
                    </div>
                    <div class="col-span-2 text-slate-500 font-mono">{{ stream.resolution }}</div>
                    <div class="col-span-2">
                      <span class="px-1.5 py-0.5 rounded text-[10px] border font-mono font-medium" :class="getCodecClass(stream.codec)">
                        {{ stream.codec }}
                      </span>
                    </div>
                    <div class="col-span-1 text-center text-slate-500 font-mono">{{ stream.fps }}</div>
                    <div class="col-span-2 text-right text-slate-500 font-mono">{{ stream.bitrate }} kbps</div>
                    <div class="col-span-2 text-right text-slate-500 font-mono group-hover:text-slate-800 dark:group-hover:text-slate-200">~{{ formatBytes(stream.size) }}</div>
                  </div>
                </template>

                <div v-if="!videoInfo.qualities.length" class="p-4 text-center text-xs text-slate-400">
                  未找到视频流信息
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="w-full lg:w-80 bg-slate-50/50 dark:bg-slate-900/30 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 p-6 flex flex-col shadow-inner">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">下载配置</h3>

          <div class="space-y-6 flex-1">

            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 shadow-sm">
              <div class="flex justify-between items-center">
                <span class="text-slate-500">模式</span>
                <span class="font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">{{ isAudioOnly ? '仅音频' : '视频 + 音频' }}</span>
              </div>

              <template v-if="!isAudioOnly">
                <div class="h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">目标画质</span>
                  <span class="font-bold text-indigo-600 dark:text-indigo-400 truncate ml-2" :title="currentSelection.label || '自动'">{{ currentSelection.label || '自动' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">指定编码</span>
                  <span class="font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 px-1.5 rounded">{{ currentSelection.codec || 'Auto' }}</span>
                </div>
              </template>

              <template v-if="videoInfo.pages && videoInfo.pages.length > 1">
                <div class="h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">分P选择</span>
                  <span class="font-medium text-emerald-600 dark:text-emerald-400">
                     {{ selectedPages.length === videoInfo.pages.length ? '全部 (ALL)' : `${selectedPages.length} 个` }}
                   </span>
                </div>
              </template>
            </div>

            <div class="space-y-4">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="isAudioOnly" class="peer sr-only">
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
                <span class="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">仅下载音频</span>
              </label>

              <div>
                <label class="text-xs font-medium text-slate-500 mb-1.5 block">文件名模板</label>
                <input
                  v-model="form.FilePattern"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="<videoTitle>"
                >
              </div>
            </div>

          </div>

          <button
            @click="submit"
            :disabled="submitting || (!currentSelection.id && !isAudioOnly)"
            class="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ submitting ? '正在提交...' : '开始下载' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive } from 'vue';
  import { resolveVideo } from '@/api/modules/bilibili';
  import { addTask } from '@/api/modules/task';
  import { usePreferenceStore } from '@/stores/preference';
  import { formatBytes } from '@/utils/format';
  import type { VideoPlayInfo, DownloadOptions, VideoQuality, VideoStreamInfo } from '@repo/shared';

  const props = defineProps<{ isOpen: boolean; bvid?: string; url?: string; }>();
  const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void; }>();

  const prefStore = usePreferenceStore();
  const loading = ref(false);
  const error = ref('');
  const submitting = ref(false);
  const videoInfo = ref<VideoPlayInfo | null>(null);

  // State
  const isAudioOnly = ref(false);
  const selectedPages = ref<number[]>([]);
  const currentSelection = reactive({
    id: null as number | null,
    label: '',
    codec: ''
  });

  const form = reactive<Partial<DownloadOptions>>({
    FilePattern: '',
  });

  // Format Helpers
  const formatDuration = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const formatDurationFull = (s: number) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
  };

  const getCodecClass = (codec: string) => {
    const c = codec.toLowerCase();
    if (c.includes('avc')) return 'text-slate-600 border-slate-300 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600';
    if (c.includes('hevc')) return 'text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (c.includes('av1')) return 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    return 'text-slate-500 border-slate-300';
  };

  const isSelected = (qid: number, codec: string) => {
    return currentSelection.id === qid && currentSelection.codec === codec;
  };

  // Actions
  const selectStream = (q: VideoQuality, s: VideoStreamInfo) => {
    currentSelection.id = q.id;
    currentSelection.label = q.label;
    currentSelection.codec = s.codec;
  };

  const selectAllPages = () => {
    if (videoInfo.value && videoInfo.value.pages) {
      selectedPages.value = videoInfo.value.pages.map(p => p.page);
    }
  };

  const init = async () => {
    loading.value = true;
    error.value = '';
    videoInfo.value = null;
    selectedPages.value = [];
    currentSelection.id = null;
    currentSelection.label = '';
    currentSelection.codec = '';

    try {
      await prefStore.fetchConfig();
      form.FilePattern = prefStore.config.filePattern;
      isAudioOnly.value = !!prefStore.config.audioOnly;

      let targetId = props.bvid;
      if (!targetId && props.url) {
        const match = props.url.match(/(BV[a-zA-Z0-9]+)/);
        if (match) targetId = match[1];
      }

      if (!targetId) {
        error.value = '无效的视频 ID 或链接';
        loading.value = false;
        return;
      }

      const res = await resolveVideo(targetId);
      if (res.code === 200 && res.data) {
        videoInfo.value = res.data;

        // Init Page Selection (Default P1)
        if (res.data.pages && res.data.pages.length > 0) {
          selectedPages.value = [res.data.pages[0].page];
        }

        // Init Stream Selection (Best Quality)
        if (res.data.qualities && res.data.qualities.length > 0) {
          const bestQ = res.data.qualities[0];
          // 自动选择策略: HEVC > AV1 > AVC
          if (bestQ.streams && bestQ.streams.length > 0) {
            // 优先查找 HEVC
            let targetStream = bestQ.streams.find(s => s.codec === 'HEVC');
            // 其次 AV1
            if (!targetStream) targetStream = bestQ.streams.find(s => s.codec === 'AV1');
            // 最后 fallback 到第一个
            if (!targetStream) targetStream = bestQ.streams[0];

            selectStream(bestQ, targetStream);
          }
        }
      } else {
        error.value = res.msg || '解析失败，请检查网络或 Cookie 状态';
      }
    } catch (e: any) {
      console.error(e);
      error.value = e.message || '网络请求错误';
    } finally {
      loading.value = false;
    }
  };

  watch(() => props.isOpen, (val) => { if (val) init(); });
  const retry = () => init();
  const close = () => emit('close');

  const submit = async () => {
    if (!videoInfo.value) return;
    submitting.value = true;

    try {
      const opts: DownloadOptions = {
        Url: `https://www.bilibili.com/video/${videoInfo.value.bvid}`,
        FilePattern: form.FilePattern,
        AudioOnly: isAudioOnly.value,
        MultiThread: prefStore.config.multiThread,
      };

      // 分P参数
      if (videoInfo.value.pages && videoInfo.value.pages.length > 1) {
        if (selectedPages.value.length === videoInfo.value.pages.length) {
          opts.SelectPage = 'ALL';
        } else {
          opts.SelectPage = selectedPages.value.join(',');
        }
      }

      // 画质与编码参数
      if (!isAudioOnly.value && currentSelection.label) {
        opts.DfnPriority = currentSelection.label;
        if (currentSelection.codec) {
          opts['EncodingPriority'] = currentSelection.codec.toLowerCase();
        }
      }

      const res = await addTask(opts);
      if (res.code === 200) { emit('success'); close(); }
      else { alert(`提交失败: ${res.msg}`); }
    } catch (e) {
      alert('网络错误');
    } finally {
      submitting.value = false;
    }
  };
</script>

<style scoped>
  .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  /* 自定义滚动条 */
  .scrollbar-thin::-webkit-scrollbar { width: 6px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-600 rounded-full; }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover { @apply bg-slate-300 dark:bg-slate-500; }
</style>
