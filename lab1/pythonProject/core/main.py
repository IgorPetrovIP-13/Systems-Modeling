from core.bank.BankModel import BankModel
from core.bank.SwitchingProcess import SwitchingProcess
from core.core.Create import Create
from core.core.Dispose import Dispose
from core.core.Route import Route


def main():
    bank()

def bank():
    create = Create("Create #1", 0.5, 0.1)
    cashier_window_1 = SwitchingProcess("Cashier window #1", 1, 0.3, 1, 2)
    cashier_window_2 = SwitchingProcess("Cashier window #2", 1, 0.3, 1, 2)
    dispose = Dispose("Dispose #1")

    cashier_window_1.initialize_channels_with_jobs(1)
    cashier_window_1.initialize_queue_with_jobs(2)
    cashier_window_1.set_neighbors(cashier_window_2)
    cashier_window_2.initialize_channels_with_jobs(1)
    cashier_window_2.initialize_queue_with_jobs(2)
    cashier_window_2.set_neighbors(cashier_window_1)

    create.set_distribution('exponential')
    cashier_window_1.set_distribution('exponential')
    cashier_window_1.set_delay_mean(0.3)
    cashier_window_2.set_distribution('exponential')
    cashier_window_2.set_delay_mean(0.3)

    cashier_window_1.max_queue_size(3)
    cashier_window_2.max_queue_size(3)

    create.set_routing('by_priority')
    create.add_routes(
        Route(cashier_window_1, 0.5, 1, lambda job: cashier_window_2.get_queue_size() < cashier_window_1.get_queue_size()),
        Route(cashier_window_2, 0.5, 0)
    )

    cashier_window_1.add_routes(
        Route(dispose)
    )

    cashier_window_2.add_routes(
        Route(dispose)
    )

    model = BankModel(create, cashier_window_1, cashier_window_2, dispose)
    model.simulate(1000)

if __name__ == "__main__":
    main()