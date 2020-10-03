import type {MapData} from './tiled-map';
import {Car} from './Car.js';
import {GameMap} from './Map.js';
import {Serializable, deserialize} from './serialization.js';

@Serializable()
export class Game {
  private readonly car: Car;

  constructor(readonly map: GameMap, readonly ctx: CanvasRenderingContext2D) {
    const carSpawn = map.findObjectByName('car-spawn')!;
    const degrees = carSpawn.properties.find(p => p.name === 'direction')!.value as number;
    this.car = new Car(this, carSpawn.x, carSpawn.y, - degrees * Math.PI / 180);
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

  static async deserialize({ctx, mapData}: GameData) {
    const map = await deserialize('GameMap', mapData);
    const game = new Game(map, ctx);
    // HACK! these objects reference each other, so we just set this here.
    (map as any).game = game;
    return game;
  }
};

interface GameData {
  ctx: CanvasRenderingContext2D;
  mapData: MapData;
}
