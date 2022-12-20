import { parseFile } from 'music-metadata';
import _ from 'lodash';
import fs from 'fs-extra';
import { LibraryItem, MetadataTrack, cacheMetadata } from '../library';
import { metaPath } from '../utils/path';

const splitArtists = (artists: string) => artists.split(/\s*;\s*/g);
const splitGenres = (genres: string) => genres.split(/\s*,\s*/g);

export default function ensureTrackMeta(track: LibraryItem) {
  return async () => {
    const metaP = metaPath(track.id);
    if (!(await fs.pathExists(metaP))) {
      console.log('Looking up track metadata', track.name);
      const meta = await parseFile(track.path);
      const _meta: MetadataTrack = {
        title: meta.common.title || '',
        artist: splitArtists(meta.common.artist || ''),
        albumArtist: splitArtists(meta.common.albumartist || ''),
        genre: _.flatten((meta.common.genre || []).map(splitGenres)),
        duration: meta.format.duration || 0,
        bitRate: meta.format.bitrate || 0,
        track: meta.common.track.no || 0,
        disc: meta.common.disk.no || undefined,
      };
      await fs.outputJSON(metaP, _meta);
      cacheMetadata(track, _meta);
    } else {
      cacheMetadata(track, await fs.readJSON(metaP));
    }
    return true;
  };
}
