import { Element } from "./Element.js";
import { Process } from "./Process.js";

export class Model {
  protected elements: Element[];
  protected tCurr: number = 0.0;
  protected tNext: number = 0.0;
  protected nearestEvent: number = 0;
  protected isFirstIteration: boolean = true;

  constructor(...elements: Element[]) {
    this.elements = elements;
  }

  public simulate(time: number): void {
    while (this.tCurr < time) {
      this.tNext = Number.MAX_VALUE;

      for (const element of this.elements) {
        if (
          (this.tCurr < element.getTNext() || this.isFirstIteration) &&
          element.getTNext() < this.tNext
        ) {
          this.tNext = element.getTNext();
          this.nearestEvent = element.getId();
        }
      }

      this.updateBlockedElements();
      console.log(
        `\nEvent in ${this.elements[this.nearestEvent].getName()}, tNext = ${
          this.tNext
        }`
      );

      const delta = this.tNext - this.tCurr;
      this.doModelStatistics(delta);

      for (const element of this.elements) {
        element.doStatistics(delta);
      }

      this.tCurr = this.tNext;

      for (const element of this.elements) {
        element.setTCurr(this.tCurr);
      }

      this.elements[this.nearestEvent].outAct();

      for (const element of this.elements) {
        if (element.getTNext() === this.tCurr) {
          element.outAct();
        }
      }

      this.isFirstIteration = false;
      this.printInfo();
    }

    this.printResult();
  }

  public printInfo(): void {
    for (const element of this.elements) {
      element.printInfo();
    }
  }

  public printResult(): void {
    console.log("\n-------------RESULTS-------------");
    for (const element of this.elements) {
      process.stdout.write("-> ");
      element.printResult();

      if (element instanceof Process) {
        console.log(`   Mean Queue = ${element.getMeanQueue() / this.tCurr}`);
        console.log(`   Mean Workload = ${element.getWorkTime() / this.tCurr}`);
        console.log(
          `   Failure Probability = ${
            element.getFailures() /
            (element.getQuantity() + element.getFailures())
          }`
        );
      }
    }
  }

  protected doModelStatistics(delta: number): void {
    // Override
  }

  private updateBlockedElements(): void {
    for (const element of this.elements) {
      if (element.getTNext() <= this.tCurr) {
        element.setTNext(this.tNext);
      }
    }
  }
}
