import { Creator } from "../classes/Creator.js";
import { CheckoutProcess } from "../task2Bank/CheckoutProcess.js";
import { Despose } from "../classes/Despose.js";
import { Job } from "../classes/Job.js";
import { DistributionEnum, RoutingEnum } from "../utils/enums.js";
import { Route } from "../classes/Route.js";
import { BankModel } from "../task2Bank/Bank.js";
import {
  CASHIER_1_CHANNELS_NUM,
  CASHIER_1_DELAY_DEVIATION,
  CASHIER_1_DELAY_MEAN,
  CASHIER_1_DELTA_TO_SWITCH,
  CASHIER_1_NAME,
  CASHIER_2_CHANNELS_NUM,
  CASHIER_2_DELAY_DEVIATION,
  CASHIER_2_DELAY_MEAN,
  CASHIER_2_DELTA_TO_SWITCH,
  CASHIER_2_NAME,
  CREATOR_DELAY,
  CREATOR_INITIAL_T_NEXT,
  CREATOR_NAME,
  DESPOSE_NAME,
} from "../constants/bankConstants.js";

export function bank(): void {
  const create = new Creator(
    CREATOR_NAME,
    CREATOR_DELAY,
    CREATOR_INITIAL_T_NEXT
  );

  const cashier1 = new CheckoutProcess(
    CASHIER_1_NAME,
    CASHIER_1_DELAY_MEAN,
    CASHIER_1_DELAY_DEVIATION,
    CASHIER_1_CHANNELS_NUM,
    CASHIER_1_DELTA_TO_SWITCH
  );

  const cashier2 = new CheckoutProcess(
    CASHIER_2_NAME,
    CASHIER_2_DELAY_MEAN,
    CASHIER_2_DELAY_DEVIATION,
    CASHIER_2_CHANNELS_NUM,
    CASHIER_2_DELTA_TO_SWITCH
  );

  const despose = new Despose(DESPOSE_NAME);

  cashier1.initializeChannelsWithJobs(1);
  cashier1.initializeQueueWithJobs(2);
  cashier1.setNeighbors(cashier2);

  cashier2.initializeChannelsWithJobs(1);
  cashier2.initializeQueueWithJobs(2);
  cashier2.setNeighbors(cashier1);

  create.setDistribution(DistributionEnum.EXPONENTIAL);
  cashier1.setDistribution(DistributionEnum.EXPONENTIAL);
  cashier1.setDelayMean(0.3);

  cashier2.setDistribution(DistributionEnum.EXPONENTIAL);
  cashier2.setDelayMean(0.3);

  cashier1.setMaxQueueSize(3);
  cashier2.setMaxQueueSize(3);

  create.setRouting(RoutingEnum.BY_PRIORITY);
  create.addRoutes(
    new Route(
      cashier1,
      0.5,
      1,
      (_: Job) => cashier2.getQueueSize() < cashier1.getQueueSize()
    ),
    new Route(cashier2, 0.5, 0)
  );

  cashier1.addRoutes(new Route(despose));
  cashier2.addRoutes(new Route(despose));

  const model = new BankModel(create, cashier1, cashier2, despose);
  model.simulate(1000);
}
