import { Element } from "./Element.js";
import { Job } from "./Job.js";

export class Route {
  private readonly element: Element | null;
  private priority: number = 0;
  private probability: number = 1.0;
  private block: ((job: Job) => boolean) | null = null;

  constructor(
    element: Element | null,
    probability: number = 1.0,
    priority: number = 0,
    block?: (job: Job) => boolean
  ) {
    this.element = element;
    this.probability = probability;
    this.priority = priority;
    if (block) {
      this.block = block;
    }
  }

  public isBlocked(job: Job): boolean {
    if (this.block === null) {
      return false;
    }
    try {
      return this.block(job);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public getElement(): Element | null {
    return this.element;
  }

  public getPriority(): number {
    return this.priority;
  }

  public getProbability(): number {
    return this.probability;
  }

  public setBlock(block: (job: Job) => boolean): void {
    this.block = block;
  }
}
