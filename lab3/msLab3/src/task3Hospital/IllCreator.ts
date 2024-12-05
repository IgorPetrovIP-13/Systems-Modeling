import { Creator } from "../classes/Creator.js";
import { Job } from "../classes/Job.js";
import { Ill } from "./Ill.js";

export class IllCreator extends Creator {
  private illTypedFrequencies: Map<number, number> = new Map();

  constructor(name: string, delay: number) {
    super(name, delay);
  }

  setillTypedFrequencies(types: number[], frequencies: number[]): void {
    this.illTypedFrequencies = new Map();
    for (let i = 0; i < types.length; i++) {
      this.illTypedFrequencies.set(types[i], frequencies[i]);
    }
  }

  protected override createJob(): Job {
    const type = this.chooseillType();
    return new Ill(this.getTCurr(), type);
  }

  private chooseillType(): number {
    const random = Math.random();
    let sum = 0.0;

    for (const [type, frequency] of this.illTypedFrequencies.entries()) {
      sum += frequency;
      if (random < sum) {
        return type;
      }
    }

    return 0;
  }
}
