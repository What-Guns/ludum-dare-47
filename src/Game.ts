import {GameMap, GameMapData} from './Map.js';
import {Serializable, deserialize} from './serialization.js';
import {clearZBuffer} from './rendering.js';

@Serializable()
export class Game {
  map!: GameMap;

  constructor(readonly ctx: CanvasRenderingContext2D) {
  }

  tick(dt: number){
    this.map.tick(dt);
  }

  draw(){
    clearZBuffer(this.ctx.canvas.width, this.ctx.canvas.height);
    this.map.draw(this.ctx);
  }

  static async deserialize({ctx, mapData}: GameData) {
    const game = new Game(ctx);
    game.map = await deserialize(GameMap, mapData)
    // HACK! these objects reference each other, so we just set this here.
    return game;
  }
};

interface GameData {
  ctx: CanvasRenderingContext2D;
  mapData: GameMapData;
}
