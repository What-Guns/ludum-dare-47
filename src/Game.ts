import {GameMap, GameMapData, Chunk} from './Map.js';
import {Serializable, deserialize} from './serialization.js';
import {Point, ScreenPoint} from './math.js';

@Serializable()
export class Game {
  map!: GameMap;

  constructor(readonly ctx: CanvasRenderingContext2D) {
  }

  tick(dt: number){
    this.map.tick(dt);
  }

  draw(){
    this.map.draw(this.ctx);
  }

  static async deserialize({ctx, mapData}: GameData) {
    const game = new Game(ctx);
    game.map = await deserialize(GameMap, mapData)
    // HACK! these objects reference each other, so we just set this here.
    return game;
  }
};

export interface GameObject extends Point, ScreenPoint {
  chunk?: Chunk;
  tick(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface GameData {
  ctx: CanvasRenderingContext2D;
  mapData: GameMapData;
}
