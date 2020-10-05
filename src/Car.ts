import {isKeyPressed} from './KeyboardListener.js';
import {GameObject, SerializedObject} from './GameObject.js';
import {Terrain} from './GameMap.js';
import {Obstacle} from './Obstacle.js';
import {Serializable} from './serialization.js';
import {Audio} from './Audio.js';
import {clamp} from './math.js';
import {RespawnPoint} from './RespawnPoint.js';
import { Package } from './Package.js';
import { GameInfo } from './GameInfo.js';

/* DIRECTIONS
Direction 0 is +x in game space, down-right in screen space
Direction 1 is 45 degrees counterclockwise from 0
This proceeds to direction 7 which is 45 degrees clockwise from 0
*/

const TERRAIN_SPEED: {[key in Terrain]: number} = {
  road: 0.004,
  dirt: 0.001,
  grass: 0.002,
  sand: 0.0005,
  void: 1,
  water: 0,
};

@Serializable()
export class Car extends GameObject {
  readonly radius = 0.25;
  direction: number;

  screenX!: number;
  screenY!: number;
  terrain: Terrain = 'road';

  debug = "";

  // Direction of the car from 0-7
  snappedDirectionIndex = 0;
  currentTurn = 0;

  speed = 0;
  timeInReverse = 0;
  isBeeping = false;


  timeSpentBraking = 0;
  isSquealing = false;


  readonly MAX_SPEED = 0.003;
  readonly ACCELERATION = 0.000005;
  readonly TURN_SPEED = 1.7;
  readonly BRAKE_DECELERATION = 0.00001;
  readonly REVERSE_ACCELERATION = -0.0002;
  readonly REVERSE_MIN_SPEED = -0.001;
  readonly TIME_BEFORE_REVERSE_LIGHTS = 400;
  readonly TIME_BEFORE_REVERSE = 600;
  readonly TIME_BEFORE_BRAKE_SQUEAL = 150;
  readonly DECELERATION_FACTOR = 0.998;
  readonly MAX_ENGINE_PITCH = 1.3;
  readonly ESSENTIALLY_STOPPED = 0.00004;
  readonly PACKAGE_CAPACITY = 7;

  static IMAGES: Array<HTMLImageElement>;
  static BACKUP_IMAGES: Array<HTMLImageElement>;

  private static async load() {
    Car.IMAGES = await Promise.all([
      'images/car/carBlue6_011.png',
      'images/car/carBlue6_012.png',
      'images/car/carBlue6_006.png',
      'images/car/carBlue6_005.png',
      'images/car/carBlue6_004.png',
      'images/car/carBlue6_009.png',
      'images/car/carBlue6_010.png',
      'images/car/carBlue6_015.png',
    ].map(waitForImageToLoad));
    Car.BACKUP_IMAGES = await Promise.all([
      'images/car/carBlue6_011.png',
      'images/car/carBlue6_012_backup.png',
      'images/car/carBlue6_006_backup.png',
      'images/car/carBlue6_005_backup.png',
      'images/car/carBlue6_004_backup.png',
      'images/car/carBlue6_009_backup.png',
      'images/car/carBlue6_010.png',
      'images/car/carBlue6_015.png',
    ].map(waitForImageToLoad));
    await Audio.load('audio/sfx/splash.ogg', 'splash');
    await Audio.load('audio/sfx/engine.ogg', 'engine');
    await Audio.load('audio/sfx/beep.ogg', 'beep');
    await Audio.load('audio/sfx/pickup.wav', 'pickup');
    await Audio.load('audio/sfx/brake.ogg', 'brake');
  }

  static async deserialize(data: SerializedObject) {
    await this.load();
    const degrees = data.properties.direction as number|undefined ?? 0;
    const direction = -degrees / 180 * Math.PI;
    return new Car({...data, direction});
  }

  constructor({direction, ...serialized}: SerializedObject&{direction: number}) {
    super(serialized);
    this.direction = direction;
    (window as any).car = this;
    Audio.playSFX('engine', 0);
  }

