import K from 'kefir'

const {hostname, protocol} = window.location;

const kServerConfig = K.fromPromise(
  window.fetch('/server_config.js')
    .then((result) => result.json()));

const kBeetsWebURL = kServerConfig
  .map(({BEETSWEB_PORT, BEETSWEB_HOST}) => {
    if (BEETSWEB_HOST) {
      return `${BEETSWEB_HOST}:${BEETSWEB_PORT}`;
    } else {
      return `${protocol}//${hostname}:${BEETSWEB_PORT}`
    }
  });
const kMPVURL = kServerConfig
  .map(({MPV_PORT, MPV_HOST}) => {
    if (MPV_HOST) {
      return `${MPV_HOST}:${MPV_PORT}`;
    } else {
      return `${protocol}//${hostname}:${MPV_PORT}`;
    }
  });
const kStaticFilesURL = kServerConfig
  .map(({HTTBEETS_PORT}) => `${protocol}//${hostname}:${HTTBEETS_PORT}/files`);
const kLastFMAPIKey = kServerConfig
  .map(({LAST_FM_API_KEY}) => LAST_FM_API_KEY);

const kIsConfigReady = kServerConfig.map(() => true).toProperty(() => false);

export {
  kBeetsWebURL,
  kMPVURL,
  kStaticFilesURL,
  kLastFMAPIKey,
  kIsConfigReady,
};
