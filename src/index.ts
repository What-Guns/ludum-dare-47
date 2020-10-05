import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';

addEventListener('load', () => {
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

let currentMapPath = 'maps/map.json';

async function startTheGameAlready() {
  const canvas = document.querySelector('canvas')!;

  await loadMap(currentMapPath);
  await loadAudio();
  Audio.playMusic('truckin', 2.097)
  
  addEventListener('resize', sizeCanvas);

  sizeCanvas();

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

async function loadMap(path: string) {
  currentMapPath = path;
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas!.getContext('2d')!;
  const mapData = await loadJson(path);

  const game = await deserialize('Game', { ctx, mapData });

  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK_ENERGY);
      game.tick(dt);
      game.draw(timestamp);
    }

    lastTick = timestamp;
    if (currentMapPath === path) requestAnimationFrame(tick);
  }
}

async function loadAudio() {
  await Audio.load('audio/music/truckin.ogg', 'truckin');
  await Audio.load('audio/music/intro.ogg', 'intro');
  // (document.querySelector('#titleScreenMusicButton') as HTMLButtonElement).onclick = () => Audio.playMusic('intro', 13.640, 25.633);
}

(window as any).loadTut = () => loadMap('maps/tutorial.json');
(window as any).loadMain = () => loadMap('maps/map.json');

