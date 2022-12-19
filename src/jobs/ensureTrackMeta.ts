import { parseFile } from 'music-metadata';
import _ from 'lodash';
import fs from 'fs-extra';
import { LibraryItem, MetadataTrack } from '../library';
import { metaPath } from '../utils/path';

const splitArtists = (artists: string) => artists.split(/\s*;\s*/g);
const splitGenres = (genres: string) => genres.split(/\s*,\s*/g);

export default function ensureTrackMeta(track: LibraryItem) {
  return async () => {
    const metaP = metaPath(track.id);
    if (!fs.pathExists(metaP)) {
      const meta = await parseFile(track.path);
      const _meta: MetadataTrack = {
        title: meta.common.title || '',
        artist: splitArtists(meta.common.artist || ''),
        albumArtist: splitArtists(meta.common.albumartist || ''),
        genre: _.flatten((meta.common.genre || []).map(splitGenres)),
        duration: meta.format.duration || 0,
        bitRate: meta.format.bitrate || 0,
      };
      await fs.outputJSON(metaPath(track.id), _meta);
    }
    return true;
  };
}
