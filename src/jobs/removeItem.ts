import log from '@/logger';
import {
  ArtistRepository,
  AlbumRepository,
  TrackRepository,
  ImageRepository,
} from '@/db';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';

export default function removeItem(p: string) {
  return async () => {
    console.log('removeItem', p);

    const relPath = libraryPathRel(p);
    const id = hash(relPath);

    const artist = await ArtistRepository.getById(id);
    const album = await AlbumRepository.getById(id);
    const track = await TrackRepository.getById(id).include((t) => t.album);
    const image = await ImageRepository.getById(id);

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
    }

    if (artist) {
      log('removing artist', relPath);
      await artist.remove();
    }

    if (image) {
      log('removing image', relPath);
      await image.remove();
    }
  };
}
