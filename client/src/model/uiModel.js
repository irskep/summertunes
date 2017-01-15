import K from "kefir";
import createBus from "./createBus";
import localStorageJSON from "../util/localStorageJSON";


const MEDIUM_UI_BREAKPOINT = 600;
const LARGE_UI_BREAKPOINT = 840;


const largeUIOptions = {
  A: [
    ['albumartist', 'album'],
    ['tracks'],
  ],
  B: [
    ['albumartist', 'album', 'tracks'],
  ],
  C: [
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
});


const [setIsInfoModalOpen, bIsInfoModalOpen] = createBus()
const kIsInfoModalOpen = bIsInfoModalOpen
  .skipDuplicates()
  .toProperty(() => false);

/* ui configs */

const [setLargeUIConfig, bLargeUIConfig] = createBus()
const kLargeUIConfig = bLargeUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiLargeUIConfig", 'B'))
  .log('kLargeUIConfig');

const [setMediumUIConfig, bMediumUIConfig] = createBus()
const kMediumUIConfig = bMediumUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiMediumUIConfig", 'A'))
  .log('kMediumUIConfig');

const [setSmallUIConfig, bSmallUIConfig] = createBus()
const kSmallUIConfig = bSmallUIConfig
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiSmallUIConfig", 'Artist'))
  .log('kSmallUIConfig');

const kUIConfigSetter = K.combine([kIsLargeUI, kIsMediumUI], (isLargeUI, isMediumUI) => {
  if (isLargeUI) return setLargeUIConfig;
  if (isMediumUI) return setMediumUIConfig;
  return setSmallUIConfig;
}).toProperty(() => setLargeUIConfig);

const kUIConfigOptions = K.combine([kIsLargeUI, kIsMediumUI], (isLargeUI, isMediumUI) => {
  console.log(isLargeUI, isMediumUI);
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

export {
  kIsInfoModalOpen,
  setIsInfoModalOpen,

  kIsMediumUI,
  kIsLargeUI,
  kIsSmallUI,

  kUIConfigSetter,
  kUIConfigOptions,
  kUIConfig,
}