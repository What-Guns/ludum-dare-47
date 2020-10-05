import { GameInfo, StaticGameInfo, DynamicGameInfo } from './GameInfo.js';
import {GameMap, GameMapData} from './GameMap.js';
import {Serializable, deserialize} from './serialization.js';
import { HUD } from './HUD.js';

type Mode = 'static' | 'dynamic';

@Serializable()
export class Game {
  readonly gameInfo: GameInfo ;

  readonly map!: GameMap;

  // HACK map sets this!
  readonly hud!: HUD;

  over = false;

  constructor(readonly mainCtx: CanvasRenderingContext2D, readonly bufferCtx: CanvasRenderingContext2D, mode: Mode) {
    window.game = this;

    switch(mode) {
      case 'static':
        this.gameInfo = new StaticGameInfo(4000);
        break;
      case 'dynamic':
        this.gameInfo = new DynamicGameInfo();
        break;
      default:
        throw new Error(`Unrecognized game mode ${mode}`);
    }
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
    const mode = mapData.properties?.find(p => p.name === 'mode')?.value as 'static'|'dynamic';

    if(!mode) alert(`No mode in map, using dynamic`);

    const game = new Game(mainCtx, bufferCtx, mode ?? 'dynamic');
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
