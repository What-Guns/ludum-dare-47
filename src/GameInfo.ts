import { GameObject } from "./GameObject.js";
import { GameMap } from './GameMap.js';
import { Job } from "./Job.js";
import { MessageBar } from "./MessageBar.js";
import { Package } from "./Package.js";

export class GameInfo {
  currentlyHeldPackages = 0;
  messageBar?: MessageBar;
  map?: GameMap;
  job?: Job;

  constructor() {
    window.setTimeout(() => this.job = Job.fromManifest([
      { spawnerId: 31, destinationId: 34 },
      { spawnerId: 31, destinationId: 35 },
      { spawnerId: 31, destinationId: 36 },
    ], () => game.hud.messageBar.setNewMessage(`Job complete!`)), 6000);
  }

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    game.hud.messageBar.setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
  }

  fallInWater() {
    if (this.currentlyHeldPackages > 0) {
      this.currentlyHeldPackages = 0;
      game.hud.messageBar.setNewMessage(`Splash! You lost all of your packages!`);
    } else game.hud.messageBar.setNewMessage(`Splash!`);
  }

  deliverPackage(pkg: GameObject) {
    if (pkg instanceof Package) {
      game.hud.messageBar.setNewMessage(`You delivered package number ${pkg.id}!`)
      pkg.deliver();
      this.currentlyHeldPackages--;
      this.checkForJobComplete();
    } else {
      console.error('Tried to deliver something that wasn\'t a package', pkg)
    }
  }

  checkForJobComplete() {
    if (!game.map.objects.find(o => o instanceof Package)) {
      game.hud.messageBar.setNewMessage('Job complete!')
      window.setTimeout(() => this.startNewJob(), 2000);
    }
  }

  startNewJob() {
    game.hud.messageBar.setNewMessage('New job should start now')
  }
}
