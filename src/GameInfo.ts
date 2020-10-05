import { GameObject } from "./GameObject.js";
import { MessageBar } from "./MessageBar.js";
import { Package } from "./Package.js";

export class GameInfo {
  currentlyHeldPackages = 0;
  messageBar?: MessageBar;

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    this.getMessageBar().setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
  }

  deliverPackage(pkg: GameObject) {
    if (pkg instanceof Package) {
      this.getMessageBar().setNewMessage(`You delivered package number ${pkg.id.toString()}!`)
      pkg.map.remove(pkg);
    } else {
      console.error('Tried to deliver something that wasn\'t a package', pkg)
    }
  }

  getMessageBar() { return this.messageBar || new MessageBar() }
}