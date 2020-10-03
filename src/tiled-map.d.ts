export interface MapData {
  layers: TiledLayer[];
  orientation: string;
  tilewidth: number;
  tileheight: number;
  tilesets: Tileset[];
}

export interface Tileset {
  columns: number;
  firstgid: number;
  grid: Grid;
  margin: number;
  name: string;
  tiles: Tile[];
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

export interface TiledLayer {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity:number;
  startx: number;
  starty: number;
  type: string;
  visible:boolean;
  width:number;
  x:number;
  y:number;
}

export interface Chunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}
