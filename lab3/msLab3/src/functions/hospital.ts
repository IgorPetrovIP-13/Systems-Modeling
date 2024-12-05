import { Despose } from "../classes/Despose.js";
import { Job } from "../classes/Job.js";
import { Process } from "../classes/Process.js";
import { Route } from "../classes/Route.js";
import { Hospital } from "../task3Hospital/Hospital.js";
import { Ill } from "../task3Hospital/Ill.js";
import { IllCreator } from "../task3Hospital/IllCreator.js";
import { RegistrationProcess } from "../task3Hospital/Registration.js";
import { TypeModifyingProcess } from "../task3Hospital/TypeModifying.js";
import { DistributionEnum, RoutingEnum } from "../utils/enums.js";

export function hospital(): void {
	const illTypes = [1, 2, 3];
	const illFrequencies = [0.5, 0.1, 0.4];
	const illDelays = [15, 40, 30];

	const create = new IllCreator("New Ill", 15);
	const registration = new RegistrationProcess("Registration", 15, 2);
	const wardsTransfer = new Process("Wards Transfer", 3, 8, 3);
	const laboratoryTransfer = new Process("Laboratory Transfer", 2, 5, 100);
	const laboratoryRegistration = new Process("Laboratory Registration", 4.5, 3, 1);
	const laboratoryAnalysis = new TypeModifyingProcess("Laboratory Analysis", 4, 2, 2);
	const registrationTransfer = new Process("Registration Transfer", 2, 5, 100);

	const wardsDispose = new Despose("Dispose [Type 1 & 2]");
	const laboratoryDispose = new Despose("Dispose [Type 3]");

	create.setillTypedFrequencies(illTypes, illFrequencies);
	registration.setillTypedDelays(illTypes, illDelays);
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

	wardsTransfer.addRoutes(new Route(wardsDispose));

	laboratoryTransfer.addRoutes(new Route(laboratoryRegistration));

	laboratoryRegistration.addRoutes(new Route(laboratoryAnalysis));

	laboratoryAnalysis.addRoutes(
			new Route(
					laboratoryDispose,
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
			wardsDispose,
			laboratoryDispose
	);

	model.simulate(1000);
}