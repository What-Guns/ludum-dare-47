import type {MapData, TileLayer, ExternalTileset, Tileset, ObjectGroup, Property, TiledMapChunk} from './tiled-map';
import {Game, GameObject} from './Game.js';
import {Serializable, deserialize} from './serialization.js';
import {loadImage, loadJson} from './loader.js';
import {setXY, Point} from './math.js';
import { Car } from './Car.js';

const GRID_ALPHA = 0.25;

@Serializable()
export class GameMap implements GameObject {
  readonly objects: GameObject[] = [];

  private readonly camera: Point = {
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0,
  };

  private readonly grid: [Point, Point][];

  constructor(
    readonly world: WorldInfo,
    private readonly layers: CellLayer[],
  ) {
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

  tick(dt: number) {
    for(const obj of this.objects) obj.tick(dt);
    // TODO: don't look for the car on every frame like c'mon that's insane.
    const car = this.objects.find(o => o instanceof Car) as Car|undefined;
    if(car) setXY(this.camera, car.x, car.y, this.world);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const screenWidth = ctx.canvas.width;
    const screenHeight = ctx.canvas.height;

    ctx.save();
    ctx.translate(-this.camera.screenX, -this.camera.screenY);
    ctx.translate(screenWidth / 2, screenHeight / 2);


    let drawnChunks = 0;
    for(const layer of this.layers) {
      for(const chunk of layer.chunks) {
        if(!this.isChunkVisible(chunk, screenWidth, screenHeight)) continue;
        drawnChunks++;
        for(const {screenX, screenY, image, offsetPX} of chunk.tiles) {
          ctx.drawImage(image,
            screenX - this.world.tilewidth + image.width / 2 + offsetPX.x,
            screenY + this.world.tileheight - image.height + offsetPX.y);
        }
      }
    }

    ctx.globalAlpha = GRID_ALPHA;
    for(const line of this.grid) {
      ctx.beginPath();
      ctx.moveTo(line[0].screenX, line[0].screenY);
      ctx.lineTo(line[1].screenX, line[1].screenY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for(const obj of this.objects) {
      obj.draw(ctx);
    }

    ctx.restore();

    ctx.fillText(`chunks drawn ${drawnChunks}`, 30, 50);
  }

  private isChunkVisible(chunk: Chunk, screenWidth: number, screenHeight: number) {
    const leftEdgeOfChunk = chunk.screenX - chunk.screenWidth / 2;
    const rightEdgeOfChunk = chunk.screenX + (chunk.screenWidth / 2);
    const topEdgeOfChunk = chunk.screenY;
    const bottomEdgeOfChunk = chunk.screenY + chunk.screenHeight;

    const leftEdgeOfScreen = this.camera.screenX - screenWidth / 2;
    const rightEdgeOfScreen = this.camera.screenX + screenWidth / 2;
    const topEdgeOfScreen = this.camera.screenY - screenHeight / 2;
    const bottomEdgeOfScreen = this.camera.screenY + screenHeight / 2;

    return leftEdgeOfChunk < rightEdgeOfScreen
        && rightEdgeOfChunk > leftEdgeOfScreen
        && topEdgeOfChunk < bottomEdgeOfScreen
        && bottomEdgeOfChunk > topEdgeOfScreen;
  }

  static async deserialize(data: MapData) {
    const tileMap = await createTileMap(data);

    const backgroundLayers = data.layers
      .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
      .map(layer => toLayer(layer, tileMap, data.tilewidth, data.tileheight));

    const {width, height, tilewidth, tileheight} = data;

    const map = new GameMap({
      width, height, tilewidth, tileheight,
    }, backgroundLayers);

    const mapObjects = data.layers
      .filter((layer): layer is ObjectGroup => layer.type === 'objectgroup')
      .map(layer => toMapObjects(map, layer))
      .reduce((l, r) => l.concat(r));

    for(const obj of mapObjects) {
      const instance = await deserialize(obj.type, obj);
      map.objects.push(instance);
    }

    return map;
  }
}

export interface GameMapData extends MapData {
  game: Game;
}

export interface SerializedObject {
  x: number;
  y: number;
  width?: number;
  height?: number;
  map: GameMap;
  name: string;
  type: string;
  properties: {[key: string]: Property['value']};
}

export interface WorldInfo {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
}

interface CellLayer {
  chunks: Chunk[];
  width: number;
  height: number;
}

interface Chunk {
  width: number;
  height: number;
  x: number;
  y: number;
  /** Represents the top corner of the chunk */
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  tiles: Cell[];
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
  const chunks: TiledMapChunk[] = 'data' in layer ? [layer] : layer.chunks;

  return {
    height: layer.height,
    width: layer.width,
    chunks: chunks.map(c =>  {
      const point = setXY({}, c.x, c.y, {tilewidth, tileheight});
      const screenWidth = setXY({}, c.width, 0, {tilewidth, tileheight}).screenX * 2;
      const screenHeight = setXY({}, c.width, c.height, {tilewidth, tileheight}).screenY;
      return {
        ...point,
        width: c.width,
        height: c.height,
        screenWidth,
        screenHeight,
        tiles: toTiles(c, tileMap, tilewidth, tileheight)
      };
    })
  };
}

function toTiles(chunk: TiledMapChunk, tileMap: Map<number, Tile>, tilewidth: number, tileheight: number) {
  const tiles: Cell[] = [];
  for(let i = 0; i < chunk.data.length; i++) {
    const tileId = chunk.data[i];
    if(tileId === 0) continue;
    const point = setXY({}, chunk.x + i % chunk.width, chunk.y +  Math.floor(i / chunk.width), {tilewidth, tileheight});
    const tile = tileMap.get(tileId);
    if(!tile) throw new Error(`No image for tile ${tileId}`);
    tiles.push({image: tile.image, type: tile.type, ...point, offsetPX: tile.offset});
  }

  tiles.sort((a, b) => a.screenY - b.screenY);

  return tiles;
}

function toMapObjects(map: GameMap, group: ObjectGroup): SerializedObject[] {
  return group.objects.map(obj => {
    const mapObj: SerializedObject = {
      x: obj.x / map.world.tileheight, // NOT A TYPO. Tiles from tiled are squares.
      y: obj.y / map.world.tileheight,
      map,
      name: obj.name,
      type: obj.type,
      properties: (obj.properties ?? []).reduce<{[key: string]: Property['value']}>((collection, prop) => {
        return {...collection, [prop.name]: prop.value};
      }, {}),
    };

    if(obj.width) mapObj.width = obj.width / map.world.tileheight;
    if(obj.height) mapObj.height = obj.height / map.world.tileheight;

    return mapObj;
  });
}

async function createTileMap(data: MapData) {
  const usedTileIds = new Set(data.layers
    .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
    .map(l => 'data' in l ? [l] : l.chunks)
    .reduce((l, r) => l.concat(r))
    .map(chunk => chunk.data)
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
