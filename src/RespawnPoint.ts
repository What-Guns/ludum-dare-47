import {GameObject, SerializedObject} from './GameObject.js';
import {Serializable} from './serialization.js';
import { Car } from './Car.js';

@Serializable()
export class RespawnPoint extends GameObject {
  timeRemaining = 0;

  constructor(data: SerializedObject, private readonly direction: number) {
    super(data);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.strokeStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(this.screenX, this.screenY, 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  tick(dt: number) {
    if(this.timeRemaining <= 0) return;
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    if(this.timeRemaining === 0) {
      const car = new Car({
        direction: this.direction,
        id: Math.floor(Math.random() * 100000),
        map: this.map,
        x: this.x,
        y: this.y,
        name: 'bob',
        type: Car.name,
        properties: {},
      });
      this.map.add(car);
    }
  }

  startTimer() {
    this.timeRemaining = 2000;
    this.map.camera.target = this;
  }

  static async deserialize(data: SerializedObject) {
    const degrees = data.properties.direction;
    if(typeof(degrees) !== 'number') throw new Error(`RespawnPoint requires a direction`);
    return new RespawnPoint(data, - degrees / 180 * Math.PI);
  }
}
