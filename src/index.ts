import Game from '../dist/Game.js';

addEventListener('load', () => {
  //const ctx = document.querySelector('canvas')!.getContext('2d')!;
  //ctx.fillText('this is a video game', 100, 100);
  startTheGameAlready()
});

// any tick longer than this will be split into smaller ticks
const BIG_TICK = 500;

function startTheGameAlready() {
  const canvas = document.querySelector('canvas')!;
  const ctx = canvas!.getContext('2d');
  const game = new Game(canvas);
  requestAnimationFrame(tick);

  let lastTick = 0;
  function tick(timestamp: number) {
    ctx?.clearRect(0, 0, 600, 800)
    ctx!.fillText(timestamp, 100, 100);
    if(lastTick !== 0) {
      const dt = Math.min(timestamp - lastTick, BIG_TICK);
      game.tick(dt);
      game.draw(timestamp);
    }

    lastTick = timestamp;
    requestAnimationFrame(tick);
  }
}