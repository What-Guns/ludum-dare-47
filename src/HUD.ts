import { MessageBar } from "./MessageBar.js";
import { Minimap } from "./Minimap.js";

export class HUD {
  readonly minimap: HUDElement;
  readonly messageBar: HUDElement;
  readonly hudElementList: Array<HUDElement> = [];
  constructor() {
    this.minimap = this.addHUDElement(new Minimap());
    this.messageBar = this.addHUDElement(new MessageBar());
  }

  addHUDElement(el: HUDElement) {
    this.hudElementList.push(el);
    return el;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.hudElementList.forEach(el => el.draw(ctx));
  }

  tick(dt: number) {
    this.hudElementList.forEach(el => el.tick(dt));
  }
}

export interface HUDElement {
  draw(ctx: CanvasRenderingContext2D): void;
  tick(timestamp: number): void;
}