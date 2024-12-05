export class Job {
  private static nextId: number = 0;
  private readonly id: number;
  private readonly timeIn: number;
  private timeOut: number;

  constructor(timeIn: number) {
    this.timeIn = timeIn;
    this.timeOut = timeIn;
    this.id = Job.nextId++;
  }

  public getId(): number {
    return this.id;
  }

  public getTimeIn(): number {
    return this.timeIn;
  }

  public getTimeOut(): number {
    return this.timeOut;
  }

  public setTimeOut(timeOut: number): void {
    this.timeOut = timeOut;
  }
}
