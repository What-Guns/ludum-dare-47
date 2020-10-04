import {GameObject, SerializedObject} from './GameObject.js';

export class Package extends GameObject {
  screenX!: number;
  screenY!: number;
  debug = "";
  static IMAGES: Array<HTMLImageElement>;

  private static async load() {
    Package.IMAGES = await Promise.all([
      'images/items/package.png'
    ].map(waitForImageToLoad));
  }

  tick() {
    
  }

  static async deserialize(data: SerializedObject) {
    await this.load();
    return new Package({...data});
  }

  constructor({...serialized}: SerializedObject&{}) {
    super(serialized);
    (window as any).package = this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.chooseSprite(0);
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, this.screenY - sprite.height / 2);
    ctx.fillText(this.debug, this.screenX + 30, this.screenY + 30);
  }

  chooseSprite(index: number) {
    return Package.IMAGES[index];
  }

}


async function waitForImageToLoad(path: string) {
  const img = new Image();
  img.src = path;
  await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve);
    img.addEventListener('error', reject);
  });
  return img;
}