public class Create extends Element {
    public Create(double delay) {
        super(delay);
        super.setTnext(0.0); // імітація розпочнеться з події Task12.Create
    }

    @Override
    public void outAct() {
        super.outAct();
        super.setTnext(super.getTcurr() + super.getDelay());
        super.getNextElement().inAct();
    }
}