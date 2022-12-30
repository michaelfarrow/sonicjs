import { DataSource } from 'typeorm';
import path from 'path';
import { LinqRepository } from 'typeorm-linq-repository';
import log from '@/logger';
import { LIBRARY_PATH } from '@/config';

import Artist from '@/models/Artist';
import Album from '@/models/Album';
import Track from '@/models/Track';
import Genre from '@/models/Genre';
import Image from '@/models/Image';

const dataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(LIBRARY_PATH, 'db.sqlite'),
  synchronize: true,
  entities: [Artist, Album, Track, Genre, Image],
  logging: ['query', 'error'],
});

export async function initDb() {
  return dataSource
    .initialize()
    .then(() => {
      log('data source has been initialized successfully.');
    })
    .catch((err) => {
      log('error during Data Source initialization:', err);
    });
}

export const ArtistRepository = new LinqRepository(dataSource, Artist, {
  autoGenerateId: false,
});

export const AlbumRepository = new LinqRepository(dataSource, Album, {
  autoGenerateId: false,
});

export const TrackRepository = new LinqRepository(dataSource, Track, {
  autoGenerateId: false,
});

export const ImageRepository = new LinqRepository(dataSource, Image, {
  autoGenerateId: false,
});

export const GenreRepository = new LinqRepository(dataSource, Genre, {
  autoGenerateId: false,
});

export default dataSource;
