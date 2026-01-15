import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '@/config/app.config';
import { BiliVideoSnippet, SearchParams, VideoPlayInfo, VideoQuality, AudioQuality, VideoPage, VideoStreamInfo } from '@repo/shared';
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BiliApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data?: T;
}

// --- WBI 签名混淆常量 ---
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

export class BilibiliService {
  private client: AxiosInstance;
  private wbiImgKey: string | null = null;
  private wbiSubKey: string | null = null;
  
  // [Fix] 保存默认的设备指纹，防止登录后丢失
  private defaultCookies: string;
  
  constructor() {
    // 构造仿真浏览器指纹
    const buvid3 = `${crypto.randomUUID()}infoc`;
    const uuid = crypto.randomUUID();
    
    // [Fix] 初始化并保存指纹
    this.defaultCookies = `buvid3=${buvid3}; _uuid=${uuid}; b_nut=1710000000; home_lang=zh-CN`;
    
    this.client = axios.create({
      baseURL: AppConfig.BILI_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Cookie': this.defaultCookies, // 使用保存的指纹
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });
    
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        
        if (status === 412) {
          console.error(`[BilibiliService] ⚠️ 风控拦截 (412): ${url} - 请检查 IP 是否受限，或 Cookie 指纹是否丢失`);
        } else {
          console.error(`[BilibiliService] Request Failed (${status}): ${url}`, error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * [新增] 服务启动时初始化
   * 从数据库加载持久化的 Cookie
   */
  public async init() {
    try {
      const setting = await prisma.globalSetting.findUnique({ where: { key: 'bili_cookie' } });
      if (setting?.value) {
        this.updateCookie(setting.value);
        console.log('[BilibiliService] Config loaded from DB');
      }
    } catch (e) {
      console.warn('[BilibiliService] Failed to load config from DB', e);
    }
  }
  
  /**
   * [Fix] 动态更新 Cookie (合并模式)
   * 确保登录 Cookie (SESSDATA) 和指纹 Cookie (buvid3) 共存
   */
  public updateCookie(cookieStr: string) {
    if (cookieStr) {
      let cleanCookie = cookieStr.trim();
      
      // 检测：如果登录 Cookie 中丢失了指纹，手动补全
      // 这是解决 412 错误的关键
      if (!cleanCookie.includes('buvid3=')) {
        // 确保分隔符正确
        const separator = this.defaultCookies.trim().endsWith(';') ? ' ' : '; ';
        cleanCookie = `${this.defaultCookies}${separator}${cleanCookie}`;
      }
      
      this.client.defaults.headers['Cookie'] = cleanCookie;
      
      // 重置 WBI Key 缓存，确保使用新用户的密钥
      this.wbiImgKey = null;
      this.wbiSubKey = null;
      console.log('[BilibiliService] ✅ 用户 Cookie 已注入 (指纹已合并)');
    } else {
      console.warn('[BilibiliService] ⚠️ Cookie 为空，服务将以降级模式运行');
    }
  }
  
  /**
   * [新增] 清除 Cookie 并重置指纹
   */
  public clearCookie() {
    // 生成一套新的指纹，模拟全新的游客会话
    const buvid3 = `${crypto.randomUUID()}infoc`;
    const uuid = crypto.randomUUID();
    this.defaultCookies = `buvid3=${buvid3}; _uuid=${uuid}; b_nut=1710000000; home_lang=zh-CN`;
    
    this.client.defaults.headers['Cookie'] = this.defaultCookies;
    this.wbiImgKey = null;
    this.wbiSubKey = null;
    console.log('[BilibiliService] ⚠️ Cookie 已清除，恢复为游客模式');
  }
  
  // --- WBI 签名核心逻辑 ---
  
  private getMixinKey(orig: string): string {
    return MIXIN_KEY_ENC_TAB.map(n => orig[n]).join('').slice(0, 32);
  }
  
  private encWbi(params: Record<string, any>, imgKey: string, subKey: string): Record<string, any> {
    const mixinKey = this.getMixinKey(imgKey + subKey);
    const currTime = Math.round(Date.now() / 1000);
    
    // 1. 注入时间戳
    const newParams = { ...params, wts: currTime };
    
    // 2. 排序 key
    const sortedKeys = Object.keys(newParams).sort();
    
    // 3. 拼接参数字符串
    const queryStr = sortedKeys
    .map(key => {
      const value = newParams[key].toString();
      // 模拟 Python 的 quote_plus (空格转+, 其他转%XX)
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+').replace(/[!'()*]/g, (c) => {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
      return `${key}=${encodedValue}`;
    })
    .join('&');
    
    // 4. 计算签名
    const wbiBody = queryStr + mixinKey;
    const w_rid = crypto.createHash('md5').update(wbiBody).digest('hex');
    
    return { ...newParams, w_rid };
  }
  
  /**
   * 获取 WBI 密钥 (Nav 接口)
   */
  private async getWbiKeys() {
    if (this.wbiImgKey && this.wbiSubKey) return { imgKey: this.wbiImgKey, subKey: this.wbiSubKey };
    
    try {
      const resBody = await this.client.get<any, BiliApiResponse>('/x/web-interface/nav');
      
      // 检查 API 状态 code
      if (resBody.code !== 0) {
        if (resBody.code === -101) {
          console.warn('[BilibiliService] Nav 提示未登录 (-101)，尝试继续读取 wbi_img...');
        } else {
          console.error('[BilibiliService] Nav API Error:', JSON.stringify(resBody));
          throw new Error(`Nav API Failed: Code ${resBody.code}`);
        }
      }
      
      // 检查数据完整性
      if (resBody.data && resBody.data.wbi_img) {
        const { img_url, sub_url } = resBody.data.wbi_img;
        this.wbiImgKey = img_url.split('/').pop()?.split('.')[0] || '';
        this.wbiSubKey = sub_url.split('/').pop()?.split('.')[0] || '';
        // console.log('[BilibiliService] ✅ WBI Keys Refreshed');
        return { imgKey: this.wbiImgKey, subKey: this.wbiSubKey };
      }
      
      console.error('[BilibiliService] ⚠️ 严重: Nav 接口返回数据缺失 wbi_img。', JSON.stringify(resBody).substring(0, 200));
      throw new Error('Failed to parse WBI keys: wbi_img missing');
      
    } catch (e: any) {
      throw e;
    }
  }
  
  // --- 业务方法 ---
  
  /**
   * 搜索视频
   */
  async searchVideos(params: SearchParams): Promise<BiliVideoSnippet[]> {
    const { keyword, page = 1 } = params;
    try {
      const response = await this.client.get<any, BiliApiResponse>('/x/web-interface/search/type', {
        params: {
          keyword,
          search_type: 'video',
          page,
          order: 'totalrank',
          tids: 0,
        }
      });
      
      if (response.code !== 0 && response.code !== 200) {
        console.warn('[BilibiliService] Search API Error:', response);
        return [];
      }
      
      const list = response.data?.result || [];
      return list.map((item: any) => ({
        bvid: item.bvid,
        aid: item.aid,
        title: item.title.replace(/<[^>]+>/g, ''),
        pic: item.pic.startsWith('//') ? `https:${item.pic}` : item.pic,
        author: item.author,
        mid: item.mid,
        duration: item.duration,
        play: item.play,
        pubdate: item.pubdate,
        description: item.description,
      }));
    } catch (error) {
      // 412 errors are caught by interceptor, here we just return empty list to prevent crash
      // console.error('[BilibiliService] Search Failed:', error);
      return [];
    }
  }
  
  /**
   * 深度解析视频 (使用 WBI 签名 + 强制 PC 高画质)
   */
  async resolveVideo(bvid: string): Promise<VideoPlayInfo> {
    try {
      // Step 1: 获取视频详情 (View) -> CID, AID, Pages
      const viewRes = await this.client.get<any, BiliApiResponse>('/x/web-interface/view', { params: { bvid } });
      if (viewRes.code !== 0) throw new Error(`View API Error: ${viewRes.message}`);
      
      const viewData = viewRes.data;
      const cid = viewData.cid;
      const avid = viewData.aid;
      const duration = viewData.duration || 0;
      
      const pages: VideoPage[] = (viewData.pages || []).map((p: any) => ({
        cid: p.cid,
        page: p.page,
        part: p.part,
        duration: p.duration
      }));
      
      // Step 2: 获取 WBI 密钥
      const { imgKey, subKey } = await this.getWbiKeys();
      
      // Step 3: 构造并签名 PlayUrl 参数
      const rawParams = {
        bvid,
        avid,
        cid,
        qn: 0,
        fnval: 4048, // 4048 = DASH (16) | HDR (64) | 4K (128) | 8K (1024)
        fnver: 0,
        fourk: 1,
        platform: 'pc',     // [关键] 声明 PC 平台
        high_quality: 1     // [关键] 强制高画质
      };
      
      const signedParams = this.encWbi(rawParams, imgKey, subKey);
      
      // Step 4: 请求 WBI PlayUrl 接口
      const playRes = await this.client.get<any, BiliApiResponse>('/x/player/wbi/playurl', {
        params: signedParams
      });
      
      if (playRes.code !== 0) throw new Error(`PlayUrl(WBI) Error: ${playRes.message}`);
      
      // Step 5: 数据清洗 (DASH 解析)
      const dash = playRes.data?.dash;
      const qualities: VideoQuality[] = [];
      const audioQualities: AudioQuality[] = [];
      
      if (dash && dash.video) {
        const supportFormats = playRes.data.support_formats || [];
        
        supportFormats.forEach((fmt: any) => {
          const relatedStreams = dash.video.filter((v: any) => v.id === fmt.quality);
          
          const streams: VideoStreamInfo[] = relatedStreams.map((s: any) => {
            let codec = 'Unknown';
            if (s.codecid === 7) codec = 'AVC';
            else if (s.codecid === 12) codec = 'HEVC';
            else if (s.codecid === 13) codec = 'AV1';
            
            // 预估大小: bandwidth(bps) * duration / 8
            const size = Math.floor((s.bandwidth * duration) / 8);
            
            return {
              codec,
              resolution: `${s.width}x${s.height}`,
              fps: s.frameRate,
              bitrate: Math.floor(s.bandwidth / 1000), // kbps
              size
            };
          });
          
          // 去重: 保留同编码下码率最高的
          const codecMap = new Map<string, VideoStreamInfo>();
          streams.forEach(s => {
            const existing = codecMap.get(s.codec);
            if (!existing || s.bitrate > existing.bitrate) {
              codecMap.set(s.codec, s);
            }
          });
          
          if (codecMap.size > 0) {
            qualities.push({
              id: fmt.quality,
              label: fmt.new_description,
              streams: Array.from(codecMap.values()).sort((a, b) => {
                const score = (c: string) => c === 'HEVC' ? 3 : c === 'AV1' ? 2 : 1;
                return score(b.codec) - score(a.codec);
              }),
              codecs: Array.from(codecMap.keys()),
              isVip: false
            });
          }
        });
      }
      
      if (dash && dash.audio) {
        if (dash.flac && dash.flac.audio) audioQualities.push({ id: 30250, label: 'Hi-Res 无损' });
        if (dash.dolby && dash.dolby.audio) audioQualities.push({ id: 30251, label: '杜比全景声' });
        audioQualities.push({ id: 30280, label: '高码率音频' });
      }
      
      return {
        bvid: viewData.bvid,
        cid,
        title: viewData.title,
        cover: viewData.pic,
        duration,
        pubdate: viewData.pubdate,
        owner: { name: viewData.owner.name, mid: viewData.owner.mid, face: viewData.owner.face },
        pages,
        qualities,
        audioQualities
      };
      
    } catch (error) {
      console.error('[BilibiliService] Resolve Failed:', error);
      throw error;
    }
  }
}

export const bilibiliService = new BilibiliService();
