import type {MapData, TileLayer, ExternalTileset, Tileset, ObjectGroup, Property, TiledMapChunk} from './tiled-map';
import {Game} from './Game.js';
import {GameObject, SerializedObject} from './GameObject.js';
import {Serializable, deserialize, Type} from './serialization.js';
import {TileProxy} from './TileProxy.js';
import {loadImage, loadJson} from './loader.js';
import {Point, GeoLookup, computeScreenCoords, ScreenPoint, removeFromArray} from './math.js';
import {Car} from './Car.js';

const GRID_ALPHA = 0.25;

export type Terrain = 'void'|'grass'|'road'|'water'|'sand'|'dirt';

@Serializable()
export class GameMap {
  readonly camera = {
    target: null as GameObject|null,
    screenX: 0,
    screenY: 0,
  };

  private readonly objects: GameObject[] = [];
  private readonly objectsById = new Map<number, GameObject>();

  private readonly grid: [ScreenPoint, ScreenPoint][];

  private readonly chunkLookup: GeoLookup<Chunk> = {};

  constructor(
    readonly world: WorldInfo,
    private readonly layers: CellLayer[],
  ) {
    this.grid = this.createGrid();
    for(const layer of layers.slice(1)) {
      for(const chunk of layer.chunks) {
        for(const tile of chunk.tiles) {
          if(tile.image) {
            this.add(new TileProxy({
              id: -1,
              map: this,
              tile: tile as DrawableCell,
              x: tile.x,
              y: tile.y,
            }));
          }
        }
      }
    }

    (window as any).map = this;

    setInterval(() => this.checkConsistency, 1000);
  }

  add(obj: GameObject) {
    this.objects.push(obj);
    this.objectMoved(obj);
    this.objectsById.set(obj.id, obj);
    if(obj instanceof Car) this.camera.target = obj;
  }

  remove(obj: GameObject) {
    for(const chunk of obj.chunks) removeFromArray(obj, chunk.objects);
    this.objectsById.delete(obj.id);
    removeFromArray(obj, this.objects);
  }

  find(id: number) {
    return this.objectsById.get(id);
  }

  expensivelyfindNearestOfType<T extends GameObject>(type: Type<T>, point: Point) {
    return this.objects
      .filter(obj => obj instanceof type)
      .map(obj => {
        return {
          obj,
          distSquared: Math.pow(obj.x - point.x, 2) + Math.pow(obj.y - point.y, 2),
        };
      })
      .sort((l, r) => l.distSquared - r.distSquared)
      .slice(0, 1)
      .map(x => x.obj)[0] as T|undefined;
  }

  objectMoved(obj: GameObject) {
    computeScreenCoords(obj, obj, this.world);

    const firstChunk = this.layers[0].chunks[0];

    // Points are centered at x,y, but rectangles use x,y as top corner
    const minX = obj.x - (obj.radius ?? 0);
    const minY = obj.y - (obj.radius ?? 0);

    const width = obj.radius ? obj.radius * 2 : obj.width ?? 1;
    const height = obj.radius ? obj.radius * 2 : obj.height ?? 1;

    const maxX = obj.x + width;
    const maxY = obj.y + height;

    for(const chunk of obj.chunks) removeFromArray(obj, chunk.objects);
    obj.chunks.length = 0;

    // Add all of the chunks that the object is touching
    for(let x = minX; x < maxX; x += Math.min(width, firstChunk.width)) {
      for(let y = minY; y < maxY; y += Math.min(height, firstChunk.height)) {
        const chunk = this.getChunkContaining(x, y);
        if(chunk) this.addObjectToChunk(obj, chunk);
      }
    }

    if(obj.tallness) {
      for(let z = 0; z < obj.tallness; z++) {
        const chunk = this.getChunkContaining(minX - z, minY - z);
        if(chunk) this.addObjectToChunk(obj, chunk);
      }
    }
  }

  tick(dt: number) {
    for(const obj of this.objects) obj.tick(dt);
    this.updateCamera();
  }

  private addObjectToChunk(obj: GameObject, chunk: Chunk) {
    if(obj.chunks.indexOf(chunk) === -1) obj.chunks.push(chunk);
    if(chunk.objects.indexOf(obj) === -1) chunk.objects.push(obj);
  }

  private readonly visibleObjects: GameObject[] = [];

