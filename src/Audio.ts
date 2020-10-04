import {loadAudioAsync} from './loader.js';

export class Audio {
  static readonly audioContext = new AudioContext();
  static soundLibrary: {[key in string]: AudioBuffer} = {};
  static async load(path: string, name: string) {
    (window as any).ac = Audio.audioContext;
    this.soundLibrary[name] = await loadAudioAsync(path, Audio.audioContext);
  }

  static currentlyPlayingSounds: {[key in string]: AudioBufferSourceNode} = {};

  static play(trackName: string, loopStart = -1, loopEnd = 0) {
    if(this.currentlyPlayingSounds[trackName]) {
      Audio.stop(trackName);
    }
    const bufferSource = Audio.audioContext.createBufferSource();
    bufferSource.buffer = Audio.soundLibrary[trackName];
    bufferSource.connect(Audio.audioContext.destination);
    bufferSource.loop = loopStart !== -1;
    if (bufferSource.loop) {
      bufferSource.loopStart = loopStart;
      bufferSource.loopEnd = loopEnd || bufferSource.buffer.duration;
    }
    bufferSource.start(0);
    this.currentlyPlayingSounds[trackName] = bufferSource;
  }

  static stop(trackName: string) {
    const namedTrack = this.currentlyPlayingSounds[trackName];
    if (namedTrack) {
      namedTrack.stop();
    }
    delete this.currentlyPlayingSounds[trackName];
  }

  static setPlaybackSpeed(trackName: string, speed: number) {
    const namedTrack = this.currentlyPlayingSounds[trackName];
    if(namedTrack) {
      namedTrack.playbackRate.value = speed;
    }
  }
}

