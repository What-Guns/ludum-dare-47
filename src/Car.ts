import {isKeyPressed} from './KeyboardListener.js';

/* DIRECTIONS
Direction 0 is +x in game space, down-right in screen space
Direction 1 is 45 degrees counterclockwise from 0
This proceeds to direction 7 which is 45 degrees clockwise from 0
*/

export class Car{
  x: number;
  y: number;

  // Direction of the car in radians
  direction: number;

  // Direction of the car from 0-7
  snappedDirectionIndex = 0;

  speed = 0;
  timeInReverse = 0;

  readonly MAX_SPEED = 0.2;
  readonly ACCELERATION = 0.005;
  readonly TURN_SPEED = 0.005;
  readonly BRAKE_DECELERATION = 0.03;
  readonly REVERSE_ACCELERATION = -0.02;
  readonly REVERSE_MIN_SPEED = -0.1;
  readonly TIME_BEFORE_REVERSE = 400;

  static IMAGES: Array<HTMLImageElement>;

  static async load() {
    Car.IMAGES = await Promise.all([
      'images/car/carBlue6_012.png', // REMOVE THIS TO GO TO ISOMETRIC
      'images/car/carBlue6_006.png',
      'images/car/carBlue6_005.png',
      'images/car/carBlue6_004.png',
      'images/car/carBlue6_009.png',
      'images/car/carBlue6_010.png',
      'images/car/carBlue6_015.png',
      'images/car/carBlue6_011.png',
      //'../images/car/carBlue6_012.png', UNCOMMENT THIS TO GO TO ISOMETRIC
    ].map(waitForImageToLoad));
    console.log(Car.IMAGES);
  }

  constructor(x:number, y: number) {
    this.x = x;
    this.y = y;
    this.direction = 0;
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
    if (!turning) {
      this.snapTurnDirection();
    }
    this.x += Math.cos(this.direction) * this.speed * dt; // cos(0) = 1 is to the right, so positive x
    this.y -= Math.sin(this.direction) * this.speed * dt; // sin(pi / 2) = 1 is up, so negative y
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.chooseSprite(this.snappedDirectionIndex), this.x, this.y);
  }

  chooseSprite(index: number) {
    return Car.IMAGES[index];
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
    this.speed += this.ACCELERATION * dt;
    if (this.speed >= this.MAX_SPEED) {
      this.speed = this.MAX_SPEED;
    }
  }

  turnLeft(dt: number) {
    this.direction += this.TURN_SPEED * dt;
  }

  turnRight(dt: number) {
    this.direction -= this.TURN_SPEED * dt;
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
