import fs from 'fs-extra';
import { imagePath } from '../utils/path';

export default function removeImage(id: string) {
  return async () => {
    const imageP = imagePath(id);
    if (
      (await fs.pathExists(imageP)) &&
      (await fs.stat(imageP)).isDirectory()
    ) {
      await fs.remove(imageP);
    }
    return true;
  };
}
