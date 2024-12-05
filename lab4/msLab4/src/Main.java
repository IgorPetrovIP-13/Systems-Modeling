import java.util.ArrayList;

public class Main {

    public static void main(String[] args) {
        ArrayList<Element> elements = new ArrayList<>();

        Create creator = new Create(2.0);
        elements.add(creator);

        int N = 5;
        for (int i = 0; i < N; i++) {
            Process process = new Process(3.0, 2);
            if (i > 0) {
                elements.get(elements.size() - 1).setNextElement(process);
            }
            elements.add(process);
        }

        creator.setNextElement(elements.get(1));

        Model model = new Model(elements);
        model.simulate(1000.0);
    }
}
