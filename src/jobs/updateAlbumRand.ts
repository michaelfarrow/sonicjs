import { AlbumRepository } from '@/db';

export default function updateAlbumRand() {
  return async () => {
    const albums = await AlbumRepository.getAll()
      .toPromise()
      .catch((e) => {
        throw e;
      });
    for (const album of albums) {
      album.rand = Math.random();
      await album.save();
    }
  };
}
