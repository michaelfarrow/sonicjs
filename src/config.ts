import path from 'path';

export const CACHE_DIR = path.resolve(__dirname, '.cache');
export const META_DIR = path.resolve(CACHE_DIR, 'metadata');
export const IMAGE_DIR = path.resolve(CACHE_DIR, 'images');
