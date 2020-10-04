import { GameMap } from "./GameMap.js";
import { MessageBar } from "./MessageBar.js";
import { Minimap } from "./Minimap.js";

export class HUD {
  readonly minimap: Minimap;
  readonly messageBar: MessageBar;
  readonly hudElementList: Array<HUDElement> = [];
  constructor(map: GameMap) {
    this.minimap = new Minimap(map);
    this.messageBar = new MessageBar();
    this.addHUDElement(this.minimap);
    this.addHUDElement(this.messageBar);
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