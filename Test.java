public class Test {
    public static void main(String[] args) {
        System.out.println(addOne(1));
        System.out.println(addOne(2));
        int addedOne = addOne(3);
        System.out.println(addedOne);
        System.out.println(addOne(addedOne));
    }

    public static int addOne(int num) {
        return num + 1;
    }
}