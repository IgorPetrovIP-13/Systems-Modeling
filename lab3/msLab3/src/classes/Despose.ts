import { Element } from "./Element.js";
import { Job } from "./Job.js";

export class Despose extends Element {
  private processedJobs: Job[] = [];

  constructor(name: string) {
    super(name);
  }

  public override inAct(job: Job): void {
    super.inAct(job);
    this.processedJobs.push(job);
    super.outAct();
  }

  public override printInfo(): void {
    console.log(`${this.getName()} quantity = ${this.getQuantity()}`);
  }

  public getProcessedJobs(): Job[] {
    return this.processedJobs;
  }
}