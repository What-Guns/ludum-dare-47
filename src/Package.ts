import {GameObject, SerializedObject} from './GameObject.js';

export class Package extends GameObject {
  screenX!: number;
  screenY!: number;
  debug = "";

  bob = Math.random() * 1000;
  readonly bobSpeed = .006;
  readonly bobAmplitude = 3;

  spriteIndex: number;
  static IMAGES: Array<HTMLImageElement>;

  private static async load() {
    Package.IMAGES = await Promise.all([
      'images/items/package.png',
      'images/items/box1.png',
      'images/items/box2.png',
    ].map(waitForImageToLoad));
  }

  tick(dt: number) {
    this.bob += dt;
  }

  static async deserialize(data: SerializedObject) {
    await this.load();
    return new Package({...data});
  }

  constructor({...serialized}: SerializedObject&{}) {
    super(serialized);
    (window as any).package = this;
    this.spriteIndex = Math.floor(1 + Math.random() * 2)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const sprite = this.chooseSprite(this.spriteIndex);
    const bobOffset = Math.sin(this.bob * this.bobSpeed) * this.bobAmplitude;
    ctx.drawImage(sprite, this.screenX - sprite.width / 2, bobOffset + this.screenY - sprite.height / 2);
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