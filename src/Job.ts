import { DeliveryZone } from "./DeliveryZone.js";
import { Package } from "./Package.js";
import { PackageSpawn } from "./PackageSpawn.js";

export type JobManifest = {
  deliveries: Delivery[];
  description: string;
  score: number;
  timeAdd: number;
}

export interface Delivery {
  spawnerId: number;
  destinationId: number;
}

export class Job {
  readonly description: string;
  readonly score: number;

  constructor(readonly packages: Array<Package>, readonly onComplete: Function, manifest: JobManifest) {
    this.description = manifest.description;
    this.score = manifest.score;
    packages.forEach(p => p.job = this);
  }

  deliverPackage(pkg: Package) {
    this.packages.splice(this.packages.findIndex(p => p === pkg), 1);
    if (!this.packages.length) {
      game.gameInfo.score += this.score;
      this.onComplete();
    }
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
    const job = new Job(pkgs, onComplete, manifest);
    if (!manifest.deliveries.length) {
      job.onComplete(); 
    }
    return job;
  }

  static findById(id: number) {
    return (window as any).game.map.find(id);
  }

  static sendMessage(msg: string) {
    (window as any).game.hud.messageBar.setNewMessage(msg);
  }
}
