import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';
import './Map.js';

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

  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    ctx.clearRect(0, 0, 800, 640)

    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK_ENERGY);
      game.tick(dt);
      game.draw(timestamp);
      ctx.fillStyle = "black";
      ctx.fillText(String((1000 / dt).toFixed(0)), 0, 30);
      ctx.fillText("Arrow Keys or WASD to move the car!", 0, 100);
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }
}

async function loadAudio() {
  await Audio.load('audio/music/truckin.ogg', 'truckin');
  await Audio.load('audio/music/intro.ogg', 'intro');
  (document.querySelector('#audioButton') as HTMLButtonElement).onclick = () => Audio.play('truckin', 2.097);
  (document.querySelector('#titleScreenMusicButton') as HTMLButtonElement).onclick = () => Audio.play('intro', 13.640, 25.633);
  (document.querySelector('#stopBGMButton') as HTMLButtonElement).onclick = () => { Audio.stop('intro'); Audio.stop('truckin'); };
}
