import {loadAudioAsync} from './loader.js';

export class Audio {
  private static createdAudioContext: AudioContext|null = null;

  static get audioContext() {
    if(!this.createdAudioContext) {
      console.log(`created audio context`);
      this.createdAudioContext = new AudioContext();
    }
    return this.createdAudioContext;
  }
  static soundLibrary: {[key in string]: AudioBuffer} = {};
  static sfxNode: GainNode;
  static musicNode: GainNode;
  static async load(path: string, name: string) {
    (window as any).ac = Audio.audioContext;
    if(this.soundLibrary[name]) return;
    this.soundLibrary[name] = await loadAudioAsync(path, Audio.audioContext);
    this.sfxNode = Audio.audioContext.createGain();
    this.musicNode = Audio.audioContext.createGain();
    this.sfxNode.connect(Audio.audioContext.destination);
    this.musicNode.connect(Audio.audioContext.destination);
    this.sfxNode.gain.value = 1;
    this.musicNode.gain.value = 1;
  }

  static currentlyPlayingSounds: {[key in string]: AudioBufferSourceNode} = {};

  static playSFX(trackName: string, loopStart = -1, loopEnd = 0) {
    Audio.play(this.sfxNode, trackName, loopStart, loopEnd);
  }

  static playMusic(trackName: string, loopStart = -1, loopEnd = 0) {
    Audio.play(this.musicNode, trackName, loopStart, loopEnd);
  }

  static setSFXGain(gain: number) {
    this.sfxNode.gain.value = gain;
    return !gain;
  }

  static setMusicGain(gain: number) {
    this.musicNode.gain.value = gain;
    return !gain;
  }

  private static play(destination: AudioNode, trackName: string, loopStart: number, loopEnd: number) {
    if(this.currentlyPlayingSounds[trackName]) {
      Audio.stop(trackName);
    }
    const bufferSource = Audio.audioContext.createBufferSource();
    bufferSource.buffer = Audio.soundLibrary[trackName];
    bufferSource.connect(destination);
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

