import { Package } from "./Package.js";
import { PackageSpawn } from "./PackageSpawn.js";

export class Job {
  constructor(readonly packages: Array<Package>, readonly onComplete: Function) {
    packages.forEach(p => p.job = this);
  }

  deliverPackage(pkg: Package) {
    this.packages.splice(this.packages.findIndex(p => p === pkg), 1);
    console.log(this.packages)
    if (!this.packages.length) this.onComplete();
  }

  static fromManifest(manifest: string) {
    const pkgs: Array<Package> = [];
    const spawner = (window as any).game.map.find(31);
    if (spawner instanceof PackageSpawn) {
      pkgs.push(spawner.spawnPackage(this.dzById(34)))
      //pkgs.push(spawner.spawnPackage((window as any).game.map.find(35)))
      //pkgs.push(spawner.spawnPackage((window as any).game.map.find(36)))
    }
    return new Job(pkgs, () => this.sendMessage('Job complete!'));
  }

  static dzById(id: number) {
    return (window as any).game.map.find(id);
  }

  static sendMessage(msg: string) {
    (window as any).game.hud.messageBar.setNewMessage(msg);
  }
}