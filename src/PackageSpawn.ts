import { GameObject, SerializedObject } from './GameObject.js';
import { Serializable } from './serialization.js';
import { computeScreenCoords, ScreenPoint } from './math.js';
import {Package} from './Package.js';
import {DeliveryZone} from './DeliveryZone.js';

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

  /** All corners except the top, which is represented by screenX/Y. */
  private otherCorners: ScreenPoint[];

  constructor(data: PackageSpawnProp) {
    super(data);
    this.visible = data.visible ?? true;
    const {x, y, width, height} = data;
    this.height = height;
    this.width = width;
    this.hasPackage = data.hasPackage ?? false;
    this.otherCorners = [
      computeScreenCoords({}, {x: x + width, y}),
      computeScreenCoords({}, {x: x + width, y: y + height}),
      computeScreenCoords({}, {x, y: y + height}),
    ];
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!this.visible) return;
    ctx.save();

    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.screenX, this.screenY);
    for(const corner of this.otherCorners) ctx.lineTo(corner.screenX, corner.screenY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  tick() { 
    if (game.gameInfo.currentlyHeldPackages == 0){
    this.getsPackage
  }
  }

  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);
    return new PackageSpawn(data as PackageSpawnProp);
  }

  pointToClosestEdge(x: number, y: number) {
    const offsetX = (x - this.midpointX()) / (this.width / 2);
    const offsetY = (y - this.midpointY()) / (this.height / 2);
    const pt = {x, y};
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      pt.x = offsetX < 0 ? this.x : this.x + this.width;
    } else {
      pt.y = offsetY < 0 ? this.y : this.y + this.height;
    }
    return pt;
  }

  getsPackage(){
     const randomNum = Math.random();
    if (!this.hasPackage && randomNum < .5){
        this.spawnPackage()
      } else if (!this.hasPackage && randomNum >=.5){
        this.visible = false;
      }
    }
    

  pointIsInside(x: number, y: number) {
    return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
  }

  randomPointInsidePackageSpawn (){
    return [Math.random() * (this.x + this.width - this.x) + this.x, Math.random() * (this.y + this.height - this.y) + this.y]
    
  }

  spawnPackage(){
    this.hasPackage = true;
    this.visible = true;

    const deliveryZones = game.map.expensivelyFindObjectsOfType(DeliveryZone);
    const deliveryZone = deliveryZones[Math.floor(Math.random() * deliveryZones.length)];

    const apackage = new Package({
      id: Math.floor(Math.random() * 100000),
      x: this.randomPointInsidePackageSpawn()[0],
      y: this.randomPointInsidePackageSpawn()[1],
      name: 'bob',
      type: Package.name,
      properties: {},
      deliveryZone,
    });
    game.map.add(apackage);
  }

  

  midpointX() {
    return this.x + this.width/2;
  }

  midpointY() {
    return this.y + this.height/2;
  }
}
