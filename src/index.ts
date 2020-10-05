import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import {Audio} from './Audio.js';
import {Game} from './Game.js';

let outputCanvas: HTMLCanvasElement;
let bufferCanvas: HTMLCanvasElement;

let mainCtx: CanvasRenderingContext2D;
let bufferCtx: CanvasRenderingContext2D;

addEventListener('load', () => {
  outputCanvas = document.getElementById('main') as HTMLCanvasElement;
  bufferCanvas = document.getElementById('buffer') as HTMLCanvasElement;
  mainCtx = outputCanvas.getContext('2d')!;
  bufferCtx = bufferCanvas.getContext('2d')!;

  addEventListener('resize', sizeCanvas);
  sizeCanvas();

  showMenu();
});

function showMenu() {
  if(document.getElementById('menu')) return;

  const mainCtx = outputCanvas.getContext('2d')!;
  mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

  const template = document.getElementById('menu-template') as HTMLTemplateElement;
  const menu = template.content.cloneNode(true) as DocumentFragment;

  for(const button of Array.from(menu.querySelectorAll('button[data-map]'))) {
    button.addEventListener('click', async () => {
      const mapFileName = button.getAttribute('data-map')!;
      closeOverlays();
      await startTheGameAlready(mapFileName);
    });
  }

  document.body.appendChild(menu);
}

function showGameOver() {
  const template = document.getElementById('game-over-template') as HTMLTemplateElement;
  const overlay = template.content.cloneNode(true) as DocumentFragment;
  overlay.querySelector('button')!.addEventListener('click', () => {
    closeOverlays();
    showMenu();
  });
  document.body.appendChild(overlay);
}

function closeOverlays() {
  for(const overlay of Array.from(document.querySelectorAll('.overlay'))) {
    overlay.remove();
  }
}

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;


async function startTheGameAlready(mapPath: string) {

  await loadAudio();
  await loadMap(mapPath);
  //Audio.playMusic('truckin', 2.097)
  
}

async function loadMap(path: string) {
  if(window.game) window.game.over = true;
  const mapData = await loadJson(path);

  const game = await deserialize(Game, { mainCtx, bufferCtx, mapData });

  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    if(game.over) {
      Audio.stfu();
      showGameOver();
      return;
    }
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
}

function sizeCanvas() {
  outputCanvas.width = window.innerWidth;
  outputCanvas.height = window.innerHeight;
  bufferCanvas.width = window.innerWidth;
  bufferCanvas.height = window.innerHeight;
}
