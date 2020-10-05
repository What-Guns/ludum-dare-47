import {Serializable} from './serialization.js';
import {GameObject, SerializedObject} from './GameObject.js';
import {Car} from './Car.js';
import {clamp, computeScreenCoords, ScreenPoint} from './math.js';
import {Audio} from './Audio.js';

@Serializable()
export class Portal extends GameObject {
  readonly width: number;
  readonly height: number;
  readonly center: ScreenPoint;
  destination?: number;

  static IMAGES: Array<HTMLImageElement> = [];

  readonly timeBetweenRotation = 100;
  currentFace = 0;
  currentTime = 0;

  cooldown = 0;

  constructor({width, height, properties, ...data}: SerializedObject) {
    super(data);
    this.destination = properties.destination as number|undefined;

    if(!width || !height) throw new Error('Portal has invalid size');
    this.width = width!;
    this.height = height!;

    this.center = computeScreenCoords({}, {x: this.x + this.width / 2, y: this.y + this.height / 2});
  }

  tick(dt: number) {
    this.warpCars();
    this.currentTime += dt;
    this.cooldown -= dt;
    if (this.currentTime > this.timeBetweenRotation) {
      this.currentTime -= this.timeBetweenRotation;
      this.currentFace ++;
      this.currentFace %= Portal.IMAGES.length;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currentImage = Portal.IMAGES[this.currentFace];
    if (!currentImage) return;
    ctx.save();
    ctx.drawImage(currentImage, this.center.screenX, this.center.screenY, 50, 20)
    ctx.restore();
  }

  private warpCars() {
    if(!this.destination) return;
    if(this.cooldown > 0) return;
    for(const chunk of this.chunks) {
      for(const obj of chunk.objects) {
        if(obj instanceof Car) this.warpCar(obj);
      }
    }
  }

  private warpCar(car: Car) {
    const destObj = this.destination && game.map.find(this.destination);
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
      const dest = this.destination ? game.map.find(this.destination) : undefined;
      if(dest && (dest instanceof Portal)) dest.setCooldown();
      car.x = destObj.x + (destObj.width ?? 0)/2;
      car.y = destObj.y + (destObj.height ?? 0)/2;
      Audio.playSFX('warp');
      game.map.objectMoved(car);
      game.hud.minimap.addPoint(this, 'purple')
      dest && game.hud.minimap.addPoint(dest, 'purple')
    }
  }

  setCooldown() {
    this.cooldown = 1000;
  }

  static async deserialize(obj: SerializedObject) {
    await this.load();
    await Audio.load('audio/sfx/warp.wav', 'warp');
    return new Portal(obj);
  }

  static async load() {
    Portal.IMAGES = await Promise.all([
      'images/items/portal1.png',
      'images/items/portal2.png',
      'images/items/portal3.png',
      'images/items/portal4.png',
    ].map(waitForImageToLoad));
  }
}

async function waitForImageToLoad(path: string) {
  const img = new Image();
  img.src = path;
  await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
  return img;
}

