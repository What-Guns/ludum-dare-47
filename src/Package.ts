import {GameObject, SerializedObject} from './GameObject.js';
import {Point} from './math.js';
import {DeliveryZone} from './DeliveryZone.js';
import { Job } from './Job.js';

export class Package extends GameObject {
  screenX!: number;
  screenY!: number;

  bob = Math.random() * 1000;
  readonly bobSpeed = .006;
  readonly bobAmplitude = 3;

  job?: Job;

  spriteIndex: number;
  static IMAGES: Array<HTMLImageElement>;

  readonly deliveryZone: DeliveryZone;

  static async load() {
    Package.IMAGES = await Promise.all([
      'images/items/package.png',
      'images/items/box1.png',
      'images/items/box2.png',
    ].map(waitForImageToLoad));
  }

  tick(dt: number) {
    this.bob += dt;
    if(!this.deliveryZone) {
      console.error(`Package had no delivery zone! Picking closest one.`);
      (this as any).deliveryZone = game.map.expensivelyFindNearestOfType(DeliveryZone, this);
      if(!this.deliveryZone) throw new Error(`No delivery zone found`);
    }
  }

  dragTowards({x, y}: Point) {
    this.bob = 0;
    const dx = x - this.x;
    const dy = y - this.y;
    const dist = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2)) - 0.5;
    if(dist < 0) return;
    const direction = Math.atan2(dy, dx);
    // const speed = Math.min(dist, TERRAIN_SPEED.road * dt);
    this.x += Math.cos(direction) * dist;
    this.y += Math.sin(direction) * dist;
    game.map.objectMoved(this);
  }

  deliver() {
    game.map.remove(this);
    this.job?.deliverPackage(this);
  }

  static async deserialize(data: SerializedObject&{deliveryZone: DeliveryZone}) {
    await this.load();
    return new Package(data);
  }

  constructor({deliveryZone, ...serialized}: SerializedObject&{deliveryZone: DeliveryZone}) {
    super(serialized);
    this.spriteIndex = Math.floor(1 + Math.random() * 2);
    this.deliveryZone = deliveryZone;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.chooseSprite(this.spriteIndex);
    const bobOffset = Math.sin(this.bob * this.bobSpeed) * this.bobAmplitude;
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, bobOffset + this.screenY - sprite.height / 2);
    if(game.debugmode) {
      ctx.fillText(this.id?.toString() ?? 'PACKAGE WITH NO ID', this.screenX + 30, this.screenY + 30);
    }

    if(this.isHeld()) {
      const dest = this.deliveryZone;
      const direction = Math.atan2(dest.center.y - this.y, dest.center.x - this.x);
      ctx.save();
      ctx.translate(this.screenX, this.screenY);
      ctx.scale(1, 0.5);
      ctx.rotate(direction + Math.PI / 4);
      ctx.strokeStyle = '#F88379';
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(248, 131, 121, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 32, - Math.PI / 8, Math.PI / 8, false);
      ctx.lineTo(50, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      dest.draw(ctx, 0.5);
    } else {
      if(this.job && this.job.packages[0] === this) this.drawJob(ctx);
    }
  }

  addDestinationPoint() {
    game.hud.minimap.addPoint(this.deliveryZone, 'cyan')
  }

  private isHeld() {
    return game.map.car?.hasPackage(this) ?? false;
  }

  private chooseSprite(index: number) {
    return Package.IMAGES[index];
  }

  private drawJob(ctx: CanvasRenderingContext2D) {
    if(!this.job) return;
    const value = this.job.score / this.job.packages.length;
    ctx.textAlign = 'center';
    ctx.font = '12px KenneyMini';
    ctx.fillStyle = 'green';
    let sx = 0;
    let sy = 0;
    for(const pkg of this.job.packages) {
      sx += pkg.screenX;
      sy += pkg.screenY;
    }

    sx /= this.job.packages.length;
    sy /= this.job.packages.length;
    ctx.fillText(`$${value}`, sx, sy - 30);
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