  draw(ctx: CanvasRenderingContext2D) {
    const screenWidth = ctx.canvas.width;
    const screenHeight = ctx.canvas.height;

    ctx.save();
    ctx.translate(-this.camera.screenX, -this.camera.screenY);
    ctx.translate(screenWidth / 2, screenHeight / 2);

    this.visibleObjects.length = 0;

    const backgroundLayer = this.layers[0];
    for(const chunk of backgroundLayer.chunks) {
      if(!this.isChunkVisible(chunk, screenWidth, screenHeight)) continue;
      for(const tile of chunk.tiles) {
        if(tile.image) this.drawTile(ctx, tile as DrawableCell);
      }

      for(const obj of chunk.objects) {
        if(this.visibleObjects.indexOf(obj) === -1) this.visibleObjects.push(obj);
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

    this.visibleObjects.sort((l, r) => (l.screenY + l.screenYDepthOffset) - (r.screenY + r.screenYDepthOffset));

    for(const obj of this.visibleObjects) {
      obj.draw(ctx);
    }

    ctx.restore();
  }

  getTerrain(obj: GameObject): Terrain {
    const chunk = this.getChunkContaining(obj.x, obj.y);
    if(!chunk) return 'void';

    const tileX = Math.floor(obj.x - chunk.x);
    const tileY = Math.floor(obj.y - chunk.y);
    const tileIndex = tileX + tileY * chunk.width;
    const tile = chunk.tiles[tileIndex];

    return tile?.terrain ?? 'void';
  }

  drawTile(ctx: CanvasRenderingContext2D, {screenX, screenY, image, offsetPX}: DrawableCell) {
    ctx.drawImage(image,
      screenX - this.world.tilewidth + image.width / 2 + offsetPX.x,
      screenY + this.world.tileheight - image.height + offsetPX.y);
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

  private getChunkContaining(x: number, y: number) {
    const chunks = this.layers[0].chunks;
    const chunkX = Math.floor(x / chunks[0].width);
    const chunkY = Math.floor(y / chunks[0].height);
    return this.chunkLookup[chunkX]?.[chunkY];
  }

  private createGrid() {
    const grid: [ScreenPoint, ScreenPoint][] = [];

    for(let x = 0; x <= this.world.width; x++) {
      grid.push([
        computeScreenCoords({}, {x, y: 0}, this.world),
        computeScreenCoords({}, {x, y: this.world.height}, this.world)
      ]);
    }
    for(let y = 0; y <= this.world.height; y++) {
      grid.push([
        computeScreenCoords({}, {x: 0, y}, this.world),
        computeScreenCoords({}, {x: this.world.width, y}, this.world)
      ]);
    }

    for(const chunk of this.layers[0].chunks) {
      const x = chunk.x / chunk.width;
      const y = chunk.y / chunk.height;
      this.chunkLookup[x] = this.chunkLookup[x] ?? {};
      this.chunkLookup[x]![y] = chunk;
    }

    return grid;
  }

  private updateCamera() {
    const target = this.camera.target;
    if(!target) return;
    const oldX = this.camera.screenX;
    const oldY = this.camera.screenY;
    
    computeScreenCoords(this.camera, target, this.world);

    this.camera.screenX = (this.camera.screenX + oldX * 10)/11;
    this.camera.screenY = (this.camera.screenY + oldY * 10)/11;
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
      map.add(instance);
    }

    return map;
  }

  private checkConsistency() {
    for(const chunk of this.layers[0].chunks) {
      for(const obj of chunk.objects) {
        if(obj.chunks.indexOf(chunk) === -1) {
          throw new Error(`Chunk contains an object that doesn't think it's in that chunk.`);
        }
      }
    }

    for(const obj of this.objects) {
      for(const chunk of obj.chunks) {
        if(chunk.objects.indexOf(obj) === -1) {
          throw new Error(`Object is contained in a chunk that doesn't think it contains that object.`);
        }
      }
    }
  }
}

export interface GameMapData extends MapData {
  game: Game;
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

export interface Chunk {
  /** Objects that are in this chunk, even partially. */
  readonly objects: GameObject[];
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  /** Represents the top corner of the chunk */
  readonly screenX: number;
  readonly screenY: number;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly tiles: readonly Cell[];
  readonly tilesSortedByY: readonly Cell[];
}

interface Tile {
  image?: HTMLImageElement;
  type: string;
  offset: {x: number; y: number};
}

interface Cell {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  image?: HTMLImageElement;
  terrain: Terrain;
  offsetPX: Point;
}
export type DrawableCell = Required<Pick<Cell, 'screenX'|'screenY'|'image'|'offsetPX'>>

function toLayer(layer: TileLayer, tileMap: Map<number, Tile>, tilewidth: number, tileheight: number): CellLayer {
  const chunks: TiledMapChunk[] = 'data' in layer ? [layer] : layer.chunks;

  if((layer.startx ?? 0) !== 0 || (layer.starty ?? 0) !== 0) {
    throw new Error(`Layers with offsets are not supported`);
  }

  const gameLayer = {
    height: layer.height,
    width: layer.width,
    chunks: chunks.map<Chunk>(c =>  {
      const screenPoint = computeScreenCoords({}, c, {tilewidth, tileheight});
      const screenWidth = computeScreenCoords({}, {x: c.width, y: 0}, {tilewidth, tileheight}).screenX * 2;
      const screenHeight = computeScreenCoords({}, {x: c.width, y: c.height}, {tilewidth, tileheight}).screenY;
      const tiles = toTiles(c, tileMap, tilewidth, tileheight);
      const tilesSortedByY = tiles.slice(0);
      tilesSortedByY.sort((a, b) => a.screenY - b.screenY)
      return {
        x: c.x,
        y: c.y,
        ...screenPoint,
        width: c.width,
        height: c.height,
        screenWidth,
        screenHeight,
        tiles,
        tilesSortedByY,
        objects: [],
      };
    })
  };

  for(const chunk of gameLayer.chunks) {
    if(chunk.width !== gameLayer.chunks[0].width || chunk.height !== gameLayer.chunks[0].height) {
      throw new Error(`Non-uniform chunk sizes not supported!`);
    }
  }

  return gameLayer;
}

function toTiles(chunk: TiledMapChunk, tileMap: Map<number, Tile>, tilewidth: number, tileheight: number) {
  const tiles: Cell[] = [];
  for(let i = 0; i < chunk.data.length; i++) {
    const tileId = chunk.data[i];
    const point = {
      x: chunk.x + i % chunk.width,
      y: chunk.y +  Math.floor(i / chunk.width),
    };
    const screenPoint = computeScreenCoords({}, point, {tilewidth, tileheight});
    const tileImage = tileMap.get(tileId);
    if(!tileImage) throw new Error(`No image for tile ${tileId}`);
    const terrain = tileImage.type ?? 'void';
    checkTerrain(terrain);
    tiles.push({
      ...point,
      ...screenPoint,
      image: tileImage.image,
      terrain,
      offsetPX: tileImage.offset
    });
  }

  return tiles;
}

function toMapObjects(map: GameMap, group: ObjectGroup): SerializedObject[] {
  return group.objects.map(obj => {
    const mapObj: SerializedObject = {
      id: obj.id,
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
  tileMap.set(0, {
    offset: {x: 0, y: 0},
    type: 'void',
  });

  for(const tileset of await Promise.all(data.tilesets.map(resolveTileset))) {
    await Promise.all(tileset.tiles
      .filter(tile => usedTileIds.has(tile.id + tileset.firstgid))
      .map(async (tile) => {
      const image = tile.image ? await loadImage('maps/'+tile.image) : undefined;
      const offset = tileset.tileoffset ?? {x: 0, y: 0};
      tileMap.set(tile.id + tileset.firstgid, {
        image,
        type: tile.type,
        offset,
      });
    }));
  }

  return tileMap;
}

async function resolveTileset(tileset: ExternalTileset|Tileset): Promise<Tileset> {
  if(!('source' in tileset)) return tileset;
  const remoteTileset = await loadJson('maps/'+tileset.source);
  remoteTileset.firstgid = tileset.firstgid;
  return remoteTileset;
}

const knownTerrains = new Set<Terrain>(['grass', 'road', 'sand', 'void', 'water', 'dirt']);
function checkTerrain(terrain: string): asserts terrain is Terrain {
  if(!knownTerrains.has(terrain as Terrain)) throw new Error(`Unrecognized terrain ${terrain}`);
}
