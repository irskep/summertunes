import K from 'kefir'

const {hostname, protocol} = window.location;

const kServerConfig = K.fromPromise(
  window.fetch('/server_config.js')
    .then((result) => result.json()));

const kBeetsWebURL = kServerConfig
  .map(({BEETSWEB_PORT}) => `${protocol}//${hostname}:${BEETSWEB_PORT}`);
const kMPVURL = kServerConfig
  .map(({MPV_PORT}) => `${protocol}//${hostname}:${MPV_PORT}`);
const kStaticFilesURL = kServerConfig
  .map(({HTTBEETS_PORT}) => `${protocol}//${hostname}:${HTTBEETS_PORT}/files`);

const kIsConfigReady = kServerConfig.map(() => true).toProperty(() => false);

export {
  kBeetsWebURL,
  kMPVURL,
  kStaticFilesURL,
  kIsConfigReady,
};
