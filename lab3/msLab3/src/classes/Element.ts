import { DistributionEnum, RoutingEnum } from "../utils/enums.js";
import { Route } from "./Route.js";
import { Job } from "./Job.js";
import * as random from "../utils/randomizers.js";

export class Element {
  private static nextId = 0;
  private routes: Route[] = [];
  private id: number;
  private name: string;
  private routing: RoutingEnum = RoutingEnum.BY_PRIORITY;
  private distribution: DistributionEnum;
  private tNext: number;
  private tCurr: number;
  private delayMean: number;
  private delayDev: number;
  private quantity: number = 0;
  private state: number = 0;

  constructor(name: string, delayMean: number = 1.0, delayDev?: number) {
    this.name = name;
    this.tNext = delayDev === undefined ? Infinity : 0.0;
    this.tCurr = this.tNext;
    this.delayMean = delayMean;
    this.delayDev = delayDev || 0;
    this.distribution =
      delayDev === undefined ? DistributionEnum.NONE : DistributionEnum.NORMAL;
    this.id = Element.nextId++;
  }

  private static getUnblockedRoutes(routes: Route[], routedJob: Job): Route[] {
    return routes.filter((route) => !route.isBlocked(routedJob));
  }

  private static getScaledProbabilities(routes: Route[]): number[] {
    const probabilities = routes.map(
      (route, i) =>
        route.getProbability() + (i === 0 ? 0 : probabilities[i - 1])
    );
    const totalProbability = probabilities[probabilities.length - 1];
    return probabilities.map((prob) => prob / totalProbability);
  }

  public setRouting(routing: RoutingEnum): void {
    this.routing = routing;
  }

  public getDelay(): number {
    switch (this.distribution) {
      case DistributionEnum.EXPONENTIAL:
        return random.randomExponential(this.delayMean);
      case DistributionEnum.UNIFORM:
        return random.randomUniform(this.delayMean, this.delayDev);
      case DistributionEnum.NORMAL:
        return random.randomNormal(this.delayMean, this.delayDev);
      case DistributionEnum.ERLANG:
        return random.randomErlang(this.delayMean, this.delayDev);
      default:
        return this.delayMean;
    }
  }

  public getDelayMean(): number {
    return this.delayMean;
  }

  public setDelayMean(delayMean: number): void {
    this.delayMean = delayMean;
  }

  public getDelayDev(): number {
    return this.delayDev;
  }

  public setDelayDev(delayDev: number): void {
    this.delayDev = delayDev;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  public changeQuantity(delta: number): void {
    this.quantity += delta;
  }

  public getNextRoute(routedJob: Job): Route {
    if (this.routes.length === 0) {
      return new Route(null);
    }

    switch (this.routing) {
      case RoutingEnum.BY_PROBABILITY:
        return this.getNextRouteByProbability(routedJob);
      case RoutingEnum.BY_PRIORITY:
        return this.getNextRouteByPriority(routedJob);
      case RoutingEnum.COMBINED:
        return this.getNextRouteCombined(routedJob);
    }
  }

  private getNextRouteByProbability(routedJob: Job): Route {
    const unblockedRoutes = Element.getUnblockedRoutes(this.routes, routedJob);
    if (unblockedRoutes.length === 0) {
      return this.routes[0];
    }

    const probability = Math.random();
    const scaledProbabilities = Element.getScaledProbabilities(unblockedRoutes);

    for (let i = 0; i < scaledProbabilities.length; i++) {
      if (probability < scaledProbabilities[i]) {
        return unblockedRoutes[i];
      }
    }

    return unblockedRoutes[unblockedRoutes.length - 1];
  }

  private getNextRouteByPriority(routedJob: Job): Route {
    const unblockedRoutes = Element.getUnblockedRoutes(this.routes, routedJob);
    return unblockedRoutes.length === 0 ? this.routes[0] : unblockedRoutes[0];
  }

  private getNextRouteCombined(routedJob: Job): Route {
    let selectedRoute: Route | null = null;

    for (const route of this.routes) {
      if (!route.isBlocked(routedJob)) {
        selectedRoute = route;
        break;
      }
    }

    if (!selectedRoute) {
      return this.routes[0];
    }

    const samePriorityRoutes = this.findRoutesByPriority(
      selectedRoute.getPriority()
    );
    const probability = Math.random();
    const scaledProbabilities =
      Element.getScaledProbabilities(samePriorityRoutes);

    for (let i = 0; i < scaledProbabilities.length; i++) {
      if (probability < scaledProbabilities[i]) {
        return samePriorityRoutes[i];
      }
    }

    return selectedRoute;
  }

  private findRoutesByPriority(priority: number): Route[] {
    return this.routes.filter((route) => route.getPriority() === priority);
  }

  public addRoutes(...routes: Route[]): void {
    this.routes.push(...routes);
    this.routes.sort((a, b) => b.getPriority() - a.getPriority());
  }

  public inAct(job: Job): void {}

  public outAct(): void {
    this.quantity++;
  }

  public getTNext(): number {
    return this.tNext;
  }

  public setTNext(tNext: number): void {
    this.tNext = tNext;
  }

  public getTCurr(): number {
    return this.tCurr;
  }

  public setTCurr(tCurr: number): void {
    this.tCurr = tCurr;
  }

  public getState(): number {
    return this.state;
  }

  public setState(state: number): void {
    this.state = state;
  }

  public getName(): string {
    return this.name;
  }

  public printInfo(): void {
    console.log(
      `${
        this.name
      } state = ${this.getState()} quantity = ${this.getQuantity()} tnext = ${this.getTNext()}`
    );
  }

  public printResult(): void {
    console.log(`${this.name} quantity = ${this.getQuantity()}`);
  }

  public getId(): number {
    return this.id;
  }

  public doStatistics(delta: number): void {}

  public setDistribution(distribution: DistributionEnum): void {
    this.distribution = distribution;
  }
}
