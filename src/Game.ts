import { Car } from './Car.js';
import { StreetGrid } from './StreetGrid.js';

export class Game{

  private readonly ctx: CanvasRenderingContext2D;
  private readonly streetGrid: StreetGrid;
  private readonly car: Car;
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.streetGrid = new StreetGrid();
    this.car = new Car(600, 200);
    canvas.addEventListener('click', ev => {
      this.car.setDestination(ev.offsetX, ev.offsetY);
    });
  }

  tick(dt: number){
    dt + 1;
    this.car.tick(dt);
  }

  draw(timestamp: number){
    timestamp + 1;
    this.streetGrid.draw(this.ctx);
    this.car.draw(this.ctx);
  }
};