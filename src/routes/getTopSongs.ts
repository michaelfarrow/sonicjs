import { Error } from '@/error';
import { ArtistRepository, TrackRepository } from '@/db';
import { trackResponse } from '@/api-response';
import genericHandler from './generic';
import { TopSongs } from '@/types';

export type GetTopSongsResponse = {
  topSongs?: TopSongs;
};

export default genericHandler(
  (z) => ({
    artist: z.string(),
    count: z.coerce.number().optional(),
  }),
  async ({ artist, count }, next, res) => {
    const response: GetTopSongsResponse = {
      topSongs: {
        song: [],
      },
    };

    res.locals = response;
    return next();

    // const dbArtist = await ArtistRepository.getOne()
    //   .include((a) => a.image)
    //   .include((a) => a.albums)
    //   .where((a) => a.name!)
    //   .equal(artist)
    //   .or((a) => a.item)
    //   .equal(artist)
    //   .toPromise();

    // if (!dbArtist) {
    //   return next({ code: Error.NotFound, message: 'artist not found' });
    // }

    // const tracksQuery = TrackRepository.getAll()
    //   .include((t) => t.album)
    //   .thenInclude((album) => album.image!)
    //   .where((t) => t.album)
    //   .in(dbArtist.albums.map((album) => album.id))
    //   .where((t) => t.plays)
    //   .greaterThan(0)
    //   .orderByDescending((t) => t.plays);

    // if (count !== undefined) tracksQuery.take(count);

    // const tracks = await tracksQuery.toPromise();

    // const response: GetTopSongsResponse = {
    //   topSongs: {
    //     song: tracks.map((track) =>
    //       trackResponse(track, track.album, dbArtist)
    //     ),
    //   },
    // };

    // res.locals = response;
    // next();
  }
);
