import time
import random

class Place:
    def __init__(self, name, tokens=0):
        self.name = name
        self.tokens = tokens

    def __str__(self):
        return f"Place({self.name}, tokens={self.tokens})"


class Transition:
    def __init__(self, name, delay=0):
        self.name = name
        self.input_arcs = []
        self.output_arcs = []
        self.delay = delay

    def add_input(self, place, weight=1):
        self.input_arcs.append((place, weight))

    def add_output(self, place, weight=1):
        self.output_arcs.append((place, weight))

    def is_enabled(self):
        return all(place.tokens >= weight for place, weight in self.input_arcs)

    def fire(self):
        if not self.is_enabled():
            raise RuntimeError(f"Transition {self.name} is not enabled.")

        for place, weight in self.input_arcs:
            place.tokens -= weight
        for place, weight in self.output_arcs:
            place.tokens += weight

    def __str__(self):
        return f"Transition({self.name}, delay={self.delay})"


class PetriNet:
    def __init__(self):
        self.places = {}
        self.transitions = {}

    def add_place(self, name, tokens=0):
        self.places[name] = Place(name, tokens)

    def add_transition(self, name, delay=0):
        self.transitions[name] = Transition(name, delay)

    def connect(self, transition_name, place_name, direction, weight=1):
        transition = self.transitions[transition_name]
        place = self.places[place_name]

        if direction == "input":
            transition.add_input(place, weight)
        elif direction == "output":
            transition.add_output(place, weight)
        else:
            raise ValueError("Direction must be 'input' or 'output'.")

    def fire_transition(self, name):
        transition = self.transitions[name]
        if transition.is_enabled():
            time.sleep(transition.delay / 1000.0)  # Delay in milliseconds
            transition.fire()
            return True
        return False

    def __str__(self):
        places = ", ".join(str(p) for p in self.places.values())
        transitions = ", ".join(str(t) for t in self.transitions.values())
        return f"PetriNet(Places: [{places}], Transitions: [{transitions}])"


class Statistics:
    def __init__(self):
        self.firing_counts = {}

    def record_firing(self, transition_name):
        if transition_name not in self.firing_counts:
            self.firing_counts[transition_name] = 0
        self.firing_counts[transition_name] += 1

    def report(self):
        return {transition: count for transition, count in self.firing_counts.items()}


class Simulator:
    def __init__(self, petri_net, statistics):
        self.petri_net = petri_net
        self.statistics = statistics

    def run(self, duration_ms):
        end_time = time.time() + duration_ms / 1000.0
        while time.time() < end_time:
            for transition_name, transition in self.petri_net.transitions.items():
                if self.petri_net.fire_transition(transition_name):
                    self.statistics.record_firing(transition_name)


# Example usage
if __name__ == "__main__":
    pn = PetriNet()
    stats = Statistics()

    # Define places
    pn.add_place("P1", tokens=1)
    pn.add_place("P2", tokens=0)

    # Define transitions with delays
    pn.add_transition("T1", delay=random.randint(100, 300))

    # Connect places and transitions
    pn.connect("T1", "P1", "input")
    pn.connect("T1", "P2", "output")

    print("Initial state:")
    print(pn)

    # Run simulation
    simulator = Simulator(pn, stats)
    simulator.run(1000)  # Run for 1000 milliseconds

    print("Final state:")
    print(pn)
    print("Statistics:", stats.report())