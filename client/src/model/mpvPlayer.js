
/* global console */
/* global window */
import io from 'socket.io-client';
import K from "kefir";
import { kMPVURL } from "../config";
import createBus from "./createBus";


const LOG = false;


const keepAlive = (observable) => {
  observable.onValue(() => { });
  return observable;
}


class MPVPlayer {
  constructor(kSocketURL) {
    this.ready = false;
    this.requestIdToPropertyName = {};

    /* events */
    [this.sendEvent, this.events] = createBus();

    if (LOG) {
      this.events.filter((e) => {
        return e.event !== "property-change" || e.name !== "time-pos";
      }).log("mpv");
    } else {
      keepAlive(this.events);

    }

    this.kPropertyChanges = this.events
      .map((event) => {
        if (!event.request_id) {
          // console.debug(event);
          return event;
        }
        if (!this.requestIdToPropertyName[event.request_id]) return event;
        const name = this.requestIdToPropertyName[event.request_id];
        if (!name) {
          console.error("Couldn't decode response", event);
        };
        delete this.requestIdToPropertyName[event.request_id];
        const reconstructedEvent = {
          "event": "property-change",
          "name": name,
          "data": event.data,
        }
        return reconstructedEvent;
      })
      .filter((event) => {
        return event.event === "property-change";
      })
      .map(({name, data}) => {
        return {name, data};
      });

    this.kPath = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "path")
      .map(({data}) => data)
      .skipDuplicates()
      .toProperty(() => null));

    this.kVolume = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "volume")
      .map(({data}) => data / 100)
      .skipDuplicates()
      .toProperty(() => 1));

    this.kIsPlaying = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "pause")
      .map(({data}) => !data)
      .skipDuplicates()
      .toProperty(() => false));

    this.kPlaybackSeconds = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "time-pos")
      .map(({data}) => data)
      .toProperty(() => 0));

    this.kPlaylistCount = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "playlist/count")
      .map(({data}) => data)
      .toProperty(() => 0));

    this.kPlaylistIndex = keepAlive(this.kPropertyChanges
      .filter(({name}) => name === "playlist-pos")
      .map(({data}) => data)
      .toProperty(() => 0));

    this.kPlaylistPaths = keepAlive(this.kPlaylistCount
      .flatMapLatest((count) => {
        const missing = {};
        const numbers = [];
        for (let i = 0; i < count; i++) {
          numbers.push(i);
          missing[i] = true;
          this.getProperty(`playlist/${i}/filename`);
          const j = i;
          setTimeout(() => {
            if (missing[j]) {
              console.warn("Re-fetching missing playlist filename", j);
              this.getProperty(`playlist/${j}/filename`);
            }
          }, 500);
        }
        return K.combine(numbers.map((i) => {
          return this.kPropertyChanges
            .filter(({name}) => name === `playlist/${i}/filename`)
            .take(1)
            .map(({data}) => {
              delete missing[i];
              return data;
            })
        }));
      }).toProperty(() => []));

    kSocketURL.onValue((url) => this.initSocket(url));
  }

  initSocket(socketURL) {
    this.socket = io(socketURL);

    // get_property doesn't include the property name in the return value, so
    // we need to do this silly request_id thing
    this.i = 0;

    /* setup */
    this.socket.on('connect', () => {
      console.log("socket.io connected");  // eslint-disable-line no-console
      this.sendAndObserve("path");
      this.sendAndObserve("pause");
      this.sendAndObserve("time-pos");
      this.sendAndObserve("volume");
      this.sendAndObserve("playlist-pos");
    });
    this.socket.on('disconnect', () => {
      console.warn("socket.io disconnected");  // eslint-disable-line no-console
    });

    K.fromEvents(this.socket, 'message').onValue(this.sendEvent);

    this.ready = true;
  }

  send(args) {
    if (this.socket) {
      if (LOG) console.debug(">", JSON.stringify(args));
      this.socket.send(args);
    }
  }

  getProperty(propertyName) {
    this.i += 1;
    this.requestIdToPropertyName[this.i] = propertyName;
    this.send({"command": ["get_property", propertyName], "request_id": this.i});
  }

  sendAndObserve(propertyName) {
    this.send({"command": ["observe_property", 0, propertyName]})
    this.getProperty(propertyName);
  }

  setIsPlaying(isPlaying) {
    this.send({"command": ["set_property", "pause", !isPlaying]});
    this.getProperty("pause");  // sometimes this can get unsynced; make sure we don't get stuck!
  }

  setVolume(volume) {
    this.send({"command": ["set_property", "volume", volume * 100]});
  }

  seek(seconds) {
    this.send({"command": ["seek", seconds, "absolute"]});
  }

  goToBeginningOfTrack() {
    this.seek(0);
  }

  playTrack(track) {
    this.send({"command": ["playlist-clear"]});
    this.send({"command": ["playlist-remove", "current"]});
    this.send({"command": ["loadfile", track.path, "append-play"]});
    this.setIsPlaying(true);
  }

  enqueueTrack(track) {
    this.send({"command": ["loadfile", track.path, "append"]});
  }

  playTracks(tracks) {
    this.send({"command": ["playlist-clear"]});
    this.send({"command": ["playlist-remove", "current"]});
    //this.send({"command": ["stop"]});
    this.send({"command": ["loadfile", tracks[0].path, "append-play"]});
    tracks.slice(1).forEach((track) => {
      this.send({"command": ["loadfile", track.path, "append"]});
    });
  }

  enqueueTracks(tracks) {
    tracks.forEach((track) => {
      this.send({"command": ["loadfile", track.path, "append"]});
    });
  }

  goToPreviousTrack() {
    this.send({"command": ["playlist-prev", "force"]});
  }

  goToNextTrack() {
    this.send({"command": ["playlist-next", "force"]});
  }

  setPlaylistIndex(i) {
    this.send({"command": ["set_property", "playlist-pos", i]});
  }

  refreshPlaylist() {
    this.getProperty('playlist/count');
  }

  removeTrackAtIndex(i) {
    this.send({"command": ["playlist-remove", i]});
    this.refreshPlaylist();
  }
}

export default new MPVPlayer(kMPVURL);
