import { HUDElement } from "./HUD.js";

export class MobileButtons implements HUDElement{
  buttons: Array<MobileButton> = [
    new GasButton(),
  ]
  draw(ctx: CanvasRenderingContext2D) {
    this.buttons.forEach(b => b.draw(ctx));
  }
  // @ts-ignore These are event-based, not tick-based
  tick(dt: number) {}
}

abstract class MobileButton {
  protected pressed = false;
  private associatedTouches: Array<Touch> = [];
  readonly canvas; 
  constructor() {
    this.canvas = document.querySelector('canvas')!;
    this.canvas.addEventListener('touchstart', ev => {
      ev.preventDefault()
      for (let i=0; i<ev.changedTouches.length; i++) {
        const touch = ev.changedTouches.item(i)!;
        if (this.isOnButton(touch.clientX, touch.clientY)) {
          this.associatedTouches.push(touch);
          this.pressed = true;
        }
      }
    });
    this.canvas.addEventListener('touchend', ev => {
      ev.preventDefault()
      for (let i=0; i<ev.changedTouches.length; i++) {
        const touch = ev.changedTouches.item(i)!;
        const existingTouch = this.associatedTouches.findIndex(t => t.identifier === touch.identifier)
        if (existingTouch > -1) {
          this.associatedTouches.splice(existingTouch, 1);
          if (!this.associatedTouches.length) this.pressed = false;
        }
      }
    });
    this.canvas.addEventListener('touchcancel', ev => {
      // ev.preventDefault() - The browser gets cranky when you try to do this
      for (let i=0; i<ev.changedTouches.length; i++) {
        const touch = ev.changedTouches.item(i)!;
        const existingTouch = this.associatedTouches.findIndex(t => t.identifier === touch.identifier)
        if (existingTouch > -1) {
          this.associatedTouches.splice(existingTouch, 1);
          if (!this.associatedTouches.length) this.pressed = false;
        }
      }
    });
  }
  isPressed(): boolean {
    return this.pressed;
  };
  abstract isOnButton(x:number, y: number): boolean;
  abstract draw(ctx: CanvasRenderingContext2D) : void;
}

class GasButton extends MobileButton {
  readonly rightMargin = 40;
  readonly bottomMargin = 80;
  readonly radius = 25;
  readonly radiusSquared = this.radius * this.radius;
  
  isOnButton(x: number, y: number): boolean {
    const xDist = (this.canvas.width - this.rightMargin) - x;
    const yDist = (this.canvas.height - this.bottomMargin) - y;
    return (xDist * xDist + yDist * yDist) < this.radiusSquared;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'black 2px';
    ctx.beginPath();
    ctx.arc(this.canvas.width - this.rightMargin, this.canvas.height - this.bottomMargin, this.radius, 0, Math.PI * 2)
    ctx.fill();
    ctx.stroke();
    ctx.strokeText('Gas!', this.canvas.width - this.rightMargin - 15, this.canvas.height - this.bottomMargin );
    return;
  }
}