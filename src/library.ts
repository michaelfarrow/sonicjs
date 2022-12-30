import path from 'path';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import jobsQueue from '@/jobs';
import scanQueue from '@/scanner';
import { CACHE_DIR, LIBRARY_PATH } from '@/config';
import cleanImages from '@/jobs/cleanImages';
import cleanMeta from '@/jobs/cleanMeta';
import ensureArtist from './jobs/ensureArtist';
import ensureAlbum from './jobs/ensureAlbum';
import ensureTrack from './jobs/ensureTrack';
import ensureMeta from '@/jobs/ensureMeta';
import ensureTrackMeta from '@/jobs/ensureTrackMeta';
import ensureImage from '@/jobs/ensureImage';
import removeItem from '@/jobs/removeItem';

const MUSIC_TYPES = ['m4a', 'mp3'];
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_NAMES = ['cover', 'poster'];

export type LibraryItem = {
  type: LibraryItemType;
  parent: string;
  name: string;
  path: string;
};

export type LibraryItemType = 'artist' | 'album' | 'track' | 'image' | 'mbid';

function isType(p: string, types: string[]) {
  return types.map((t) => `.${t}`).includes(path.extname(p));
}

async function add(item: LibraryItem) {
  switch (item.type) {
    case 'artist':
      jobsQueue.push(ensureArtist(item));
      break;
    case 'album':
      jobsQueue.push(ensureAlbum(item));
      break;
    case 'track':
      jobsQueue.push(ensureTrack(item));
      scanQueue.push(ensureTrackMeta(item));
      break;
    case 'mbid':
      scanQueue.push(ensureMeta(item));
      break;
    case 'image':
      jobsQueue.push(ensureImage(item));
      break;
  }
}

function remove(p: string) {
  jobsQueue.push(removeItem(p));
}

export async function initLibrary() {
  await fs.ensureDir(CACHE_DIR);

  const watchDir = path.resolve(LIBRARY_PATH);

  const relPath = (p: string) => {
    return p.substring(watchDir.length + 1);
  };

  const onAddChange = (filePath: string) => {
    const parentDir = path.dirname(filePath);
    const relativePath = relPath(filePath);
    const pathParts = relativePath.split(/\//);

    if (pathParts.length === 3 && isType(filePath, MUSIC_TYPES)) {
      add({
        type: 'track',
        name: path.basename(pathParts[2], path.extname(pathParts[2])),
        parent: parentDir,
        path: filePath,
      });
    }

    if (
      (pathParts.length === 3 || pathParts.length === 2) &&
      isType(filePath, IMAGE_TYPES)
    ) {
      const lastPathPart = pathParts[pathParts.length - 1];
      const name = path.basename(lastPathPart, path.extname(lastPathPart));

      if (IMAGE_NAMES.includes(name)) {
        add({
          type: 'image',
          name: name,
          parent: parentDir,
          path: filePath,
        });
      }
    }

    if (
      (pathParts.length === 3 || pathParts.length === 2) &&
      path.basename(filePath) === 'mbid'
    ) {
      add({
        type: 'mbid',
        name: 'mbid',
        parent: parentDir,
        path: filePath,
      });
    }
  };

  return new Promise((resolve, reject) => {
    chokidar
      .watch(watchDir, {
        depth: 2,
        ignored: /\/db\..*?$/,
      })
      .on('addDir', (dirPath) => {
        if (dirPath === watchDir) return;

        const parentDir = path.dirname(dirPath);
        const relativePath = relPath(dirPath);
        const pathParts = relativePath.split(/\//);

        if (pathParts.length === 1) {
          // Artist
          add({
            type: 'artist',
            name: pathParts[0],
            path: dirPath,
            parent: '',
          });
        } else if (pathParts.length === 2) {
          // Album
          add({
            type: 'album',
            parent: parentDir,
            name: pathParts[1],
            path: dirPath,
          });
        }
      })
      .on('add', onAddChange)
      .on('change', onAddChange)
      .on('unlinkDir', remove)
      .on('unlink', remove)
      .on('ready', async () => {
        // queue(cleanImages);
        // queue(cleanMeta);
        console.log('initial library scan complete.');

        if (jobsQueue.length) {
          jobsQueue.start();
          jobsQueue.on('end', () => {
            scanQueue.start();
          });
        } else {
          jobsQueue.start();
          scanQueue.start();
        }
        resolve(true);
      })
      // Handle change event?
      .on('error', reject);
  });
}
