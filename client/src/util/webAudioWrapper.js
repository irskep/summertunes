const requestAudio = function(path, callback) {
  var request;
  request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData;
    audioData = request.response;
    return callback(audioData);
  };
  return request.send();
};

class MusicTrack {
  constructor(player, path1, onended, onloaded) {
    this.paused = false;
    this.stopped = true;
    this.soundStart = 0;
    this.pauseOffset = 0;
    this.player = player;
    this.path = path1;
    this.onended = onended;
    this.onloaded = onloaded;
    requestAudio(this.path, (function(_this) {
      return function(audioData) {
        return _this.player.ctx.decodeAudioData(audioData, function(decodedData) {
          _this.buffer = decodedData;
          _this.onloaded();
          return _this.initializeSource();
        });
      };
    })(this));
  }

  initializeSource() {
    this.source = this.player.ctx.createBufferSource();
    this.source.connect(this.player.gainNode);
    this.source.buffer = this.buffer;
    return this.source.onended = this.onended;
  };

  play() {
    if (!this.paused && this.stopped) {
      this.soundStart = Date.now();
      this.source.onended = this.onended;
      this.source.start();
      return this.stopped = false;
    } else if (this.paused) {
      this.paused = false;
      this.source.onended = this.onended;
      return this.source.start(0, this.pauseOffset / 1000);
    }
  };

  stop() {
    if (!this.stopped) {
      this.source.onended = null;
      this.source.stop();
      this.stopped = true;
      this.paused = false;
      return this.initializeSource();
    }
  };

  pause() {
    if (!(this.paused || this.stopped)) {
      this.pauseOffset = Date.now() - this.soundStart;
      this.paused = true;
      this.source.onended = null;
      this.source.stop();
      return this.initializeSource();
    }
  };

  getDuration() {
    return this.buffer.duration;
  };

  getPosition() {
    if (this.paused) {
      return this.pauseOffset / 1000;
    } else if (this.stopped) {
      return 0;
    } else {
      return (Date.now() - this.soundStart) / 1000;
    }
  };

  setPosition(position) {
    if (position < this.buffer.duration) {
      if (this.paused) {
        return this.pauseOffset = position;
      } else if (this.stopped) {
        this.stopped = false;
        this.soundStart = Date.now() - position * 1000;
        this.source.onended = this.onended;
        return this.source.start(0, position);
      } else {
        this.source.onended = null;
        this.source.stop();
        this.initializeSource();
        this.soundStart = Date.now() - position * 1000;
        return this.source.start(0, position);
      }
    } else {
      throw new Error("Cannot play further the end of the track");
    }
  };
}

class MusicPlayer {
  constructor() {
    this.playlist = [];
    this.muted = false;

    this.onSongFinished = function(path) { };
    this.onPlaylistEnded = function() { };
    this.onPlayerStopped = function() { };
    this.onPlayerPaused = function() { };
    this.onTrackLoaded = function(path) { };
    this.onTrackAdded = function(path) { };
    this.onTrackRemoved = function(path) { };
    this.onVolumeChanged = function(value) { };
    this.onMuted = function() { };
    this.onUnmuted = function() { };
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
  }

  setVolume(value) {
    this.gainNode.gain.value = value;
    return this.onVolumeChanged(value);
  };

  getVolume() {
    return this.gainNode.gain.value;
  };

  toggleMute() {
    if (this.muted) {
      this.muted = false;
      this.gainNode.gain.value = this.previousGain;
      return this.onUnmuted();
    } else {
      this.previousGain = this.gainNode.gain.value;
      this.gainNode.gain.value = 0;
      this.muted = true;
      return this.onMuted();
    }
  };

  pause () {
    if (this.playlist.length !== 0) {
      this.playlist[0].pause();
      return this.onPlayerPaused();
    }
  };

  stop() {
    if (this.playlist.length !== 0) {
      this.playlist[0].stop();
      return this.onPlayerStopped();
    }
  };

  play() {
    if (this.playlist.length !== 0) {
      return this.playlist[0].play();
    }
  };

  playNext() {
    if (this.playlist.length !== 0) {
      this.playlist[0].stop();
      this.playlist.shift();
      if (this.playlist.length === 0) {
        return this.onPlaylistEnded();
      } else {
        return this.playlist[0].play();
      }
    }
  };

  addTrack(path) {
    var finishedCallback, loadedCallback;
    finishedCallback = (function(_this) {
      return function() {
        _this.onSongFinished(path);
        return _this.playNext();
      };
    })(this);
    loadedCallback = (function(_this) {
      return function() {
        return _this.onTrackLoaded(path);
      };
    })(this);
    return this.playlist.push(new MusicTrack(this, path, finishedCallback, loadedCallback));
  };

  insertTrack(index, path) {
    var finishedCallback, loadedCallback;
    finishedCallback = (function(_this) {
      return function() {
        _this.onSongFinished(path);
        return _this.playNext();
      };
    })(this);
    loadedCallback = (function(_this) {
      return function() {
        return _this.onTrackLoaded(path);
      };
    })(this);
    return this.playlist.splice(index, 0, new MusicTrack(this, path, finishedCallback, loadedCallback));
  };

  removeTrack(index) {
    var song;
    song = this.playlist.splice(index, 1);
    return this.onTrackRemoved(song.path);
  };

  replaceTrack(index, path) {
    var finishedCallback, loadedCallback, newTrack, oldTrack;
    finishedCallback = (function(_this) {
      return function() {
        _this.onSongFinished(path);
        return _this.playNext();
      };
    })(this);
    loadedCallback = (function(_this) {
      return function() {
        return _this.onTrackLoaded(path);
      };
    })(this);
    newTrack = new MusicTrack(this, path, finishedCallback, loadedCallback);
    oldTrack = this.playlist.splice(index, 1, newTrack);
    return this.onTrackRemoved(oldTrack.path);
  };

  getSongDuration(index) {
    if (this.playlist.length === 0) {
      return 0;
    } else {
      if (index != null) {
        return this.playlist[index] ? this.playlist[index].getDuration() : 0;
      } else {
        return this.playlist[0].getDuration();
      }
    }
  };

  getSongPosition() {
    if (this.playlist.length === 0) {
      return 0;
    } else {
      return this.playlist[0].getPosition();
    }
  };

  setSongPosition(value) {
    if (this.playlist.length !== 0) {
      return this.playlist[0].setPosition(value);
    }
  };

  removeAllTracks() {
    this.stop();
    this.playlist = [];
  };
}

export default MusicPlayer;