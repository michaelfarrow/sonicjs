import path from 'path';
import { LIBRARY_PATH, IMAGE_DIR } from '../config';

export function imagePath(id: string) {
  return path.resolve(IMAGE_DIR, `${id}`);
}

export function libraryPath(p: string) {
  return path.resolve(LIBRARY_PATH, p);
}

export function libraryPathRel(p: string) {
  return p.indexOf(LIBRARY_PATH) === 0
    ? p.substring(LIBRARY_PATH.length + 1)
    : p;
}
