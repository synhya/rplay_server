import fs from 'node:fs';

export const ensureFileExists = (filePath: string, defaultContent = '') => {
  if (!fs.existsSync(filePath)) {
    // 파일 생성
    fs.writeFileSync(filePath, defaultContent, 'utf8');
    console.log(`파일이 존재하지 않아 새로 생성되었습니다: ${filePath}`);
  }
};