// packages/shared/src/common/types.ts

// --- 保留原有代码 ---
export enum ApiCode {
  SUCCESS = 200,
  FAIL = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400, // 新增
}

export interface ApiResponse<T = any> {
  code: ApiCode;
  data?: T;
  msg?: string;
}

export interface HelloData {
  message: string;
  timestamp: number;
}
// --- 原有代码结束 ---

// --- 新增：BBDown 核心数据结构 (参考 BBDownServer.md) ---

export interface DownloadTask {
  Aid: string;           // 唯一标识符 (Video AID)
  Url: string;           // 原始 URL
  TaskCreateTime: number;
  Title?: string;
  Pic?: string;
  VideoPubTime?: number;
  TaskFinishTime?: number;
  Progress: number;      // 0-1
  DownloadSpeed: number; // Byte/s
  TotalDownloadedBytes: number;
  IsSuccessful: boolean;
}

export interface DownloadTaskCollection {
  Running: DownloadTask[];
  Finished: DownloadTask[];
}

// 对应 BBDown MyOption (部分核心字段)
export interface DownloadOptions {
  Url: string;
  UseHevc?: boolean;     // 是否使用 HEVC
  UseAv1?: boolean;      // 是否使用 AV1
  OnlyShowInfo?: boolean;
  HideStreams?: boolean;
  MultiThread?: boolean;
  VideoOnly?: boolean;
  AudioOnly?: boolean;
  SubOnly?: boolean;
  NoSub?: boolean;
  SkipSubtitle?: boolean;
  SkipCover?: boolean;
  SkipMux?: boolean;
  Language?: string;
  WorkDir?: string;      // 工作目录
  FilePattern?: string;  // 文件名格式
}

// --- 新增：Bilibili 业务数据结构 ---

// 视频搜索结果摘要
export interface BiliVideoSnippet {
  bvid: string;
  aid: number;
  title: string;
  pic: string;        // 封面图
  author: string;     // UP主
  mid: number;        // UP主ID
  duration: string;   // 时长 (e.g. "03:20")
  play: number;       // 播放量
  pubdate: number;    // 发布时间
  description: string;
}

// 用户认证状态
export interface AuthStatus {
  isLoggedIn: boolean;
  mid?: number;
  uname?: string;
  face?: string;
  level?: number;
  vipStatus?: number;
  qrcodeKey?: string; // 扫码登录用 Key
  qrcodeUrl?: string; // 扫码登录用 URL
}

// 统一的 API 请求参数
export interface SearchParams {
  keyword: string;
  page?: number;
}

export interface AddTaskRequest {
  url: string;
  options?: Partial<DownloadOptions>;
}
