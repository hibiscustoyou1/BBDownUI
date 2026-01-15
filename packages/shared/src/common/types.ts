export enum ApiCode {
  SUCCESS = 200,
  FAIL = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
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

// --- BBDown 核心任务结构 ---

export interface DownloadTask {
  Aid: string;
  Url: string;
  TaskCreateTime: number;
  Title?: string;
  Pic?: string;
  VideoPubTime?: number;
  TaskFinishTime?: number;
  Progress: number;
  DownloadSpeed: number;
  TotalDownloadedBytes: number;
  IsSuccessful: boolean;
}

export interface DownloadTaskCollection {
  Running: DownloadTask[];
  Finished: DownloadTask[];
}

// 对应 BBDown MyOption (包含 v0.6.0+ 新增的控制参数)
export interface DownloadOptions {
  Url: string;
  UseHevc?: boolean;
  UseAv1?: boolean;
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
  WorkDir?: string;
  FilePattern?: string; // 文件名模板 e.g. <videoTitle>
  
  // [v0.6.0] 精准控制
  DfnPriority?: string;      // 画质优先级 (e.g. "8K 超高清")
  EncodingPriority?: string; // 编码优先级 (e.g. "hevc", "av1")
  SelectPage?: string;       // 分P选择 (e.g. "1,2", "ALL")
}

// --- Bilibili 业务数据结构 ---

export interface BiliVideoSnippet {
  bvid: string;
  aid: number;
  title: string;
  pic: string;
  author: string;
  mid: number;
  duration: string;
  play: number;
  pubdate: number;
  description: string;
}

export interface AuthStatus {
  isLoggedIn: boolean;
  mid?: number;
  uname?: string;
  face?: string;
  level?: number;
  vipStatus?: number;
  qrcodeKey?: string;
  qrcodeUrl?: string;
}

export interface SearchParams {
  keyword: string;
  page?: number;
}

export interface AddTaskRequest {
  url: string;
  options?: Partial<DownloadOptions>;
}

export interface FileInfo {
  name: string;
  size: number;
  mtime: number;
  extension: string;
}

export interface UserProfile {
  isLogin: boolean;
  mid?: number;
  uname?: string;
  face?: string;
  level?: number;
  vipType?: number;
  vipStatus?: number;
}

export interface QRCodeGenerateResult {
  url: string;
  qrcode_key: string;
}

export interface QRCodePollResult {
  code: number;
  message: string;
  cookies?: string;
}

// --- v0.6.0 全局偏好设置 ---

export interface GlobalPreference {
  downloadDir?: string;
  filePattern?: string;
  multiThread?: boolean;
  useHevc?: boolean;
  useAv1?: boolean;
  audioOnly?: boolean;
  deleteAfterSuccess?: boolean;
}

// --- v0.6.2 视频深度解析 (Smart Resolve) ---

export interface VideoPage {
  cid: number;
  page: number;
  part: string;     // 分P标题
  duration: number; // 分P时长 (秒)
}

export interface VideoStreamInfo {
  codec: string;      // AVC, HEVC, AV1
  resolution: string; // e.g. "3840x2160"
  fps: string;        // e.g. "60.0"
  bitrate: number;    // kbps
  size: number;       // 预估大小 (bytes)
}

export interface VideoQuality {
  id: number;          // 清晰度ID (e.g. 120)
  label: string;       // 清晰度描述 (e.g. "4K 超清")
  streams: VideoStreamInfo[]; // 该画质下的流列表 (不同编码)
  codecs: string[];    // 简略编码列表 (兼容旧逻辑)
  isVip?: boolean;
}

export interface AudioQuality {
  id: number;
  label: string;
}

export interface VideoPlayInfo {
  bvid: string;
  cid: number; // 当前解析使用的参考CID
  title: string;
  cover: string;
  duration: number; // 总时长或当前分P时长
  pubdate: number;
  owner: {
    name: string;
    mid: number;
    face: string;
  };
  
  // [v0.6.2] 分P列表
  pages: VideoPage[];
  
  qualities: VideoQuality[];
  audioQualities: AudioQuality[];
}
