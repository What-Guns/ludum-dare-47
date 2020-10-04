import {GameObject, BaseProps} from './GameObject.js';
import {Cell} from './GameMap.js';

/** Draws a tile, but is an object. This allows for tiles to have z-ordering. */
export class TileProxy extends GameObject {
  private readonly tile: Cell;

  constructor({tile, ...baseProps}: TileProxyProps) {
    super(baseProps);
    this.tile = tile;
    this.screenYDepthOffset = this.map.world.tileheight / 2;
  }

  tick() {}

  draw(ctx: CanvasRenderingContext2D) {
    this.map.drawTile(ctx, this.tile);
  }
}

interface TileProxyProps extends BaseProps {
  tile: Cell;
}
