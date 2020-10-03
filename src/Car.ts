import {isKeyPressed} from './KeyboardListener.js';

export class Car{
  x: number;
  y: number;
  direction: number;
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
    Car.IMAGES = await [
      '../images/car/carBlue6_011.png',
      '../images/car/carBlue6_015.png',
      '../images/car/carBlue6_010.png',
      '../images/car/carBlue6_009.png',
      '../images/car/carBlue6_004.png',
      '../images/car/carBlue6_005.png',
      '../images/car/carBlue6_006.png',
      '../images/car/carBlue6_012.png',
    ].map(waitForImageToLoad);
    console.log(Car.IMAGES);
  }

  constructor(x:number, y: number) {
    this.x = x;
    this.y = y;
    this.direction = 0;
    //this.attachKeyboardListener();
  }

  tick(dt: number) {
    //this.direction += .1;
    if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) {
      this.accelerate(dt);
    }
    if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) {
      this.turnLeft(dt);
    }
    if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) {
      this.turnRight(dt);
    }
    if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) {
      this.brakeOrReverse(dt);
    }
    this.x += Math.cos(this.direction) * this.speed * dt;
    this.y -= Math.sin(this.direction) * this.speed * dt;
    /*if (this.currentManeuver) {
      this.progressManeuver();
    } else if(this.destination) {
      if (((this.x - this.destination.x) * (this.x - this.destination.x)) + ((this.y - this.destination.y) * (this.y - this.destination.y)) < this.DISTANCE_FROM_DESTINATION) {
      this.x = this.destination.x;
      this.y = this.destination.y;
      this.destination = null;
      this.directionToDestination = null;
    }
    this.x += Math.cos(this.directionToDestination) * this.SPEED * dt;
    this.y += Math.sin(this.directionToDestination) * this.SPEED * dt;
    }*/
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.chooseSprite(), this.x, this.y);
  }

  chooseSprite() {
    const d = this.direction;
    const sin = Math.sin(d);
    const cos = Math.cos(d);
    const piOverEight = Math.PI / 8;
    if(sin < Math.sin(piOverEight) && sin > Math.sin(15 * piOverEight)) {
      if(cos > 0) {
        return Car.IMAGES[0];
      } else {
        return Car.IMAGES[4];
      }
    } else if(sin < Math.sin(3 * piOverEight) && sin > 0) {
      if(cos > 0) {
        return Car.IMAGES[7];
      } else {
        return Car.IMAGES[5];
      }
    } else if(sin > Math.sin(11 * piOverEight) && sin < 0) {
      if(cos > 0) {
        return Car.IMAGES[1];
      } else {
        return Car.IMAGES[3];
      }
    }else if(sin > 0) {
      return Car.IMAGES[6];
    } else {
      return Car.IMAGES[2];
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
    console.log(this.timeInReverse)
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
}

function waitForImageToLoad(path: string) {
  const img = new Image();
  img.src = path;
  new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
  return img;
}