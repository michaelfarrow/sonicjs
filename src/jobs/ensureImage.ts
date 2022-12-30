import log from '@/logger';
import { LibraryItem } from '@/library';
import { hash } from '@/utils/hash';
import { libraryPathRel } from '@/utils/path';
import { hashImage } from '@/utils/hash';
import { ArtistRepository, AlbumRepository, ImageRepository } from '@/db';
import Image from '@/models/Image';

export default function ensureImage(item: LibraryItem) {
  return async () => {
    log('ensuring image', libraryPathRel(item.path));

    const relPath = libraryPathRel(item.path);
    const parentId = hash(libraryPathRel(item.parent));
    const id = hash(relPath);

    if (await ImageRepository.getById(id)) return;

    const artist = item.parent
      ? await ArtistRepository.getById(parentId).include((a) => a.image)
      : null;
    const album = item.parent
      ? await AlbumRepository.getById(parentId).include((a) => a.image)
      : null;

    const parent = artist || album;

    if (!parent) {
      return false;
    }

    const image = new Image();
    image.id = id;
    image.path = relPath;
    image.hash = await hashImage(item.path);
    await image.save();

    parent.image = image;
    await parent.save();

    return true;
  };
}
