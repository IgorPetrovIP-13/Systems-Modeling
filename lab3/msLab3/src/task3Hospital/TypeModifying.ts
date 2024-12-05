import { Process } from "../classes/Process.js";
import { Ill } from "./Ill.js";

export class TypeModifyingProcess extends Process {
  private typeModifyingMap: Map<number, number> = new Map();

  constructor(
    name: string,
    delayMean: number,
    delayDev: number,
    channelsNum: number
  ) {
    super(name, delayMean, delayDev, channelsNum);
  }

  setTypeModifyingMap(types: number[], modifiedTypes: number[]): void {
    this.typeModifyingMap = new Map();
    for (let i = 0; i < types.length; i++) {
      this.typeModifyingMap.set(types[i], modifiedTypes[i]);
    }
  }

  protected override processCurrentJobs(): void {
    const channelsWithMinTNext = this.getChannelsWithMinTNext();

    for (const channel of channelsWithMinTNext) {
      const job = channel.getCurrentJob();
      if (!(job instanceof Ill)) {
        continue;
      }

      const ill = job as Ill;

      const newType = this.typeModifyingMap.get(ill.getType());
      if (newType !== undefined) {
        ill.setType(newType);
      }

      const nextRoute = this.getNextRoute(job);
      if (nextRoute.isBlocked(job)) {
        continue;
      }

      if (nextRoute.getElement() !== null) {
        job.setTimeOut(this.getTCurr());
        nextRoute.getElement()?.inAct(job);
      }

      channel.setCurrentJob(null);
      channel.setTNext(Number.POSITIVE_INFINITY);

      this.changeQuantity(1);
      this.totalLeaveTime += this.getTCurr() - this.previousLeaveTime;
      this.previousLeaveTime = this.getTCurr();
    }
  }
}
