package LibTest;
import PetriObj.*;
import LibNet.NetLibrary;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

public class Coursework {
    public static void main(String[] args) throws ExceptionInvalidTimeDelay, ExceptionInvalidNetStructure {
//        verify();
// experiment();
        getMeanValuesTest();
    }
    public static void verify() throws ExceptionInvalidTimeDelay, ExceptionInvalidNetStructure {
        int TIME = 525600;
        int S = 3000000;

        // Змінні параматери для верифікації
        int stripes = 4;
        int intensivity = 6;
        int serviceTime = 35;
        int refillTime = 70;
        int migrationTime = 140;

        for (int i = 0; i <= 3; i++) {
            ArrayList<PetriSim> list = new ArrayList<>();
            list.add(new PetriSim(NetLibrary.VerificationModel(stripes, intensivity, serviceTime, refillTime, migrationTime)));
            PetriObjModel model = new PetriObjModel(list);
            model.setIsProtokol(false);
            model.go(TIME);

            int migratedFleets = model.getListObj().get(0).getNet().getListP()[11].getObservedMax();
            int earned = model.getListObj().get(0).getNet().getListP()[14].getObservedMax();
            int lost = model.getListObj().get(0).getNet().getListP()[6].getObservedMax();
            int profit = earned - lost;
            double profitTime = ((double) (S*stripes - S*2) / profit);
            System.out.println("Кількість літаків, що здійснили перельоти на інший аеропорт: "+migratedFleets);
            System.out.println("Прибуток від обслуговування літаків: "+earned);
            System.out.println("Втрати аеропорту на дозаправку: "+lost);
            System.out.println("Час окупності: "+profitTime);
        }
    }
    public static void experiment() throws ExceptionInvalidTimeDelay, ExceptionInvalidNetStructure {
        int TIME = 525600;
        int S = 3000000;

        int startJ = 3;
        int endJ = 12;
        int countJ = endJ - startJ + 1;

        double[] profitSum = new double[countJ];

        for (int i = 1; i <= 20; i++) {
            int index = 0;

            for (int j = startJ; j <= endJ; j++) {
                ArrayList<PetriSim> list = new ArrayList<>();
                list.add(new PetriSim(NetLibrary.CourseworkModel(j)));
                PetriObjModel model = new PetriObjModel(list);
                model.setIsProtokol(false);
                model.go(TIME);

                int earned = model.getListObj().get(0).getNet().getListP()[14].getObservedMax();
                int lost = model.getListObj().get(0).getNet().getListP()[6].getObservedMax();
                int profit = earned - lost;

                double profitTime = ((double) (S*j - S*2) / profit);

                profitSum[index] += profitTime;
                index++;
            }
        }

        System.out.println("Середній час окупності для кожної довжини смуги (за 20 прогонів):");
        int jVal = startJ;
        for (int i = 0; i < countJ; i++) {
            double avgProfit = profitSum[i] / 20.0;
            System.out.println("Довжина смуги " + jVal + ": " + avgProfit);
            jVal++;
        }
    }
    public static void getMeanValuesTest() throws ExceptionInvalidTimeDelay, ExceptionInvalidNetStructure {
        int MAX_TIME = 525600;
        int MIN_TIME = 1440;
        int step = 1440;

        int stripes = 3;
        int intensivity = 6;
        int serviceTime = 35;
        int refillTime = 70;
        int migrationTime = 140;

        ArrayList<Double> averageQueueLengths = new ArrayList<>();

        for (int i = MIN_TIME; i <= MAX_TIME; i += step) {
            double totalQueueLength = 0.0;

            for (int run = 0; run < 20; run++) {
                ArrayList<PetriSim> list = new ArrayList<>();
                list.add(new PetriSim(NetLibrary.VerificationModel(stripes, intensivity, serviceTime, refillTime, migrationTime)));
                PetriObjModel model = new PetriObjModel(list);
                model.setIsProtokol(false);
                model.go(i);
                double queueLength = model.getListObj().get(0).getNet().getListP()[7].getMean();

                totalQueueLength += queueLength;
            }

            double averageQueueLength = totalQueueLength / 20.0;
            averageQueueLengths.add(averageQueueLength);
        }

        writeDataToCsv(averageQueueLengths, "average_queue_lengths.csv");
    }


    private static void writeDataToCsv(ArrayList<Double> data, String fileName) {
        try (FileWriter writer = new FileWriter(fileName)) {
            writer.write("AverageQueueLength\n");

            for (Double value : data) {
                writer.write(value + "\n");
            }

            System.out.println("Дані записано: " + fileName);
        } catch (IOException e) {
            System.err.println("Помилка: " + e.getMessage());
        }
    }
}
