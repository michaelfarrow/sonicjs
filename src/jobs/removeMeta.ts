import fs from 'fs-extra';
import { metaPath } from '../utils/path';

export default function removeMeta(id: string) {
  return async () => {
    const metaP = metaPath(id);
    if (await fs.pathExists(metaP)) {
      await fs.unlink(metaP);
    }
    return true;
  };
}
