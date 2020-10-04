export async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });
  imageMasks.set(image, createImageMask(image));
  return image;
}

export const imageMasks = new Map<HTMLImageElement, ImageData>();

export async function loadJson(path: string) {
  const response = await fetch(path);
  if(!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  return await response.json();
}

let maskCtx: CanvasRenderingContext2D|undefined;

function createImageMask(image: HTMLImageElement) {
  if(!maskCtx) {
    const maskCanvas = document.createElement('canvas');
    document.body.appendChild(maskCanvas);
    maskCanvas.style.backgroundColor = 'coral';
    maskCtx = maskCanvas.getContext('2d')!;
  }

  maskCtx.canvas.width = image.width;
  maskCtx.canvas.height = image.height;
  maskCtx.fillRect(0, 0, image.width, image.height);
  maskCtx.fillStyle = 'white';
  maskCtx.globalCompositeOperation = 'destination-out';
  maskCtx.drawImage(image, 0, 0);
  maskCtx.globalCompositeOperation = 'xor';
  maskCtx.fillRect(0, 0, image.width, image.height);
  return maskCtx.getImageData(0, 0, image.width, image.height);
}
