import type {MapData, TileLayer, ExternalTileset, Tileset} from './tiled-map';
import {loadImage, loadJson} from './loader.js';
import {setXY, Point} from './Math.js';

const GRID_ALPHA = 0.25;

export class GameMap {
  private readonly grid: [Point, Point][];

  static async load(mapDataPath: string) {
    const data = await loadJson(mapDataPath) as MapData;

    const tileMap = await createTileMap(data);

    const backgroundLayers = data.layers
      .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
      .map(layer => toLayer(layer, tileMap, data.tilewidth, data.tileheight));

    const {width, height, tilewidth, tileheight} = data;

    return new GameMap({
      width, height, tilewidth, tileheight,
    }, backgroundLayers);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.world.height * this.world.tilewidth/2, this.world.tileheight);
    for(const layer of this.layers) {
      for(const {screenX, screenY, image, offsetPX} of layer.tiles) {
        ctx.drawImage(image,
          screenX - this.world.tilewidth + image.width / 2 + offsetPX.x,
          screenY + this.world.tileheight - image.height + offsetPX.y);
      }
    }

    ctx.globalAlpha = GRID_ALPHA;
    for(const line of this.grid) {
      ctx.beginPath();
      ctx.moveTo(line[0].screenX, line[0].screenY);
      ctx.lineTo(line[1].screenX, line[1].screenY);
      ctx.stroke();
    }
    ctx.restore();
  }

  private constructor(readonly world: WorldInfo, private readonly layers: CellLayer[]) {
    this.grid = [];
    for(let x = 0; x <= world.width; x++) {
      this.grid.push([
        setXY({}, x, 0, world),
        setXY({}, x, world.height, world)
      ]);
    }
    for(let y = 0; y <= world.height; y++) {
      this.grid.push([
        setXY({}, 0, y, world),
        setXY({}, world.width, y, world)
      ]);
    }
  }
}

export interface WorldInfo {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
}

interface CellLayer {
  tiles: Cell[];
  width: number;
  height: number;
}

interface Tile {
  image: HTMLImageElement;
  type?: string;
  offset: {x: number; y: number};
}

interface Cell {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  image: HTMLImageElement;
  type?: string;
  offsetPX: {x: number, y: number};
}

function toLayer(layer: TileLayer, tileMap: Map<number, Tile>, tilewidth: number, tileheight: number): CellLayer {
  const tiles: Cell[] = [];
  for(let i = 0; i < layer.data.length; i++) {
    const tileId = layer.data[i];
    if(tileId === 0) continue;
    const point = setXY({}, i % layer.width,  Math.floor(i / layer.width), {tilewidth, tileheight});
    const tile = tileMap.get(tileId);
    if(!tile) throw new Error(`No image for tile ${tileId}`);
    tiles.push({image: tile.image, type: tile.type, ...point, offsetPX: tile.offset});
  }

  tiles.sort((a, b) => a.screenY - b.screenY);

  return {
    height: layer.height,
    width: layer.width,
    tiles
  };
}

async function createTileMap(data: MapData) {
  const usedTileIds = new Set(data.layers
    .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
    .map(l => l.data)
    .reduce((l, r) => l.concat(r)));

  const tileMap = new Map<number, Tile>();

  const loadingMsg = `Loading ${tileMap.size} images`;
  console.time(loadingMsg);
  for(const tileset of await Promise.all(data.tilesets.map(resolveTileset))) {
    await Promise.all(tileset.tiles
      .filter(tile => usedTileIds.has(tile.id + tileset.firstgid))
      .map(async (tile) => {
      // HACK! Instead of resolving relative paths, I'm just stripping '..' off.
      const image = await loadImage('maps/'+tile.image);
      const offset = tileset.tileoffset ?? {x: 0, y: 0};
      tileMap.set(tile.id + tileset.firstgid, {
        image,
        type: tile.type,
        offset,
      });
    }));
  }
  console.timeEnd(loadingMsg);

  return tileMap;
}

async function resolveTileset(tileset: ExternalTileset|Tileset): Promise<Tileset> {
  if(!('source' in tileset)) return tileset;
  const remoteTileset = await loadJson('maps/'+tileset.source);
  remoteTileset.firstgid = tileset.firstgid;
  return remoteTileset;
}
