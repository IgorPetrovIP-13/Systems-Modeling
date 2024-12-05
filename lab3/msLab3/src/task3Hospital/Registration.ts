import { Job } from "../classes/Job.js";
import { Process } from "../classes/Process.js";
import { Ill } from "./Ill.js";

export class RegistrationProcess extends Process {
    private prioritizedillType!: number;
    private illTypedDelays: Map<number, number> = new Map();

    constructor(name: string, delayMean: number, channelsNum: number) {
        super(name, delayMean, channelsNum);
    }

    setPrioritizedillType(type: number): void {
        this.prioritizedillType = type;
    }

    setillTypedDelays(types: number[], delays: number[]): void {
        this.illTypedDelays = new Map();
        for (let i = 0; i < types.length; i++) {
            this.illTypedDelays.set(types[i], delays[i]);
        }
    }

    override inAct(job: Job): void {
        const freeChannel = this.getFreeChannel();
        if (freeChannel) {
            freeChannel.setCurrentJob(job);
            const originalDelayMean = this.getDelayMean();
            const illType = (job as Ill).getType();
            this.setDelayMean(this.illTypedDelays.get(illType) || originalDelayMean);
            freeChannel.setTNext(this.getTCurr() + this.getDelay());
            this.setDelayMean(originalDelayMean);
        } else {
            if (this.queue.length < this.getMaxQueueSize()) {
                this.queue.push(job);
            } else {
                this.failures++;
            }
        }
    }

    protected override startNextJobs(): void {
        const originalDelay = this.getDelayMean();
        let freeChannel = this.getFreeChannel();
        this.sortQueueByillPriority();

        while (this.queue.length > 0 && freeChannel) {
            const ill = this.queue.shift() as Ill;
            const type = ill.getType();
            this.setDelayMean(this.illTypedDelays.get(type) || originalDelay);
            freeChannel.setCurrentJob(ill);
            freeChannel.setTNext(this.getTCurr() + this.getDelay());
            freeChannel = this.getFreeChannel();
        }

        this.setDelayMean(originalDelay);
    }

    private sortQueueByillPriority(): void {
        const prioritizedills: Ill[] = [];
        const otherills: Ill[] = [];

        while (this.queue.length > 0) {
            const ill = this.queue.shift() as Ill;
            if (ill.getType() === this.prioritizedillType) {
                prioritizedills.push(ill);
            } else {
                otherills.push(ill);
            }
        }

        this.queue.push(...prioritizedills, ...otherills);
    }
}
