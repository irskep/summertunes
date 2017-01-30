import K from "kefir";
import createBus from "./model/createBus";

const {hostname, protocol} = window.location;

const [setServerConfig, bServerConfig] = createBus();
const kServerConfig = bServerConfig.toProperty(() => ({}));

window.fetch('/server_config.js')
    .then((result) => result.json())
    .then((conf) => setServerConfig(conf))
    .catch(() => { });
window.fetch('/summertunes/server_config.js')
    .then((result) => result.json())
    .then((conf) => setServerConfig(conf))
    .catch(() => { });

const kBeetsWebURL = bServerConfig
  .map(({BEETSWEB_PORT, BEETSWEB_HOST}) => {
    if (BEETSWEB_HOST) {
      return `${BEETSWEB_HOST}:${BEETSWEB_PORT}`;
    } else {
      return `${protocol}//${hostname}:${BEETSWEB_PORT}`
    }
  });
const kMPVURL = bServerConfig
  .map(({MPV_PORT, MPV_HOST}) => {
    if (MPV_HOST) {
      return `${MPV_HOST}:${MPV_PORT}`;
    } else {
      return `${protocol}//${hostname}:${MPV_PORT}`;
    }
  });
const kStaticFilesURL = K.constant('/summertunes/files')
  //.map(({SUMMERTUNES_PORT}) => `${protocol}//${hostname}:${3003}`);
const kLastFMAPIKey = bServerConfig
  .map(({LAST_FM_API_KEY}) => LAST_FM_API_KEY);

const kIsConfigReady = bServerConfig.map(() => true).toProperty(() => false);

const kPlayerServices = kServerConfig.map(({player_services}) => player_services);
kPlayerServices.onValue(() => { })

export {
  kBeetsWebURL,
  kMPVURL,
  kStaticFilesURL,
  kLastFMAPIKey,
  kIsConfigReady,
  kPlayerServices,
  kServerConfig,
};
