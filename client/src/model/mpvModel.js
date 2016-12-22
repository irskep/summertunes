/* global console */
/* global window */
import io from 'socket.io-client';
import K from "kefir";
import { SERVER_URL, MPV_URL } from "../config";
import apiKeys from "../apiKeys";

const socket = io(MPV_URL);


// get_property doesn't include the property name in the return value, so
// we need to do this silly request_id thing
let i = 0;
const requestIdToPropertyName = {};

const getProperty = (propertyName) => {
  i += 1;
  requestIdToPropertyName[i] = propertyName;
  socket.send({"command": ["get_property", propertyName], "request_id": i});
}

const sendAndObserve = (propertyName) => {
  socket.send({"command": ["observe_property", 0, propertyName]})
  getProperty(propertyName);
}

/* setup */

socket.on('connect', () => {
  console.log("socket.io connected");  // eslint-disable-line no-console
  sendAndObserve("path");
  sendAndObserve("pause");
  sendAndObserve("time-pos");
});
socket.on('disconnect', () => {
  console.warn("socket.io disconnected");  // eslint-disable-line no-console
});

/* mutations */

const setIsPlaying = (isPlaying) => {
  socket.send({"command": ["set_property", "pause", !isPlaying]});
};

const seek = (seconds) => {
  socket.send({"command": ["seek", seconds, "absolute"]});
};

const goToBeginningOfTrack = () => {
  seek(0);
};

const playTrack = (track) => {
  socket.send({"command": ["playlist-clear"]});
  socket.send({"command": ["playlist-remove", "current"]});
  socket.send({"command": ["loadfile", track.path, "append-play"]});
  setIsPlaying(true);
};

const playTracks = (tracks) => {
  socket.send({"command": ["playlist-clear"]});
  socket.send({"command": ["playlist-remove", "current"]});
  socket.send({"command": ["loadfile", tracks[0].path, "append-play"]});
  setIsPlaying(true);
  tracks.slice(1).forEach((track) => {
    socket.send({"command": ["loadfile", track.path, "append"]});
  });
};

const goToNextTrack = (seconds) => {
  socket.send({"command": ["playlist-next", "force"]});
};

/* streams */

const events = K.stream((emitter) => {
  socket.on('message', emitter.emit);
  return () => socket.off('message', emitter.emit);
});

const kPropertyChanges = events
  .map((event) => {
    if (!event.request_id) return event;
    if (!requestIdToPropertyName[event.request_id]) return event;
    const name = requestIdToPropertyName[event.request_id];
    delete requestIdToPropertyName[event.request_id];
    return {
      "event": "property-change",
      "name": name,
      "data": event.data,
    };
  })
  .filter((event) => {
    return event.event === "property-change";
  })
  .map(({name, data}) => {
    return {name, data};
  });

const kPath = kPropertyChanges
  .filter(({name}) => name === "path")
  .map(({data}) => data)
  .skipDuplicates()
  .toProperty(() => null);

const kIsPlaying = kPropertyChanges
  .filter(({name}) => name === "pause")
  .map(({data}) => !data)
  .skipDuplicates()
  .toProperty(() => false);

const kPlaybackSeconds = kPropertyChanges
  .filter(({name}) => name === "time-pos")
  .map(({data}) => data)
  .toProperty(() => 0);

const kPlayingTrack = kPath
  .flatMapLatest((path) => {
    if (!path) return K.constant(null);
    return K.fromPromise(
      window.fetch(`${SERVER_URL}/track?path=${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then(({track}) => track)
    );
  })
  .toProperty(() => null);

const kLastFM = kPlayingTrack
  .flatMapLatest((track) => {
    if (!track) return K.constant(null);
    return K.fromPromise(window.fetch(
          `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${
            apiKeys.lastFM
          }&artist=${
            track.artist
          }&album=${
            track.album
          }&format=json`
      ).then((result) => result.json())
    );
  })
  .toProperty(() => null);

const kAlbumArtURL = kLastFM
  .map((lastFMData) => {
    if (!lastFMData || !lastFMData.album) return {};
    const urlBySize = {};
    for (const imgData of (lastFMData.album.image || [])) {
      urlBySize[imgData.size] = imgData["#text"];
    }
    return urlBySize;
  });

export {
  setIsPlaying,
  goToBeginningOfTrack,
  goToNextTrack,
  playTrack,
  playTracks,
  seek,

  kIsPlaying,
  kPropertyChanges,
  kPath,
  kPlaybackSeconds,
  kPlayingTrack,
  kLastFM,
  kAlbumArtURL,
};