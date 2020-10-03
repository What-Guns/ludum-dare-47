export class Car{
  x: number;
  y: number;
  direction: number;

  //private destination: any;
  //private directionToDestination: any;

  private currentManeuver: Turn | null = null;

  readonly SPEED = 1;
  readonly DISTANCE_FROM_DESTINATION = 5;
  readonly MANEUVER_SPEED = 0.05;

  static IMAGES: Array<HTMLImageElement>;

  lastTurnLeft = false;

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
    this.direction = Math.PI;
  }


  tick(dt: number) {
    this.direction += .1;
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
    if(sin < Math.sin(Math.PI / 8) && sin > Math.sin(15 * Math.PI / 8)) {
      if(cos > 0) {
        return Car.IMAGES[0];
      } else {
        return Car.IMAGES[4];
      }
    } else if(sin < Math.sin(3 * Math.PI / 8) && sin > 0) {
      if(cos > 0) {
        return Car.IMAGES[7];
      } else {
        return Car.IMAGES[5];
      }
    } else if(sin > Math.sin(11 * Math.PI / 8) && sin < 0) {
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