/* global console */
import io from 'socket.io-client';
import K from "kefir";
import { SERVER_URL } from "./config";

const socket = io('http://localhost:3001');

/* setup */

socket.on('connect', () => {
  console.log("socket.io connected");  // eslint-disable-line no-console
  socket.send({"command": ["observe_property", 1, "path"]});
  socket.send({"command": ["observe_property", 2, "pause"]});
  socket.send({"command": ["observe_property", 3, "time-pos"]});
  socket.send({"command": ["loadfile", "/Volumes/SteveJStorage/Music/Rush/Moving Pictures/01 Tom Sawyer.mp3"]});
});
socket.on('disconnect', () => {
  console.warn("socket.io disconnected");  // eslint-disable-line no-console
});

/* streams */

const events = K.stream((emitter) => {
  socket.on('message', emitter.emit);
  return () => socket.off('message', emitter.emit);
});

const kPropertyChanges = events
  .filter((event) => {
    return event.event === "property-change";
  })
  .map(({name, data}) => {
    return {name, data};
  });

const kPath = kPropertyChanges
  .filter(({name}) => name === "path")
  .map(({data}) => data)
  .toProperty(() => null);

const kIsPlaying = kPropertyChanges
  .filter(({name}) => name === "pause")
  .map(({data}) => !data)
  .toProperty(() => false);

const kPlaybackSeconds = kPropertyChanges
  .filter(({name}) => name === "time-pos")
  .map(({data}) => data)
  .toProperty(() => 0);

const kTrack = kPath
  .flatMapLatest((path) => {
    if (!path) return K.constant(null);
    return K.fromPromise(
      window.fetch(`${SERVER_URL}/track?path=${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then(({track}) => track)
    );
  })
  .toProperty(() => null);

/* mutations */

const setIsPlaying = (isPlaying) => {
  socket.send({"command": ["set_property", "pause", !isPlaying]});
};

//propertyChanges.onValue(console.log);
kTrack.onValue(console.log);
kIsPlaying.onValue(console.log);

export {
  setIsPlaying,

  kIsPlaying,
  kPropertyChanges,
  kPath,
  kPlaybackSeconds,
};