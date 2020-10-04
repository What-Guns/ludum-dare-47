import {clamp} from './math.js';

let zCtx: CanvasRenderingContext2D|undefined;
let scratchCtx: CanvasRenderingContext2D|undefined;
let maskCtx: CanvasRenderingContext2D|undefined;

let tx = 0;
let ty = 0;

export function drawZBuffer(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    z: number,
  ) {
  ctx.drawImage(image, x, y);

  zCtx = zCtx ?? (document.getElementById('z-buffer') as HTMLCanvasElement).getContext('2d')!;
  scratchCtx = scratchCtx ?? (document.getElementById('scratch-canvas') as HTMLCanvasElement).getContext('2d')!;

  const mask = createImageMask(image, z);

  zCtx.drawImage(mask,
    // source
    0, 0, image.width, image.height,
    // destination
    x, y, image.width, image.height);

  scratchCtx.globalCompositeOperation = 'source-over';
  scratchCtx.drawImage(zCtx.canvas, 0, 0);

  // subtract our part of the z-buffer from the z-buffer.
  // If we're closer (or equal) to the background, we'll
  // end up with a black region in the image.

  scratchCtx.globalCompositeOperation = 'difference';
  scratchCtx.drawImage(mask,
    // source
    0, 0, image.width, image.height,
    // destination
    x + tx, y + ty, image.width, image.height);

  // This makes the canvas white except for the black cut out
  // we just drew.
  scratchCtx.globalCompositeOperation = 'color-dodge';
  scratchCtx.fillStyle = 'white';
  scratchCtx.fillRect(0, 0, 600, 400);

  // zCtx.putImageData(zbuffer, 0, 0);

  // if(mask && zCtx) {
  //   // zCtx.globalCompositeOperation = 'lighten';
  //   zCtx.drawImage(mask, x, y);
  //   // zCtx.fillRect(x, y, mask.width, mask.height);
  // }
}

function createImageMask(image: HTMLImageElement, z: number): CanvasImageSource {
  if(!maskCtx) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = image.width;
    maskCanvas.height = image.height;
    document.body.append(maskCanvas);
    maskCtx = maskCanvas.getContext('2d')!;
  }

  if(maskCtx.canvas.width < image.width) maskCtx.canvas.width = image.width;
  if(maskCtx.canvas.height < image.height) maskCtx.canvas.height = image.height;

  maskCtx.clearRect(0, 0, image.width, image.height);
  maskCtx.fillRect(0, 0, image.width, image.height);
  const zPercent = clamp(z * 100, 0, 100);
  maskCtx.fillStyle = `hsl(0deg, 0%, ${zPercent}%)`;
  maskCtx.globalCompositeOperation = 'destination-out';
  maskCtx.drawImage(image, 0, 0);
  maskCtx.globalCompositeOperation = 'xor';
  maskCtx.fillRect(0, 0, image.width, image.height);
  return maskCtx.canvas;
}

export function clearZBuffer(width: number, height: number) {
  if(!zCtx) return;
  zCtx.resetTransform();
  zCtx.globalCompositeOperation = 'source-over';
  zCtx.fillStyle = 'black';
  zCtx.fillRect(0, 0, width, height);
  tx = 0;
  ty = 0;
}

export function translateZBuffer(x: number, y: number) {
  zCtx?.translate(x, y);
  tx += x;
  ty += y;
}

