import { Process } from "../classes/Process.js";

export class CheckoutProcess extends Process {
  private neighbors: Process[] = [];
  private deltaToSwitch: number;
  private switchedJobs: number = 0;

  constructor(
    name: string,
    delayMean: number,
    delayDev: number,
    channelsNum: number,
    deltaToSwitch: number
  ) {
    super(name, delayMean, delayDev, channelsNum);
    this.deltaToSwitch = deltaToSwitch;
  }

  setNeighbors(...neighbors: Process[]): void {
    this.neighbors.push(...neighbors);
  }

  override outAct(): void {
    this.checkout();
    super.outAct();
    for (const neighbor of this.neighbors) {
      if (neighbor instanceof CheckoutProcess) {
        (neighbor as CheckoutProcess).checkout();
      }
    }
  }

  override printResult(): void {
    super.printResult();
    console.log(`   Switched jobs: ${this.switchedJobs}`);
  }

  checkout(): void {
    for (const neighbor of this.neighbors) {
      while (
        this.getQueueSize() - neighbor.getQueueSize() >=
        this.deltaToSwitch
      ) {
        const switchedJob = this.queue.pop();
        if (switchedJob) {
          neighbor.inAct(switchedJob);
          this.switchedJobs++;
        }
      }
    }
  }

  getSwitchedJobs(): number {
    return this.switchedJobs;
  }
}
