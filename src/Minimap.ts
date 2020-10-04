import { GameMap } from "./GameMap.js";
import { GameObject } from "./GameObject.js";

export class Minimap {
  readonly mapImage: HTMLImageElement;
  readonly points: Array<MinimapPoint>;

  readonly mapOffsetX = 60;
  readonly mapOffsetY = -40;

  readonly blinkOnTime = 700;
  readonly blinkOffTime = 400;

  blinkTime = 0;
  drawPoints = true;

  constructor(readonly map: GameMap) {
    const canvas = document.createElement('canvas');
    canvas.height = 200;
    canvas.width = 200;
    const ctx = canvas.getContext('2d')!;
    map.drawMinimap(ctx);
    this.mapImage = new Image();
    this.mapImage.src = ctx.canvas.toDataURL();
    this.points = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.rotate(Math.PI / 4);
    ctx.drawImage(this.mapImage, this.mapOffsetX, this.mapOffsetY);
    ctx.globalAlpha = 1;
    ctx.translate(this.mapOffsetX, this.mapOffsetY)
    if (this.drawPoints) this.points.forEach(p => p.draw(ctx));
    ctx.restore();
  }

  tick(dt: number) {
    this.blinkTime += dt;
    this.blinkTime %= (this.blinkOnTime + this.blinkOffTime);
    this.drawPoints = this.blinkTime < this.blinkOnTime;
  }

  addPoint(name: string, obj: GameObject, color = '#F00') {
    this.points.push(new MinimapPoint(name, obj, color))
  }

  removePoint(name: string) {
    this.points.splice(this.points.findIndex(p => p.name === name), 1);
  }
}

class MinimapPoint{
  constructor(readonly name: string, readonly obj: GameObject, readonly color: string) {}

  draw(ctx:CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.obj.x - 1, this.obj.y - 1, 3, 3)
  }
}