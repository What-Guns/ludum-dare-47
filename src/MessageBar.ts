export class MessageBar {
  private width = 0.8; // 80% of the screen
  private bottomMargin = 50;
  private height = 30; // 30 px tall
  private messageText = 'WASD or Arrow Keys will let you drive around!';
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

  tick(){}
}