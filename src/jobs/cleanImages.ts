import fs from 'fs-extra';
import klaw from 'klaw';
import path from 'path';
import { hasItem } from '../library';
import { IMAGE_DIR } from '../config';

function getDirs(): Promise<string[]> {
  const items: string[] = [];
  return new Promise((resolve, reject) => {
    klaw(IMAGE_DIR, { depthLimit: 0 })
      .on('data', (item) => {
        if (item.stats.isDirectory() && item.path !== path.resolve(IMAGE_DIR)) {
          items.push(item.path);
        }
      })
      .on('end', () => resolve(items))
      .on('error', () => resolve([])); // TODO: Handle errors properly
  });
}

const cleanImages = async () => {
  const dirs = await getDirs();

  for (const dir of dirs) {
    const id = path.basename(dir);
    if (!hasItem(id)) await fs.remove(dir);
  }

  return true;
};

export default cleanImages;
