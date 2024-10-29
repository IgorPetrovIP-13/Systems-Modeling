import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import expon, norm, chisquare

# Параметри генерації
N = 10000  # Кількість випадкових чисел

# Метод 1: Експоненційний розподіл
def generate_exponential(lam):
    # Генерація рівномірно розподілених чисел
    uniform_numbers = np.random.uniform(0, 1, N)
    # Перетворення до експоненційного розподілу
    exponential_numbers = -np.log(uniform_numbers) / lam
    return exponential_numbers

# Метод 2: Нормальний розподіл
def generate_normal(a, sigma):
    uniform_numbers = np.random.uniform(0, 1, (N, 12))
    mu_i = np.sum(uniform_numbers, axis=1) - 6
    normal_numbers = sigma * mu_i + a
    return normal_numbers

# Метод 3: Лінійний конгруентний генератор
def generate_linear_congruential(a, c, seed=1):
    z = seed
    random_numbers = []
    for _ in range(N):
        z = (a * z) % c
        random_numbers.append(z / c)
    return np.array(random_numbers)

# Параметри для перевірки
lambdas = [0.5, 1.0, 1.5]  # Значення λ для методу 1
a_sigma_pairs = [(0, 1), (5, 2)]  # Пари (a, σ) для методу 2
a, c = 5**13, 2**31  # Параметри для методу 3

# Генерація чисел за кожним методом
for lam in lambdas:
    exponential_data = generate_exponential(lam)
    plt.hist(exponential_data, bins=50, density=True, alpha=0.6, color='blue')
    x = np.linspace(0, np.max(exponential_data), 100)
    plt.plot(x, expon.pdf(x, scale=1/lam), 'r-', lw=2)
    plt.title(f'Експоненційний розподіл, λ={lam}')
    plt.show()

for a, sigma in a_sigma_pairs:
    normal_data = generate_normal(a, sigma)
    plt.hist(normal_data, bins=50, density=True, alpha=0.6, color='blue')
    x = np.linspace(np.min(normal_data), np.max(normal_data), 100)
    plt.plot(x, norm.pdf(x, loc=a, scale=sigma), 'r-', lw=2)
    plt.title(f'Нормальний розподіл, a={a}, σ={sigma}')
    plt.show()

linear_congruential_data = generate_linear_congruential(a, c)
plt.hist(linear_congruential_data, bins=50, density=True, alpha=0.6, color='blue')
plt.title('Рівномірний розподіл (лінійний конгруентний генератор)')
plt.show()

# Перевірка розподілів за допомогою критерію χ2
def chi_square_test(data, distribution=None, **kwargs):
    # Побудова гістограми для даних
    hist, bin_edges = np.histogram(data, bins=50, density=True)
    bin_centers = 0.5 * (bin_edges[1:] + bin_edges[:-1])

    # Обчислення очікуваних частот для рівномірного розподілу
    if distribution is None:
        expected_freq = np.ones_like(bin_centers) * np.diff(bin_edges) * N / len(bin_centers)
    else:
        expected_freq = distribution.pdf(bin_centers, **kwargs) * np.diff(bin_edges) * N

    # Спостережувані частоти
    observed_freq = hist * np.diff(bin_edges) * N

    # Нормалізація частот
    observed_freq = observed_freq / observed_freq.sum() * N
    expected_freq = expected_freq / expected_freq.sum() * N

    # Критерій χ2
    chi2_stat, p_value = chisquare(f_obs=observed_freq, f_exp=expected_freq)
    return chi2_stat, p_value

# Проведення χ2-тесту для експоненційного розподілу
for lam in lambdas:
    exponential_data = generate_exponential(lam)
    chi2_stat, p_value = chi_square_test(exponential_data, expon, scale=1/lam)
    print(f"Експоненційний розподіл (λ={lam}): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")

# Проведення χ2-тесту для нормального розподілу
for a, sigma in a_sigma_pairs:
    normal_data = generate_normal(a, sigma)
    chi2_stat, p_value = chi_square_test(normal_data, norm, loc=a, scale=sigma)
    print(f"Нормальний розподіл (a={a}, σ={sigma}): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")

# Проведення χ2-тесту для рівномірного розподілу
chi2_stat, p_value = chi_square_test(linear_congruential_data)
print(f"Рівномірний розподіл (лінійний конгруентний генератор): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")