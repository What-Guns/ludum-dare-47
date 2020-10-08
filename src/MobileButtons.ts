import { HUDElement } from "./HUD.js";
import { loadImage } from "./loader.js";

type button = 'gas' | 'brake' | 'right' | 'left';

export class MobileButtons implements HUDElement{
  buttons: {[keys in button]: MobileButton} = {
    gas: new GasButton(),
    brake: new BrakeButton(),
    left: new LeftTurnButton(),
    right: new RightTurnButton(),
  }
  draw(ctx: CanvasRenderingContext2D) {
    if(!(window as any).isMobile) return;
    Object.keys(this.buttons).forEach(b => this.buttons[(b as button)].draw(ctx));
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
  readonly rightMargin = 60;
  readonly bottomMargin = 80;
  readonly radius = 40;
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
    return;
  }
}

class BrakeButton extends MobileButton {
  readonly rightMargin = 130;
  readonly bottomMargin = 50;
  readonly radius = 30;
  readonly radiusSquared = this.radius * this.radius;
  
  isOnButton(x: number, y: number): boolean {
    const xDist = (this.canvas.width - this.rightMargin) - x;
    const yDist = (this.canvas.height - this.bottomMargin) - y;
    return (xDist * xDist + yDist * yDist) < this.radiusSquared;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black 2px';
    ctx.beginPath();
    ctx.arc(this.canvas.width - this.rightMargin, this.canvas.height - this.bottomMargin, this.radius, 0, Math.PI * 2)
    ctx.fill();
    ctx.stroke();
    return;
  }
}

class LeftTurnButton extends MobileButton {
  readonly leftMargin = 20;
  readonly bottomMargin = 40;
  readonly width = 60;
  readonly height = this.width;
  image?: HTMLImageElement;

  constructor() {
    super();
    loadImage('./images/ui/arrowLeft.png').then(img => this.image = img);
  }
  
  isOnButton(x: number, y: number): boolean {
    return x > this.leftMargin && x < this.leftMargin + this.width && y > this.canvas.height - this.bottomMargin - this.height && y < this.canvas.height - this.bottomMargin;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'black 2px';
    ctx.fillRect(this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height)
    ctx.strokeRect(this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height)
    if (this.image) ctx.drawImage(this.image, this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height);
    return;
  }
}

class RightTurnButton extends MobileButton {
  readonly leftMargin = 90;
  readonly bottomMargin = 40;
  readonly width = 60;
  readonly height = this.width;
  image?: HTMLImageElement;

  constructor() {
    super();
    loadImage('./images/ui/arrowRight.png').then(img => this.image = img);
  }
  
  isOnButton(x: number, y: number): boolean {
    return x > this.leftMargin && x < this.leftMargin + this.width && y > this.canvas.height - this.bottomMargin - this.height && y < this.canvas.height - this.bottomMargin;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'black 2px';
    ctx.fillRect(this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height)
    ctx.strokeRect(this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height)
    if (this.image) ctx.drawImage(this.image, this.leftMargin, this.canvas.height - this.bottomMargin - this.height, this.width, this.height);
    return;
  }
}