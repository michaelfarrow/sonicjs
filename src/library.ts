import path from 'path';
import chokidar from 'chokidar';
import { v5 as uuidv5 } from 'uuid';

const MUSIC_TYPES = ['m4a', 'mp3'];
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_NAMES = ['cover', 'poster', 'backdrop'];

const UUID_NAMESPACE = '9933e1a5-ee79-4e15-be29-bf7d49de728d';

export type LibraryItemType = 'album' | 'artist' | 'track' | 'image';

export type LibraryItem = {
  type: LibraryItemType;
  parent?: string;
  name: string;
  path: string;
  children?: string[];
};

let library: { [id: string]: LibraryItem } = {};

function isType(p: string, types: string[]) {
  return types.map((t) => `.${t}`).includes(path.extname(p));
}

function hash(str: string) {
  return uuidv5(str, UUID_NAMESPACE);
}

function hasItem(id: string): Boolean {
  return !!library[id];
}

function getItem(id: string): LibraryItem | null {
  return library[id] || null;
}

export function items() {
  return Object.entries(library);
}

export function item(id: string, type?: LibraryItemType): LibraryItem | null {
  const found = library[id] || null;
  return type ? (found?.type === type ? found : null) : found;
}

export function allAlbums() {
  return items().filter(([id, i]) => i.type === 'album');
}

export function allArtists() {
  return items().filter(([id, i]) => i.type === 'artist');
}

export function children(
  parent: LibraryItem
): ({ id: string } & LibraryItem)[] {
  return (parent.children || [])
    .filter((c) => !!library[c])
    .map((c) => ({ id: c, ...library[c] }));
}

export function albums(parent: LibraryItem) {
  return children(parent).filter((c) => c.type === 'album');
}

export function tracks(parent: LibraryItem) {
  return children(parent).filter((c) => c.type === 'track');
}

export function images(parent: LibraryItem) {
  return children(parent).filter((c) => c.type === 'image');
}

export function init(dir: string) {
  const watchDir = path.resolve(dir);

  function normalisePath(p: string) {
    return p;
    // return p.substring(watchDir.length + 1);
  }

  function add(id: string, newItem: LibraryItem) {
    const parent = newItem.parent ? getItem(newItem.parent) : null;

    if (!hasItem(id)) {
      console.log(
        `Adding ${newItem.type} to library`,
        normalisePath(newItem.path)
      );
    } else {
      console.log(
        `Updating ${newItem.type} in library`,
        normalisePath(newItem.path)
      );
    }

    library[id] = { ...newItem, path: normalisePath(newItem.path) };

    if (parent) {
      if (!parent.children) parent.children = [];
      if (!parent.children.includes(id)) parent.children.push(id);
    }
  }

  function remove(id: string, parentId?: string) {
    const parent = parentId ? getItem(parentId) : null;

    if (hasItem(id)) {
      console.log(`Removing ${id} from library`);
      delete library[id];
    }

    if (parent && parent.children) {
      parent.children = parent.children.filter((c) => c !== id);
    }
  }

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
          add(id, {
            type: 'artist',
            name: pathParts[0],
            path: dirPath,
          });
        } else if (pathParts.length === 2) {
          // Album
          add(id, {
            type: 'album',
            parent: hash(path.dirname(dirPath)),
            name: pathParts[1],
            path: dirPath,
          });
        }
      })
      .on('unlinkDir', (dirPath) => {
        if (dirPath === watchDir) return;

        const relativePath = dirPath.substring(watchDir.length + 1);
        const pathParts = relativePath.split(/\//);

        const id = hash(dirPath);

        if (pathParts.length === 1) {
          remove(id);
        } else if (pathParts.length > 1) {
          remove(id, hash(path.dirname(dirPath)));
        }
      })
      .on('add', (filePath) => {
        const relativePath = filePath.substring(watchDir.length + 1);
        const pathParts = relativePath.split(/\//);

        if (pathParts.length === 3 && isType(filePath, MUSIC_TYPES)) {
          add(hash(filePath), {
            type: 'track',
            name: path.basename(pathParts[2], path.extname(pathParts[2])),
            parent: hash(path.dirname(filePath)),
            path: filePath,
          });
        }

        if (
          (pathParts.length === 3 || pathParts.length === 2) &&
          isType(filePath, IMAGE_TYPES)
        ) {
          const lastPathPart = pathParts[pathParts.length - 1];
          const name = path.basename(lastPathPart, path.extname(lastPathPart));

          IMAGE_NAMES.includes(name) &&
            add(hash(filePath), {
              type: 'image',
              name: name,
              parent: hash(path.dirname(filePath)),
              path: filePath,
            });
        }
      })
      .on('unlink', (filePath) => {
        remove(hash(filePath), hash(path.dirname(filePath)));
      })
      .on('ready', () => {
        console.log('Initial library scan complete.');
        resolve(library);
      })
      // Handle change event?
      .on('error', reject);
  });
}
