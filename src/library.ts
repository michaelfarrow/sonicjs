import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs-extra';
import scanQueue from '@/scanner';
import { CACHE_DIR, LIBRARY_PATH } from '@/config';
import ensureArtist from '@/jobs/ensureArtist';
import ensureAlbum from '@/jobs/ensureAlbum';
import ensureTrack from '@/jobs/ensureTrack';
import ensureMeta from '@/jobs/ensureMeta';
import ensureTrackMeta from '@/jobs/ensureTrackMeta';
import ensureImage from '@/jobs/ensureImage';
import removeItem from '@/jobs/removeItem';
import cleanup from '@/jobs/cleanup';

const MUSIC_TYPES = ['m4a', 'mp3'];
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_NAMES = ['cover', 'poster'];

let watcher: FSWatcher;
let watchDir = '';

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

async function add(item: LibraryItem, rescan: boolean = false) {
  switch (item.type) {
    case 'artist':
      scanQueue.push(ensureArtist(item));
      break;
    case 'album':
      scanQueue.push(ensureAlbum(item));
      break;
    case 'track':
      scanQueue.push(ensureTrack(item));
      scanQueue.push(ensureTrackMeta(item, rescan));
      break;
    case 'mbid':
      scanQueue.push(ensureMeta(item, rescan));
      break;
    case 'image':
      scanQueue.push(ensureImage(item));
      break;
  }
}

function remove(p: string) {
  scanQueue.push(removeItem(p));
}

function relPath(p: string) {
  return p.substring(watchDir.length + 1);
}

function onAddDir(dirPath: string) {
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
}

function onAddChange(filePath: string, rescan: boolean = false) {
  const parentDir = path.dirname(filePath);
  const relativePath = relPath(filePath);
  const pathParts = relativePath.split(/\//);

  if (pathParts.length === 3 && isType(filePath, MUSIC_TYPES)) {
    add(
      {
        type: 'track',
        name: path.basename(pathParts[2], path.extname(pathParts[2])),
        parent: parentDir,
        path: filePath,
      },
      rescan
    );
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
    add(
      {
        type: 'mbid',
        name: 'mbid',
        parent: parentDir,
        path: filePath,
      },
      rescan
    );
  }
}

export async function initLibrary() {
  await fs.ensureDir(CACHE_DIR);

  watchDir = path.resolve(LIBRARY_PATH);

  return new Promise((resolve, reject) => {
    watcher = chokidar
      .watch(watchDir, {
        depth: 2,
        ignored: /\/db\..*?$/,
        awaitWriteFinish: true,
      })
      .on('addDir', (dir) => onAddDir(dir))
      .on('add', (file) => onAddChange(file))
      .on('change', (file) => onAddChange(file))
      .on('unlinkDir', remove)
      .on('unlink', remove)
      .on('ready', async () => {
        // queue(cleanImages);
        // queue(cleanMeta);
        console.log('initial library scan complete.');

        scanQueue.push(cleanup);

        if (scanQueue.length) {
          scanQueue.start();
          scanQueue.on('end', () => {
            scanQueue.start();
          });
        } else {
          scanQueue.start();
        }

        scanQueue.autostart = true;
        resolve(true);
      })
      // Handle change event?
      .on('error', reject);
  });
}

export function rescan() {
  Object.entries(watcher.getWatched()).forEach(([dir, files]) => {
    onAddDir(dir);
    files.forEach((file) => {
      onAddChange(path.resolve(dir, file), true);
    });
  });
}
