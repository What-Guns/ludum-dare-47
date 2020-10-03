import {Car} from './Car.js';
import {loadJson} from './loader.js';
import {deserialize} from './serialization.js';
import './Game.js';
import './Map.js';

addEventListener('load', () => {
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

async function startTheGameAlready() {
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas!.getContext('2d')!;
  await Car.load();
  const mapData = await loadJson('maps/map.json');
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
      ctx.fillText(String(1000 / dt), 0, 30);
      ctx.fillText("Arrow Keys or WASD to move the car!", 0, 100);
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }
}
