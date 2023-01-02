import {
  AlbumID3,
  AlbumWithSongsID3,
  ArtistID3,
  ArtistWithAlbumsID3,
  Child,
  Playlist as SonicPlaylist,
  PlaylistWithSongs,
} from '@/types';
import Artist from '@/models/Artist';
import Album from '@/models/Album';
import Track from '@/models/Track';
import Playlist from '@/models/Playlist';

export function trackResponse(
  track: Track,
  album: Album = track.album,
  artist: Artist = album.artist
): Child {
  const multiArtist =
    !!track.artist && !!track.albumArtist && track.artist !== track.albumArtist;

  return {
    id: track.id,
    title: track.name || track.item,
    artist: multiArtist
      ? (track?.artist as string)
      : artist?.name || artist?.item,
    artistId: !multiArtist ? artist?.id : undefined,
    parent: album?.id || undefined,
    path: track.path,
    album: album?.name || album?.item,
    albumId: album.id,
    duration: track.duration || undefined,
    bitRate: track.bitRate || undefined,
    contentType: track.type || undefined,
    // type: 'music',
    discNumber: track.disc || undefined,
    track: track.track || undefined,
    size: track.size || undefined,
    userRating: track.rating,
    starred: track.starred || undefined,
    coverArt: album?.image
      ? `${album.image.id}|${album.image.hash}`
      : undefined,
    created: track.createdAt,
  };
}

export function albumResponse(
  album: Album,
  artist: Artist = album.artist
): AlbumID3 {
  return {
    id: album.id,
    name: album.name || album.item,
    artist: artist.name || artist.item,
    artistId: artist.id,
    coverArt: album.image ? `${album.image.id}|${album.image.hash}` : undefined,
    songCount: album.trackCount,
    duration: album.duration,
    year: album.year || undefined,
    starred: album.starred || undefined,
    created: album.createdAt,
  };
}

export function albumWithSongsResponse(album: Album): AlbumWithSongsID3 {
  return {
    ...albumResponse(album),
    song: album.tracks.map((track) => trackResponse(track, album)),
  };
}

export function artistResponse(artist: Artist): ArtistID3 {
  return {
    id: artist.id,
    name: artist.name || artist.item,
    albumCount: artist.albumCount,
    coverArt: artist.image
      ? `${artist.image.id}|${artist.image.hash}`
      : undefined,
    starred: artist.starred || undefined,
  };
}

export function artistWithAlbumsResponse(artist: Artist): ArtistWithAlbumsID3 {
  return {
    ...artistResponse(artist),
    album: artist.albums.map((album) => albumResponse(album, artist)),
  };
}

export function playlistResponse(playlist: Playlist): SonicPlaylist {
  return {
    id: String(playlist.id),
    name: playlist.name,
    comment: playlist.comment || undefined,
    songCount: playlist.trackCount,
    duration: playlist.duration,
    public: playlist.public,
    created: playlist.createdAt,
    changed: playlist.updatedAt,
  };
}

export function playlistWithSongsResponse(
  playlist: Playlist
): PlaylistWithSongs {
  return {
    ...playlistResponse(playlist),
    entry: playlist.tracks.map((playlistTrack) =>
      trackResponse(playlistTrack.track)
    ),
  };
}
