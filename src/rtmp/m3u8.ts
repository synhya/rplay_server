import path from "node:path";
import { uploadFileToBucket as uploadFileAndGetSignedUrl } from "@/lib/aws";
import fs from "node:fs";
// @ts-ignore
import { Parser } from "m3u8-parser";
import { ensureFileExists } from "@/lib/utils";

export const baseDirectory = "./media/live";
const maxSegments = 7;

export const onHlsAddEvent = async (filePath: string) => {
  if (!filePath.endsWith(".ts")) return;

  const streamPath = path.relative(baseDirectory, filePath); // id/index.ts(m3u8)
  const streamDirectory = streamPath.split(path.sep)[0]; // id
  const originalPlaylistPath = path.join(baseDirectory, streamDirectory, "index.m3u8");
  const signedPlaylistPath = path.join(baseDirectory, streamDirectory, "track.m3u8");

  ensureFileExists(signedPlaylistPath);

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

  if (originalPlaylist.mediaSequence > signedPlaylist.mediaSequence || !signedPlaylist.mediaSequence) {
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
};


// m3u8 파일 직렬화 함수
const generateM3u8 = (playlist: any) => {
  const lines = [];

  lines.push('#EXTM3U');
  lines.push(`#EXT-X-VERSION:${playlist.version || 3}`);
  lines.push(`#EXT-X-TARGETDURATION:${playlist.targetDuration}`);
  lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequence}`);

  playlist.segments.forEach((segment: any) => {
    lines.push(`#EXTINF:${segment.duration},`);
    if (segment.programDateTime) {
      lines.push(`#EXT-X-PROGRAM-DATE-TIME:${segment.programDateTime}`);
    }
    lines.push(segment.uri);
  });

  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n');
};