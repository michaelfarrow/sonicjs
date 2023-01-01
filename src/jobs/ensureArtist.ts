import log from '@/logger';
import { LibraryItem } from '@/library';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';
import { ArtistRepository } from '@/db';
import Artist from '@/models/Artist';

export default function ensureArtist(item: LibraryItem) {
  return async () => {
    log('ensuring artist', libraryPathRel(item.path));

    const relPath = libraryPathRel(item.path);
    const id = hash(relPath);

    if (await ArtistRepository.getById(id).toPromise()) return;

    const artist = new Artist();
    artist.id = id;
    artist.item = item.name;
    artist.path = relPath;
    await artist.save();
  };
}
