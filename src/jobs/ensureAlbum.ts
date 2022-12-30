import log from '@/logger';
import { LibraryItem } from '@/library';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';
import { ArtistRepository } from '@/db';
import Album from '@/models/Album';

export default function ensureAlbum(item: LibraryItem) {
  return async () => {
    log('ensuring album', libraryPathRel(item.path));

    const relPath = libraryPathRel(item.path);

    const albumArtist = await ArtistRepository.getById(
      hash(libraryPathRel(item.parent))
    );
    if (albumArtist) {
      const album = new Album();
      album.id = hash(relPath);
      album.item = item.name;
      album.path = relPath;
      album.artist = albumArtist;
      album.rand = Math.random();
      await album.save();
    }
  };
}
