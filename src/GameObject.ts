import {Chunk} from './GameMap.js';
import {Point, ScreenPoint} from './math.js';
import {Property} from './tiled-map';

export abstract class GameObject implements Point, ScreenPoint {
  x: number;
  y: number;
  id?: number;

  // note: these are set by map!
  screenX!: number;
  screenY!: number;

  screenYDepthOffset = 0;

  readonly chunks: Chunk[] = [];

  radius?: number;
  width?: number;
  height?: number;

  tallness?: number;

  constructor({x, y, id}: BaseProps) {
    this.id = id;
    this.x = x;
    this.y = y;
  }


  abstract tick(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}

export type BaseProps = Pick<SerializedObject, 'x'|'y'|'id'>;

export interface SerializedObject {
  id?: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  type: string;
  properties: Properties;
}

export type Properties = {[key: string]: Property['value']};

export function reduceProperties(properties: Property[]) {
  return (properties ?? []).reduce<Properties>((collection, prop) => {
    return {...collection, [prop.name]: prop.value};
  }, {});
}
