import K from "kefir";
import createBus from "./createBus";
import localStorageJSON from "../util/localStorageJSON";


const MEDIUM_UI_BREAKPOINT = 500;
const LARGE_UI_BREAKPOINT = 1024;


const getWindowWidth = () => window.document.body.clientWidth
const kWindowWidth = K.fromEvents(window, 'resize')
  .map(getWindowWidth)
  .toProperty(getWindowWidth)
const kIsMediumUI = kWindowWidth
  .map((width) => width >= MEDIUM_UI_BREAKPOINT && width < LARGE_UI_BREAKPOINT);
const kIsLargeUI = kWindowWidth
  .map((width) => width >= LARGE_UI_BREAKPOINT);


const [setIsInfoVisible, bIsInfoVisible] = createBus()
const kIsInfoVisible = bIsInfoVisible
  .skipDuplicates()
  .toProperty(() => localStorageJSON("uiIsInfoVisible", false));


const [setOpenModal, bOpenModal] = createBus("openModal")
const kOpenModal = bOpenModal
  .skipDuplicates()
  //.merge(kArtist.changes().map(() => null).map(logMapper("artist kill")))
  //.merge(kAlbum.changes().map(() => null).map(logMapper("album kill")))
  //.map(logMapper("openModal"))
  .toProperty(() => null);

/* localStorage sync */

kIsInfoVisible.onValue((isInfoVisible) => localStorage.uiIsInfoVisible = JSON.stringify(isInfoVisible))

export {
  kIsInfoVisible,
  setIsInfoVisible,

  kIsMediumUI,
  kIsLargeUI,

  kOpenModal,
  setOpenModal,
}