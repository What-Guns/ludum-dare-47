import { HUDElement } from "./HUD";

export class TimeRemaining implements HUDElement{
  readonly SHADOW_OFFSET = 4;
  readonly TOP_MARGIN = 50;

  readonly CRITICAL_TIME = 20000;
  readonly PULSE_SPEED = 0.003;
  readonly PULSE_AMPLITUDE = 1;

  timeInMillis = 22347;
  timeString = '';

  draw(ctx: CanvasRenderingContext2D) {
    if(this.timeInMillis < 0) return;
    const critical = this.timeInMillis < this.CRITICAL_TIME;
    ctx.save();
    const sorryForNotNamingThisBetter = this.PULSE_AMPLITUDE * Math.sin((this.timeInMillis - this.CRITICAL_TIME) * this.PULSE_SPEED);
    const scale = critical ? 1 + Math.abs(sorryForNotNamingThisBetter) : 1.0;
    ctx.translate(ctx.canvas.width / 2 - (scale * 145), 0);
    ctx.scale(scale, scale);
    ctx.rotate(critical ? sorryForNotNamingThisBetter / 15 : 0);
    ctx.fillStyle = critical ? 'red' : 'yellow';
    ctx.textAlign = 'left';
    ctx.font = '48px KenneyMini'
    ctx.fillText(this.timeString, 60 + this.SHADOW_OFFSET, this.TOP_MARGIN + this.SHADOW_OFFSET);
    ctx.fillStyle = 'black';
    ctx.fillText(this.timeString, 60, this.TOP_MARGIN);
    ctx.restore();
  }

  tick(dt: number) {
    this.timeInMillis -= dt;
    this.calculateTimeString();
  }
  
  calculateTimeString() {
    const date = new Date(this.timeInMillis);
    this.timeString = `${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  }

}