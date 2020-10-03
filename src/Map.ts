import type {MapData, TileLayer, ExternalTileset, Tileset} from './tiled-map';

export class GameMap {
  static async load(mapDataPath: string) {
    const data = await loadJson(mapDataPath) as MapData;

    const tileMap = await createTileMap(data);

    const loadingMsg = `Loading ${tileMap.size} images`;
    console.time(loadingMsg);
    await Array.from(tileMap.values()).map(tile => tile.image).map(waitForImageToLoad);
    console.timeEnd(loadingMsg);

    const backgroundLayers = data.layers
      .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
      .map(layer => toLayer(layer, tileMap, data.tilewidth, data.tileheight));

    return new GameMap(backgroundLayers);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(350, 0);
    for(const layer of this.layers) {
      for(const {screenX, screenY, image} of layer.tiles) {
        ctx.drawImage(image, screenX, screenY);
      }
    }
    ctx.restore();
  }

  private constructor(private readonly layers: BackgroundLayer[]) {}
}

interface BackgroundLayer {
  tiles: Cell[];
  width: number;
  height: number;
}

interface Tile {
  image: HTMLImageElement;
  type?: string;
}

interface Cell {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  image: HTMLImageElement;
  type?: string;
}

function toLayer(layer: TileLayer, tileMap: Map<number, Tile>, tilewidth: number, tileheight: number): BackgroundLayer {
  const tiles: Cell[] = [];
  for(let i = 0; i < layer.data.length; i++) {
    const tileId = layer.data[i];
    if(tileId === 0) continue;
    const x = i % layer.width;
    const y = Math.floor(i / layer.width);
    const screenX = ((x - y) * tilewidth/2);
    const screenY = ((x + y) * tileheight/2);
    const tile = tileMap.get(tileId);
    if(!tile) throw new Error(`No image for tile ${tileId}`);
    tiles.push({image: tile.image, type: tile.type, x, y, screenX, screenY});
  }

  tiles.sort((a, b) => a.screenY - b.screenY);

  return {
    height: layer.height,
    width: layer.width,
    tiles
  };
}

function waitForImageToLoad(img: HTMLImageElement) {
  return new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
}

async function createTileMap(data: MapData) {
  const usedTileIds = new Set(data.layers
    .filter((layer): layer is TileLayer => layer.type === 'tilelayer')
    .map(l => l.data)
    .reduce((l, r) => l.concat(r)));

  const tileMap = new Map<number, Tile>();

  for(const tileset of await Promise.all(data.tilesets.map(resolveTileset))) {
    for(const tile of tileset.tiles) {
      const gid = tile.id + tileset.firstgid;
      if(!usedTileIds.has(gid)) continue;
      const image = new Image();
      // HACK! Instead of resolving relative paths, I'm just stripping '..' off.
      image.src = 'maps/'+tile.image;
      tileMap.set(gid, {image, type: tile.type});
    }
  }

  return tileMap;
}

async function resolveTileset(tileset: ExternalTileset|Tileset): Promise<Tileset> {
  if(!('source' in tileset)) return tileset;
  const remoteTileset = await loadJson('maps/'+tileset.source);
  remoteTileset.firstgid = tileset.firstgid;
  return remoteTileset;
}

async function loadJson(path: string) {
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  return await response.json();
}
