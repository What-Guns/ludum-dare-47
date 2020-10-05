import { GameInfo, StaticGameInfo } from './GameInfo.js';
import {GameMap, GameMapData} from './GameMap.js';
import {Serializable, deserialize} from './serialization.js';
import { HUD } from './HUD.js';

@Serializable()
export class Game {
  readonly gameInfo: GameInfo ;

  readonly map!: GameMap;

  // HACK map sets this!
  readonly hud!: HUD;

  over = false;

  constructor(readonly mainCtx: CanvasRenderingContext2D, readonly bufferCtx: CanvasRenderingContext2D) {
    window.game = this;

    this.gameInfo = new StaticGameInfo([
      {
        deliveries: [
          { spawnerId: 31, destinationId: 34 },
          { spawnerId: 31, destinationId: 35 },
          { spawnerId: 31, destinationId: 36 },
        ],
        description: "Deliver 3 packages"
      }
    ], 6000);
  }

  tick(dt: number){
    game.map.tick(dt);
    this.gameInfo.tick(dt);
    this.hud.tick(dt);
  }

  draw(){
    game.map.draw();
    this.hud.draw(this.mainCtx);
  }

  static async deserialize({mainCtx, bufferCtx, mapData}: GameData) {
    const game = new Game(mainCtx, bufferCtx);
    // HACK: game needs to exist before map, but has a readonly map.
    (game as any).map = await deserialize(GameMap, mapData)
    return game;
  }
};

interface GameData {
  mainCtx: CanvasRenderingContext2D;
  bufferCtx: CanvasRenderingContext2D;
  mapData: GameMapData;
}

declare global {
  var game: Game;
}
