import fs from 'fs-extra';
import klaw from 'klaw';
import path from 'path';
import { hasItem } from '../library';
import { META_DIR } from '../config';

function getFiles(): Promise<string[]> {
  const items: string[] = [];
  return new Promise((resolve, reject) => {
    klaw(META_DIR, { depthLimit: 0 })
      .on('data', (item) => {
        if (path.extname(item.path) === '.json') {
          items.push(item.path);
        }
      })
      .on('end', () => resolve(items))
      .on('error', reject);
  });
}

const cleanMeta = async () => {
  const files = await getFiles();

  for (const file of files) {
    const id = path.basename(file, path.extname(file));
    if (!hasItem(id)) await fs.unlink(file);
  }

  return true;
};

export default cleanMeta;
