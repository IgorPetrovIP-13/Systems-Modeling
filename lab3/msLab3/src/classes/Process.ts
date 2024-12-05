import { Element } from "./Element.js";
import { Job } from "./Job.js";

export class Process extends Element {
  protected queue: Job[] = [];
  protected channels: Process.Channel[] = [];
  protected failures: number = 0;
  protected maxQueueSize: number = Number.MAX_SAFE_INTEGER;
  protected meanQueue: number = 0.0;
  protected workTime: number = 0.0;
  protected totalLeaveTime: number = 0.0;
  protected previousLeaveTime: number = 0.0;

  constructor(
    name: string,
    delayMean: number,
    channelsNum: number,
    delayDev?: number
  ) {
    super(name, delayMean, delayDev);
    for (let i = 0; i < channelsNum; i++) {
      this.channels.push(new Process.Channel());
    }
  }

  public initializeChannelsWithJobs(jobsNum: number): void {
    const limitedJobsNum = Math.min(jobsNum, this.channels.length);
    for (let i = 0; i < limitedJobsNum; i++) {
      this.channels[i].setCurrentJob(new Job(0.0));
      this.channels[i].setTNext(this.getTCurr() + this.getDelay());
    }
  }

  public initializeQueueWithJobs(jobsNum: number): void {
    const limitedJobsNum = Math.min(jobsNum, this.maxQueueSize);
    for (let i = 0; i < limitedJobsNum; i++) {
      this.queue.push(new Job(0.0));
    }
  }

  public override inAct(job: Job): void {
    const freeChannel = this.getFreeChannel();
    if (freeChannel) {
      freeChannel.setCurrentJob(job);
      freeChannel.setTNext(this.getTCurr() + this.getDelay());
    } else {
      if (this.queue.length < this.getMaxQueueSize()) {
        this.queue.push(job);
      } else {
        this.failures++;
      }
    }
  }

  public override outAct(): void {
    this.processCurrentJobs();
    this.startNextJobs();
  }

  protected processCurrentJobs(): void {
    const channelsWithMinTNext = this.getChannelsWithMinTNext();
    for (const channel of channelsWithMinTNext) {
      const job = channel.getCurrentJob();

      if (!job) continue;

      const nextRoute = this.getNextRoute(job);
      if (nextRoute.isBlocked(job)) continue;

      if (nextRoute.getElement()) {
        job.setTimeOut(this.getTCurr());
        nextRoute.getElement()?.inAct(job);
      }

      channel.setCurrentJob(null);
      channel.setTNext(Number.MAX_VALUE);
      this.changeQuantity(1);
      this.totalLeaveTime += this.getTCurr() - this.previousLeaveTime;
      this.previousLeaveTime = this.getTCurr();
    }
  }

  protected startNextJobs(): void {
    let freeChannel = this.getFreeChannel();
    while (this.queue.length > 0 && freeChannel) {
      const job = this.queue.shift();
      if (job) {
        freeChannel.setCurrentJob(job);
        freeChannel.setTNext(this.getTCurr() + this.getDelay());
      }
      freeChannel = this.getFreeChannel();
    }
  }

  protected getChannelsWithMinTNext(): Process.Channel[] {
    const channelsWithMinTNext: Process.Channel[] = [];
    let minTNext = Number.MAX_VALUE;

    for (const channel of this.channels) {
      if (channel.getTNext() < minTNext) {
        minTNext = channel.getTNext();
      }
    }

    for (const channel of this.channels) {
      if (channel.getTNext() === minTNext) {
        channelsWithMinTNext.push(channel);
      }
    }

    return channelsWithMinTNext;
  }

  protected getFreeChannel(): Process.Channel | null {
    for (const channel of this.channels) {
      if (channel.getState() === 0) {
        return channel;
      }
    }
    return null;
  }

  public getMaxQueueSize(): number {
    return this.maxQueueSize;
  }

  public setMaxQueueSize(maxQueueSize: number): void {
    this.maxQueueSize = maxQueueSize;
  }

  public getFailures(): number {
    return this.failures;
  }

  public getMeanQueue(): number {
    return this.meanQueue;
  }

  public getWorkTime(): number {
    return this.workTime;
  }

  public override doStatistics(delta: number): void {
    super.doStatistics(delta);
    this.meanQueue += this.queue.length * delta;
    this.workTime += this.getState() * delta;
  }

  public override getState(): number {
    return this.channels.reduce(
      (state, channel) => state | channel.getState(),
      0
    );
  }

  public override getTNext(): number {
    return Math.min(...this.channels.map((channel) => channel.getTNext()));
  }

  public override setTNext(tNext: number): void {
    const previousTNext = this.getTNext();
    for (const channel of this.channels) {
      if (channel.getTNext() === previousTNext) {
        channel.setTNext(tNext);
      }
    }
  }

  public override printInfo(): void {
    console.log(
      `${this.getName()} state = ${this.getState()} quantity = ${this.getQuantity()} tnext = ${this.getTNext()} failures = ${
        this.failures
      } queue size = ${this.queue.length}`
    );
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getMeanLeaveInterval(): number {
    return this.totalLeaveTime / this.getQuantity();
  }

  public getUnprocessedJobs(): Job[] {
    const jobs: Job[] = [];
    for (const channel of this.channels) {
      if (channel.getCurrentJob()) {
        jobs.push(channel.getCurrentJob());
      }
    }
    if (this.queue.length > 0) {
      jobs.push(...this.queue);
    }
    for (const job of jobs) {
      job.setTimeOut(this.getTCurr());
    }
    return jobs;
  }
}

export namespace Process {
  export class Channel {
    private currentJob: Job | null = null;
    private tNext: number = Number.MAX_VALUE;

    public getState(): number {
      return this.currentJob === null ? 0 : 1;
    }

    public getCurrentJob(): Job | null {
      return this.currentJob;
    }

    public setCurrentJob(job: Job | null): void {
      this.currentJob = job;
    }

    public getTNext(): number {
      return this.tNext;
    }

    public setTNext(tNext: number): void {
      this.tNext = tNext;
    }
  }
}
