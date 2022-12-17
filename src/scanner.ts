import path from 'path';
import chokidar from 'chokidar';
import { v5 as uuidv5 } from 'uuid';

const FILE_TYPES = ['m4a', 'mp3'];
const ALLOWED_EXTENSIONS = FILE_TYPES.map((t) => `.${t}`);
const UUID_NAMESPACE = '9933e1a5-ee79-4e15-be29-bf7d49de728d';

export type LibraryItemType = 'album' | 'artist' | 'track';

export type LibraryItem = {
  id: string;
  type: LibraryItemType;
  parent?: string;
  name: string;
  path: string;
};

let library: LibraryItem[] = [];

function hash(str: string) {
  return uuidv5(str, UUID_NAMESPACE);
}

function getIndex(itemPath: string) {
  return library.findIndex((item) => itemPath === item.path);
}

function add(newItem: LibraryItem) {
  const existingIndex = getIndex(newItem.path);

  if (existingIndex === -1) {
    console.log(`Adding ${newItem.type} to library`, newItem.path);
    library.push(newItem);
  } else {
    console.log(`Updating ${newItem.type} in library`, newItem.path);
    library.splice(existingIndex, 1, newItem);
  }
}

function remove(p: string) {
  const existingIndex = getIndex(p);

  if (existingIndex !== -1) {
    console.log(`Removing ${p} from library`);
    library.splice(existingIndex, 1);
  }
}

export default function scanner(dir: string) {
  const watchDir = path.resolve(dir);

  return new Promise((resolve, reject) => {
    chokidar
      .watch(watchDir, { depth: 2 })
      .on('addDir', (dirPath) => {
        if (dirPath === watchDir) return;

        const id = hash(dirPath);
        const relativePath = dirPath.substring(watchDir.length + 1);
        const pathParts = relativePath.split(/\//);

        if (pathParts.length === 1) {
          // Artist
          add({
            id,
            type: 'artist',
            name: pathParts[0],
            path: dirPath,
          });
        } else if (pathParts.length === 2) {
          // Album
          add({
            id,
            type: 'album',
            parent: hash(path.dirname(dirPath)),
            name: pathParts[1],
            path: dirPath,
          });
        }
      })
      .on('unlinkDir', (dirPath) => {
        if (dirPath === watchDir) return;
        remove(dirPath);
      })
      .on('add', (filePath) => {
        const relativePath = filePath.substring(watchDir.length + 1);
        const pathParts = relativePath.split(/\//);
        if (
          pathParts.length === 3 &&
          ALLOWED_EXTENSIONS.includes(path.extname(filePath))
        ) {
          add({
            id: hash(filePath),
            type: 'track',
            name: path.basename(pathParts[2], path.extname(pathParts[2])),
            parent: hash(path.dirname(filePath)),
            path: filePath,
          });
        }
      })
      .on('unlink', (filePath) => {
        remove(filePath);
      })
      .on('ready', () => {
        console.log('Initial library scan complete.');
        resolve(library);
      })
      .on('error', reject);
  });
}
