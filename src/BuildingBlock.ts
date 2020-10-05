import {SerializedObject} from './GameObject.js';
import {Obstacle, ObstacleProps} from './Obstacle.js';
import {Serializable} from './serialization.js';
import {Building, ZoningRestrictions} from './Building.js';
import {SeedRandom} from './seedrandom';

@Serializable()
export class BuildingBlock extends Obstacle {
  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);

    const {fillInterior, seed, ...properties} = data.properties;

    const zoning: ZoningRestrictions = {
      minTallness: 2,
      maxTallness: 7,
      ...properties,
    };

    const rnd = new Math.seedrandom(seed ?? `${data.x}-${data.y}`);

    const waitFor: Promise<Building>[] = [];
    for(let x = 0; x < data.width; x++) {
      for(let y = 0; y < data.height; y++) {
        if(!fillInterior && isInterior(x, y, data.width, data.height)) continue;
        const direction = chooseDirection(rnd, x, y, data.width, data.height);
        const where = { x: data.x + x, y: data.y + y, };
        waitFor.push(Building.create(where, {...zoning, direction}, rnd.int32().toString()));
      }
    }

    for(const b of await Promise.all(waitFor)) game.map.add(b);

    return new Obstacle({visible: false, ...data as ObstacleProps});
  }
}

function chooseDirection(rnd: SeedRandom, x: number, y: number, width: number, height: number) {
  const directions = new Set(['north', 'east', 'south', 'west']);
  if (x > 0) directions.delete('west');
  if (x < width - 1) directions.delete('east');
  if (y > 0) directions.delete('north');
  if (y < height - 1) directions.delete('south');

  if(directions.size === 0) return undefined;
  const index = rnd.int32() % directions.size;
  return Array.from(directions)[index];
}

function isInterior(x: number, y: number, width: number, height: number) {
  return x > 0
      && x < width - 1
      && y > 0
      && y < height - 1;
      
}
