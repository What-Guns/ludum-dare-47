import { Car } from './Car.js';
import {GameMap} from './Map.js';

export class Game {
  private readonly car: Car;

  constructor(readonly map: GameMap, readonly ctx: CanvasRenderingContext2D) {
    this.car = new Car(this, 1, 1);
  }

  tick(dt: number){
    dt + 1;
    this.car.tick(dt);
  }

  draw(timestamp: number){
    timestamp + 1;
    this.ctx.save();
    this.ctx.translate(this.map.world.height * this.map.world.tilewidth/2, this.map.world.tileheight);
    this.map.draw(this.ctx);
    this.car.draw(this.ctx);
    this.ctx.restore();
  }

  static async create(ctx: CanvasRenderingContext2D, pathToMap: string) {
    const map = await GameMap.load(pathToMap);
    return new Game(map, ctx);
  }
};
