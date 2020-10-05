import { GameMap } from "./GameMap.js";
import { GameObject } from "./GameObject.js";
import { MessageBar } from "./MessageBar.js";
import { Package } from "./Package.js";

export class GameInfo {
  currentlyHeldPackages = 0;
  messageBar?: MessageBar;
  map?: GameMap;

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    this.getMessageBar().setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
  }

  deliverPackage(pkg: GameObject) {
    if (pkg instanceof Package) {
      this.getMessageBar().setNewMessage(`You delivered package number ${pkg.id.toString()}!`)
      pkg.map.remove(pkg);
      this.checkForJobComplete();
    } else {
      console.error('Tried to deliver something that wasn\'t a package', pkg)
    }
  }

  checkForJobComplete() {
    if (!this.getMap().objects.find(o => o instanceof Package)) {
      this.getMessageBar().setNewMessage('Job complete!')
      window.setTimeout(() => this.startNewJob(), 2000);
    }
  }

  startNewJob() {
    this.getMessageBar().setNewMessage('New job should start now')
  }

  getMessageBar() { return this.messageBar || new MessageBar() }
  getMap() { return this.map || new GameMap({width: 1, height: 1, tilewidth: 1, tileheight: 1}, []) }


}