import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';
import {Game} from './Game.js';

addEventListener('load', () => {
  for(const button of Array.from(document.querySelectorAll('button[data-map]'))) {
    button.addEventListener('click', () => {
      startTheGameAlready(button.getAttribute('data-map')!);
    });
  }
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

let outputCanvas: HTMLCanvasElement;
let bufferCanvas: HTMLCanvasElement;

async function startTheGameAlready(mapPath: string) {
  const menu = document.getElementById('menu');
  if(menu) menu.remove();
  outputCanvas = document.getElementById('main') as HTMLCanvasElement;
  bufferCanvas = document.getElementById('buffer') as HTMLCanvasElement;

  await loadAudio();
  await loadMap(mapPath);
  //Audio.playMusic('truckin', 2.097)
  
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
    requestAnimationFrame(tick);
  }
}

async function loadAudio() {
  await Audio.load('audio/music/truckin.ogg', 'truckin');
  await Audio.load('audio/music/intro.ogg', 'intro');
  // (document.querySelector('#titleScreenMusicButton') as HTMLButtonElement).onclick = () => Audio.playMusic('intro', 13.640, 25.633);
}

(window as any).loadTut = () => { Audio.stop('truckin'); Audio.stop('intro'); loadMap('maps/tutorial.json'); }
(window as any).loadMain = () => { Audio.stop('truckin'); Audio.stop('intro'); loadMap('maps/map.json');} 

