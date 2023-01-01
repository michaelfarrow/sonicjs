
import log from '@/logger';
import { AlbumRepository } from '@/db';

export default async function () {
    log('udpating album track meta' );

    const albums = await AlbumRepository.getAll()
      .toPromise();

    for(const album of albums) {
      await album.updateTrackInfo();
      await album.save();
    }
  };
}
