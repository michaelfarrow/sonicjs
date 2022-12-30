import { parseFile } from 'music-metadata';
import fs from 'fs-extra';
import _ from 'lodash';
import log from '@/logger';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';
import { libraryPath } from '@/utils/path';
import { LibraryItem } from '@/library';
import { TrackRepository } from '@/db';

const splitArtists = (artists: string) => artists.split(/\s*;\s*/g);
const splitGenres = (genres: string) => genres.split(/\s*,\s*/g);

export default function ensureTrackMeta(item: LibraryItem) {
  return async () => {
    log('ensuring track meta', libraryPathRel(item.path));

    const track = await TrackRepository.getById(
      hash(libraryPathRel(item.path))
    ).include((t) => t.album);

    if (track && (!track.metaFetched || !track.size)) {
      const libPath = libraryPath(track.path);
      const meta = await parseFile(libPath);
      const stat = await fs.stat(libPath);

      const trackAlbum = track.album;

      track.name = meta.common.title || null;
      track.artist = meta.common.artist || null;
      track.albumArtist = meta.common.albumartist || null;
      track.bitRate =
        (meta.format.bitrate && Math.round(meta.format.bitrate / 1000)) || null;
      track.track = meta.common.track.no || null;
      track.disc = meta.common.disk.no || null;
      track.duration =
        (meta.format.duration && Math.round(meta.format.duration)) || null;
      track.size = stat.size;

      await track.save();

      await trackAlbum.updateTrackInfo();
      await trackAlbum.save();
    }
  };
}
