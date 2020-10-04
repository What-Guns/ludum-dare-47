import {GameObject, SerializedObject, reduceProperties} from './GameObject.js';
import {Point} from './math.js';
import {GameMap} from './GameMap.js';
import {Serializable} from './serialization.js';
import {loadJson, loadImage} from './loader.js';
import {Tileset, Grid} from './tiled-map';

const buildings = loadBuildings();

@Serializable()
export class Building extends GameObject {
  tick() {}

  readonly pieces: LoadedBuildingPiece[];
  readonly tallness: number;
  readonly grid: Grid;

  constructor({pieces, grid, ...base}: BuildingParameters) {
    super({...base});
    this.pieces = pieces;
    this.grid = grid;
    this.screenYDepthOffset = this.map.world.tileheight / 2;
    this.tallness = pieces.map(p => p.tallness).reduce((a, b) => a+b);
  }

  draw(ctx: CanvasRenderingContext2D) {
    let bottomY = this.screenY + this.grid.height;
    let isBase = true;
    for(const piece of this.pieces) {
      ctx.save();
      if(isBase) this.clipBase(ctx);
      const topLeftX = this.screenX - piece.image.width / 2;
      const topLeftY = bottomY - piece.image.height + piece.offsetPX.y;
      ctx.drawImage(piece.image, topLeftX, topLeftY);
      bottomY -= piece.tallness;
      ctx.restore();
      isBase = false;
    }
  }

  clipBase(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.screenX - this.grid.width / 2, this.screenY - 100);
    ctx.lineTo(this.screenX - this.grid.width / 2, this.screenY + this.grid.height / 2);
    ctx.lineTo(this.screenX, this.screenY + this.grid.height);
    ctx.lineTo(this.screenX + this.grid.width / 2, this.screenY + this.grid.height / 2);
    ctx.lineTo(this.screenX + this.grid.width / 2, this.screenY - 100);
    ctx.closePath();
    ctx.clip();
  }

  static async create(map: GameMap, {x, y}: Point, zoning: ZoningRestrictions) {
    return this.deserialize({
      id: -1,
      name: '',
      type: Building.name,
      x,
      y,
      map,
      properties: zoning as any,
    });
  }

  static async deserialize(obj: SerializedObject) {
    const {pieces, grid} = await buildings;

    const myPieces = [];

    const {tallness: fixedTallness, maxTallness = 8, minTallness = 2, ...globalFilter} = obj.properties as unknown as ZoningRestrictions&{tallness?: number};

    const tallness = fixedTallness ?? minTallness + Math.floor(Math.random() * (maxTallness - minTallness));

    if(!globalFilter.color && Math.random() > 0.6) {
      globalFilter.color = pickRandom(['red', 'yellow', 'white', 'brown']);
    }

    for(let i = 0; i < tallness; i++) {
      const filter = {
        ...globalFilter,
        bottom: i === 0 || undefined,
        middle: i > 0 && i < tallness - 1 || undefined,
        top: i === tallness - 1 || undefined,
      };
      myPieces.push(pickPiece(pieces, filter));
    }

    return new Building({
      ...obj,
      grid,
      pieces: await loadPieces(myPieces),
      x: Math.floor(obj.x),
      y: Math.floor(obj.y),
    });
  }
}

export interface ZoningRestrictions {
  color?: string;
  direction?: string;
  minTallness: number;
  maxTallness: number;
}

async function loadPieces(pieces: BuildingPiece[]) {
  return Promise.all(pieces.map(async piece => {
    if('image' in piece) return Promise.resolve(piece);
    const image = await loadImage(piece.imageUrl);
    return {...piece, image};
  }));
}

function pickPiece(pieces: BuildingPiece[], filters: BuildingFilters): BuildingPiece {
  for(const [key, value] of Object.entries(filters)) {
    if(value === undefined || value === "") delete (filters as any)[key];
  }
  const legalPieces = pieces.filter(piece => {
    return Object.entries(filters).every(([key, value]) => {
      if(value === "") return true;
      if(value === undefined) return true;
      if((typeof value !== 'boolean') && !(key in piece)) return true;
      return piece[key as keyof BuildingFilters] === value;
    });
    return true;
  });

  if(legalPieces.length === 0) {
    if(!filters.color) throw new Error(`No pieces match the filter ${JSON.stringify(filters)}`);
    console.warn(`Warning: no pieces match ${JSON.stringify(filters)}`);
    delete filters.color;
    return pickPiece(pieces, filters);
  }

  return pickRandom(legalPieces);
}

type BuildingFilters = Partial<Pick<BuildingPiece, 'top'|'middle'|'bottom'|'color'>>;

interface BuildingParameters extends SerializedObject {
  pieces: LoadedBuildingPiece[];
  grid: Grid;
}

interface BuildingSet {
  pieces: BuildingPiece[];
  grid: Grid;
}

type BuildingPiece = UnloadedBuildingPiece | LoadedBuildingPiece;


interface UnloadedBuildingPiece extends BuildingProps {
  imageUrl: string;
  offsetPX: {x: number, y: number};
  tallness: number;
}

interface LoadedBuildingPiece extends BuildingProps {
  image: HTMLImageElement;
  offsetPX: {x: number, y: number};
  tallness: number;
}

interface BuildingProps {
  bottom: boolean;
  middle: boolean;
  top: boolean;
  color?: string;
}

async function loadBuildings(): Promise<BuildingSet> {
  const {grid, tiles, tileoffset} = await loadJson('maps/buildings.json') as Tileset;
  const pieces = tiles
    .filter(tile => tile.image)
    .map<UnloadedBuildingPiece>(tile => {
      const offset = {x: tileoffset?.x ?? 0, y: tileoffset?.y ?? 0};
      offset.x += (grid.width - tile.imagewidth) / 2;
      return {
        imageUrl: `maps/${tile.image}`,
        bottom: false,
        middle: false,
        top: false,
        offsetPX: offset,
        tallness: 0,
        ...reduceProperties(tile.properties || [])
      }
    });

  return { pieces, grid };
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor((Math.random() * items.length))];
}
