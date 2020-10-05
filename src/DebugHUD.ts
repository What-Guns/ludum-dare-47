import { HUDElement } from "./HUD.js";

export class DebugHUD implements HUDElement {
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'right';
    ctx.font = '24px KenneyMini';
    ctx.fillStyle = 'black';
    ctx.fillText(`Currently collected packages: ${game.gameInfo.currentlyHeldPackages}`, ctx.canvas.width - 30, 80);
  }

  tick(timestamp: number): void {
    timestamp;
  }
}
