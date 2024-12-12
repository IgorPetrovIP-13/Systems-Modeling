import java.util.ArrayList;

public class Model {
    private final ArrayList<Element> list;
    double tnext;
    double tcurr;
    int eventID;


    public Model(ArrayList<Element> elements) {
        list = elements;
        tnext = 0.0;
        eventID = 0;
        tcurr = tnext;
    }

    public void simulate(double time) {
        while (tcurr < time) {
            tnext = Double.MAX_VALUE;
            for (Element e : list) {
                if (e.getTnext() < tnext) {
                    tnext = e.getTnext();
                    eventID = e.getId();
                }
            }

            for (Element e : list) {
                e.doStatistics(tnext - tcurr);
            }
            tcurr = tnext;
            for (Element e : list) {
                e.setTcurr(tcurr);
            }
            list.get(eventID).outAct();
            for (Element e : list) {
                if (e.getTnext() == tcurr) {
                    e.outAct();
                }
            }
        }

    }

}
