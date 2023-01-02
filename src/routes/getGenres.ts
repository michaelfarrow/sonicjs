import { NextFunction, Request, Response } from 'express';
import { Genres } from '@/types';
import { GenreRepository } from '@/db';

export type GetGenresResponse = {
  genres: Genres;
};

export default async function getGenres(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const genres = await GenreRepository.getAll()
    .orderBy((g) => g.name)
    .include((g) => g.albums)
    .toPromise();

  const response: GetGenresResponse = {
    genres: {
      genre: genres.map((genre) => ({
        value: genre.name,
        songCount: genre.songCount,
        albumCount: genre.albumCount,
      })),
    },
  };

  res.locals = response;
  next();
}
