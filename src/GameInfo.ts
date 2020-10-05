import { GameObject } from "./GameObject.js";
import { Job, JobManifest } from "./Job.js";
import { MessageBar } from "./MessageBar.js";
import { Package } from "./Package.js";
import { PackageSpawn } from "./PackageSpawn.js";
import { removeFromArray, distanceSquared } from './math.js';
import { Car } from './Car.js';
import { GhostCar } from './RespawnPoint.js';
import { DeliveryZone } from './DeliveryZone.js';
import { runTutorialEvents } from "./TutorialEvents.js";

export abstract class GameInfo {
  currentlyHeldPackages = 0;
  score = 0;
  messageBar?: MessageBar;

  abstract timeRemaining: number;

  incrementPackages(num = 1) {
    this.currentlyHeldPackages += num;
    // game.hud.messageBar.setNewMessage(`You have collected ${this.currentlyHeldPackages} so far!`);
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

  abstract tick(dt: number): void;
}

export class StaticGameInfo extends GameInfo {
  timeRemaining = Infinity;

  constructor(private readonly manifests: JobManifest[], delay: number) {
    super();
    runTutorialEvents(delay);
  }

  tick() {
    // do nothing because this uses setTimeout. It probably shouldn't, but w/e.
  }
}

export class DynamicGameInfo extends GameInfo {
  private readonly jobs: Job[] = [];

  timeUntilNextJob = 60_000;
  minTimeBetweenJobs = 10_000;
  maxTimeBetweenJobs = 120_000;

  minDeliveriesPerJob = 1;
  maxDeliveriesPerJob = 1;

  // When crating jobs, pick the n closest spawn points.
  numClosestSpawnersToChooseFrom = 3;

  timeRemaining = 60_000;

  tick(dt: number) {
    if(!this.jobs.length) this.createNewJob();

    this.timeUntilNextJob -= dt;

    if(this.timeUntilNextJob < 0) this.createNewJob();
  }

  private createNewJob() {
    this.timeUntilNextJob = randomBetween(this.minTimeBetweenJobs, this.maxTimeBetweenJobs);


    const sources = this.chooseSources();
    const destinations = this.chooseDestinations();

    const deliveries = Array.from(this.createDeliveries(sources, destinations));

    const score = deliveries
      .map(d => distanceSquared(d.destination, d.spawner))
      .reduce((l, r) => l + r);

    const manifest: JobManifest = {
      deliveries: deliveries.map(d => ({
        spawnerId: d.spawner.id!,
        destinationId: d.destination.id!,
      })),
      description: 'do a job',
      timeAdd: 30_000,
      score: Math.floor(score * 100)/100,
    };

    const job = Job.fromManifest(manifest, () => {
      removeFromArray(job, this.jobs);
      console.log(`it's done now`);
    });

    this.jobs.push(job);
  }

  private *createDeliveries(sources: PackageSpawn[], destinations: DeliveryZone[]) {
    const numDeliveries = randomBetween(this.minDeliveriesPerJob, this.maxDeliveriesPerJob);
    for(let i = 0; i < numDeliveries; i++) {
      const delivery = {
        spawner: sources[randomBetween(0, sources.length)],
        destination: destinations[randomBetween(0, destinations.length)],
      }
      yield delivery;
    }
  }

  private chooseSources() {
    let sources = game.map.expensivelyFindObjectsOfType(PackageSpawn);

    const car = game.map.expensivelyFindObjectsOfType(Car)[0] ?? game.map.expensivelyFindObjectsOfType(GhostCar)[0];
    if(car) {
      sources.sort((l, r) => distanceSquared(l, car) - distanceSquared(r, car));
      sources = sources.slice(0, 3);
    }

    return sources;
  }

  private chooseDestinations() {
    // TODO: pick them less arbitrarily?
    return game.map.expensivelyFindObjectsOfType(DeliveryZone);
  }
}

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}
