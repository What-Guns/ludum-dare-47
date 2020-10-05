import {GameObject, BaseProps, SerializedObject} from './GameObject.js';
import {Serializable} from './serialization.js';
import {Car} from './Car.js';

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
    }
  }

  spawnGhost(car: Car, carImage: HTMLImageElement) {
    const ghostProps = {
      map: this.map,
      x: car.x,
      y: car.y,
      id: -1,
    };
    this.map.add(new GhostCar(ghostProps, carImage, this));
  }

  spawnCar() {
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

  static async deserialize(data: SerializedObject) {
    const degrees = data.properties.direction;
    if(typeof(degrees) !== 'number') throw new Error(`RespawnPoint requires a direction`);
    return new RespawnPoint(data, - degrees / 180 * Math.PI);
  }
}

export class GhostCar extends GameObject {
  private waitTime = 500;
  private speed = 0.075;

  constructor(props: BaseProps, readonly image: HTMLImageElement, private readonly destination: RespawnPoint) {
    super(props);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.image;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, this.screenY - sprite.height / 2);
    ctx.globalAlpha = 1.0;
  }

  tick(dt: number) {
    this.waitTime = Math.max(0, this.waitTime - dt);

    if(!this.waitTime) {
      const dx = this.destination.x - this.x;
      const dy = this.destination.y - this.y;
      const distSquared = Math.pow(dy, 2) + Math.pow(dx, 2);
      if(distSquared < this.speed) {
        this.respawn();
      }
      else {
        const direction = Math.atan2(dy, dx);
        this.x += Math.cos(direction) * this.speed;
        this.y += Math.sin(direction) * this.speed;
        this.map.objectMoved(this);
      }
    }
  }

  private respawn() {
    this.map.remove(this);
    this.destination.spawnCar();
  }
}
