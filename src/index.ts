import {Game} from './Game.js';

addEventListener('load', () => {
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK_ENERGY = 500;

function startTheGameAlready() {
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas!.getContext('2d');
  const game = new Game(canvas);
  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    ctx?.clearRect(0, 0, 600, 800)
    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK_ENERGY);
      game.tick(dt);
      game.draw(timestamp);
      ctx!.fillText(String(1000 / dt), 100, 100);
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }
}