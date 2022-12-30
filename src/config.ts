import path from 'path';

export const CACHE_DIR = path.resolve(__dirname, '.cache');
export const IMAGE_DIR = path.resolve(CACHE_DIR, 'images');
export const LIBRARY_PATH = path.resolve(process.env.LIBRARY_PATH || __dirname);

export const IGNORED_ARTICLES = ['The', 'El', 'La', 'Los', 'Las', 'Le', 'Les'];
