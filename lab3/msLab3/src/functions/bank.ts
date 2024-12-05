import { Creator } from "../classes/Creator.js";
import { CheckoutProcess } from "../task2Bank/CheckoutProcess.js";
import { Despose } from "../classes/Despose.js";
import { Job } from "../classes/Job.js";
import { DistributionEnum, RoutingEnum } from "../utils/enums.js";
import { Route } from "../classes/Route.js";
import { BankModel } from "../task2Bank/Bank.js";

export function bank(): void {
    const create = new Creator("Create 1", 0.5, 0.1);
    const cashierWindow1 = new CheckoutProcess("Cashier 1", 1, 0.3, 1, 2);
    const cashierWindow2 = new CheckoutProcess("Cashier 2", 1, 0.3, 1, 2);
    const dispose = new Despose("Despose 1");

    cashierWindow1.initializeChannelsWithJobs(1);
    cashierWindow1.initializeQueueWithJobs(2);
    cashierWindow1.setNeighbors(cashierWindow2);

    cashierWindow2.initializeChannelsWithJobs(1);
    cashierWindow2.initializeQueueWithJobs(2);
    cashierWindow2.setNeighbors(cashierWindow1);

    create.setDistribution(DistributionEnum.EXPONENTIAL);
    cashierWindow1.setDistribution(DistributionEnum.EXPONENTIAL);
    cashierWindow1.setDelayMean(0.3);

    cashierWindow2.setDistribution(DistributionEnum.EXPONENTIAL);
    cashierWindow2.setDelayMean(0.3);

    cashierWindow1.setMaxQueueSize(3);
    cashierWindow2.setMaxQueueSize(3);

    create.setRouting(RoutingEnum.BY_PRIORITY);
    create.addRoutes(
        new Route(cashierWindow1, 0.5, 1, (job: Job) => cashierWindow2.getQueueSize() < cashierWindow1.getQueueSize()),
        new Route(cashierWindow2, 0.5, 0)
    );

    cashierWindow1.addRoutes(new Route(dispose));
    cashierWindow2.addRoutes(new Route(dispose));

    const model = new BankModel(create, cashierWindow1, cashierWindow2, dispose);
    model.simulate(1000);
}