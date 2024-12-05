export function randomExponential(timeMean: number): number {
  let randomValue = 0;
  while (randomValue === 0) {
    randomValue = Math.random();
  }
  return -timeMean * Math.log(randomValue);
}

export function randomUniform(timeMin: number, timeMax: number): number {
	let randomValue = 0;
	while (randomValue === 0) {
		randomValue = Math.random();
	}
	return timeMin + randomValue * (timeMax - timeMin);
}

export function randomNormal(timeMean: number, timeDeviation: number): number {
	const randomGaussian = (): number => {
		const u = Math.random();
		const v = Math.random();
		return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	};
	return timeMean + timeDeviation * randomGaussian();
}

export function randomErlang(timeMean: number, shape: number): number {
	let sum = 0;
	for (let i = 0; i < shape; i++) {
		sum += Math.log(Math.random());
	}
	return (-1 / (timeMean / shape)) * sum;
}