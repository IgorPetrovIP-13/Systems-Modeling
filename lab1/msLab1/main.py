import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import expon, norm, chi2

N = 10000  # Number of random numbers

# Exponential distribution generation
def generate_exponential(lam):
    uniform_numbers = np.random.uniform(0, 1, N)
    exponential_numbers = -np.log(uniform_numbers) / lam
    return exponential_numbers

# Normal distribution generation
def generate_normal(a, sigma):
    uniform_numbers = np.random.uniform(0, 1, (N, 12))
    mu_i = np.sum(uniform_numbers, axis=1) - 6
    normal_numbers = sigma * mu_i + a
    return normal_numbers

# Linear congruential generator for uniform distribution
def generate_linear_congruential(a, c, seed=1):
    z = seed
    random_numbers = []
    for _ in range(N):
        z = (a * z) % c
        random_numbers.append(z / c)
    return np.array(random_numbers)

# Custom chi-square test function
def chi_square_test(data, distribution=None, bins=50, **kwargs):
    observed_freq, bin_edges = np.histogram(data, bins=bins)
    while np.any(observed_freq < 5) and bins > 1:
        bins -= 1
        observed_freq, bin_edges = np.histogram(data, bins=bins)

    if distribution == 'exponential':
        expected_freq = N * (
                    expon.cdf(bin_edges[1:], scale=kwargs['scale']) - expon.cdf(bin_edges[:-1], scale=kwargs['scale']))
    elif distribution == 'normal':
        expected_freq = N * (
                    norm.cdf(bin_edges[1:], loc=kwargs['loc'], scale=kwargs['scale']) - norm.cdf(bin_edges[:-1],
                                                                                                 loc=kwargs['loc'],
                                                                                                 scale=kwargs['scale']))
    elif distribution == 'uniform':
        expected_freq = np.ones_like(observed_freq) * (N / bins)
    else:
        raise ValueError("Unknown distribution type for chi-square test.")

    # Chi-square statistic calculation
    chi2_stat = np.sum((observed_freq - expected_freq) ** 2 / expected_freq)
    degrees_of_freedom = len(observed_freq) - 1
    p_value = 1 - chi2.cdf(chi2_stat, degrees_of_freedom)

    return chi2_stat, p_value


# Plotting and testing exponential distribution
lambdas = [0.5, 1.0, 1.5]
for lam in lambdas:
    exponential_data = generate_exponential(lam)
    plt.hist(exponential_data, bins=50, density=True, alpha=0.6, color='blue')
    x = np.linspace(0, np.max(exponential_data), 100)
    plt.plot(x, expon.pdf(x, scale=1 / lam), 'r-', lw=2)
    plt.title(f'Exponential Distribution, λ={lam}')
    plt.show()

    chi2_stat, p_value = chi_square_test(exponential_data, 'exponential', bins=50, scale=1 / lam)
    print(f"Exponential distribution (λ={lam}): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")

# Plotting and testing normal distribution
a_sigma_pairs = [(0, 1), (5, 2)]
for a, sigma in a_sigma_pairs:
    normal_data = generate_normal(a, sigma)
    plt.hist(normal_data, bins=50, density=True, alpha=0.6, color='blue')
    x = np.linspace(np.min(normal_data), np.max(normal_data), 100)
    plt.plot(x, norm.pdf(x, loc=a, scale=sigma), 'r-', lw=2)
    plt.title(f'Normal Distribution, a={a}, σ={sigma}')
    plt.show()

    chi2_stat, p_value = chi_square_test(normal_data, 'normal', bins=50, loc=a, scale=sigma)
    print(f"Normal distribution (a={a}, σ={sigma}): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")

# Plotting and testing uniform distribution with linear congruential generator
a_c_pairs = [(5 ** 13, 2 ** 31)]
for a, c in a_c_pairs:
    uniform_data = generate_linear_congruential(a, c)
    plt.hist(uniform_data, bins=50, density=True, alpha=0.6, color='blue')
    plt.title(f'Uniform Distribution (Linear Congruential Generator) a={a}, c={c}')
    plt.show()

    chi2_stat, p_value = chi_square_test(uniform_data, 'uniform', bins=50)
    print(
        f"Uniform distribution (linear congruential generator with a={a}, c={c}): χ2 = {chi2_stat:.2f}, p-value = {p_value:.2f}")