import java.util.ArrayList;
import java.util.Random;

public class Process extends Element {
    private int queue, maxqueue, failure;
    private double meanQueue, busyTime;
    private final int machinesNum;
    private final double[] nextMachines;
    private ArrayList<Element> nextElements;

    public Process(double delay, int machinesNum) {
        super(delay);
        queue = 0;
        maxqueue = Integer.MAX_VALUE;
        meanQueue = 0.0;
        busyTime = 0.0;
        nextElements = new ArrayList<>();
        this.machinesNum = machinesNum;
        this.nextMachines = new double[machinesNum];
        for (int i = 0; i < machinesNum; i++) {
            nextMachines[i] = Double.MAX_VALUE;
        }
    }

    @Override
    public void inAct() {
        int freeMachine = getFreeMachine();
        if (freeMachine != -1) {
            nextMachines[freeMachine] = super.getTcurr() + super.getDelay();
            super.setState(1);
        } else {
            if (getQueue() < getMaxqueue()) {
                setQueue(getQueue() + 1);
            } else {
                failure++;
            }
        }
        double minTnext = Double.MAX_VALUE;
        for (double tnext : nextMachines) {
            if (tnext < minTnext) {
                minTnext = tnext;
            }
        }
        super.setTnext(minTnext);
    }

    @Override
    public void outAct() {
        super.outAct();

        double minValue = Double.MAX_VALUE;

        int nextMachine = -1;

        for (int i = 0; i < machinesNum; i++) {
            if (nextMachines[i] < minValue) {
                minValue = nextMachines[i];
                nextMachine = i;
            }
        }

        if (nextMachine != -1) {
            nextMachines[nextMachine] = Double.MAX_VALUE;
            if (getQueue() > 0) {
                setQueue(getQueue() - 1);
                nextMachines[nextMachine] = super.getTcurr() + super.getDelay();
            } else {
                boolean isAllFree = true;
                for (double tnext : nextMachines) {
                    if (tnext != Double.MAX_VALUE) {
                        isAllFree = false;
                        break;
                    }
                }
                if (isAllFree) {
                    super.setState(0);
                }
            }
            if (!nextElements.isEmpty()) {
                Element nextElement = getNextRandomElement();
                if (nextElement != null) {
                    nextElement.inAct();
                }
            }
        }
        double minTnext = Double.MAX_VALUE;
        for (double tnext : nextMachines) {
            if (tnext < minTnext) {
                minTnext = tnext;
            }
        }
        super.setTnext(minTnext);
    }

    public int getFailure() {
        return failure;
    }
    public int getQueue() {
        return queue;
    }

    public void setQueue(int queue) {
        this.queue = queue;
    }
    public int getMaxqueue() {
        return maxqueue;
    }
    public void setMaxqueue(int maxqueue) {
        this.maxqueue = maxqueue;
    }
    @Override
    public void printInfo() {
        super.printInfo();
        System.out.println("failure = " + this.getFailure());
    }
    @Override
    public void doStatistics(double delta) {
        meanQueue = getMeanQueue() + queue * delta;
        if (getState() == 1) {
            busyTime += delta;
        }
    }
    public double getMeanQueue() {
        return meanQueue;
    }

    public double getMeanBusyTime(double totalTime) {
        return busyTime / totalTime;
    }

    private int getFreeMachine() {
        int freeI = -1;
        for (int i = 0; i < machinesNum; i++) {
            if (nextMachines[i] == Double.MAX_VALUE) {
                return i;
            }
        }
        return freeI;
    }

    private Element getNextRandomElement() {
        return nextElements.get(new Random().nextInt(nextElements.size()));
    }

    public void addNextElement(Element element) {
        nextElements.add(element);
    }
}
