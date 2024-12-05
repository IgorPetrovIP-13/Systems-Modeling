import { Despose } from "../classes/Despose.js";
import { Element } from "../classes/Element.js";
import { Job } from "../classes/Job.js";
import { Process } from "../classes/Process.js";
import { Model } from "../classes/Model.js";
import { CheckoutProcess } from "./CheckoutProcess.js";

export class BankModel extends Model {
  private meanClientsNum: number = 0;
  private totalSwitchedJobs: number = 0;

  constructor(...elements: Element[]) {
    super(...elements);
  }

  override printResult(): void {
    console.log("\n-------------RESULTS-------------");
    for (const element of this.elements) {
      if (element instanceof Process) {
        console.log(`${element.getName()}`);
        console.log(
          `   Average workload: ${element.getWorkTime() / this.tCurr}`
        );
        console.log(
          `   Average queue size: ${element.getMeanQueue() / this.tCurr}`
        );
        console.log(
          `   Mean leave interval: ${element.getMeanLeaveInterval()}`
        );
      }
      if (element instanceof CheckoutProcess) {
        console.log(`   Switched jobs: ${element.getSwitchedJobs()}\n`);
      }
    }
    console.log(`Mean clients num: ${this.meanClientsNum / this.tCurr}`);
    console.log(
      `Average client in bank time: ${this.getAverageJobInSystemTime()}`
    );
    console.log(`Mean leave interval: ${this.getGlobalMeanLeaveInterval()}`);
    console.log(
      `Failure percentage: ${this.getTotalFailureProbability() * 100}%`
    );
    console.log(`Total switched jobs: ${this.totalSwitchedJobs}`);
  }

  protected override doModelStatistics(delta: number): void {
    super.doModelStatistics(delta);
    for (const element of this.elements) {
      if (element instanceof Process) {
        this.meanClientsNum +=
          element.getQueueSize() * delta + element.getState() * delta;
      }
    }
  }

  private getTotalFailureProbability(): number {
    let totalFailures = 0;
    let totalQuantity = 0;
    for (const element of this.elements) {
      if (element instanceof Process) {
        totalFailures += element.getFailures();
        totalQuantity += element.getQuantity();
      }
      if (element instanceof CheckoutProcess) {
        this.totalSwitchedJobs += element.getSwitchedJobs();
      }
    }
    return totalFailures / totalQuantity;
  }

  private getAverageJobInSystemTime(): number {
    const jobs: Job[] = [];
    for (const element of this.elements) {
      if (element instanceof Process) {
        jobs.push(...element.getUnprocessedJobs());
      }
      if (element instanceof Despose) {
        jobs.push(...element.getProcessedJobs());
      }
    }
    const totalJobInSystemTime = jobs.reduce(
      (sum, job) => sum + (job.getTimeOut() - job.getTimeIn()),
      0
    );
    return jobs.length > 0 ? totalJobInSystemTime / jobs.length : 0;
  }

  private getGlobalMeanLeaveInterval(): number {
    let totalLeaveInterval = 0;
    let totalQuantity = 0;
    for (const element of this.elements) {
      if (element instanceof Process) {
        totalLeaveInterval +=
          element.getMeanLeaveInterval() * element.getQuantity();
        totalQuantity += element.getQuantity();
      }
    }
    return totalQuantity > 0 ? totalLeaveInterval / totalQuantity : 0;
  }
}