  tick(dt: number) {
    this.snappedDirectionIndex = this.getSnappedDirectionIndex();
    let turning = false;
    if (this.timeInReverse > this.TIME_BEFORE_REVERSE_LIGHTS) {
      if (!this.isBeeping) {
        Audio.playSFX('beep', 0); // Backing up
        this.isBeeping = true;
      }
    } else {
      Audio.stop('beep');
      this.isBeeping = false;
    }
    if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) {
      this.accelerate(dt);
      Audio.setPlaybackSpeed('engine', ((this.speed / this.MAX_SPEED) * (this.MAX_ENGINE_PITCH - 1) + 1.0));
    } else {
      Audio.setPlaybackSpeed('engine', 1.0);
    }
    if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) {
      this.turnLeft(dt);
      turning = true;
    }
    if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) {
      this.turnRight(dt);
      turning = true;
    }
    if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) {
      this.brakeOrReverse(dt);
    } else {
      Audio.stop('brake');
      this.timeSpentBraking = 0;
      this.isSquealing = false;
    }
    this.speed *= this.DECELERATION_FACTOR;
    if (Math.abs(this.speed) < this.ESSENTIALLY_STOPPED) this.speed = 0;

    if (!turning) {
      this.snapTurnDirection();
    }
    this.x += Math.cos(this.direction) * this.speed * dt; // cos(0) = 1 is to the right, so positive x 
    this.y -= Math.sin(this.direction) * this.speed * dt; // sin(pi / 2) = 1 is down, so negative y
    this.map.objectMoved(this);

    this.terrain = this.map.getTerrain(this);

    if(this.terrain === 'water') {
      Audio.playSFX('splash');
      Audio.stop('engine');
      this.map.remove(this);

      const sprite = this.chooseSprite(this.snappedDirectionIndex);
      this.map.expensivelyfindNearestOfType(RespawnPoint, this)?.spawnGhost(this, sprite);
    }

    const currentCollisions = this.collideWithObjects();
    if (currentCollisions[0]) {
      this.processCollision(currentCollisions[0]);
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.chooseSprite(this.snappedDirectionIndex);
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, this.screenY - sprite.height / 2);
    ctx.fillText(this.debug, this.screenX + 30, this.screenY + 30);
  }

  chooseSprite(index: number) {
    return this.timeInReverse > this.TIME_BEFORE_REVERSE_LIGHTS ? Car.BACKUP_IMAGES[index] : Car.IMAGES[index];
  }

  getSnappedDirectionIndex() {
    const d = this.direction;
    const sin = Math.sin(d);
    const cos = Math.cos(d);
    const piOverEight = Math.PI / 8;
    if(sin < Math.sin(piOverEight) && sin > Math.sin(15 * piOverEight)) {
      if(cos > 0) {
        return 0;
      } else {
        return 4;
      }
    } else if(sin < Math.sin(3 * piOverEight) && sin > 0) {
      if(cos > 0) {
        return 1;
      } else {
        return 3;
      }
    } else if(sin > Math.sin(11 * piOverEight) && sin < 0) {
      if(cos > 0) {
        return 7;
      } else {
        return 5;
      }
    }else if(sin > 0) {
      return 2;
    } else {
      return 6;
    }
  }

  accelerate(dt: number) {
    this.timeInReverse = 0;
    this.speed += this.ACCELERATION * dt;
    if (this.speed >= TERRAIN_SPEED[this.terrain]) {
      this.speed = TERRAIN_SPEED[this.terrain]
    }
  }

  turnLeft(dt: number) {
    const turnAmount = this.TURN_SPEED * dt * this.speed;
    this.direction += turnAmount;
    this.currentTurn += turnAmount;
  }

  turnRight(dt: number) {
    const turnAmount = this.TURN_SPEED * dt * this.speed;
    this.direction -= turnAmount;
    this.currentTurn -= turnAmount;
  }

  brakeOrReverse(dt: number) {
    if (this.speed > 0) {
      this.timeInReverse = 0;
      this.speed -= this.BRAKE_DECELERATION * dt;
      if (this.speed < 0) {
        this.speed = 0;
      }
      this.timeSpentBraking += dt;
      if(this.timeSpentBraking > this.TIME_BEFORE_BRAKE_SQUEAL) {
        if(!this.isSquealing) {
          Audio.playSFX('brake');
          this.isSquealing = true;
        }    
      }
    } else if (this.timeInReverse < this.TIME_BEFORE_REVERSE) {
      this.timeInReverse += dt;
      Audio.stop('brake')
    } else {
      Audio.stop('brake')
      this.speed += this.REVERSE_ACCELERATION * dt;
      if (this.speed < this.REVERSE_MIN_SPEED) {
        this.speed = this.REVERSE_MIN_SPEED;
      }
    }
  }

  snapTurnDirection() {
    if (this.currentTurn < Math.PI / 8 && this.currentTurn > -Math.PI / 8) {
      if (this.currentTurn > 0) {
        this.snappedDirectionIndex++;
      } else if(this.currentTurn < 0) {
        this.snappedDirectionIndex--;
      }
    }
    this.currentTurn = 0;
    this.snappedDirectionIndex += 8;
    this.snappedDirectionIndex %= 8;
    this.direction = Math.PI / 4 * this.snappedDirectionIndex;
  }

  private collideWithObjects() {
    this.debug = '';
    let currentCollision;
    const collisionList = [];
    for(const chunk of this.chunks) {
      for(const obj of chunk.objects) {
        if(obj instanceof Obstacle) {
          currentCollision = this.collideWithObstacle(obj);
        } else if (obj instanceof Package) {
          currentCollision = this.collideWithPackage(obj);
        }
        if (currentCollision) collisionList.push(currentCollision);
      }
    }
    return collisionList;
  }

  private collideWithObstacle(obstacle: Obstacle) {
    const diffX = this.x - obstacle.midpointX();
    const diffY = this.y - obstacle.midpointY();

    const clampedDiffX = clamp(diffX, -obstacle.width / 2, obstacle.width / 2);
    const clampedDiffY = clamp(diffY, -obstacle.height / 2, obstacle.height / 2);

    const collisionX = obstacle.x + obstacle.width / 2 + clampedDiffX;
    const collisionY = obstacle.y + obstacle.height / 2 + clampedDiffY;
    const directionToPush = Math.atan2(collisionY - this.y, this.x - collisionX);
    const target = {
      x: collisionX + (Math.cos(directionToPush) * this.radius),
      y: collisionY - (Math.sin(directionToPush) * this.radius),
    }
    const distSquared = Math.pow(collisionX - this.x, 2) + Math.pow(collisionY - this.y, 2);

    const collisionExists = distSquared <= this.radius * this.radius
    this.debug = (collisionExists).toString();
    return collisionExists ? target : null;
  }

  private collideWithPackage(obj: Package) {
    if (this.map.gameInfo!.currentlyHeldPackages < this.PACKAGE_CAPACITY){
      const distanceToPackageSquared = Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2);
      if (distanceToPackageSquared < this.radius) this.collectPackage(obj);
    } else {
      this.denyPackage()
    }
    return null;
  }

  private processCollision(target: {x: number, y: number}) {
    this.x = target.x;
    this.y = target.y;
    this.speed = 0;
  }

  collectPackage(pkg: Package) {
    this.map.remove(pkg);
    Audio.playSFX('pickup');
    this.map.gameInfo!.incrementPackages();
  }

  denyPackage(){
    this.map.gameInfo!.messageBar?.setNewMessage("You require more car capacity. Drop off packages at post office to carry more");
    }

  setGameInfo(info: GameInfo) {
    this.map.gameInfo! = info;
  }
}

async function waitForImageToLoad(path: string) {
  const img = new Image();
  img.src = path;
  await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
  return img;
}
