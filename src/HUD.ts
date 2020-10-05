import { AudioControls } from "./AudioControls.js";
import { DebugHUD } from "./DebugHUD.js";
import { GameInfo } from "./GameInfo.js";
import { GameMap } from "./GameMap.js";
import { MessageBar } from "./MessageBar.js";
import { Minimap } from "./Minimap.js";
import { TimeRemaining } from "./TimeRemaining.js";

export class HUD {
  readonly minimap: Minimap;
  readonly messageBar: MessageBar;
  readonly fpsCounter: FPSCounter;
  readonly audioControls: AudioControls;
  readonly timeRemaining: TimeRemaining;
  readonly debugHUD: DebugHUD;
  readonly hudElementList: Array<HUDElement> = [];
  constructor(map: GameMap) {
    this.minimap = new Minimap(map);
    this.messageBar = new MessageBar();
    this.fpsCounter = new FPSCounter();
    this.audioControls = new AudioControls();
    this.timeRemaining = new TimeRemaining();
    this.debugHUD = new DebugHUD(map);
    this.addHUDElement(this.minimap);
    this.addHUDElement(this.messageBar);
    this.addHUDElement(this.fpsCounter);
    this.addHUDElement(this.audioControls);
    this.addHUDElement(this.timeRemaining);
    this.addHUDElement(this.debugHUD);
  }

  addHUDElement(el: HUDElement) {
    this.hudElementList.push(el);
    return el;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.filter = 'none'
    this.hudElementList.forEach(el => el.draw(ctx));
  }

  tick(dt: number) {
    this.hudElementList.forEach(el => el.tick(dt));
  }

  setGameInfo(info: GameInfo) {
    this.messageBar.setGameInfo(info);
  }
}

export interface HUDElement {
  draw(ctx: CanvasRenderingContext2D): void;
  tick(timestamp: number): void;
}

class FPSCounter implements HUDElement{
  fps = '';
  tick(dt: number) {
    this.fps = String((1000 / dt).toFixed(0))
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';
    ctx.fillText(this.fps, 0, 10);
  }
}