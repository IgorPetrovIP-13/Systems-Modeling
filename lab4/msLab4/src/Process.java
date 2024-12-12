import java.util.ArrayList;

public class Process extends Element {
    private int queue, maxqueue, failure;
    private double meanQueue = 0.0;
    private double workTime = 0.0;
    private final ArrayList<Channel> channels = new ArrayList<>();

    public Process(double delay, int channelsNum) {
        super(delay);
        queue = 0;
        maxqueue = Integer.MAX_VALUE;
        for (int i = 0; i < channelsNum; i++) {
            channels.add(new Channel());
        }
    }

    @Override
    public void inAct() {
        super.inAct();
        var freeChannel = getFreeChannel();
        if (freeChannel != -1) {
            channels.get(freeChannel).setState(1);
            channels.get(freeChannel).setTnext(super.getTcurr() + super.getDelay());
            return;
        }
        if (getQueue() < getMaxqueue()) {
            setQueue(getQueue() + 1);
        } else {
            failure++;
        }

    }

    @Override
    public void outAct() {
        var chansWithMinTnext = getChannelsWithMinTnext();
        setQuantity(getQuantity() + chansWithMinTnext.size());

        for (int index : chansWithMinTnext) {
            channels.get(index).setTnext(Double.MAX_VALUE);
            channels.get(index).setState(0);
        }

        for (int i = 0; i < chansWithMinTnext.size(); i++) {
            var nextElement = getNextElement();
            if (nextElement != null) {
                nextElement.inAct();
            }
        }

        if (getQueue() > 0) {
            var newTasks = Math.min(getQueue(), chansWithMinTnext.size());
            setQueue(getQueue() - newTasks);
            for (int i = 0; i < newTasks; i++) {
                channels.get(chansWithMinTnext.get(i)).setState(1);
                channels.get(chansWithMinTnext.get(i)).setTnext(super.getTcurr() + super.getDelay());
            }
        }
    }

    @Override
    public int getState() {
        int state = 0;
        for (Channel channel : channels) {
            state |= channel.getState();
        }
        return state;
    }

    @Override
    public double getTnext() {
        double tnext = Double.MAX_VALUE;
        for (Channel channel : channels) {
            if (channel.getTnext() < tnext) {
                tnext = channel.getTnext();
            }
        }
        return tnext;
    }

    private int getFreeChannel() {
        for (int i = 0; i < channels.size(); i++) {
            if (channels.get(i).getState() == 0) {
                return i;
            }
        }
        return -1;
    }

    private ArrayList<Integer> getChannelsWithMinTnext() {
        var minTnext = getTnext();
        var channelsWithMinTnext = new ArrayList<Integer>();
        for (int i = 0; i < channels.size(); i++) {
            if (channels.get(i).getTnext() == minTnext) {
                channelsWithMinTnext.add(i);
            }
        }
        return channelsWithMinTnext;
    }

    @Override
    public void printInfo() {
        super.printInfo();
        System.out.println("failure = " + this.getFailure() + " worktime = " + this.workTime);
    }

    @Override
    public void doStatistics(double delta) {
        meanQueue = getMeanQueue() + queue * delta;
        workTime = getWorkTime() + getState() * delta;
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

    public double getMeanQueue() {
        return meanQueue;
    }

    public double getWorkTime() {
        return workTime;
    }

    static class Channel {
        private int state = 0;
        private double tnext = Double.MAX_VALUE;

        public int getState() {
            return state;
        }

        public void setState(int state) {
            this.state = state;
        }

        public double getTnext() {
            return tnext;
        }

        public void setTnext(double tnext) {
            this.tnext = tnext;
        }
    }
}
