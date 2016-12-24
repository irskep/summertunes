/* global console */
/* global window */
import io from 'socket.io-client';
import K from "kefir";
import { SERVER_URL, MPV_URL } from "../config";


class MPVPlayer {
  constructor(socketURL) {
    this.socket = io(socketURL);

    // get_property doesn't include the property name in the return value, so
    // we need to do this silly request_id thing
    this.i = 0;
    this.requestIdToPropertyName = {};

    /* setup */
    this.socket.on('connect', () => {
      console.log("socket.io connected");  // eslint-disable-line no-console
      this.sendAndObserve("path");
      this.sendAndObserve("pause");
      this.sendAndObserve("time-pos");
      this.sendAndObserve("volume");
    });
    this.socket.on('disconnect', () => {
      console.warn("socket.io disconnected");  // eslint-disable-line no-console
    });

    /* events */
    this.events = K.stream((emitter) => {
      this.socket.on('message', emitter.emit);
      return () => this.socket.off('message', emitter.emit);
    });

    this.kPropertyChanges = this.events
      .map((event) => {
        if (!event.request_id) {
          // console.debug(event);
          return event;
        }
        if (!this.requestIdToPropertyName[event.request_id]) return event;
        const name = this.requestIdToPropertyName[event.request_id];
        delete this.requestIdToPropertyName[event.request_id];
        const reconstructedEvent = {
          "event": "property-change",
          "name": name,
          "data": event.data,
        }
        console.debug(reconstructedEvent);
        return reconstructedEvent;
      })
      .filter((event) => {
        return event.event === "property-change";
      })
      .map(({name, data}) => {
        return {name, data};
      });

    this.kPath = this.kPropertyChanges
      .filter(({name}) => name === "path")
      .map(({data}) => data)
      .skipDuplicates()
      .toProperty(() => null);

    this.kVolume = this.kPropertyChanges
      .filter(({name}) => name === "volume")
      .map(({data}) => data / 100)
      .skipDuplicates()
      .toProperty(() => 1);

    this.kIsPlaying = this.kPropertyChanges
      .filter(({name}) => name === "pause")
      .map(({data}) => !data)
      .skipDuplicates()
      .toProperty(() => false);

    this.kPlaybackSeconds = this.kPropertyChanges
      .filter(({name}) => name === "time-pos")
      .map(({data}) => data)
      .toProperty(() => 0);

    this.kPlayingTrack = this.kPath
      .flatMapLatest((path) => {
        if (!path) return K.constant(null);
        return K.fromPromise(
          window.fetch(`${SERVER_URL}/track?path=${encodeURIComponent(path)}`)
            .then((response) => response.json())
            .then(({track}) => track)
        );
      })
      .toProperty(() => null);
  }

  getProperty(propertyName) {
    this.i += 1;
    this.requestIdToPropertyName[this.i] = propertyName;
    this.socket.send({"command": ["get_property", propertyName], "request_id": this.i});
  }

  sendAndObserve(propertyName) {
    this.socket.send({"command": ["observe_property", 0, propertyName]})
    this.getProperty(propertyName);
  }

  setIsPlaying(isPlaying) {
    this.socket.send({"command": ["set_property", "pause", !isPlaying]});
    this.getProperty("pause");  // sometimes this can get unsynced; make sure we don't get stuck!
  }

  setVolume(volume) {
    this.socket.send({"command": ["set_property", "volume", volume * 100]});
  }

  seek(seconds) {
    this.socket.send({"command": ["seek", seconds, "absolute"]});
  }

  goToBeginningOfTrack() {
    this.seek(0);
  }

  playTrack(track) {
    this.socket.send({"command": ["playlist-clear"]});
    this.socket.send({"command": ["playlist-remove", "current"]});
    this.socket.send({"command": ["loadfile", track.path, "append-play"]});
    this.setIsPlaying(true);
  }

  playTracks(tracks) {
    this.socket.send({"command": ["playlist-clear"]});
    this.socket.send({"command": ["playlist-remove", "current"]});
    this.socket.send({"command": ["loadfile", tracks[0].path, "append-play"]});
    this.setIsPlaying(true);
    tracks.slice(1).forEach((track) => {
      this.socket.send({"command": ["loadfile", track.path, "append"]});
    });
  }

  goToNextTrack() {
    this.socket.send({"command": ["playlist-next", "force"]});
  }
}

export default new MPVPlayer(MPV_URL);