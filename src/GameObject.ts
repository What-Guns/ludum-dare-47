import {GameMap, Chunk} from './Map.js';
import {Point, ScreenPoint} from './math.js';
import {Property} from './tiled-map';

export abstract class GameObject implements Point, ScreenPoint {
  readonly map: GameMap;
  x: number;
  y: number;
  id: number;

  // note: these are set by map!
  screenX!: number;
  screenY!: number;

  readonly chunks = new Set<Chunk>();

  radius?: number;
  width?: number;
  height?: number;

  constructor({map, x, y, id}: BaseProps) {
    this.map = map;
    this.id = id;
    this.x = x;
    this.y = y;
  }


  abstract tick(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}

export type BaseProps = Pick<SerializedObject, 'map'|'x'|'y'|'id'>;

export interface SerializedObject {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  map: GameMap;
  name: string;
  type: string;
  properties: {[key: string]: Property['value']};
}
