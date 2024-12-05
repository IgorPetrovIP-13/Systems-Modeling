from core.core.Process import Process

class SwitchingProcess(Process):
    def __init__(self, name, delay_mean, channels_num, delta_to_switch, delay_dev=None):
        if delay_dev is None:
            super().__init__(name, delay_mean, channels_num)
        else:
            super().__init__(name, delay_mean, delay_dev, channels_num)
        self.neighbors = []
        self.delta_to_switch = delta_to_switch
        self.switched_jobs = 0

    def set_neighbors(self, *neighbors):
        self.neighbors.extend(neighbors)

    def out_act(self):
        self.try_switch_process()
        super().out_act()
        for neighbor in self.neighbors:
            if isinstance(neighbor, SwitchingProcess):
                neighbor.try_switch_process()

    def print_result(self):
        super().print_result()
        print(f"   Switched jobs: {self.switched_jobs}")

    def try_switch_process(self):
        for neighbor in self.neighbors:
            while self.get_queue_size() - neighbor.get_queue_size() >= self.delta_to_switch:
                switched_job = self.queue.pop()
                neighbor.in_act(switched_job)
                self.switched_jobs += 1

    def get_switched_jobs(self):
        return self.switched_jobs