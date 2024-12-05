from core.core.Element import Element
from core.core.Job import Job


class Create(Element):
    def __init__(self, name, delay, initial_tnext=0.0):
        super().__init__(name, delay)
        self.failures = 0
        self.set_tnext(initial_tnext)

    def out_act(self):
        super().out_act()
        self.set_tnext(self.get_tcurr() + self.get_delay())
        created_job = self.create_job()
        next_route = self.get_next_route(created_job)
        if next_route.get_element() is None or next_route.is_blocked(created_job):
            self.failures += 1
        else:
            next_route.get_element().in_act(created_job)

    def create_job(self):
        return Job(self.get_tcurr())