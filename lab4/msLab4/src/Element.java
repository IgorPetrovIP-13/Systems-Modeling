import java.util.ArrayList;

public class Element {
    private String name;
    private static int nextId = 0;
    private int id;
    private double tnext;
    private double tcurr;
    private double delayMean, delayDev;
    private String distribution;
    private int state;
    private int quantity;
    private final ArrayList<Element> nextElements = new ArrayList<>();


    public Element(double delay) {
        name = "placeholder";
        tnext = 0.0;
        delayMean = delay;
        distribution = "";
        tcurr = tnext;
        state = 0;
        id = nextId;
        nextId++;
        name = "element[" + id + "]";
    }

    public double getDelay() {
        return switch (getDistribution().toLowerCase()) {
            case "exp" -> FunRand.Exp(getDelayMean());
            case "norm" -> FunRand.Norm(getDelayMean(), getDelayDev());
            case "unif" -> FunRand.Unif(getDelayMean(), getDelayDev());
            default -> getDelayMean();
        };
    }

    public Element getNextElement() {
        if (nextElements.isEmpty()) {
            return null;
        }
        var randomIndex = (int) (Math.random() * nextElements.size());
        return nextElements.get(randomIndex);
    }


    public void addNextElement(Element nextElement) {
        this.nextElements.add(nextElement);
    }

    public void inAct() {
    }

    public void setState(int state) {
        this.state = state;
    }

    public static void resetNextId() {
        nextId = 0;
    }

    public double getDelayDev() {
        return delayDev;
    }

    public String getDistribution() {
        return distribution;
    }

    public void setDistribution(String distribution) {
        this.distribution = distribution;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getTcurr() {
        return tcurr;
    }

    public void setTcurr(double tcurr) {
        this.tcurr = tcurr;
    }

    public int getState() {
        return state;
    }

    public void outAct() {
        quantity++;
    }

    public double getTnext() {
        return tnext;
    }

    public void setTnext(double tnext) {
        this.tnext = tnext;
    }

    public double getDelayMean() {
        return delayMean;
    }

    public void setDelayMean(double delayMean) {
        this.delayMean = delayMean;
    }

    public int getId() {
        return id;
    }

    public void printInfo() {
        System.out.printf("%10s state = %2d | quantity = %3d\n", getName(), state, quantity);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void doStatistics(double delta) {
    }
}
