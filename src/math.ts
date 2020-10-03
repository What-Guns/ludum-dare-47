import {WorldInfo} from './Map.js';

export function computeScreenCoords<T extends Partial<ScreenPoint>>(out: T, {x, y}: Point, {tilewidth, tileheight}: TileDimensions) {
  out.screenX = ((x - y) * tilewidth/2);
  out.screenY = ((x + y) * tileheight/2);
  return out as T&ScreenPoint;
}

export interface Point {
  x: number;
  y: number;
}

export interface ScreenPoint {
  screenX: number;
  screenY: number;
}

type TileDimensions = Pick<WorldInfo, 'tilewidth'|'tileheight'>;

export type GeoLookup<T> = {
  [x: number]: {
    [y: number]: T|undefined
  }|undefined
}
