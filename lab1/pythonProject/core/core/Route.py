class Route:
    def __init__(self, element, probability=1.0, priority=0, block=None):
        self.element = element
        self.probability = probability
        self.priority = priority
        self.block = block

    def is_blocked(self, job):
        if self.block is None:
            return False
        try:
            return self.block(job)
        except Exception as e:
            raise RuntimeError(e)

    def get_element(self):
        return self.element

    def get_priority(self):
        return self.priority

    def get_probability(self):
        return self.probability

    def set_block(self, block):
        self.block = block