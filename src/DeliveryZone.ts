import {GameObject, BaseProps} from './GameObject.js';
import {Serializable} from './serialization.js';
import {makeRectanglePath, Size, ScreenPoint, Point, computeScreenCoords} from './math.js';

@Serializable()
export class DeliveryZone extends GameObject {
  readonly width: number;
  readonly height: number;

  readonly center: Point&ScreenPoint;

  constructor({width, height, ...props}: BaseProps&Size) {
    super(props);
    this.width = width;
    this.height = height;
    this.center = {
      x: this.x + width / 2, y: this.y + height/2,
      screenX: 0, screenY:0,
    };
    computeScreenCoords(this.center, this.center);
  }

  draw(ctx: CanvasRenderingContext2D, noReally = false) {
    if(!game.debugmode && !noReally) return;
    ctx.save();
    ctx.fillStyle = 'rgba(248, 131, 121, 0.25)';
    ctx.strokeStyle = '#F88379';
    makeRectanglePath(ctx, this, this);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  tick() {}

  static async deserialize(data: BaseProps&Partial<Size>) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);
    return new this(data as BaseProps&Size);
  }
}
