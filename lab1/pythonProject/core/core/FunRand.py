import random
import math

class FunRand:
    @staticmethod
    def exponential(time_mean: float) -> float:
        a = 0
        while a == 0:
            a = random.random()
        return -time_mean * math.log(a)

    @staticmethod
    def uniform(time_min: float, time_max: float) -> float:
        a = 0
        while a == 0:
            a = random.random()
        return time_min + a * (time_max - time_min)

    @staticmethod
    def normal(time_mean: float, time_deviation: float) -> float:
        return time_mean + time_deviation * random.gauss(0, 1)

    @staticmethod
    def erlang(time_mean: float, shape: float) -> float:
        a = 0
        for _ in range(int(shape)):
            a += math.log(random.random())
        return (-1 / (time_mean / shape)) * a