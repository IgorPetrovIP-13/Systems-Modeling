import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        seq();
        paralell();
    }

    public static void seq(){
            final int N = 4001;
            final int iterations = 3;

            for (int processNum = 1; processNum <= N; processNum += 500) {
                long totalTime = 0;

                for (int currIter = 0; currIter < iterations; currIter++) {

                    Element.resetNextId();
                    ArrayList<Element> elements = new ArrayList<>();



                    Create creator = new Create(5.0);
                    creator.setName("CREATOR");
                    creator.setDistribution("exp");
                    elements.add(creator);



                    Process lastProcess = null;
                    for (int i = 0; i < processNum; i++) {
                        Process newProcess = new Process(1.0, 1);
                        newProcess.setName("PROCESSOR " + (i + 1));
                        newProcess.setDistribution("exp");
                        elements.add(newProcess);
                        if (lastProcess != null) {
                            lastProcess.addNextElement(newProcess);
                        } else {
                            creator.addNextElement(newProcess);
                        }
                        lastProcess = newProcess;
                    }



                    Model model = new Model(elements);
                    long start = System.currentTimeMillis();
                    model.simulate(1000);
                    long end = System.currentTimeMillis();
                    totalTime += (end - start);
                }
                System.out.printf("time with %d processes: %d ms%n", processNum, totalTime / iterations);
            }
    }

    public static void paralell(){
        final int N = 4001;
        final int iterations = 3;

        for (int processNum = 1; processNum <= N; processNum += 500) {
            long totalTime = 0;

            for (int currIter = 0; currIter < iterations; currIter++) {
                Element.resetNextId();
                ArrayList<Element> elements = new ArrayList<>();



                Create creator = new Create(5.0);
                creator.setName("CREATOR");
                creator.setDistribution("exp");
                elements.add(creator);



                ArrayList<Process> branch1 = new ArrayList<>();
                ArrayList<Process> branch2 = new ArrayList<>();



                for (int i = 0; i < processNum; i++) {
                    Process newProcess = new Process(1.0, 1);
                    newProcess.setName("PROCESS " + (i + 1));
                    newProcess.setDistribution("exp");
                    elements.add(newProcess);

                    if (i % 2 == 0) {
                        branch1.add(newProcess);
                    } else {
                        branch2.add(newProcess);
                    }
                }

                //branch1
                for (int i = 0; i < branch1.size(); i++) {
                    Process currentProcess = branch1.get(i);
                    if (i == 0) {
                        creator.addNextElement(currentProcess);
                    } else {
                        branch1.get(i - 1).addNextElement(currentProcess);
                    }
                }
                //branch2
                for (int i = 0; i < branch2.size(); i++) {
                    Process currentProcess = branch2.get(i);
                    if (i == 0) {
                        creator.addNextElement(currentProcess);
                    } else {
                        branch2.get(i - 1).addNextElement(currentProcess);
                    }
                }



                Model model = new Model(elements);
                long start = System.currentTimeMillis();
                model.simulate(1000);
                long end = System.currentTimeMillis();
                totalTime += (end - start);
            }
            System.out.printf("time with %d processes: %d ms%n", processNum, totalTime / iterations);
        }
    }
}