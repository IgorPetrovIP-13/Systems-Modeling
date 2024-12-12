import java.util.Random;

public class FunRand {
    /**
     * Generates a random value according to an exponential
     * distribution
     *
     * @param delayMean mean value
     * @return a random value according to an exponential
     * distribution
     */
    public static double Exp(double delayMean) {
        double a = 0;
        while (a == 0) {
            a = Math.random();
        }
        a = -delayMean * Math.log(a);

        return a;
    }

    /**
     * Generates a random value according to a uniform
     * distribution
     *
     * @param Min min value
     * @param Max max value
     * @return a random value according to a uniform distribution
     */
    public static double Unif(double Min, double Max) {
        double a = 0;
        while (a == 0) {
            a = Math.random();
        }
        a = Min + a * (Max - Min);

        return a;
    }

    /**
     * Generates a random value according to a normal (Gauss)
     * distribution
     *
     * @param delayMean mean value
     * @param delayDev standard deviation of normal distribution
     * @return a random value according to a normal (Gauss) distribution
     */
    public static double Norm(double delayMean, double delayDev) {
        double a;
        Random r = new Random();
        a = delayMean + delayDev * r.nextGaussian();

        return a;
    }
}
