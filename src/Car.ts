import {isKeyPressed} from './KeyboardListener.js';
import {GameMap, SerializedObject, Terrain} from './Map.js';
import {setXY} from './math.js';
import {Serializable} from './serialization.js';

/* DIRECTIONS
Direction 0 is +x in game space, down-right in screen space
Direction 1 is 45 degrees counterclockwise from 0
This proceeds to direction 7 which is 45 degrees clockwise from 0
*/

const TERRAIN_SPEED: {[key in Terrain]: number} = {
  road: 0.004,
  dirt: 0.001,
  grass: 0.002,
  sand: 0.0005,
  void: 1,
  water: 0,
};

@Serializable()
export class Car {
  x!: number;
  y!: number;
  screenX!: number;
  screenY!: number;
  terrain: Terrain = 'road';

  // Direction of the car from 0-7
  snappedDirectionIndex = 0;
  currentTurn = 0;

  speed = 0;
  timeInReverse = 0;

  readonly MAX_SPEED = 0.003;
  readonly ACCELERATION = 0.000005;
  readonly TURN_SPEED = 1.7;
  readonly BRAKE_DECELERATION = 0.00001;
  readonly REVERSE_ACCELERATION = -0.0002;
  readonly REVERSE_MIN_SPEED = -0.001;
  readonly TIME_BEFORE_REVERSE_LIGHTS = 400;
  readonly TIME_BEFORE_REVERSE = 600;
  readonly DECELERATION_FACTOR = 0.998;

  static IMAGES: Array<HTMLImageElement>;
  static BACKUP_IMAGES: Array<HTMLImageElement>;

  private static async load() {
    Car.IMAGES = await Promise.all([
      'images/car/carBlue6_011.png',
      'images/car/carBlue6_012.png',
      'images/car/carBlue6_006.png',
      'images/car/carBlue6_005.png',
      'images/car/carBlue6_004.png',
      'images/car/carBlue6_009.png',
      'images/car/carBlue6_010.png',
      'images/car/carBlue6_015.png',
    ].map(waitForImageToLoad));
    Car.BACKUP_IMAGES = await Promise.all([
      'images/car/carBlue6_011.png',
      'images/car/carBlue6_012_backup.png',
      'images/car/carBlue6_006_backup.png',
      'images/car/carBlue6_005_backup.png',
      'images/car/carBlue6_004_backup.png',
      'images/car/carBlue6_009_backup.png',
      'images/car/carBlue6_010.png',
      'images/car/carBlue6_015.png',
    ].map(waitForImageToLoad));
  }

  static async deserialize(data: SerializedObject) {
    await this.load();
    const degrees = data.properties.direction as number|undefined ?? 0;
    const direction = -degrees / 180 * Math.PI;
    return new Car(data.map, data.x, data.y, direction);
  }

  constructor(readonly map: GameMap, x:number, y: number, /** Direction in radians */ public direction: number) {
    setXY(this, x, y, map.world);
  }

  tick(dt: number) {
    this.snappedDirectionIndex = this.getSnappedDirectionIndex();
    let turning = false;
    if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) {
      this.accelerate(dt);
    }
    if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) {
      this.turnLeft(dt);
      turning = true;
    }
    if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) {
      this.turnRight(dt);
      turning = true;
    }
    if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) {
      this.brakeOrReverse(dt);
    }
    this.speed *= this.DECELERATION_FACTOR;
    if (!turning) {
      this.snapTurnDirection();
    }
    setXY(this,
      this.x + Math.cos(this.direction) * this.speed * dt, // cos(0) = 1 is to the right, so positive x
      this.y - Math.sin(this.direction) * this.speed * dt, // sin(pi / 2) = 1 is down, so negative y
      this.map.world
    );

    this.terrain = this.map.getTerrain(this);

    if(this.terrain === 'water') this.map.remove(this);
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.chooseSprite(this.snappedDirectionIndex);
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, this.screenY - sprite.height / 2);
  }

  chooseSprite(index: number) {
    return this.timeInReverse > this.TIME_BEFORE_REVERSE_LIGHTS ? Car.BACKUP_IMAGES[index] : Car.IMAGES[index];
  }

  getSnappedDirectionIndex() {
    const d = this.direction;
    const sin = Math.sin(d);
    const cos = Math.cos(d);
    const piOverEight = Math.PI / 8;
    if(sin < Math.sin(piOverEight) && sin > Math.sin(15 * piOverEight)) {
      if(cos > 0) {
        return 0;
      } else {
        return 4;
      }
    } else if(sin < Math.sin(3 * piOverEight) && sin > 0) {
      if(cos > 0) {
        return 1;
      } else {
        return 3;
      }
    } else if(sin > Math.sin(11 * piOverEight) && sin < 0) {
      if(cos > 0) {
        return 7;
      } else {
        return 5;
      }
    }else if(sin > 0) {
      return 2;
    } else {
      return 6;
    }
  }

  accelerate(dt: number) {
    this.timeInReverse = 0;
    this.speed += this.ACCELERATION * dt;
    if (this.speed >= TERRAIN_SPEED[this.terrain]) {
      this.speed = TERRAIN_SPEED[this.terrain]
    }
  }

  turnLeft(dt: number) {
    const turnAmount = this.TURN_SPEED * dt * this.speed;
    this.direction += turnAmount;
    this.currentTurn += turnAmount;
  }

  turnRight(dt: number) {
    const turnAmount = this.TURN_SPEED * dt * this.speed;
    this.direction -= turnAmount;
    this.currentTurn -= turnAmount;
  }

  brakeOrReverse(dt: number) {
    if (this.speed > 0) {
      this.timeInReverse = 0;
      this.speed -= this.BRAKE_DECELERATION * dt;
      if (this.speed < 0) {
        this.speed = 0;
      }
    } else if (this.timeInReverse < this.TIME_BEFORE_REVERSE) {
      this.timeInReverse += dt;
    } else {
      this.speed += this.REVERSE_ACCELERATION * dt;
      if (this.speed < this.REVERSE_MIN_SPEED) {
        this.speed = this.REVERSE_MIN_SPEED;
      }
    }
  }

  snapTurnDirection() {
    if (this.currentTurn < Math.PI / 8 && this.currentTurn > -Math.PI / 8) {
      if (this.currentTurn > 0) {
        this.snappedDirectionIndex++;
      } else if(this.currentTurn < 0) {
        this.snappedDirectionIndex--;
      }
    }
    this.currentTurn = 0;
    this.snappedDirectionIndex += 8;
    this.snappedDirectionIndex %= 8;
    this.direction = Math.PI / 4 * this.snappedDirectionIndex;
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
