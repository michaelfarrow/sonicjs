import { AlbumRepository } from '@/db';

export default function updateAlbumRand() {
  return async () => {
    const albums = await AlbumRepository.getAll().toPromise();

    for (const album of albums) {
      album.rand = Math.random();
      await album.save();
    }
  };
}
