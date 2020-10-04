import { HUD } from './HUD.js';
import {GameMap, GameMapData} from './Map.js';
import {Serializable, deserialize} from './serialization.js';

@Serializable()
export class Game {
  map!: GameMap;
  hud = new HUD();

  constructor(readonly ctx: CanvasRenderingContext2D) {
  }

  tick(dt: number){
    this.map.tick(dt);
    this.hud.tick(dt);
  }

  draw(){
    this.map.draw(this.ctx);
    this.hud.draw(this.ctx);
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
