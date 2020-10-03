import { Car } from './Car.js';

export class Game{

  private readonly ctx: CanvasRenderingContext2D;
  private readonly car: Car;
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.car = new Car(600, 600);
  }

  tick(dt: number){
    dt + 1;
    this.car.tick(dt);
  }

  draw(timestamp: number){
    timestamp + 1;
    this.car.draw(this.ctx);
  }
};