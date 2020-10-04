import {SerializedObject} from './Map.js';
import {GameObject} from './GameObject.js';
import {Serializable} from './serialization.js';

@Serializable()
export class ArbitraryGameObject extends GameObject {
  draw() {}

  tick() {}

  static async deserialize(data: SerializedObject) {
    return new ArbitraryGameObject(data);
  }
}

