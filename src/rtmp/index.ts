import { connect as connectdb } from "@/db";
import { StreamModel } from "@/db/streamModel";
import { nms } from "./server";
import { watch } from "chokidar";
import path from "node:path";
import { uploadFileToBucket as uploadFileAndGetSignedUrl } from "@/lib/aws";
import fs from "node:fs";
// @ts-ignore
import { Parser } from "m3u8-parser";
import { generateM3u8 } from "@/lib/m3u8";

connectdb().then(() => nms.run());

const baseDirectory = "./media/live";
const watcher = watch(baseDirectory, {
  ignored: /(^|[\/\\])\../,
  ignoreInitial: true,
  persistent: true,
  depth: 2,
});

const maxSegments = 7;

watcher
  .on("add", async (filePath) => {
    console.log("File added: ", filePath);
    if (!filePath.endsWith(".ts")) return;

    const streamPath = path.relative(baseDirectory, filePath); // id/index.ts(m3u8)
    const streamDirectory = streamPath.split(path.sep)[0]; // id
    const originalPlaylistPath = path.join(baseDirectory, streamDirectory, "index.m3u8");
    const signedPlaylistPath = path.join(baseDirectory, streamDirectory, "track.m3u8");

    // 원본 m3u8 파일과 서명된 m3u8 파일 읽기
    const originalContent = fs.readFileSync(originalPlaylistPath, "utf8");
    const signedContent = fs.readFileSync(signedPlaylistPath, "utf8");

    // m3u8 파서로 원본과 서명된 파일 파싱
    const originalParser = new Parser();
    originalParser.push(originalContent);
    originalParser.end();

    const signedParser = new Parser();
    signedParser.push(signedContent);
    signedParser.end();

    const originalPlaylist = originalParser.manifest;
    const signedPlaylist = signedParser.manifest;

    if (originalPlaylist.mediaSequence > signedPlaylist.mediaSequence) {
      if (signedPlaylist.segments.length >= maxSegments) {
        signedPlaylist.segments.shift();
      }

      const signedUrl = await uploadFileAndGetSignedUrl(filePath);

      console.log("Uploaded file: ", signedUrl);

      const newSegment = {
        duration: originalPlaylist.segments[originalPlaylist.segments.length - 1].duration,
        uri: signedUrl,
        programDateTime: new Date().toISOString(),
      };
      signedPlaylist.segments.push(newSegment);

      // EXT-X-MEDIA-SEQUENCE 값도 갱신
      signedPlaylist.mediaSequence = originalPlaylist.mediaSequence;

      // 새로운 m3u8 파일을 직렬화하여 track.m3u8로 저장
      const newSignedContent = generateM3u8(signedPlaylist);
      fs.writeFileSync(signedPlaylistPath, newSignedContent, "utf8");
    }
  })
  .on("error", (error) => console.error(`Watcher error: ${error}`));

nms.on("doneConnect", async (id, args) => {
  try {
    console.log("[NodeEvent on doneConnect]", `id=${id} args=${JSON.stringify(args)}`);

    // 방송 중단시에 로그기록
    const stream = await StreamModel.findOneAndUpdate({ "current.streamId": id }, { $unset: { current: 1 } }).exec();

    if (!stream) {
      console.error("Stream not found for id ", id);
      return;
    }

    stream.history.push({
      streamId: id,
      startedAt: stream?.current?.startedAt,
      endedAt: new Date(),
    });
    stream.save();
  } catch (err) {
    console.error(err);
  }
});

nms.on("prePublish", async (id, StreamPath, args) => {
  console.log("[NodeEvent on prePublish]", `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  const streamKey = (args as any)?.sign;
  const session: any = nms.getSession(id);

  if (!streamKey) {
    console.error("Stream key not found");
    session.reject();
    return;
  }

  const stream = await StreamModel.exists({ "streamKey.value": streamKey });

  if (!stream) {
    console.error("Stream not found for key ", streamKey);
    session.reject();
    return;
  }
});

nms.on("postPublish", (id, StreamPath, args) => {
  console.log("[NodeEvent on postPublish]", `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  const streamKey = (args as any)?.sign;
  StreamModel.updateOne({ "streamKey.value": streamKey }, { current: { streamId: id, startedAt: new Date() } }).exec();
});

// nms.on('preConnect', (id, args) => {
//   console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
//   // let session = nms.getSession(id);
//   // session.reject();
// });

// nms.on('postConnect', (id, args) => {
//   console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
// });

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
