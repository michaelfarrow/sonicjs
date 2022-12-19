import { MusicBrainzApi } from 'musicbrainz-api';

const api = new MusicBrainzApi({
  appName: 'farrow-sonicjs',
  appVersion: '0.1.0',
  appContactInfo: 'mike@farrow.io',
});

export default api;
