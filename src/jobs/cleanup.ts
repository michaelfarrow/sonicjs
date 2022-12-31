import fs from 'fs-extra';
import log from '@/logger';
import {
  ArtistRepository,
  AlbumRepository,
  TrackRepository,
  ImageRepository,
} from '@/db';
import removeItem from './removeItem';
import { libraryPath } from '@/utils/path';

export default async function cleanup() {
  log('cleaning up');

  const images = await ImageRepository.getAll();
  const tracks = await TrackRepository.getAll();
  const albums = await AlbumRepository.getAll();
  const artists = await ArtistRepository.getAll();

  for (const image of images) {
    const imagePath = libraryPath(image.path);
    if (!(await fs.pathExists(imagePath))) await removeItem(imagePath)();
  }

  for (const track of tracks) {
    const trackPath = libraryPath(track.path);
    if (!(await fs.pathExists(trackPath))) await removeItem(trackPath)();
  }

  for (const album of albums) {
    const albumPath = libraryPath(album.path);
    if (!(await fs.pathExists(albumPath))) await removeItem(albumPath)();
  }

  for (const artist of artists) {
    const artistPath = libraryPath(artist.path);
    if (!(await fs.pathExists(artistPath))) await removeItem(artistPath)();
  }
}
