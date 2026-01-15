import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '@/config/app.config';
import { BiliVideoSnippet, SearchParams, VideoPlayInfo, VideoQuality, AudioQuality, VideoPage, VideoStreamInfo } from '@repo/shared';
import crypto from 'crypto';

interface BiliApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data?: T;
}

export class BilibiliService {
  private client: AxiosInstance;
  
  constructor() {
    // 构造仿真浏览器指纹，避免 412
    const buvid3 = `${crypto.randomUUID()}infoc`;
    const uuid = crypto.randomUUID();
    
    this.client = axios.create({
      baseURL: AppConfig.BILI_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        'Cookie': `buvid3=${buvid3}; _uuid=${uuid}; b_nut=1710000000; home_lang=zh-CN`,
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
          console.error(`[BilibiliService] ⚠️ 风控拦截 (412): ${url} - 请尝试在设置页扫码登录`);
        } else {
          console.error(`[BilibiliService] Request Failed (${status}): ${url}`);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 动态更新 Cookie (登录后调用)
   */
  public updateCookie(cookieStr: string) {
    if (cookieStr) {
      // 移除可能存在的换行符，确保 Header 合法
      const cleanCookie = cookieStr.trim();
      this.client.defaults.headers['Cookie'] = cleanCookie;
      console.log('[BilibiliService] ✅ 用户 Cookie 已注入，解析将包含会员/高画质信息');
    } else {
      console.warn('[BilibiliService] ⚠️ Cookie 为空，将以降级(游客)模式运行');
    }
  }
  
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
      throw error;
    }
  }
  
  /**
   * 深度解析视频 (v0.6.2)
   * 获取元数据、分P信息、以及详细的流信息(DASH)
   */
  async resolveVideo(bvid: string): Promise<VideoPlayInfo> {
    try {
      // Step 1: 获取视频详情 (View) 以拿到 CID 和 Pages
      const viewRes = await this.client.get<any, BiliApiResponse>('/x/web-interface/view', { params: { bvid } });
      if (viewRes.code !== 0) throw new Error(`View API Error: ${viewRes.message}`);
      
      const viewData = viewRes.data;
      // 默认使用 P1 的 CID 进行流解析
      const cid = viewData.cid;
      // 视频时长 (秒)
      const duration = viewData.duration || 0;
      
      // 提取分P列表
      const pages: VideoPage[] = (viewData.pages || []).map((p: any) => ({
        cid: p.cid,
        page: p.page,
        part: p.part,
        duration: p.duration
      }));
      
      // Step 2: 获取播放流信息 (PlayUrl)
      // fnval: 4048 = 16(dash) | 64(hdr) | 128(4k) | 256(dolby) | 2048(dolby_vision) | 1024(8k)
      // [Fix]: 增加 platform: 'pc', high_quality: 1 以获取高画质
      const playRes = await this.client.get<any, BiliApiResponse>('/x/player/playurl', {
        params: {
          bvid,
          cid,
          qn: 127, // 请求最高画质
          fnval: 4048,
          fnver: 0,
          fourk: 1,
          platform: 'pc',
          high_quality: 1
        }
      });
      
      if (playRes.code !== 0) throw new Error(`PlayUrl API Error: ${playRes.message}`);
      
      const dash = playRes.data?.dash;
      const qualities: VideoQuality[] = [];
      const audioQualities: AudioQuality[] = [];
      
      // 解析 DASH 视频流
      if (dash && dash.video) {
        // support_formats 提供了所有可用清晰度的概览
        const supportFormats = playRes.data.support_formats || [];
        
        supportFormats.forEach((fmt: any) => {
          // 在 dash.video 中找到该清晰度对应的所有流 (不同编码)
          const relatedStreams = dash.video.filter((v: any) => v.id === fmt.quality);
          
          const streams: VideoStreamInfo[] = relatedStreams.map((s: any) => {
            let codec = 'Unknown';
            if (s.codecid === 7) codec = 'AVC';
            else if (s.codecid === 12) codec = 'HEVC';
            else if (s.codecid === 13) codec = 'AV1';
            
            // 预估大小: bandwidth (bps) * duration / 8
            // 注意: s.bandwidth 是 bits per second
            const size = Math.floor((s.bandwidth * duration) / 8);
            
            return {
              codec,
              resolution: `${s.width}x${s.height}`,
              fps: s.frameRate,
              bitrate: Math.floor(s.bandwidth / 1000), // kbps
              size
            };
          });
          
          // 去重策略: 有时 B 站会返回多个相同编码的流 (如备用线路)，只保留码率最高的
          const uniqueStreams: VideoStreamInfo[] = [];
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
                // 排序优先级: HEVC > AV1 > AVC
                const score = (c: string) => c === 'HEVC' ? 3 : c === 'AV1' ? 2 : 1;
                return score(b.codec) - score(a.codec);
              }),
              codecs: Array.from(codecMap.keys()), // 简略列表
              isVip: false
            });
          }
        });
      }
      
      // 解析音频流
      if (dash && dash.audio) {
        if (dash.flac && dash.flac.audio) {
          audioQualities.push({ id: 30250, label: 'Hi-Res 无损' });
        }
        if (dash.dolby && dash.dolby.audio && dash.dolby.audio.length > 0) {
          audioQualities.push({ id: 30251, label: '杜比全景声' });
        }
        // 基础音频 (通常取列表第一个为最高音质)
        audioQualities.push({ id: 30280, label: '高码率音频' });
      }
      
      return {
        bvid: viewData.bvid,
        cid: cid,
        title: viewData.title,
        cover: viewData.pic,
        duration: duration,
        pubdate: viewData.pubdate,
        owner: {
          name: viewData.owner.name,
          mid: viewData.owner.mid,
          face: viewData.owner.face
        },
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
