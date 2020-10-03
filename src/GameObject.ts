import {GameMap, Chunk} from './Map.js';
import {Point, ScreenPoint} from './math.js';

export abstract class GameObject implements Point, ScreenPoint {
  // note: these are set by map!
  screenX!: number;
  screenY!: number;

  readonly chunks = new Set<Chunk>();

  radius?: number;
  width?: number;
  height?: number;

  constructor(readonly map: GameMap, public x: number, public y: number) {}


  abstract tick(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
