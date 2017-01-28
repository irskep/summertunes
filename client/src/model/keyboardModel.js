import mousetrap from "mousetrap";
import createBus from "./createBus";


const createBusProperty = (initialValue, skipDuplicates = true) => {
  const [setter, bus] = createBus();
  const property = (skipDuplicates ? bus.skipDuplicates() : bus).toProperty(() => initialValue);
  return [setter, property];
}

const createKeyStream = (k) => {
  const [set, stream] = createBus();
  mousetrap.bind(k, set);
  stream.onValue(() => { });
  return stream;
}


const keyboardFocusOptions = {
  artist: "artist",
  album: "album",
  trackList: "trackList",
  queue: "queue",
}
const [setKeyboardFocus, kKeyboardFocus] = createBusProperty("artist");
kKeyboardFocus.log('kb').onValue(() => { });


const kUps = createKeyStream(['up', 'k']);
const kDowns = createKeyStream(['down', 'j']);
const kLefts = createKeyStream(['left', 'h']).merge(createKeyStream('h'));
const kRights = createKeyStream(['right', 'l']);
const kEnters = createKeyStream(['enter', 'return']);
const kSpaces = createKeyStream('space');


mousetrap.bind('a', setKeyboardFocus.bind(this, keyboardFocusOptions.artist));
mousetrap.bind('b', setKeyboardFocus.bind(this, keyboardFocusOptions.album));
mousetrap.bind('t', setKeyboardFocus.bind(this, keyboardFocusOptions.trackList));
mousetrap.bind('q', setKeyboardFocus.bind(this, keyboardFocusOptions.queue));


kKeyboardFocus.sampledBy(kLefts).onValue((keyboardFocus) => {
  switch (keyboardFocus) {
  case keyboardFocusOptions.artist: break;
  case keyboardFocusOptions.album:
    setKeyboardFocus(keyboardFocusOptions.artist);
    break;
  case keyboardFocusOptions.trackList:
    setKeyboardFocus(keyboardFocusOptions.album);
    break;
  default: break;
  }
});


kKeyboardFocus.sampledBy(kRights).onValue((keyboardFocus) => {
  switch (keyboardFocus) {
  case keyboardFocusOptions.artist:
    setKeyboardFocus(keyboardFocusOptions.album)
    break;
  case keyboardFocusOptions.album:
    setKeyboardFocus(keyboardFocusOptions.trackList);
    break;
  case keyboardFocusOptions.trackList:
    break;
  default: break;
  }
});


export {
    keyboardFocusOptions,
    kKeyboardFocus,

    kUps,
    kDowns,
    kEnters,
    kSpaces,
}
