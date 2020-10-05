import { DeliveryZone } from "./DeliveryZone.js";
import { Package } from "./Package.js";
import { PackageSpawn } from "./PackageSpawn.js";

export type JobManifest = {
  deliveries: Delivery[];
  description: string;
}

export interface Delivery {
  spawnerId: number;
  destinationId: number;
}

export class Job {
  constructor(readonly packages: Array<Package>, readonly onComplete: Function, readonly description: string) {
    packages.forEach(p => p.job = this);
  }

  deliverPackage(pkg: Package) {
    this.packages.splice(this.packages.findIndex(p => p === pkg), 1);
    if (!this.packages.length) this.onComplete();
  }

  static fromManifest(manifest: JobManifest, onComplete: Function) {
    const pkgs: Array<Package> = [];
    for(const item of manifest.deliveries) {
      const spawner = this.findById(item.spawnerId);
      if (spawner instanceof PackageSpawn) {
        const deliveryZone = this.findById(item.destinationId);
        if (deliveryZone instanceof DeliveryZone) {
          pkgs.push(spawner.spawnPackage(deliveryZone))
        } else {
          console.error('Could not spawn package: invalid delivery zone:', deliveryZone);
        }
      } else {
        console.error('Could not spawn package: invalid spawner:', spawner);
      }
    };
    
    return new Job(pkgs, onComplete, manifest.description);
  }

  static findById(id: number) {
    return (window as any).game.map.find(id);
  }

  static sendMessage(msg: string) {
    (window as any).game.hud.messageBar.setNewMessage(msg);
  }
}
