from core.bank.SwitchingProcess import SwitchingProcess
from core.core.Dispose import Dispose
from core.core.Model import Model
from core.core.Process import Process


class BankModel(Model):
    def __init__(self, *elements):
        super().__init__(*elements)
        self.mean_clients_num = 0
        self.total_switched_jobs = 0

    def print_result(self):
        print("\n-------------RESULTS-------------")
        for element in self.elements:
            if isinstance(element, Process):
                print(f"-> {element.get_name()}")
                print(f"   Average workload: {element.work_time / self.t_curr}")
                print(f"   Average queue size: {element.mean_queue / self.t_curr}")
                print(f"   Mean leave interval: {element.get_mean_leave_interval()}")
            if isinstance(element, SwitchingProcess):
                print(f"   Switched jobs: {element.get_switched_jobs()}")
        print(f"Mean clients num: {self.mean_clients_num / self.t_curr}")
        print(f"Average client in bank time: {self.get_average_job_in_system_time()}")
        print(f"Mean leave interval: {self.get_global_mean_leave_interval()}")
        print(f"Failure percentage: {self.get_total_failure_probability() * 100}%")
        print(f"Total switched jobs: {self.total_switched_jobs}")

    def do_model_statistics(self, delta):
        super().do_model_statistics(delta)
        for element in self.elements:
            if isinstance(element, Process):
                self.mean_clients_num += element.get_queue_size() * delta + element.get_state() * delta

    def get_total_failure_probability(self):
        total_failures = 0
        total_quantity = 0
        for element in self.elements:
            if isinstance(element, Process):
                total_failures += element.failures
                total_quantity += element.get_quantity()
            if isinstance(element, SwitchingProcess):
                self.total_switched_jobs += element.get_switched_jobs()
        return total_failures / total_quantity if total_quantity != 0 else 0

    def get_average_job_in_system_time(self):
        jobs = []
        for element in self.elements:
            if isinstance(element, Process):
                jobs.extend(element.get_unprocessed_jobs())
            if isinstance(element, Dispose):
                jobs.extend(element.getProcessedJobs())
        total_job_in_system_time = 0
        for job in jobs:
            total_job_in_system_time += job.get_time_out() - job.get_time_in()
        return total_job_in_system_time / len(jobs) if jobs else 0

    def get_global_mean_leave_interval(self):
        total_leave_interval = 0
        total_quantity = 0
        for element in self.elements:
            if isinstance(element, Process):
                total_leave_interval += element.get_mean_leave_interval() * element.get_quantity()
                total_quantity += element.get_quantity()
        return total_leave_interval / total_quantity if total_quantity != 0 else 0