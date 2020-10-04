import { MessageBar } from "./MessageBar.js";

export class GameInfo {
  currentlyHeldPackages = 0;
  messageBar: MessageBar | null = null;

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    if (this.messageBar) this.messageBar.setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
  }
}