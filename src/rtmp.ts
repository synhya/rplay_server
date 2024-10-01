import md5 from "md5";
import NodeMediaServer from "node-media-server";

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: "./media",
    allow_origin: "*",
  },
  trans: {
    ffmpeg:
      process.env.NODE_ENV === "production"
        ? "/usr/local/bin/ffmpeg"
        : "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=1:hls_list_size=100:hls_flags=delete_segments]",
        // dash: true,
        // dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
      },
    ],
  },
  // auth: {
  //   play: true,
  //   publish: true,
  //   secret: process.env.RTMP_SECRET,
  // },
});

// 오늘부터 일주일 뒤까지만 유효한 URL을 생성
const expireTime = Date.now() + 60 * 60 * 24 * 7 * 1000;
const keyString = `/live/stream-${expireTime}-${process.env.RTMP_SECRET}`;
console.log(`sign=${expireTime}-${md5(keyString)}`);

export { nms };
