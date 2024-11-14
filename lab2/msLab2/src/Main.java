import java.util.ArrayList;

public class Main {

    //Task 1 - 2
//    public static void main(String[] args) {
//        Create c = new Create(2.0);
//        Process p = new Process(2.0, 1);
//
//        c.setNextElement(p);
//        p.setMaxqueue(5);
//
//        c.setName("CREATOR");
//        p.setName("PROCESSOR");
//
//        c.setDistribution("exp");
//        p.setDistribution("exp");
//
//        ArrayList<Element> list = new ArrayList<>();
//
//        list.add(c);
//        list.add(p);
//
//        Model model = new Model(list);
//
//        model.simulate(1000.0);
//    }

    // Task 3 - 4
//    public static void main(String[] args) {
//        Create c = new Create(2.0);
//        Process p1 = new Process(2.0, 1);
//        Process p2 = new Process(2.0, 1);
//        Process p3 = new Process(2.0, 1);
//
//        c.setNextElement(p1);
//        p1.setNextElement(p2);
//        p2.setNextElement(p3);
//
//        p1.setMaxqueue(5);
//        p2.setMaxqueue(5);
//        p3.setMaxqueue(5);
//
//        c.setName("CREATOR");
//        p1.setName("PROCESSOR1");
//        p2.setName("PROCESSOR2");
//        p3.setName("PROCESSOR3");
//
//        c.setDistribution("exp");
//        p1.setDistribution("exp");
//        p2.setDistribution("exp");
//        p3.setDistribution("exp");
//
//        ArrayList<Element> list = new ArrayList<>();
//        list.add(c);
//        list.add(p1);
//        list.add(p2);
//        list.add(p3);
//
//        Model model = new Model(list);
//        model.simulate(1000.0);
//    }

    // Task 5
//        public static void main(String[] args) {
//        Create c = new Create(2.0);
//        Process p1 = new Process(2.0, 2);
//        Process p2 = new Process(2.0, 2);
//        Process p3 = new Process(2.0, 2);
//
//        c.setNextElement(p1);
//        p1.setNextElement(p2);
//        p2.setNextElement(p3);
//
//        p1.setMaxqueue(5);
//        p2.setMaxqueue(5);
//        p3.setMaxqueue(5);
//
//        c.setName("CREATOR");
//        p1.setName("PROCESSOR1");
//        p2.setName("PROCESSOR2");
//        p3.setName("PROCESSOR3");
//
//        c.setDistribution("exp");
//        p1.setDistribution("exp");
//        p2.setDistribution("exp");
//        p3.setDistribution("exp");
//
//        ArrayList<Element> list = new ArrayList<>();
//        list.add(c);
//        list.add(p1);
//        list.add(p2);
//        list.add(p3);
//
//        Model model = new Model(list);
//        model.simulate(1000);
//    }

    // Task 6
    public static void main(String[] args) {
        Create c = new Create(2.0);
        Process p1 = new Process(6.0, 3);
        Process p2 = new Process(5.0, 3);
        Process p3 = new Process(2.0, 2);

        c.setNextElement(p1);
        p1.addNextElement(p2);
        p2.addNextElement(p1);
        p2.addNextElement(p3);

        p1.setMaxqueue(5);
        p2.setMaxqueue(5);
        p3.setMaxqueue(5);

        c.setName("CREATOR");
        p1.setName("PROCESSOR1");
        p2.setName("PROCESSOR2");
        p3.setName("PROCESSOR3");

        c.setDistribution("exp");
        p1.setDistribution("exp");
        p2.setDistribution("exp");
        p3.setDistribution("exp");

        ArrayList<Element> list = new ArrayList<>();
        list.add(c);
        list.add(p1);
        list.add(p2);
        list.add(p3);

        Model model = new Model(list);
        model.simulate(1000);
    }
}
