import { DynamicGameInfo } from './GameInfo.js';
import { HUDElement } from "./HUD.js";

export class DebugHUD implements HUDElement {
  draw(ctx: CanvasRenderingContext2D): void {
    if(!game.debugmode) return;
    ctx.textAlign = 'right';
    ctx.font = '24px KenneyMini';
    ctx.fillStyle = 'black';
    ctx.fillText(`Currently collected packages: ${game.gameInfo.currentlyHeldPackages}`, ctx.canvas.width - 30, 80);
    if(game.gameInfo instanceof DynamicGameInfo) {
      ctx.fillText(`Difficulty: ${Math.floor(game.gameInfo.difficulty * 100)}%`, ctx.canvas.width - 30, 100);
    }
  }

  tick(timestamp: number): void {
    timestamp;
  }
}
