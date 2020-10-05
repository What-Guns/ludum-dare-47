import {GameObject, SerializedObject, reduceProperties} from './GameObject.js';
import {SeedRandom} from './seedrandom';
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
      this.clipAroundCar(ctx);
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

  clipAroundCar(ctx: CanvasRenderingContext2D) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const squareSize = 0.05
    ctx.translate(this.map.camera.screenX, this.map.camera.screenY);
    ctx.translate(-width / 2, -height / 2);
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height)
    ctx.lineTo(1, 0);
    ctx.lineTo(width * (0.5 - squareSize), height * (0.5 - squareSize))
    ctx.lineTo(width * (0.5 - squareSize), height * (0.5 + squareSize))
    ctx.lineTo(width * (0.5 + squareSize), height * (0.5 + squareSize))
    ctx.lineTo(width * (0.5 + squareSize), height * (0.5 - squareSize))
    ctx.lineTo(width * (0.5 - squareSize), height * (0.5 - squareSize))
    ctx.lineTo(0, 0);
    ctx.clip('evenodd');
    //ctx.fill()
    ctx.translate(width / 2, height / 2);
    ctx.translate(-this.map.camera.screenX, -this.map.camera.screenY);
  }

  static async create(map: GameMap, {x, y}: Point, zoning: ZoningRestrictions, seed: string) {
    return this.deserialize({
      id: -1,
      name: '',
      type: Building.name,
      x,
      y,
      map,
      properties: zoning as any,
    }, seed);
  }

  static async deserialize(obj: SerializedObject, seed?: string) {
    const {pieces, grid} = await buildings;

    const rnd = new Math.seedrandom(seed);

    const myPieces = [];

    const {tallness: fixedTallness, maxTallness = 8, minTallness = 2, ...globalFilter} = obj.properties as unknown as ZoningRestrictions&{tallness?: number};

    const tallness = fixedTallness ?? minTallness + Math.floor(rnd() * (maxTallness - minTallness));

    if(!globalFilter.color && rnd() > 0.6) {
      globalFilter.color = pickRandom(['red', 'yellow', 'white', 'brown'], rnd);
    }

    for(let i = 0; i < tallness; i++) {
      const filter = {
        ...globalFilter,
        bottom: i === 0 || undefined,
        middle: i > 0 && i < tallness - 1 || undefined,
        top: i === tallness - 1 || undefined,
      };
      myPieces.push(pickPiece(pieces, filter, rnd));
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

function pickPiece(pieces: BuildingPiece[], filters: BuildingFilters, rnd: SeedRandom): BuildingPiece {
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
    return pickPiece(pieces, filters, rnd);
  }

  return pickRandom(legalPieces, rnd);
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

function pickRandom<T>(items: T[], rnd: SeedRandom) {
  return items[Math.floor((rnd() * items.length))];
}
