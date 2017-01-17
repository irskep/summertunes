import K from "kefir";
import createBus from "./createBus";
import localStorageJSON from "../util/localStorageJSON";


const MEDIUM_UI_BREAKPOINT = 600;
const LARGE_UI_BREAKPOINT = 1100;


const largeUIOptions = {
  A: [
    ['albumartist', 'album'],
    ['tracks'],
  ],
  B: [
    ['albumartist', 'album', 'tracks'],
  ],
  Q: [
    ['hierarchy', 'queue'],
  ],
};


const mediumUIOptions = largeUIOptions;


const smallUIOptions = {
  Artist: [['albumartist']],
  Album: [['album']],
  Tracks: [['tracks']],
  Queue: [['queue']],
};


const getWindowWidth = () => window.document.body.clientWidth
const kWindowWidth = K.fromEvents(window, 'resize')
  .map(getWindowWidth)
  .toProperty(getWindowWidth)
const kIsMediumUI = kWindowWidth
  .map((width) => width >= MEDIUM_UI_BREAKPOINT && width < LARGE_UI_BREAKPOINT);
const kIsLargeUI = kWindowWidth
  .map((width) => width >= LARGE_UI_BREAKPOINT);
const kIsSmallUI = K.combine([kIsLargeUI, kIsMediumUI], (isLarge, isMedium) => {
    return !isLarge && !isMedium;
}).toProperty(() => false);


const [setIsInfoModalOpen, bIsInfoModalOpen] = createBus()
const kIsInfoModalOpen = bIsInfoModalOpen
  .skipDuplicates()
  .toProperty(() => false);


const [setInfoModalTrack, bInfoModalTrack] = createBus()
const kInfoModalTrack = bInfoModalTrack.toProperty(() => null);


const openInfoModal = (track) => {
  setInfoModalTrack(track);
  setIsInfoModalOpen(true);
}

const closeInfoModal = () => {
  setIsInfoModalOpen(false);
}

/* ui configs */

const [setLargeUIConfig, bLargeUIConfig] = createBus()
const kLargeUIConfig = bLargeUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiLargeUIConfig", 'B'));

const [setMediumUIConfig, bMediumUIConfig] = createBus()
const kMediumUIConfig = bMediumUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiMediumUIConfig", 'A'));

const [setSmallUIConfig, bSmallUIConfig] = createBus()
const kSmallUIConfig = bSmallUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiSmallUIConfig", 'Artist'));

const kUIConfigSetter = K.combine([kIsLargeUI, kIsMediumUI], (isLargeUI, isMediumUI) => {
  if (isLargeUI) return setLargeUIConfig;
  if (isMediumUI) return setMediumUIConfig;
  return setSmallUIConfig;
}).toProperty(() => setLargeUIConfig);

const kUIConfigOptions = K.combine([kIsLargeUI, kIsMediumUI], (isLargeUI, isMediumUI) => {
  if (isLargeUI) return largeUIOptions;
  if (isMediumUI) return mediumUIOptions;
  return smallUIOptions;
}).toProperty(() => largeUIOptions);

const kUIConfig = K.combine([kIsLargeUI, kIsMediumUI])
  .flatMapLatest(([isLargeUI, isMediumUI]) => {
    if (isLargeUI) return kLargeUIConfig;
    if (isMediumUI) return kMediumUIConfig;
    return kSmallUIConfig;
  }).toProperty(() => largeUIOptions.B);

/* local storage sync */

kLargeUIConfig.onValue((v) => localStorage.uiLargeUIConfig = JSON.stringify(v));
kMediumUIConfig.onValue((v) => localStorage.uiMediumUIConfig = JSON.stringify(v));
kSmallUIConfig.onValue((v) => localStorage.uiSmallUIConfig = JSON.stringify(v));

export {
  kIsInfoModalOpen,
  kInfoModalTrack,
  openInfoModal,
  closeInfoModal,

  kIsMediumUI,
  kIsLargeUI,
  kIsSmallUI,

  kUIConfigSetter,
  kUIConfigOptions,
  kUIConfig,

  setSmallUIConfig,
}
