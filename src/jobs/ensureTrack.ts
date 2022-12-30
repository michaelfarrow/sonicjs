import mime from 'mime-types';
import log from '@/logger';
import { LibraryItem } from '@/library';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';
import { AlbumRepository } from '@/db';
import Track from '@/models/Track';

export default function ensureTrack(item: LibraryItem) {
  return async () => {
    log('ensuring track', libraryPathRel(item.path));

    const relPath = libraryPathRel(item.path);

    const trackAlbum = await AlbumRepository.getById(
      hash(libraryPathRel(item.parent))
    );
    if (trackAlbum) {
      const track = new Track();
      track.id = hash(relPath);
      track.item = item.name;
      track.path = relPath;
      track.album = trackAlbum;
      track.type = mime.lookup(item.path) || null;
      await track.save();
    }
  };
}
