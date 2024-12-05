from core.core.Process import Process


class Model:
    def __init__(self, *elements):
        self.elements = list(elements)
        self.t_curr = 0.0
        self.t_next = 0.0
        self.nearest_event = 0
        self.is_first_iteration = True

    def simulate(self, time: float):
        while self.t_curr < time:
            self.t_next = float('inf')
            for element in self.elements:
                if (self.t_curr < element.get_t_next() or self.is_first_iteration) and element.get_t_next() < self.t_next:
                    self.t_next = element.get_t_next()
                    self.nearest_event = element.get_id()

            self.update_blocked_elements()

            print(f"\nEvent in {self.elements[self.nearest_event].get_name()}, tNext = {self.t_next}")

            delta = self.t_next - self.t_curr
            self.do_model_statistics(delta)

            for element in self.elements:
                element.do_statistics(delta)

            self.t_curr = self.t_next

            for element in self.elements:
                element.set_t_curr(self.t_curr)

            self.elements[self.nearest_event].out_act()

            for element in self.elements:
                if element.get_t_next() == self.t_curr:
                    element.out_act()

            self.is_first_iteration = False
            self.print_info()

        self.print_result()

    def print_info(self):
        for element in self.elements:
            element.print_info()

    def print_result(self):
        print("\n-------------RESULTS-------------")
        for element in self.elements:
            print("-> ", end="")
            element.print_result()
            if isinstance(element, Process):
                print(f"   Mean Queue = {element.mean_queue / self.t_curr}")
                print(f"   Mean Workload = {element.work_time / self.t_curr}")
                print(f"   Failure Probability = {element.failures / (element.get_quantity() + element.failures)}")

    def do_model_statistics(self, delta: float):
        pass

    def update_blocked_elements(self):
        for element in self.elements:
            if element.get_t_next() <= self.t_curr:
                element.set_t_next(self.t_next)