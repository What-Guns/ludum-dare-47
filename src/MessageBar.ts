import { GameInfo } from "./GameInfo";

export class MessageBar {
  private width = 0.8; // 80% of the screen
  private bottomMargin = 50;
  private height = 30; // 30 px tall
  private goalMessage = 'WASD or Arrow Keys will let you drive around!';
  private messageText = this.gibberish(this.goalMessage.length);
  private elapsedTime = 0;
  private currentIterations = 0;

  readonly maxIterations = 5;
  readonly timeBetweenIterations = 180;
  readonly unscramblePercentage = 0.6;
  
  setGameInfo(info: GameInfo) {
    info.messageBar = this;
  }

  draw(ctx: CanvasRenderingContext2D){
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const x = (1 - this.width) * ctx.canvas.width / 2;
    const y = ctx.canvas.height - this.bottomMargin - this.height;
    const width = ctx.canvas.width * this.width;
    const height = this.height;
    ctx.fillRect(x, y, width, height)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '30px sans-serif'
    ctx.fillText(this.messageText, ctx.canvas.width / 2, ctx.canvas.height - this.bottomMargin - 2, width);
  }

  tick(dt: number){
    this.elapsedTime += dt;
    if(this.elapsedTime > this.timeBetweenIterations) {
      this.elapsedTime -= this.timeBetweenIterations;
      if (this.currentIterations < this.maxIterations) {
        this.unscramblePartial();
        this.currentIterations ++;
      } else {
        this.messageText = this.goalMessage;
      }
    }
  }

  setNewMessage(msg: string) {
    if (this.goalMessage === msg) return;
    this.goalMessage = msg;
    this.messageText = this.gibberish(msg.length);
    this.currentIterations = 0;
  }

  gibberish(length: number) {
    // https://stackoverflow.com/a/12502559
    let tempString = '';
    do {
      tempString += Math.random().toString(36).slice(2);
    } while (tempString.length < length);
    return tempString.slice(0, length);
  }

  unscramblePartial() {
    for(let i=0; i<this.goalMessage.length; i++) {
      if(Math.random() < this.unscramblePercentage) this.messageText = this.messageText.substring(0, i) + this.goalMessage.charAt(i) + this.messageText.substring(i+1);
    }
  }
}