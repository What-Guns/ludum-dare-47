import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';
import {Game} from './Game.js';

addEventListener('load', () => {
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

let currentMapPath = 'maps/tutorial.json';

let outputCanvas: HTMLCanvasElement;
let bufferCanvas: HTMLCanvasElement;

async function startTheGameAlready() {
  outputCanvas = document.getElementById('main') as HTMLCanvasElement;
  bufferCanvas = document.getElementById('buffer') as HTMLCanvasElement;

  await loadMap(currentMapPath);
  await loadAudio();
  Audio.playMusic('truckin', 2.097)
  
  addEventListener('resize', sizeCanvas);

  sizeCanvas();

  function sizeCanvas() {
    outputCanvas.width = window.innerWidth;
    outputCanvas.height = window.innerHeight;
    bufferCanvas.width = window.innerWidth;
    bufferCanvas.height = window.innerHeight;
  }
}

async function loadMap(path: string) {
  if(window.game) window.game.over = true;
  currentMapPath = path;
  const mainCtx = outputCanvas.getContext('2d')!;
  const bufferCtx = bufferCanvas.getContext('2d')!;
  const mapData = await loadJson(path);

  const game = await deserialize(Game, { mainCtx, bufferCtx, mapData });

  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    if(game.over) return;
    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK_ENERGY);
      game.tick(dt);
      game.draw();
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

