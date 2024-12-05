from collections import deque
from core.core.Element import Element
from core.core.Job import Job

class Process(Element):
    def __init__(self, name, delay_mean, channels_num, delay_dev=None):
        super().__init__(name, delay_mean, delay_dev)
        self.queue = deque()
        self.channels = [self.Channel() for _ in range(channels_num)]
        self.failures = 0
        self.max_queue_size = float('inf')
        self.mean_queue = 0.0
        self.work_time = 0.0
        self.total_leave_time = 0.0
        self.previous_leave_time = 0.0

    def initialize_channels_with_jobs(self, jobs_num):
        jobs_num = min(jobs_num, len(self.channels))
        for i in range(jobs_num):
            self.channels[i].set_current_job(Job(0.0))
            self.channels[i].set_t_next(self.get_tcurr() + self.get_delay())

    def initialize_queue_with_jobs(self, jobs_num):
        jobs_num = min(jobs_num, self.max_queue_size)
        for i in range(jobs_num):
            self.queue.append(Job(0.0))

    def in_act(self, job):
        free_channel = self.get_free_channel()
        if free_channel is not None:
            free_channel.set_current_job(job)
            free_channel.set_t_next(self.get_tcurr() + self.get_delay())
        else:
            if len(self.queue) < self.max_queue_size:
                self.queue.append(job)
            else:
                self.failures += 1

    def out_act(self):
        self.process_current_jobs()
        self.start_next_jobs()

    def process_current_jobs(self):
        channels_with_min_tnext = self.get_channels_with_min_tnext()
        for channel in channels_with_min_tnext:
            job = channel.get_current_job()
            next_route = self.get_next_route(job)
            if next_route.is_blocked(job):
                continue
            if next_route.get_element() is not None:
                job.set_time_out(self.get_tcurr())
                next_route.get_element().in_act(job)
            channel.set_current_job(None)
            channel.set_t_next(float('inf'))
            self.change_quantity(1)
            self.total_leave_time += self.get_tcurr() - self.previous_leave_time
            self.previous_leave_time = self.get_tcurr()

    def start_next_jobs(self):
        free_channel = self.get_free_channel()
        while self.queue and free_channel is not None:
            job = self.queue.popleft()
            free_channel.set_current_job(job)
            free_channel.set_t_next(self.get_tcurr() + self.get_delay())
            free_channel = self.get_free_channel()

    def get_channels_with_min_tnext(self):
        min_tnext = float('inf')
        channels_with_min_tnext = []
        for channel in self.channels:
            if channel.get_t_next() < min_tnext:
                min_tnext = channel.get_t_next()
        for channel in self.channels:
            if channel.get_t_next() == min_tnext:
                channels_with_min_tnext.append(channel)
        return channels_with_min_tnext

    def get_free_channel(self):
        for channel in self.channels:
            if channel.get_state() == 0:
                return channel
        return None

    def do_statistics(self, delta):
        super().do_statistics(delta)
        self.mean_queue += len(self.queue) * delta
        self.work_time += self.get_state() * delta

    def get_state(self):
        state = 0
        for channel in self.channels:
            state |= channel.get_state()
        return state

    def get_t_next(self):
        t_next = float('inf')
        for channel in self.channels:
            if channel.get_t_next() < t_next:
                t_next = channel.get_t_next()
        return t_next

    def set_t_next(self, t_next):
        previous_tnext = self.get_t_next()
        for channel in self.channels:
            if channel.get_t_next() == previous_tnext:
                channel.set_t_next(t_next)

    def print_info(self):
        print(f"{self.get_name()} state = {self.get_state()} quantity = {self.get_quantity()} tnext = {self.get_t_next()} failures = {self.failures} queue size = {len(self.queue)}")

    def get_queue_size(self):
        return len(self.queue)

    def get_mean_leave_interval(self):
        return self.total_leave_time / self.get_quantity()

    def get_unprocessed_jobs(self):
        jobs = [channel.get_current_job() for channel in self.channels if channel.get_current_job() is not None]
        jobs.extend(self.queue)
        for job in jobs:
            job.set_time_out(self.get_tcurr())
        return jobs

    class Channel:
        def __init__(self):
            self.current_job = None
            self.t_next = float('inf')

        def get_state(self):
            return 1 if self.current_job is not None else 0

        def get_current_job(self):
            return self.current_job

        def set_current_job(self, job):
            self.current_job = job

        def get_t_next(self):
            return self.t_next

        def set_t_next(self, t_next):
            self.t_next = t_next
