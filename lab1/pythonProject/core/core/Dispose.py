from core.core.Element import Element


class Dispose(Element):
    def __init__(self, name):
        super().__init__(name)
        self.processedJobs = []

    def inAct(self, job):
        super().in_act(job)
        self.processedJobs.append(job)
        self.out_act()

    def printInfo(self):
        print(f"{self.get_name()} quantity = {self.get_quantity()}")

    def getProcessedJobs(self):
        return self.processedJobs