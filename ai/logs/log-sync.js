import fs from 'fs';
import path from 'path';

export function syncLogs(targetPath) {
  const logDir = path.resolve('src/ai/logs');
  const files = fs.readdirSync(logDir);

  files.forEach(file => {
    const src = path.join(logDir, file);
    const dest = path.join(targetPath, file);
    fs.copyFileSync(src, dest);
  });

  return true;
}
