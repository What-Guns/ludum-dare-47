export interface MapData {
  layers: Array<TileLayer|ObjectGroup>;
  orientation: string;
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
}

export interface TileLayer {
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
}

export interface ObjectGroup {
  draworder: string;
  id: number;
  name: string;
  objects: never[];
  opacity: number;
  type: 'objectgroup';
  visible: boolean;
  x: number;
  y: number;
}

export interface Chunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}
