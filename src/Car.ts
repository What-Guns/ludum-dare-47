export class Car{
  x: number;
  y: number;

  private destination: any;
  private directionToDestination: any;

  readonly SPEED = .1;
  readonly DISTANCE_FROM_DESTINATION = 5;

  constructor(x:number, y: number) {
    this.x = x;
    this.y = y;
    this.setDestination(600, 200)
  }


  tick(dt: number) {
    if (!this.destination) {
      return;
    }
    if (((this.x - this.destination.x) * (this.x - this.destination.x)) + ((this.y - this.destination.y) * (this.y - this.destination.y)) < this.DISTANCE_FROM_DESTINATION) {
      this.x = this.destination.x;
      this.y = this.destination.y;
      this.destination = null;
      this.directionToDestination = null;
    }
    this.x += Math.cos(this.directionToDestination) * this.SPEED * dt;
    this.y += Math.sin(this.directionToDestination) * this.SPEED * dt;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  setDestination(x: number, y: number) {
    this.destination = {x, y}
    this.directionToDestination = Math.atan2(y - this.y, x - this.x);
  }
}