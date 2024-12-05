import { Element } from "./Element.js";
import { Job } from "./Job.js";

export class Creator extends Element {
  private failures: number = 0;

  constructor(name: string, delay: number, initialTNext?: number) {
    super(name, delay);
    super.setTNext(initialTNext !== undefined ? initialTNext : 0.0);
  }

  public override outAct(): void {
    super.outAct();
    super.setTNext(super.getTCurr() + super.getDelay());
    const createdJob = this.createJob();
    const nextRoute = super.getNextRoute(createdJob);

    if (!nextRoute.getElement() || nextRoute.isBlocked(createdJob)) {
      this.failures++;
    } else {
      nextRoute.getElement()?.inAct(createdJob);
    }
  }

  protected createJob(): Job {
    return new Job(super.getTCurr());
  }
}
