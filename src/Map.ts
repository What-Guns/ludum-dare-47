import type {MapData, TiledLayer} from './tiled-map';

export class GameMap {
  static async load(mapDataPath: string) {
    const response = await fetch(mapDataPath);
    if(!response.ok) throw new Error(`Failed to load ${mapDataPath}: ${response.statusText}`);
    const data = await response.json() as MapData;

    const tileMap = createTileMap(data);

    const loadingMsg = `Loading ${tileMap.size} images`;
    console.time(loadingMsg);
    await Array.from(tileMap.values()).map(waitForImageToLoad);
    console.timeEnd(loadingMsg);

    const layers = data.layers.map(layer => toLayer(layer, tileMap, data.tilewidth, data.tileheight));

    return new GameMap(layers);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for(const layer of this.layers) {
      for(const {screenX, screenY, image} of layer.tiles) {
        ctx.drawImage(image, screenX, screenY);
      }
    }
    ctx.restore();
  }

  private constructor(private readonly layers: Layer[]) {
    console.log(layers);
  }
}

interface Layer {
  tiles: Tile[];
  width: number;
  height: number;
}

interface Tile {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  image: HTMLImageElement;
}

function toLayer(layer: TiledLayer, tileMap: Map<number, HTMLImageElement>, tilewidth: number, tileheight: number): Layer {
  const tiles: Tile[] = [];
  for(let i = 0; i < layer.data.length; i++) { const tileId = layer.data[i] - 1;
    if(tileId === -1) continue;
    const x = i % layer.width;
    const y = Math.floor(i / layer.width);
    const screenX = ((x - y) * tilewidth/2);
    const screenY = ((x + y) * tileheight/2);
    tiles.push({
      image: tileMap.get(tileId)!,
      x, y, screenX, screenY
    });
  }

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

function createTileMap(data: MapData) {
  const usedTileIds = new Set(data.layers.map(l => l.data).reduce((l, r) => l.concat(r)).map(n => n - 1));

  return new Map(data.tilesets
    .map(tileset => tileset.tiles)
    .reduce((l, r) => l.concat(r))
    .filter(tile => usedTileIds.has(tile.id))
    .map(tile => {
      const image = new Image();
      // HACK! Instead of resolving relative paths, I'm just stripping '..' off.
      image.src = tile.image.replace('../', '');
      return [tile.id, image];
    }));
}
