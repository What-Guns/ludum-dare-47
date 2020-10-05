import { GameObject, SerializedObject } from './GameObject.js';
import { Serializable } from './serialization.js';
import {makeRectanglePath} from './math.js'

export interface ObstacleProps extends SerializedObject {
  visible?: boolean;
  width: number;
  height: number;
}

@Serializable()
export class Obstacle extends GameObject {
  readonly height: number;
  readonly width: number;
  screenX!: number;
  screenY!: number;

  visible: boolean;

  constructor(data: ObstacleProps) {
    super(data);
    this.visible = data.visible ?? true;
    const {width, height} = data;
    this.height = height;
    this.width = width;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if(!this.visible) return;
    ctx.save();

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    makeRectanglePath(ctx, this, this);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  tick() { }

  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);
    return new Obstacle(data as ObstacleProps);
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

  midpointX() {
    return this.x + this.width/2;
  }

  midpointY() {
    return this.y + this.height/2;
  }
}
