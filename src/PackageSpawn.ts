import { GameObject, SerializedObject } from './GameObject.js';
import { Serializable } from './serialization.js';
import {Package} from './Package.js';
import {DeliveryZone} from './DeliveryZone.js';
import {makeRectanglePath} from './math.js';

export interface PackageSpawnProp extends SerializedObject {
  visible?: boolean;
  width: number;
  height: number;
  hasPackage?:boolean;
}

@Serializable()
export class PackageSpawn extends GameObject {
  readonly height: number;
  readonly width: number;
  screenX!: number;
  screenY!: number;
  hasPackage: boolean;
  
  visible: boolean;

  constructor(data: PackageSpawnProp) {
    super(data);
    this.visible = data.visible ?? true;
    this.height = data.height;
    this.width = data.width;
    this.hasPackage = data.hasPackage ?? false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!this.visible) return;
    ctx.save();

    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    makeRectanglePath(ctx, this, this);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  tick() {}

  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);
    await Package.load();
    return new PackageSpawn(data as PackageSpawnProp);
  }

  spawnPackage(dz?: DeliveryZone){
    this.hasPackage = true;
    this.visible = true;

    let deliveryZone = dz;
    if (!dz) {
      const deliveryZones = game.map.expensivelyFindObjectsOfType(DeliveryZone);
      deliveryZone = deliveryZones[Math.floor(Math.random() * deliveryZones.length)];
    }

    deliveryZone = deliveryZone!;

    const apackage = new Package({
      id: Math.floor(Math.random() * 100000),
      x: this.x + Math.random() * this.width,
      y: this.y + Math.random() * this.height,
      name: 'bob',
      type: Package.name,
      properties: {},
      deliveryZone,
    });
    game.map.add(apackage);
    return apackage;
  }
}
