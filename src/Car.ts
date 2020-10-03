export class Car{
  x: number;
  y: number;
  direction: number;

  private destination: any;
  private directionToDestination: any;

  private currentManeuver: Turn | null = null;

  readonly SPEED = 1;
  readonly DISTANCE_FROM_DESTINATION = 5;
  readonly MANEUVER_SPEED = 0.05;

  lastTurnLeft = false;

  constructor(x:number, y: number) {
    this.x = x;
    this.y = y;
    this.direction = Math.PI;
    this.setDestination(600, 200)
  }


  tick(dt: number) {
    if (this.currentManeuver) {
      this.progressManeuver();
    } else if(this.lastTurnLeft) {
      this.lastTurnLeft = false;
      this.makeRightTurn();
      this.progressManeuver();
    } else if(!this.lastTurnLeft) {
      this.lastTurnLeft = true;
      this.makeLeftTurn();
      this.progressManeuver();
    } else if(this.destination) {
      if (((this.x - this.destination.x) * (this.x - this.destination.x)) + ((this.y - this.destination.y) * (this.y - this.destination.y)) < this.DISTANCE_FROM_DESTINATION) {
      this.x = this.destination.x;
      this.y = this.destination.y;
      this.destination = null;
      this.directionToDestination = null;
    }
    this.x += Math.cos(this.directionToDestination) * this.SPEED * dt;
    this.y += Math.sin(this.directionToDestination) * this.SPEED * dt;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  setDestination(x: number, y: number) {
    this.destination = {x, y}
    this.directionToDestination = Math.atan2(y - this.y, x - this.x);
  }

  makeRightTurn() {
    this.currentManeuver = {
      startingRotation: this.direction,
      endingRotation: this.direction + (Math.PI / 2),
      type: 'rightTurn',
      percentageComplete: 0,
    }
  }

  makeLeftTurn() {
    this.currentManeuver = {
      startingRotation: this.direction,
      endingRotation: this.direction - (Math.PI / 2),
      type: 'leftTurn',
      percentageComplete: 0,
    }
  }

  progressManeuver() {
    const mvr  = this.currentManeuver!;
    if(mvr && mvr.percentageComplete >=1 ) {
      this.currentManeuver = null;
    }
    this.direction = lerp(mvr.startingRotation, mvr.endingRotation, mvr.percentageComplete);
    this.x += Math.cos(this.direction) * this.SPEED;
    this.y += Math.sin(this.direction) * this.SPEED;
    mvr.percentageComplete += this.MANEUVER_SPEED;
  }
}

interface Turn {
  startingRotation: number,
  endingRotation: number,
  type: CarActionType,
  percentageComplete: number,
}

function lerp(start: number, end: number, percent: number) {
  return start*(1 - percent) + end*percent;
}

export type CarActionType = 'straight' | 'leftTurn' | 'rightTurn';