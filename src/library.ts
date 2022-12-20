import path from 'path';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import { queue } from './queue';
import { CACHE_DIR } from './config';
import { metaPath } from './utils/path';
import { hash } from './utils/hash';
import cleanImages from './jobs/cleanImages';
import removeImage from './jobs/removeImage';
import cleanMeta from './jobs/cleanMeta';
import ensureMeta from './jobs/ensureMeta';
import removeMeta from './jobs/removeMeta';
import ensureTrackMeta from './jobs/ensureTrackMeta';

const MUSIC_TYPES = ['m4a', 'mp3'];
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_NAMES = ['cover', 'poster', 'backdrop'];

export type MetadataArtist = {
  name: string;
};

export type MetadataAlbum = {
  title: string;
};

export type MetadataTrack = {
  title: string;
  genre: string[];
  artist: string[];
  albumArtist: string[];
  duration: number;
  bitRate: number;
  track: number;
  disc?: number;
};

export type LibraryItem = {
  id: string;
  type: LibraryItemType;
  parent?: string;
  name: string;
  path: string;
  children?: string[];
};

export type LibraryItemWithMeta<MetaType> = LibraryItem & {
  meta?: MetaType;
};

export type LibraryItemArtist = LibraryItemWithMeta<MetadataArtist>;
export type LibraryItemAlbum = LibraryItemWithMeta<MetadataAlbum>;
export type LibraryItemTrack = LibraryItemWithMeta<MetadataTrack>;

export type LibraryItemTypes = {
  artist: LibraryItemArtist;
  album: LibraryItemAlbum;
  track: LibraryItemTrack;
  image: LibraryItem;
  mbid: LibraryItem;
};

export type LibraryItemType = keyof LibraryItemTypes;

const library: { [id: string]: LibraryItem } = {};
let metadataCache: { [id: string]: any } = {};

function isType(p: string, types: string[]) {
  return types.map((t) => `.${t}`).includes(path.extname(p));
}

export function hasItem(id: string): Boolean {
  return !!library[id];
}

export function getItem(id: string): LibraryItem | null {
  return library[id] || null;
}

export function getItemType<T extends keyof LibraryItemTypes>(
  id: string,
  type: T
): LibraryItemTypes[T] | null {
  const libraryItem = library[id];
  if (libraryItem && libraryItem.type === type)
    return libraryItem as LibraryItemTypes[T];
  return null;
}

function add(newItem: LibraryItem) {
  const parent = newItem.parent ? getItem(newItem.parent) : null;

  if (!hasItem(newItem.id)) {
    console.log(`Adding ${newItem.type} to library`, newItem.path);
  } else {
    console.log(`Updating ${newItem.type} in library`, newItem.path);
  }

  library[newItem.id] = { ...newItem, path: newItem.path };

  if (parent) {
    if (!parent.children) parent.children = [];
    if (!parent.children.includes(newItem.id)) parent.children.push(newItem.id);
  }

  switch (newItem.type) {
    case 'track':
      queue(ensureTrackMeta(newItem));
      break;
    case 'mbid':
      queue(ensureMeta(newItem));
      break;
  }
}

function remove(id: string, parentId?: string) {
  const item = getItem(id);
  const parent = parentId ? getItem(parentId) : null;

  if (item) {
    if (item.type === 'mbid' && parent) {
      queue(removeMeta(parent.id));
    }

    if (item.type === 'image') {
      queue(removeImage(item.id));
    }

    queue(removeMeta(item.id));

    console.log(`Removing ${id} from library`);
    delete library[id];
  }

  if (parent && parent.children) {
    parent.children = parent.children.filter((c) => c !== id);
  }
}

export function items() {
  return Object.values(library);
}

export function item(id: string): LibraryItem | null {
  return library[id] || null;
}

export async function artist(id: string) {
  const item = getItemType(id, 'artist');
  return item && attachMetadata(item);
}

export async function album(id: string) {
  const item = getItemType(id, 'album');
  return item && attachMetadata(item);
}

export async function track(id: string) {
  const item = getItemType(id, 'track');
  return item && attachMetadata(item);
}

export async function image(id: string) {
  const item = getItemType(id, 'image');
  return item && attachMetadata(item);
}

export function filteredItems<T extends keyof LibraryItemTypes>(
  type: T
): LibraryItemTypes[T][] {
  return items().filter((i) => i.type === type);
}

export async function allAlbums() {
  return await attachMetadataMultiple(filteredItems('album'));
}

export async function allArtists() {
  return await attachMetadataMultiple(filteredItems('artist'));
}

export function allMbid() {
  return filteredItems('mbid');
}

export function children(parent: LibraryItem): LibraryItem[] {
  return (parent.children || [])
    .filter((c) => !!library[c])
    .map((c) => ({ ...library[c] }));
}

export function filteredChildren(parent: LibraryItem, type: LibraryItemType) {
  return children(parent).filter((c) => c.type === type);
}

export async function albums(parent: LibraryItem) {
  return await attachMetadataMultiple(
    filteredChildren(parent, 'album') as LibraryItemAlbum[]
  );
}

export async function tracks(parent: LibraryItem) {
  return await attachMetadataMultiple(
    filteredChildren(parent, 'track') as LibraryItemTrack[]
  );
}

export function images(parent: LibraryItem) {
  return filteredChildren(parent, 'image');
}

export function clearMetadataCache() {
  // metadataCache = {};
}

export function cacheMetadata(libItem: LibraryItem, meta: any) {
  metadataCache[libItem.id] = meta;
}

export async function attachMetadata<T extends LibraryItemWithMeta<any>>(
  item: T
) {
  const metaP = metaPath(item.id);
  if (metadataCache[item.id]) {
    // console.log('getting meta from cache', item.type, item.id);
    return { ...item, meta: metadataCache[item.id] };
  } else if (await fs.pathExists(metaP)) {
    // console.log('gtting meta from file', item.type, item.id);
    const metaData = await fs.readJSON(metaP);
    metadataCache[item.id] = metaData;
    return { ...item, meta: metaData };
  }
  return { ...item };
}

export async function attachMetadataMultiple<
  T extends LibraryItemWithMeta<any>
>(items: T[]) {
  const resItems: T[] = [];
  for (const item of items) {
    resItems.push(await attachMetadata(item));
  }
  return resItems;
}

export async function init(dir: string) {
  await fs.ensureDir(CACHE_DIR);

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
          add({
            id: hash(filePath),
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
            add({
              id: hash(filePath),
              type: 'image',
              name: name,
              parent: hash(path.dirname(filePath)),
              path: filePath,
            });
        }

        if (
          (pathParts.length === 3 || pathParts.length === 2) &&
          path.basename(filePath) === 'mbid'
        ) {
          add({
            id: hash(filePath),
            type: 'mbid',
            name: 'mbid',
            parent: hash(path.dirname(filePath)),
            path: filePath,
          });
        }
      })
      .on('unlink', (filePath) => {
        remove(hash(filePath), hash(path.dirname(filePath)));
      })
      .on('ready', async () => {
        queue(cleanImages);
        queue(cleanMeta);
        console.log('Initial library scan complete.');
        resolve(library);
      })
      // Handle change event?
      .on('error', reject);
  });
}
