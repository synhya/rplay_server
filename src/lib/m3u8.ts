// m3u8 파일 직렬화 함수
export const generateM3u8 = (playlist: any) => {
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