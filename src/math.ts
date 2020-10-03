import {WorldInfo} from './Map.js';

export function setXY(point: Partial<Point>, x: number, y: number, {tilewidth, tileheight}: TileDimensions): Point {
  point.x = x;
  point.y = y;
  point.screenX = ((x - y) * tilewidth/2);
  point.screenY = ((x + y) * tileheight/2);
  return point as Point;
}

export interface Point {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
}

type TileDimensions = Pick<WorldInfo, 'tilewidth'|'tileheight'>;
