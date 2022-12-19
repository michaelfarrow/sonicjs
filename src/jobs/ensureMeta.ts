import fs from 'fs-extra';
import { metaPath } from '../utils/path';
import {
  LibraryItem,
  MetadataArtist,
  MetadataAlbum,
  getItem,
} from '../library';
import mbApi from '../utils/mbApi';

export default function ensureMeta(item: LibraryItem) {
  return async () => {
    const id = await fs.readFile(item.path, 'utf-8');
    const parent = item.parent && getItem(item.parent);

    if (id && parent && ['album', 'artist'].includes(parent.type)) {
      const metaP = metaPath(parent.id);
      const metaFileExists = await fs.pathExists(metaP);
      if (!metaFileExists) {
        console.log('Looking up metadata', parent.name);
        switch (parent.type) {
          case 'artist':
            const infoArtist = await mbApi.lookupArtist(id);
            const metaArtist: MetadataArtist = {
              name: infoArtist.name,
            };
            await fs.outputJSON(metaP, metaArtist);
            break;
          case 'album':
            const infoRelease = await mbApi.lookupRelease(id);
            const metaAlbum: MetadataAlbum = {
              title: infoRelease.title,
            };
            await fs.outputJSON(metaP, metaAlbum, {});
            break;
        }
      }
    }

    return true;
  };
}
