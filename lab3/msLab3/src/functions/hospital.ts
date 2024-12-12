import { Despose } from "../classes/Despose.js";
import { Job } from "../classes/Job.js";
import { Process } from "../classes/Process.js";
import { Route } from "../classes/Route.js";
import {
  CREATOR_DELAY,
  CREATOR_NAME,
  ILL_DELAYS,
  ILL_FREQUENCIES,
  ILL_TYPES,
  LABORATORY_ANALYSIS_PROCESS_CHANNELS_NUM,
  LABORATORY_ANALYSIS_PROCESS_DELAY_DEVIATION,
  LABORATORY_ANALYSIS_PROCESS_DELAY_MEAN,
  LABORATORY_ANALYSIS_PROCESS_NAME,
  LABORATORY_DESPOSE_NAME,
  LABORATORY_REGISTRATION_PROCESS_CHANNELS_NUM,
  LABORATORY_REGISTRATION_PROCESS_DELAY_DEVIATION,
  LABORATORY_REGISTRATION_PROCESS_DELAY_MEAN,
  LABORATORY_REGISTRATION_PROCESS_NAME,
  LABORATORY_TRANSFER_CHANNELS_NUM,
  LABORATORY_TRANSFER_DELAY_DEVIATION,
  LABORATORY_TRANSFER_DELAY_MEAN,
  LABORATORY_TRANSFER_PROCESS_NAME,
  REGISTRATION_CHANNELS_NUM,
  REGISTRATION_PROCESS_DELAY_MEAN,
  REGISTRATION_PROCESS_NAME,
  REGISTRATION_TRANSFER_CHANNELS_NUM,
  REGISTRATION_TRANSFER_DELAY_DEVIATION,
  REGISTRATION_TRANSFER_PROCESS_DELAY_MEAN,
  REGISTRATION_TRANSFER_PROCESS_NAME,
  WARDS_DESPOSE_NAME,
  WARDS_TRANSFER_DELAY_DEVIATION,
  WARDS_TRANSFER_PROCESS_CHANNELS_NUM,
  WARDS_TRANSFER_PROCESS_DELAY_MEAN,
  WARDS_TRANSFER_PROCESS_NAME,
} from "../constants/hospitalConstants.js";
import { Hospital } from "../task3Hospital/Hospital.js";
import { Ill } from "../task3Hospital/Ill.js";
import { IllCreator } from "../task3Hospital/IllCreator.js";
import { RegistrationProcess } from "../task3Hospital/Registration.js";
import { TypeModifyingProcess } from "../task3Hospital/TypeModifying.js";
import { DistributionEnum, RoutingEnum } from "../utils/enums.js";

export function hospital(): void {
  const create = new IllCreator(CREATOR_NAME, CREATOR_DELAY);

  const registration = new RegistrationProcess(
    REGISTRATION_PROCESS_NAME,
    REGISTRATION_PROCESS_DELAY_MEAN,
    REGISTRATION_CHANNELS_NUM
  );
	
  const wardsTransfer = new Process(
    WARDS_TRANSFER_PROCESS_NAME,
    WARDS_TRANSFER_PROCESS_DELAY_MEAN,
    WARDS_TRANSFER_PROCESS_CHANNELS_NUM,
    WARDS_TRANSFER_DELAY_DEVIATION
  );

  const laboratoryTransfer = new Process(
    LABORATORY_TRANSFER_PROCESS_NAME,
    LABORATORY_TRANSFER_DELAY_MEAN,
    LABORATORY_TRANSFER_CHANNELS_NUM,
    LABORATORY_TRANSFER_DELAY_DEVIATION
  );

  const laboratoryRegistration = new Process(
    LABORATORY_REGISTRATION_PROCESS_NAME,
    LABORATORY_REGISTRATION_PROCESS_DELAY_MEAN,
    LABORATORY_REGISTRATION_PROCESS_CHANNELS_NUM,
    LABORATORY_REGISTRATION_PROCESS_DELAY_DEVIATION
  );

  const laboratoryAnalysis = new TypeModifyingProcess(
    LABORATORY_ANALYSIS_PROCESS_NAME,
    LABORATORY_ANALYSIS_PROCESS_DELAY_MEAN,
    LABORATORY_ANALYSIS_PROCESS_CHANNELS_NUM,
    LABORATORY_ANALYSIS_PROCESS_DELAY_DEVIATION
  );

  const registrationTransfer = new Process(
    REGISTRATION_TRANSFER_PROCESS_NAME,
    REGISTRATION_TRANSFER_PROCESS_DELAY_MEAN,
    REGISTRATION_TRANSFER_CHANNELS_NUM,
    REGISTRATION_TRANSFER_DELAY_DEVIATION
  );

  const wardsDespose = new Despose(WARDS_DESPOSE_NAME);
  const laboratoryDespose = new Despose(LABORATORY_DESPOSE_NAME);

  create.setillTypedFrequencies(ILL_TYPES, ILL_FREQUENCIES);
  registration.setillTypedDelays(ILL_TYPES, ILL_DELAYS);
  registration.setPrioritizedillType(1);
  laboratoryAnalysis.setTypeModifyingMap([2], [1]);

  create.setDistribution(DistributionEnum.EXPONENTIAL);
  registration.setDistribution(DistributionEnum.EXPONENTIAL);
  wardsTransfer.setDistribution(DistributionEnum.UNIFORM);
  laboratoryTransfer.setDistribution(DistributionEnum.UNIFORM);
  laboratoryRegistration.setDistribution(DistributionEnum.ERLANG);
  laboratoryAnalysis.setDistribution(DistributionEnum.ERLANG);
  registrationTransfer.setDistribution(DistributionEnum.UNIFORM);

  create.addRoutes(new Route(registration));

  registration.addRoutes(
    new Route(
      wardsTransfer,
      0.5,
      1,
      (job: Job) => (job as Ill).getType() !== 1
    ),
    new Route(laboratoryTransfer, 0.5, 0)
  );
  registration.setRouting(RoutingEnum.BY_PRIORITY);

  wardsTransfer.addRoutes(new Route(wardsDespose));

  laboratoryTransfer.addRoutes(new Route(laboratoryRegistration));

  laboratoryRegistration.addRoutes(new Route(laboratoryAnalysis));

  laboratoryAnalysis.addRoutes(
    new Route(
      laboratoryDespose,
      0.5,
      1,
      (job: Job) => (job as Ill).getType() !== 3
    ),
    new Route(registrationTransfer, 0.5, 0)
  );
  laboratoryAnalysis.setRouting(RoutingEnum.BY_PRIORITY);

  registrationTransfer.addRoutes(new Route(registration));

  const model = new Hospital(
    create,
    registration,
    wardsTransfer,
    laboratoryTransfer,
    laboratoryRegistration,
    laboratoryAnalysis,
    registrationTransfer,
    wardsDespose,
    laboratoryDespose
  );

  model.simulate(1000);
}
