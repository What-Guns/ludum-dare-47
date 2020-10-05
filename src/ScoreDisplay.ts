import {HUDElement} from './HUD.js';

export class ScoreDisplay implements HUDElement {
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'right';
    ctx.font = '24px KenneyMini';
    ctx.fillStyle = 'black';
    ctx.fillText(`$${game.gameInfo.score}`, ctx.canvas.width - 30, 50);
  }

  tick() {}
}
