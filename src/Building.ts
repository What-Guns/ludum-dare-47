import {GameObject, SerializedObject} from './GameObject.js';
import {Serializable} from './serialization.js';
import {loadJson, loadImage} from './loader.js';
import {Tileset, Property} from './tiled-map';
import {DrawableCell} from './GameMap.js';
import {computeScreenCoords} from './math.js';

const buildings = loadBuildings();

@Serializable()
export class Building extends GameObject {
  tick() {}

  readonly cells: DrawableCell[];
  readonly height: number;

  constructor({images, ...base}: BuildingParameters) {
    super(base);
    this.screenYDepthOffset = this.map.world.tileheight / 2;
    computeScreenCoords(this, this, this.map.world);
    let offset = 0;
    this.cells = images.map((image) => {
      const cell = {
        image,
        screenX: this.screenX,
        screenY: this.screenY,
        offsetPX: {x: 0, y: offset}
      };
      offset -= 34;
      return cell;
    });
    this.height = images.length;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for(const cell of this.cells) this.map.drawTile(ctx, cell);
  }

  static async deserialize(obj: SerializedObject) {
    const height = (obj.properties.height as number|undefined) ?? 8;
    const {bottom, middle, top, offsetPX} = await buildings;

    const imageUrls: string[] = [];

    for(let i = 0; i < height; i++) {
      if(i === 0) imageUrls.push(pickRandom(bottom));
      else if(i === height - 1) imageUrls.push(pickRandom(top));
      else imageUrls.push(pickRandom(middle));
    }

    const images = await Promise.all(imageUrls.map(loadImage));

    return new Building({
      ...obj,
      images,
      offsetPX,
      x: Math.floor(obj.x),
      y: Math.floor(obj.y),
    });
  }
}

interface BuildingParameters extends SerializedObject {
  images: HTMLImageElement[];
  offsetPX: {x: number, y: number};
}

async function loadBuildings() {
  const data = await loadJson('maps/buildings.json') as Tileset;
  const tiles = data.tiles
    .filter(tile => tile.image)
    .map(tile => {
      return {
        imageUrl: `maps/${tile.image}`,
        properties: (tile.properties ?? []).reduce<{[key: string]: Property['value']}>((collection, prop) => {
          return {...collection, [prop.name]: prop.value};
        }, {}),
      }
    });

  return {
    top: tiles.filter(t => t.properties?.top === true).map(t => t.imageUrl),
    middle: tiles.filter(t => t.properties?.middle === true).map(t => t.imageUrl),
    bottom: tiles.filter(t => t.properties?.bottom === true).map(t => t.imageUrl),
    offsetPX: data.tileoffset ?? {x: 0, y: 0}
  };
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor((Math.random() * items.length))];
}
