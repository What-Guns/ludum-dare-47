export interface MapData {
  layers: Array<ChunkedTileLayer|TileLayer|ObjectGroup>;
  orientation: string;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  tilesets: Array<Tileset|ExternalTileset>;
}

export interface Tileset {
  columns: number;
  firstgid: number;
  grid: Grid;
  margin: number;
  name: string;
  tiles: Tile[];
  tileoffset?: { x: number, y: number };
}

export interface ExternalTileset {
  source: string;
  firstgid: number;
}

export interface Grid {
  height: number;
  width: number;
  orientation: string;
}

export interface Tile {
  id: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  type?: string;
}

export type TileLayer = InlineTileLayer|ChunkedTileLayer;

export interface InlineTileLayer {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: 'tilelayer';
  visible:boolean;
  width:number;
  x:number;
  y:number;
  startx?: number;
  starty?: number;
}

export interface ChunkedTileLayer {
  chunks: TiledMapChunk[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: 'tilelayer';
  visible:boolean;
  width:number;
  x:number;
  y:number;
  startx: number;
  starty: number;
}

export interface ObjectGroup {
  draworder: string;
  id: number;
  name: string;
  objects: TiledObject[]
  opacity: number;
  type: 'objectgroup';
  visible: boolean;
  x: number;
  y: number;
}

export interface TiledObject {
  id: number;
  height: number;
  name: string;
  point?: boolean;
  properties?: Property[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface FloatProperty {
  name: string;
  type: 'float';
  value: number;
}

export interface BoolProperty {
  name: string;
  type: 'bool';
  value: boolean;
}

export interface ObjectProperty {
  name: string;
  type: 'object';
  value: number;
}

export interface ColorProperty {
  name: string;
  type: 'color';
  value: string;
}

type Property = FloatProperty
  | BoolProperty
  | ObjectProperty
  | ColorProperty;

export interface TiledMapChunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}
