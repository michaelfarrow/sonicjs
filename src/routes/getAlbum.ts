import { NextFunction, Request, Response } from 'express';
import { AlbumWithSongsID3 } from '../types';
import { album, artist, tracks, images } from '../library';
import { Error } from '../error';

export type GetAlbumResponse = {
  album: AlbumWithSongsID3;
};

export default async function getArtist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.query;
  const _id = (id || '') as string;

  const libAlbum = await album(_id);

  if (!libAlbum) {
    return next({
      code: Error.NotFound,
      message: 'Album not found',
    });
  }

  const albumArtist = libAlbum.parent ? await artist(libAlbum.parent) : null;
  const albumTracks = await tracks(libAlbum);
  const albumImages = images(libAlbum);

  const albumCover =
    (albumImages.find((image) => ['cover'].includes(image.name))?.path &&
      _id) ||
    undefined;

  const response: GetAlbumResponse = {
    album: {
      id: libAlbum.id,
      name: libAlbum.meta?.title || libAlbum.name,
      artist: albumArtist?.meta?.name || albumArtist?.name,
      artistId: albumArtist?.id,
      coverArt: albumCover,
      songCount: 0,
      duration: 0,
      created: new Date(),
      song: albumTracks.map((track) => ({
        id: track.id,
        title: track.meta?.title || track.name,
        artist: track.meta?.artist.join('; '),
        album: libAlbum.meta?.title || libAlbum.name,
        albumId: libAlbum.id,
        coverArt: albumCover,
        bitRate: track.meta?.bitRate && Math.round(track.meta?.bitRate / 1000),
        duration: track.meta?.duration && track.meta.duration,
      })),
    },
  };

  res.locals = response;
  next();
}
