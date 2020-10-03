import {CarActionType} from './Car.js'

export class StreetGrid{
  GRID_HEIGHT = 5;
  GRID_WIDTH = 5;

  CELL_WIDTH = 120;
  CELL_HEIGHT = 72;

  CELL_SPACING_X = 60;
  CELL_SPACING_Y = 36;

  draw(ctx: CanvasRenderingContext2D) {
    for (let x=0; x < this.GRID_WIDTH; x++) {
      for (let y=0; y < this.GRID_HEIGHT; y++) {
        this.drawCell(ctx, 400 + ((x - y) * this.CELL_SPACING_X), 50 + ((x + y) * this.CELL_SPACING_Y));
      }
    }
  }

  drawCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - (this.CELL_WIDTH / 2), y + (this.CELL_HEIGHT / 2));
    ctx.lineTo(x, y + this.CELL_HEIGHT);
    ctx.lineTo(x + (this.CELL_WIDTH / 2), y + (this.CELL_HEIGHT / 2));
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

/*class StreetGridNode {
  readonly destinationNodes: {[key in CarActionType]: StreetGridNode | null};

  constructor(readonly x: number, readonly y: number) {
    this.x = x;
    this.y = y;
    this.destinationNodes = {
      straight: null,
      leftTurn: null,
      rightTurn: null, 
    }
  }

  setDestinationNode(node: StreetGridNode, action: CarActionType) {
    this.destinationNodes[action] = node;
  }
}*/