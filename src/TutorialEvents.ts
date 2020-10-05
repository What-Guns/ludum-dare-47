import { Job, JobManifest } from './Job.js';
import { loadJson } from './loader.js';

let te: {[key in string]: Array<EventItem | JobEventItem>};

export async function runTutorialEvents(delay: number) {
  const tutorialEvents = await loadJson('./src/tutorial-events.json');
  te = (tutorialEvents as {[key in string]: Array<EventItem | JobEventItem>});
  window.setTimeout(() => runEvent(te.init), delay)
}

function runEvent(e: Array<EventItem | JobEventItem>) {
  if (!e) {
    return (window as any).loadMain();
  }
  e.reverse().reduce((prev, cv) => {
    return () => window.setTimeout(() => {runEventItem(cv, prev)}, cv.delay / 100)
  }, () => {})()
}

function runEventItem(e: EventItem, prev: Function) {
  (window as any).game.hud.messageBar.setNewMessage(e.messageText);
  if (e.type === 'createJob') {
    Job.fromManifest((e as JobEventItem).jobManifest, () => runEvent(te[(e as JobEventItem).onComplete]));
  }
  prev();
}

interface EventItem {
  type: 'sendMessage' | 'createJob',
  delay: number,
  messageText: string,
}

interface JobEventItem extends EventItem {
  type: 'createJob',
  jobManifest: JobManifest,
  onComplete: string,
}