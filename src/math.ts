import '//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js'
import {SeedRandom} from './seedrandom';

export function computeScreenCoords<T extends Partial<ScreenPoint>>(
    out: T, {x, y}: Point,
    {tilewidth, tileheight}: TileSize = game.map.world
) {
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

export interface Size {
  width: number;
  height: number;
}

export interface TileSize {
  tilewidth: number;
  tileheight: number;
}

export type Box = Point&Size;

export type GeoLookup<T> = {
  [x: number]: {
    [y: number]: T|undefined
  }|undefined
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function removeFromArray<T>(obj: T, array: T[]) {
  const index = array.indexOf(obj);
  if(index === -1) return;
  array.splice(index, 1);
}

export function pointIsInside({x, y}: Point, box: Box) {
  return x > box.x && x < box.x + box.width && y > box.y && y < box.y + box.height;
}

export function distanceSquared(a: Point, b: Point) {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}

let scratchPoint: Point&ScreenPoint = {
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0
};
export function makeRectanglePath(
  ctx: CanvasRenderingContext2D,
  topLeft: Point,
  {width, height}: Size,
) {
  ctx.beginPath();
  scratchPoint.x = topLeft.x;
  scratchPoint.y = topLeft.y;
  computeScreenCoords(scratchPoint, scratchPoint);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.x += width;
  computeScreenCoords(scratchPoint, scratchPoint);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.y += height;
  computeScreenCoords(scratchPoint, scratchPoint);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.x = topLeft.x;
  computeScreenCoords(scratchPoint, scratchPoint);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  ctx.closePath();
}

declare global {
  interface Math {
    seedrandom: {
      new(seed?: any): SeedRandom;
    }
  }
}
