import path from 'path';
import { META_DIR, IMAGE_DIR } from '../config';

export function libPath(p?: string | null) {
  return (p && `http://localhost:3000/lib/${p}`) || undefined;
}

export function metaPath(id: string) {
  return path.resolve(META_DIR, `${id}.json`);
}

export function imagePath(id: string) {
  return path.resolve(IMAGE_DIR, `${id}`);
}
