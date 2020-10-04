import { GameObject } from './GameObject.js';
import { Serializable } from './serialization.js';
import { SerializedObject, Chunk } from './Map.js';
import { computeScreenCoords, ScreenPoint } from './math.js';

@Serializable()
export class Obstacle extends GameObject {
  readonly chunks = new Set<Chunk>();
  readonly height: number;
  readonly width: number;
  screenX!: number;
  screenY!: number;

  /** All corners except the top, which is represented by screenX/Y. */
  private otherCorners: ScreenPoint[];

  constructor(data: SerializedObject&{width: number, height: number}) {
    super(data);
    (window as any).obstacle = this;
    const {x, y, width, height, map} = data;
    this.height = height;
    this.width = width;
    this.otherCorners = [
      computeScreenCoords({}, {x: x + width, y}, map.world),
      computeScreenCoords({}, {x: x + width, y: y + height}, map.world),
      computeScreenCoords({}, {x, y: y + height}, map.world),
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

  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);
    return new Obstacle(data as SerializedObject&{width: number, height: number});
  }
}
