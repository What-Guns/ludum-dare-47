import { GameObject } from './Game.js';
import { Serializable } from './serialization.js';
import { SerializedObject, GameMap } from './Map.js';
import { Point, setXY } from './math.js';

@Serializable()
export class Obstacle implements GameObject, Point {
  screenX!: number;
  screenY!: number;

  private otherCorners: Point[];

  constructor(map: GameMap, public x: number, public y: number, readonly width: number, readonly height: number) {
    setXY(this, x, y, map.world);
    this.otherCorners = [
      setXY({}, x + width, y, map.world),
      setXY({}, x + width, y + height, map.world),
      setXY({}, x, y + height, map.world),
    ];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.screenX, this.screenY);
    for(const corner of this.otherCorners) ctx.lineTo(corner.screenX, corner.screenY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  tick() { }

  static async deserialize({map, x, y, width, height}: SerializedObject) {
    if(typeof(width) !== 'number') throw new Error(`Invalid width ${width}`);
    if(typeof(height) !== 'number') throw new Error(`Invalid height ${height}`);
    return new Obstacle(map, x, y, width, height);
  }
}