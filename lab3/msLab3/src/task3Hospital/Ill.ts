import { Job } from "../classes/Job.js";

export class Ill extends Job {
  private type: number;

  constructor(timeIn: number, type: number) {
    super(timeIn);
    this.type = type;
  }

  getType(): number {
    return this.type;
  }

  setType(type: number): void {
    this.type = type;
  }
}
