import {Serializable} from './serialization.js';
import {GameObject, SerializedObject} from './GameObject.js';
import {Car} from './Car.js';
import {clamp, computeScreenCoords, ScreenPoint, makeRectanglePath} from './math.js';
import {Audio} from './Audio.js';

@Serializable()
export class Portal extends GameObject {
  readonly width: number;
  readonly height: number;
  readonly center: ScreenPoint;
  destination?: number;

  constructor({width, height, properties, ...data}: SerializedObject) {
    super(data);
    this.destination = properties.destination as number|undefined;

    if(!width || !height) throw new Error('Portal has invalid size');
    this.width = width!;
    this.height = height!;

    this.center = computeScreenCoords({}, {x: this.x + this.width / 2, y: this.y + this.height / 2}, this.map.world);
  }

  tick() {
    this.warpCars();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'blue';

    makeRectanglePath(ctx, this, this, this.map.world);
    ctx.stroke();

    const dest = this.destination && this.map.find(this.destination);
    if(dest) {
      ctx.beginPath();
      ctx.moveTo(this.center.screenX, this.center.screenY);
      ctx.lineTo(dest.screenX + (dest.width ?? 0)/2, dest.screenY + (dest.height ?? 0)/2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private warpCars() {
    if(!this.destination) return;
    for(const chunk of this.chunks) {
      for(const obj of chunk.objects) {
        if(obj instanceof Car) this.warpCar(obj);
      }
    }
  }

  private warpCar(car: Car) {
    const destObj = this.destination && this.map.find(this.destination);
    if(!destObj) return;
    const diffX = car.x - (this.x + (this.width / 2));
    const diffY = car.y - (this.y + (this.height / 2));

    const clampedDiffX = clamp(diffX, -this.width / 2, this.width / 2);
    const clampedDiffY = clamp(diffY, -this.height / 2, this.height / 2);

    const collisionX = this.x + this.width / 2 + clampedDiffX;
    const collisionY = this.y + this.height / 2 + clampedDiffY;

    const distSquared = Math.pow(collisionX - car.x, 2) + Math.pow(collisionY - car.y, 2);

    const isColliding = (distSquared <= car.radius * car.radius);

    if(isColliding) {
      car.x = destObj.x + (destObj.width ?? 0)/2;
      car.y = destObj.y + (destObj.height ?? 0)/2;
      Audio.playSFX('warp');
      this.map.objectMoved(car);
    }
  }

  static async deserialize(obj: SerializedObject) {
    await Audio.load('audio/sfx/warp.wav', 'warp');
    return new Portal(obj);
  }
}
