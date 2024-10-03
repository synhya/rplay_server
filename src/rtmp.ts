import md5 from "md5";
import NodeMediaServer from "node-media-server";
import { connect as connectdb } from "./db";
import { StreamModel } from "./db/streamHistory";
import { UserModel } from "./db/userModel";

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
        : "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg.exe",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=1:hls_list_size=20:hls_flags=delete_segments]",
        // dash: true,
        // dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
      },
    ],
  },
  auth: {
    play: true,
    publish: true,
    secret: process.env.RTMP_SECRET,
  },
});

// 오늘부터 일주일 뒤까지만 유효한 URL을 생성
const username = "synhya";
const expireTime = Date.now() + 60 * 60 * 24 * 7 * 1000;
const keyString = `/live/${username}-${expireTime}-${process.env.RTMP_SECRET}`;
console.log(`sign=${expireTime}-${md5(keyString)}`);

connectdb().then(() => nms.run());

// nms.on('preConnect', (id, args) => {
//   console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
//   // let session = nms.getSession(id);
//   // session.reject();
// });

// nms.on('postConnect', (id, args) => {
//   console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
// });

nms.on("doneConnect", (id, args) => {
  console.log("[NodeEvent on doneConnect]", `id=${id} args=${JSON.stringify(args)}`);

  // 방송 중단시에 로그기록
});

nms.on("prePublish", (id, StreamPath, args) => {
  console.log("[NodeEvent on prePublish]", `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPublish", async (id, StreamPath, args) => {
  console.log("[NodeEvent on postPublish]", `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  // // /live/synhya
  // const user = await UserModel.findOne({ name: StreamPath.split('/')[2] }).exec();

  // if (!user) {
  //   console.error('User not found');
  //   return;
  // }

  // StreamModel.updateOne({ user: user._id }, { current: { streamId: id, startedAt: new Date() } }).exec();
});

// nms.on('donePublish', (id, StreamPath, args) => {
//   console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
// });

// nms.on('prePlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
//   // let session = nms.getSession(id);
//   // session.reject();
// });

// nms.on('postPlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
// });

// nms.on('donePlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
// });

// nms.on('logMessage', (...args) => {
//   // custom logger log message handler
// });

// nms.on('errorMessage', (...args) => {
//   // custom logger error message handler

//   // 에러시 로그기록
// });

// nms.on('debugMessage', (...args) => {
//   // custom logger debug message handler
// });

// nms.on('ffDebugMessage', (...args) => {
//   // custom logger ffmpeg debug message handler
// });
