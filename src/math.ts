import '//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js'
import {SeedRandom} from './seedrandom';

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

export interface Size {
  width: number;
  height: number;
}

type TileDimensions = {tilewidth: number, tileheight: number}

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
  tileDimensions: TileDimensions
) {
  ctx.beginPath();
  scratchPoint.x = topLeft.x;
  scratchPoint.y = topLeft.y;
  computeScreenCoords(scratchPoint, scratchPoint, tileDimensions);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.x += width;
  computeScreenCoords(scratchPoint, scratchPoint, tileDimensions);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.y += height;
  computeScreenCoords(scratchPoint, scratchPoint, tileDimensions);
  ctx.lineTo(scratchPoint.screenX, scratchPoint.screenY);

  scratchPoint.x = topLeft.x;
  computeScreenCoords(scratchPoint, scratchPoint, tileDimensions);
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
