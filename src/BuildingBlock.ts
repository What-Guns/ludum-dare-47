import {SerializedObject} from './GameObject.js';
import {Obstacle, ObstacleProps} from './Obstacle.js';
import {Serializable} from './serialization.js';
import {Building, ZoningRestrictions} from './Building.js';

@Serializable()
export class BuildingBlock extends Obstacle {
  static async deserialize(data: SerializedObject) {
    if(typeof(data.width) !== 'number') throw new Error(`Invalid width ${data.width}`);
    if(typeof(data.height) !== 'number') throw new Error(`Invalid height ${data.height}`);

    const zoning: ZoningRestrictions = {
      minTallness: 2,
      maxTallness: 7,
      ...data.properties,
    };

    for(let x = 0; x < data.width; x++) {
      for(let y = 0; y < data.height; y++) {
        const where = { x: data.x + x, y: data.y + y, };
        Building.create(data.map, where, zoning).then(b => data.map.add(b));
      }
    }


    return new Obstacle(data as ObstacleProps);
  }
}
