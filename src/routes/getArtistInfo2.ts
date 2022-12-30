import _ from 'lodash';
import { ArtistInfo2 } from '@/types';
import { ArtistRepository } from '@/db';
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

    const genreArtists = await ArtistRepository.getAll()
      .where((a) => a.id)
      .notEqual(artist.id)
      .include((a) => a.image)
      .include((a) => a.albums)
      .join((a) => a.albums)
      .thenJoin((album) => album.genres)
      .where((g) => g.id)
      .in(
        _(artist.albums)
          .map((a) => a.genres)
          .flatten()
          .map((g) => g.id)
          .uniq()
          .value()
      );

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
