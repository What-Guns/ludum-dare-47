import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';

addEventListener('load', () => {
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

async function startTheGameAlready() {
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas!.getContext('2d')!;
  // const mapData = await loadJson('maps/map.json');
  const mapData = await loadJson('maps/map.json');
  await loadAudio();

  const game = await deserialize('Game', { ctx, mapData });
  Audio.playMusic('truckin', 2.097)

  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    ctx.clearRect(0, 0, 800, 640)

    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK_ENERGY);
      game.tick(dt);
      game.draw(timestamp);
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }
}

async function loadAudio() {
  await Audio.load('audio/music/truckin.ogg', 'truckin');
  await Audio.load('audio/music/intro.ogg', 'intro');
  // (document.querySelector('#titleScreenMusicButton') as HTMLButtonElement).onclick = () => Audio.playMusic('intro', 13.640, 25.633);
}
