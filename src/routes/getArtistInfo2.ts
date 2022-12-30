import _, { shuffle } from 'lodash';
import { ArtistInfo2 } from '@/types';
import { ArtistRepository, GenreRepository } from '@/db';
import { Error } from '@/error';
import genericHandler from './generic';
import { artistResponse } from '@/api-response';

export type GetArtistInfo2Response = {
  artistInfo2: ArtistInfo2;
};

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res) => {
    const artist = await ArtistRepository.getById(id)
      .include((a) => a.albums)
      .thenInclude((album) => album.genres);

    if (!artist) {
      return next({
        code: Error.NotFound,
        message: 'Artist not found',
      });
    }

    const genres = await GenreRepository.getAll()
      .where((g) => g.id)
      .in(
        _(artist.albums)
          .map((a) => a.genres)
          .flatten()
          .map((g) => g.id)
          .uniq()
          .value()
      )
      .include((g) => g.albums)
      .thenInclude((album) => album.artist)
      .thenInclude((artist) => artist.albums)
      .include((g) => g.albums)
      .thenInclude((album) => album.artist)
      .thenInclude((artist) => artist.image!);

    const genreArtists = _(genres)
      .map((g) => g.albums)
      .flatten()
      .map((a) => a.artist)
      .uniqBy((a) => a.id)
      .filter((a) => a.id !== artist.id)
      .shuffle()
      .value();

    const response: GetArtistInfo2Response = {
      artistInfo2: {
        biography: artist.bio || undefined,
        similarArtist: genreArtists.map((artist) => artistResponse(artist)),
      },
    };

    res.locals = response;
    next();
  }
);
