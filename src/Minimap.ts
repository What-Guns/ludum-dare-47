import { Car } from "./Car.js";
import { GameMap } from "./GameMap.js";
import { GameObject } from "./GameObject.js";

export class Minimap {
  readonly mapImage: HTMLImageElement;
  readonly points: Array<MinimapPoint>;

  readonly mapOffsetX = 70;
  readonly mapOffsetY = -69;

  readonly mapScaleX = 2;
  readonly mapScaleY = 1.0;
  readonly mapAlpha = 0.85

  readonly blinkOnTime = 700;
  readonly blinkOffTime = 400;

  blinkTime = 0;
  drawPoints = true;

  constructor(readonly map: GameMap) {
    const canvas = document.createElement('canvas');
    canvas.height = map.heightInTiles;
    canvas.width = map.widthInTiles;
    const ctx = canvas.getContext('2d')!;
    map.drawMinimap(ctx);
    this.mapImage = new Image();
    this.mapImage.src = ctx.canvas.toDataURL();
    this.points = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.scale(this.mapScaleX, this.mapScaleY);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = 'black 2px';
    ctx.strokeRect(this.mapOffsetX-1, this.mapOffsetY-1, this.mapImage.width + 1, this.mapImage.height + 1)
    ctx.globalAlpha = this.mapAlpha;
    ctx.drawImage(this.mapImage, this.mapOffsetX, this.mapOffsetY, this.mapImage.width, this.mapImage.height);
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

  addPoint(obj: GameObject, color = '#F00') {
    if(obj instanceof Car) {
      this.points.push(new MinimapPoint(obj, color)); // Cars are very important
    } else {
      this.points.unshift(new MinimapPoint(obj, color));
    }
  }

  removePoint(obj: GameObject) {
    const i = this.points.findIndex(p => p.obj === obj);
    if (i > -1) {
      this.points.splice(i, 1);
    } else {
      console.error('Tried to remove something from the minimap that was not there', obj)
    }
  }
}

class MinimapPoint{
  constructor(readonly obj: GameObject, readonly color: string) {}

  draw(ctx:CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.obj.x - 1, this.obj.y - 1, 3, 3)
  }
}
