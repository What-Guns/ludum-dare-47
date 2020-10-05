import { Audio } from './Audio.js';
import { HUDElement } from './HUD.js';

export class AudioControls implements HUDElement {
  sfxIsMuted = true;
  musicIsMuted = true;
  images: {[key in string]: HTMLImageElement} = {};

  constructor() {
    this.loadImage('AUDIO_ON', 'images/ui/audioOn.png');
    this.loadImage('AUDIO_OFF', 'images/ui/audioOff.png');
    this.loadImage('MUSIC_ON', 'images/ui/musicOn.png');
    this.loadImage('MUSIC_OFF', 'images/ui/musicOff.png');
    // Audio.setSFXGain(!this.sfxIsMuted ? 1 : 0);
    // Audio.setMusicGain(!this.musicIsMuted ? 1 : 0);

    document.querySelector('canvas')!.addEventListener('click', ev => {
      if (ev.offsetX > 30 && ev.offsetX < 55 && ev.offsetY > 10 && ev.offsetY < 35) this.sfxIsMuted = Audio.setSFXGain(this.sfxIsMuted ? 1 : 0);
      if (ev.offsetX > 10 && ev.offsetX < 35 && ev.offsetY > 30 && ev.offsetY < 55) this.musicIsMuted = Audio.setMusicGain(this.musicIsMuted ? 1 : 0);
    })
  }

  loadImage(name: string, path: string) {
    const img = new Image();
    img.src = path;
    return new Promise<HTMLImageElement>((resolve, reject) => {
      img.addEventListener('load', ev => resolve(ev.target as HTMLImageElement));
      img.addEventListener('error', reject);
    }).then(img => this.images[name] = img );
  }
  
  draw(ctx: CanvasRenderingContext2D){
    const sfxIcon = this.sfxIsMuted ? this.images.AUDIO_OFF : this.images.AUDIO_ON;
    if (sfxIcon) ctx.drawImage(sfxIcon, 30, 10, 25, 25);
    const musicIcon = this.musicIsMuted ? this.images.MUSIC_OFF : this.images.MUSIC_ON;
    if (musicIcon) ctx.drawImage(musicIcon, 10, 30, 25, 25);
  }

  tick(dt: number) {dt}
}

