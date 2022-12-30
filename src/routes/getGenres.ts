import { NextFunction, Request, Response } from 'express';
import { Genre } from '@/types';
import { GenreRepository } from '@/db';

export type GetStarred2Response = {
  genres: {
    genre: Genre[];
  };
};

export default async function getGenres(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const genres = await GenreRepository.getAll()
    .orderBy((g) => g.name)
    .include((g) => g.albums)
    .thenInclude((album) => album.tracks);

  const response: GetStarred2Response = {
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
