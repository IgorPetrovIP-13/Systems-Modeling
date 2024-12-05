import { Model } from "../classes/Model.js";
import { Element } from "../classes/Element.js";
import { Despose } from "../classes/Despose.js";
import { Job } from "../classes/Job.js";
import { Process } from "../classes/Process.js";
import { Ill } from "./Ill.js";

export class Hospital extends Model {
  constructor(...elements: Element[]) {
    super(...elements);
  }

  private getLaboratoryArrivalInterval(): number {
    for (const element of this.elements) {
      if (
        element.getName() === "Laboratory Transfer" &&
        element instanceof Process
      ) {
        return element.getMeanLeaveInterval();
      }
    }
    return 0.0;
  }

  override printResult(): void {
    console.log("\n-------------RESULTS-------------");
    this.printillInfo();
    console.log("\n-----------STATS------------");
    console.log(
      "Mean time in system (processed): " + this.getMeanTimeInSystem()
    );
    console.log(
      "Mean laboratory arrival interval: " + this.getLaboratoryArrivalInterval()
    );
  }

  private printillInfo(): void {
    console.log("\n-------------Clients------------");
    for (const element of this.elements) {
      if (element instanceof Despose) {
        const ills = element.getProcessedJobs();
        for (const ill of ills) {
          if (ill instanceof Ill) {
            console.log(
              `ill ${ill.getId()} type ${ill.getType()} ` +
                `time in ${ill.getTimeIn()} time out ${ill.getTimeOut()} ` +
                `time in system ${ill.getTimeOut() - ill.getTimeIn()}`
            );
          }
        }
      }
    }
  }

  private getMeanTimeInSystem(): number {
    const ills: Job[] = [];
    for (const element of this.elements) {
      if (element instanceof Despose) {
        ills.push(...element.getProcessedJobs());
      }
    }

    const totalTime = ills.reduce((sum, ill) => {
      return sum + (ill.getTimeOut() - ill.getTimeIn());
    }, 0);

    return ills.length > 0 ? totalTime / ills.length : 0.0;
  }
}
