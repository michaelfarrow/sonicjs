import fs from 'fs-extra';
import log from '@/logger';
import {
  ArtistRepository,
  AlbumRepository,
  TrackRepository,
  ImageRepository,
  GenreRepository,
} from '@/db';
import { hash } from '@/utils/hash';
import { libraryPathRel, imagePath } from '@/utils/path';

export default function removeItem(p: string) {
  return async () => {
    const relPath = libraryPathRel(p);
    const id = hash(relPath);

    const artist = await ArtistRepository.getById(id).toPromise();
    const album = await AlbumRepository.getById(id).toPromise();
    const track = await TrackRepository.getById(id)
      .include((t) => t.album)
      .toPromise();
    const image = await ImageRepository.getById(id).toPromise();

    if (track) {
      log('removing track', relPath);

      const trackAlbum = track.album;

      await track.remove();

      await trackAlbum.updateTrackInfo();
      await trackAlbum.save();
    }

    if (album) {
      log('removing album', relPath);
      await album.remove();

      const genresToRemove = (
        await GenreRepository.getAll()
          .include((g) => g.albums)
          .toPromise()
      ).filter((g) => !g.albumCount);

      for (const genre of genresToRemove) {
        log('removing genre', genre.name);
        await genre.remove();
      }
    }

    if (artist) {
      log('removing artist', relPath);
      await artist.remove();
    }

    if (image) {
      log('removing image', relPath);
      await image.remove();

      const cacheDir = imagePath(image.hash);

      if (await fs.pathExists(cacheDir)) {
        log('removing image cache', cacheDir);
        await fs.remove(cacheDir);
      }
    }
  };
}
