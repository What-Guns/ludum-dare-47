import {GameObject, BaseProps} from './GameObject.js';
import {DrawableCell} from './GameMap.js';

/** Draws a tile, but is an object. This allows for tiles to have z-ordering. */
export class TileProxy extends GameObject {
  private readonly tile: DrawableCell;

  constructor({tile, ...baseProps}: TileProxyProps) {
    super(baseProps);
    this.tile = tile;
    this.screenYDepthOffset = game.map.world.tileheight / 2;
  }

  tick() {}

  draw(ctx: CanvasRenderingContext2D) {
    game.map.drawTile(ctx, this.tile);
  }
}

interface TileProxyProps extends BaseProps {
  tile: DrawableCell;
}
