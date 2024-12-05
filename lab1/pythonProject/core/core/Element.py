import random
from typing import List

from core.core.FunRand import FunRand
from core.core.Route import Route


class Element:
    next_id = 0

    def __init__(self, name, delay_mean=1.0, delay_dev=0.0):
        self.routes = []
        self.id = Element.next_id
        Element.next_id += 1
        self.name = name
        self.routing = 'by_priority'
        self.distribution = 'none'
        self.t_next = float('inf')
        self.t_curr = self.t_next
        self.delay_mean = delay_mean
        self.delay_dev = delay_dev
        self.quantity = 0
        self.state = 0

    @staticmethod
    def get_unblocked_routes(routes: List['Route'], routed_job: 'Job') -> List['Route']:
        return [route for route in routes if not route.is_blocked(routed_job)]

    @staticmethod
    def get_scaled_probabilities(routes: List['Route']) -> List[float]:
        probabilities = [route.get_probability() for route in routes]
        for i in range(1, len(probabilities)):
            probabilities[i] += probabilities[i - 1]
        total = probabilities[-1]
        return [p / total for p in probabilities]

    def set_routing(self, routing: 'Routing'):
        self.routing = routing

    def get_delay(self) -> float:
        if self.distribution == 'exponential':
            return FunRand.exponential(self.delay_mean)
        elif self.distribution == 'uniform':
            return FunRand.uniform(self.delay_mean, self.delay_dev)
        elif self.distribution == 'normal':
            return FunRand.normal(self.delay_mean, self.delay_dev)
        elif self.distribution == 'erlang':
            return FunRand.erlang(self.delay_mean, self.delay_dev)
        return self.delay_mean

    def get_delay_mean(self) -> float:
        return self.delay_mean

    def set_delay_mean(self, delay_mean: float):
        self.delay_mean = delay_mean

    def get_delay_dev(self) -> float:
        return self.delay_dev

    def set_delay_dev(self, delay_dev: float):
        self.delay_dev = delay_dev

    def get_quantity(self) -> int:
        return self.quantity

    def set_quantity(self, quantity: int):
        self.quantity = quantity

    def change_quantity(self, delta: int):
        self.quantity += delta

    def get_next_route(self, routed_job: 'Job') -> 'Route':
        if not self.routes:
            return Route(None)

        if self.routing == 'by_probability':
            return self.get_next_route_by_probability(routed_job)
        elif self.routing == 'by_priority':
            return self.get_next_route_by_priority(routed_job)
        elif self.routing == 'combined':
            return self.get_next_route_combined(routed_job)

    def get_next_route_by_probability(self, routed_job: 'Job') -> 'Route':
        unblocked_routes = self.get_unblocked_routes(self.routes, routed_job)
        if not unblocked_routes:
            return self.routes[0]

        probability = random.random()
        scaled_probabilities = self.get_scaled_probabilities(unblocked_routes)
        for i, prob in enumerate(scaled_probabilities):
            if probability < prob:
                return unblocked_routes[i]
        return unblocked_routes[-1]

    def get_next_route_by_priority(self, routed_job: 'Job') -> 'Route':
        unblocked_routes = self.get_unblocked_routes(self.routes, routed_job)
        if not unblocked_routes:
            return self.routes[0]
        return unblocked_routes[0]

    def get_next_route_combined(self, routed_job: 'Job') -> 'Route':
        selected_route = None
        for route in self.routes:
            if not route.is_blocked(routed_job):
                selected_route = route
                break

        if selected_route is None:
            return self.routes[0]

        same_priority_routes = self.find_routes_by_priority(selected_route.get_priority())
        probability = random.random()
        scaled_probabilities = self.get_scaled_probabilities(same_priority_routes)
        for i, prob in enumerate(scaled_probabilities):
            if probability < prob:
                selected_route = same_priority_routes[i]
                break
        return selected_route

    def find_routes_by_priority(self, priority: int) -> List['Route']:
        return [route for route in self.routes if route.get_priority() == priority]

    def add_routes(self, *routes: 'Route'):
        self.routes.extend(routes)
        self.routes.sort(key=lambda route: route.get_priority(), reverse=True)

    def in_act(self, job: 'Job'):
        pass

    def out_act(self):
        self.quantity += 1

    def get_tnext(self) -> float:
        return self.t_next

    def set_tnext(self, t_next: float):
        self.t_next = t_next

    def get_tcurr(self) -> float:
        return self.t_curr

    def set_tcurr(self, t_curr: float):
        self.t_curr = t_curr

    def get_state(self) -> int:
        return self.state

    def set_state(self, state: int):
        self.state = state

    def get_name(self) -> str:
        return self.name

    def print_info(self):
        print(f"{self.name} state = {self.state} quantity = {self.quantity} tnext = {self.t_next}")

    def print_result(self):
        print(f"{self.name} quantity = {self.quantity}")

    def get_id(self) -> int:
        return self.id

    def do_statistics(self, delta: float):
        pass

    def set_distribution(self, distribution: 'Distribution'):
        self.distribution = distribution