import {StreetGrid} from './StreetGrid.js';

export class Game{

  private readonly ctx: CanvasRenderingContext2D;
  private readonly streetGrid: StreetGrid;
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.streetGrid = new StreetGrid();
  }

  tick(){}

  draw(){
    this.streetGrid.draw(this.ctx);
  }
};