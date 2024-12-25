/*
 * Спрощена модель Petri, яка оперує списком PetriSim.
 * Залишено використання StateTime для відліку часу.
 * Видалено функціонал Petri-об’єктних моделей.
 */

package PetriObj;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;
import javax.swing.JTextArea;

public class PetriObjModel implements Serializable {

    private ArrayList<PetriSim> listObj = new ArrayList<>();
    private boolean protocolPrint = true;
    private boolean statistics = true;
    private StateTime timeState;  // використання часу через StateTime

    public PetriObjModel(ArrayList<PetriSim> listObj) {
        this(listObj, new StateTime());
    }

    public PetriObjModel(ArrayList<PetriSim> listObj, StateTime timeState) {
        this.listObj = listObj;
        this.timeState = timeState;
        this.listObj.forEach(sim -> sim.setTimeState(timeState));
    }

    /**
     * Встановити потребу виведення протоколу.
     */
    public void setIsProtokol(boolean b) {
        this.protocolPrint = b;
    }

    /**
     * Встановити потребу збору статистики.
     */
    public void setIsStatistics(boolean b) {
        this.statistics = b;
    }

    public ArrayList<PetriSim> getListObj() {
        return listObj;
    }

    public void setListObj(ArrayList<PetriSim> List) {
        listObj = List;
        this.listObj.forEach(sim -> sim.setTimeState(timeState));
    }

    /**
     * Запустити моделювання до часу timeModeling.
     * Якщо ввімкнуто протокол, він буде виводитися у консоль.
     * Якщо ввімкнуто статистику, вона оновлюватиметься.
     */
    public void go(double timeModeling) {
        setSimulationTime(timeModeling);
        setCurrentTime(0.0);

        // Сортуємо об'єкти за пріоритетом
        getListObj().sort(PetriSim.getComparatorByPriority());

        // Ініціалізуємо вхідні переходи
        for (PetriSim e : getListObj()) {
            e.input();
        }

        if (protocolPrint) {
            for (PetriSim e : getListObj()) {
                e.printMark();
            }
        }

        ArrayList<PetriSim> conflictObj = new ArrayList<>();
        Random r = new Random();

        while (getCurrentTime() < getSimulationTime()) {
            conflictObj.clear();
            double min = getListObj().get(0).getTimeMin();

            for (PetriSim e : getListObj()) {
                if (e.getTimeMin() < min) {
                    min = e.getTimeMin();
                }
            }

            // Збір статистики
            if (statistics && min > 0) {
                double delta = Math.min(min - getCurrentTime(), getSimulationTime() - getCurrentTime());
                for (PetriSim e : getListObj()) {
                    if (delta > 0) {
                        e.doStatistics(delta / min);
                    }
                }
            }

            setCurrentTime(min);
            if (protocolPrint) {
                System.out.println(" Time progress: time = " + getCurrentTime() + "\n");
            }

            if (getCurrentTime() <= getSimulationTime()) {
                for (PetriSim sim : getListObj()) {
                    if (getCurrentTime() == sim.getTimeMin()) {
                        conflictObj.add(sim);
                    }
                }

                if (protocolPrint) {
                    System.out.println(" Conflicting objects:");
                    for (int ii = 0; ii < conflictObj.size(); ii++) {
                        System.out.println(" K[" + ii + "] = " + conflictObj.get(ii).getName());
                    }
                }

                int num;
                if (conflictObj.size() > 1) {
                    conflictObj.sort(PetriSim.getComparatorByPriority());
                    int max = conflictObj.size();
                    for (int i = 1; i < conflictObj.size(); i++) {
                        if (conflictObj.get(i).getPriority() < conflictObj.get(i - 1).getPriority()) {
                            max = i - 1;
                            break;
                        }
                    }
                    num = (max == 0) ? 0 : r.nextInt(max);
                } else {
                    num = 0;
                }

                PetriSim chosen = conflictObj.get(num);
                if (protocolPrint) {
                    System.out.println(" Selected object: " + chosen.getName());
                }

                for (PetriSim sim : getListObj()) {
                    if (sim.getNumObj() == chosen.getNumObj()) {
                        if (protocolPrint) {
                            System.out.println(" time = " + getCurrentTime() +
                                    " Event '" + sim.getEventMin().getName() + "' " +
                                    "occurring for the object " + sim.getName());
                        }
                        sim.doT();
                        sim.output();
                    }
                }

                if (protocolPrint) {
                    System.out.println("Markers output:");
                    for (PetriSim sim : getListObj()) {
                        sim.printMark();
                    }
                }

                Collections.shuffle(getListObj());
                getListObj().sort(PetriSim.getComparatorByPriority());

                for (PetriSim e : getListObj()) {
                    e.input();
                }

                if (protocolPrint) {
                    System.out.println("Markers input:");
                    for (PetriSim e : getListObj()) {
                        e.printMark();
                    }
                }
            }
        }

        getListObj().sort(PetriSim.getComparatorByNum());
    }

    public void printStatistics() {
        System.out.println("State of places and transitions:");
        for (PetriSim e : listObj) {
            e.printMark();
            e.printBuffer();
        }
        if (statistics) {
            for (PetriSim e : listObj) {
                System.out.println("\nMean values for " + e.getName() + ":");
                for (PetriP p: e.getNet().getListP()) {
                    System.out.println(p.getName() + "  " + p.getMean());
                }
                for (PetriT tr: e.getNet().getListT()) {
                    System.out.println(tr.getName() + "  " + tr.getMean());
                }
            }
        }
    }

    public void setSimulationTime(double t) {
        getTimeState().setSimulationTime(t);
        for (PetriSim sim: getListObj()) {
            sim.setSimulationTime(t);
        }
    }

    public double getSimulationTime() {
        return getTimeState().getSimulationTime();
    }

    public void setCurrentTime(double t) {
        getTimeState().setCurrentTime(t);
        for(PetriSim sim: this.listObj) {
            sim.setTimeCurr(t);
        }
    }

    public double getCurrentTime() {
        return getTimeState().getCurrentTime();
    }

    public StateTime getTimeState() {
        return timeState;
    }

    public void setTimeState(StateTime timeState) {
        this.timeState = timeState;
        this.listObj.forEach(sim -> sim.setTimeState(timeState));
    }

    public boolean isProtocolPrint() {
        return protocolPrint;
    }

    public boolean isStatistics() {
        return statistics;
    }

    public void printInfo(String info, JTextArea area) {
        if (protocolPrint) {
            area.append(info);
        }
    }

    public void printMark(JTextArea area) {
        if (protocolPrint) {
            for (PetriSim e : listObj) {
                e.printMark(area);
            }
        }
    }
}
