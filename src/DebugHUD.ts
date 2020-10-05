import { GameMap } from "./GameMap.js";
import { HUDElement } from "./HUD.js";

export class DebugHUD implements HUDElement {
  constructor(readonly map: GameMap){}

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.map.gameInfo) return;

    ctx.textAlign = 'right';
    ctx.font = '24px KenneyMini';
    ctx.fillStyle = 'black';
    ctx.fillText(`Currently collected packages: ${this.map.gameInfo.currentlyHeldPackages}`, ctx.canvas.width - 30, 50);
  }

  tick(timestamp: number): void {
    timestamp;
  }
  
}