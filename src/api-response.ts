import {
  AlbumID3,
  AlbumWithSongsID3,
  ArtistID3,
  ArtistWithAlbumsID3,
  Child,
} from './types';
import {
  LibraryItemAlbum,
  artist,
  album,
  albums,
  tracks,
  images,
  LibraryItemArtist,
  LibraryItemTrack,
} from './library';

export async function trackResponse(
  libItem: LibraryItemTrack,
  libAlbum?: LibraryItemAlbum | null,
  libArtist?: LibraryItemArtist | null
): Promise<Child> {
  const songAlbum = libAlbum || (await album(libItem.parent || ''));
  const songArtist = libArtist || (await artist(songAlbum?.parent || ''));
  const albumImages = songAlbum ? images(songAlbum) : [];

  const albumCover =
    (albumImages.find((image) => ['cover'].includes(image.name))?.path &&
      songAlbum?.id) ||
    undefined;

  return {
    id: libItem.id,
    title: libItem.meta?.title || libItem.name,
    artist: songArtist?.meta?.name || songArtist?.name || undefined,
    artistId: songArtist?.id || undefined,
    album: songAlbum?.meta?.title || songAlbum?.name || undefined,
    albumId: songAlbum?.id || undefined,
    duration: Math.round(libItem.meta?.duration || 0),
    bitRate: Math.round((libItem.meta?.bitRate || 0) / 1000),
    // contentType: 'audio/mp4',
    // type: 'music',
    path: libItem.path,
    track: libItem.meta?.track || undefined,
    discNumber: libItem.meta?.disc || undefined,
    coverArt: albumCover,
  };
}

export async function albumResponse(
  libItem: LibraryItemAlbum,
  libArtist?: LibraryItemArtist | null,
  libTracks?: LibraryItemTrack[] | null
): Promise<AlbumID3> {
  const albumArtist = libArtist || (await artist(libItem.parent || ''));
  const albumTracks = libTracks || (await tracks(libItem));
  const albumImages = images(libItem);

  const albumCover =
    (albumImages.find((image) => ['cover'].includes(image.name))?.path &&
      libItem.id) ||
    undefined;

  let duration = 0;

  for (const track of albumTracks) {
    duration += track.meta?.duration || 0;
  }

  return {
    id: libItem.id,
    name: libItem.meta?.title || libItem.name,
    artist: albumArtist?.meta?.name || albumArtist?.name,
    artistId: albumArtist?.id,
    coverArt: albumCover,
    songCount: albumTracks.length,
    duration: Math.round(duration),
    created: new Date(),
  };
}

export async function albumWithSongsResponse(
  libItem: LibraryItemAlbum
): Promise<AlbumWithSongsID3> {
  const albumTracks = await tracks(libItem);
  const albumArtist = await artist(libItem.parent || '');
  const album = await albumResponse(libItem, albumArtist, albumTracks);
  const resSongs: Child[] = [];

  for (const track of albumTracks) {
    resSongs.push(await trackResponse(track, libItem, albumArtist));
  }

  return { ...album, song: resSongs };
}

export async function artistResponse(
  libItem: LibraryItemArtist
): Promise<ArtistID3> {
  const artistImages = images(libItem);
  const artistAlbums = await albums(libItem);
  return {
    id: libItem.id,
    name: libItem.meta?.name || libItem.name,
    albumCount: artistAlbums.length,
    coverArt:
      (artistImages.find((image) => ['poster', 'cover'].includes(image.name))
        ?.path &&
        libItem.id) ||
      undefined,
  };
}

export async function artistWithAlbumsResponse(
  libItem: LibraryItemArtist
): Promise<ArtistWithAlbumsID3> {
  const artist = await artistResponse(libItem);
  const artistAlbums = await albums(libItem);

  const resAlbums: AlbumID3[] = [];

  for (const album of artistAlbums) {
    resAlbums.push(await albumResponse(album));
  }

  return { ...artist, album: resAlbums };
}
