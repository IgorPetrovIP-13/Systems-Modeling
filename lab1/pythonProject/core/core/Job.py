class Job:
    next_id = 0

    def __init__(self, time_in: float):
        self.time_in = time_in
        self.time_out = time_in
        self.id = Job.next_id
        Job.next_id += 1

    def get_id(self) -> int:
        return self.id

    def get_time_in(self) -> float:
        return self.time_in

    def get_time_out(self) -> float:
        return self.time_out

    def set_time_out(self, time_out: float):
        self.time_out = time_out