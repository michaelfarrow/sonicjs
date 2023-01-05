import fs from 'fs-extra';
import axios from 'axios';
import log from '@/logger';
import { hash } from '@/utils/hash';
import { libraryPath, libraryPathRel } from '@/utils/path';
import mbApi from '@/utils/mbApi';
import { LibraryItem } from '@/library';
import { ArtistRepository, AlbumRepository } from '@/db';
import Genre from '@/models/Genre';

const AUDIO_DB_KEY = '195003';

const JSON_OPTIONS = {
  headers: {
    'Content-Type': 'application/json; charset=shift-jis',
    'Access-Control-Allow-Origin': '*',
    'accept-encoding': null,
    proxy: false,
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
    gzip: true,
    encoding: null,
  },
};

function getBiography(mbid: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://www.theaudiodb.com/api/v1/json/${AUDIO_DB_KEY}/artist-mb.php?i=${encodeURIComponent(
          mbid
        )}`,
        JSON_OPTIONS
      )
      .then((res) => {
        resolve(res.data?.artists?.[0]?.strBiographyEN);
      })
      .catch(reject);
  });
}

export default function ensureMeta(item: LibraryItem) {
  return async () => {
    log('ensuring meta', libraryPathRel(item.path));

    const parentId = hash(libraryPathRel(item.parent));

    const artist = item.parent
      ? await ArtistRepository.getById(parentId).toPromise()
      : null;
    const album = item.parent
      ? await AlbumRepository.getById(parentId).toPromise()
      : null;

    if (
      (!artist && !album) ||
      (artist && artist.metaFetched) ||
      (album && album.metaFetched)
    ) {
      return false;
    }

    const mbid = await fs.readFile(libraryPath(item.path), 'utf-8');

    if (artist) {
      const info = await mbApi.lookupArtist(mbid);
      const bio = await getBiography(mbid);

      if (info) {
        artist.mbid = mbid;
        artist.name = info.name;
        artist.bio =
          (bio &&
            bio
              .replace(/\n+/g, '\n')
              .split(/\n/g)
              .map((p) => p.trim())
              .join('\n\n')) ||
          null;
        artist.metaFetched = true;

        await artist.save();
      }
    }

    if (album) {
      const info = await mbApi.lookupRelease(mbid, ['release-groups']);
      const releaseGroup = info['release-group']?.id;

      const releaseGroupInfo = releaseGroup
        ? await mbApi.lookupReleaseGroup(releaseGroup, ['genres', 'releases'])
        : null;

      if (info && releaseGroup) {
        const releaseInfo: string | null | undefined = (
          releaseGroupInfo as any
        )?.['first-release-date'];

        const year = releaseInfo?.match(/\d+/)?.[0];

        const genres: Genre[] = (
          releaseGroupInfo
            ? (releaseGroupInfo as any).genres.map((genre: any) => genre.name)
            : []
        ).map((genre: string) => {
          const g = new Genre();
          g.id = hash(genre);
          g.name = genre;
          return g;
        });

        for (const genre of genres) {
          await genre.save();
        }

        album.name = info.title;
        album.year = (year && Number(year)) || null;
        album.genres = genres;
        album.metaFetched = true;

        await album.save();
      }
    }

    return true;
  };
}
