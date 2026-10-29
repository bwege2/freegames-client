package freegames.probe;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The runtime oracle: what the translated FreeCol code relies on from the Java library, exercised and
 * printed. The original prints this on the JVM (oracle/run.sh JreProbe); the test translates this same
 * file with j2ts and prints it in the port's runtime: the texts must be equal (test/jre.test.ts).
 * HashMap and HashSet orders (list and tree bins, resizing, removal), Random, float and double printing,
 * string hashes, integer and float arithmetic, sorting, shuffling, PriorityQueue, streams.
 */
public class JreProbe {
    private final StringBuilder out = new StringBuilder();

    private void p(String s) {
        out.append(s).append('\n');
    }

    public static String run() {
        JreProbe j = new JreProbe();
        j.random();
        j.numbers();
        j.strings();
        j.hashMaps();
        j.treeBins();
        j.sets();
        j.queues();
        j.sorting();
        j.streams();
        return j.out.toString();
    }

    public static void main(String[] args) {
        System.out.print(run());
    }

    private void random() {
        Random r = new Random(42);
        StringBuilder sb = new StringBuilder("random:");
        for (int i = 0; i < 5; i++) sb.append(' ').append(r.nextInt());
        for (int i = 0; i < 5; i++) sb.append(' ').append(r.nextInt(100));
        for (int i = 0; i < 5; i++) sb.append(' ').append(r.nextInt(7));
        for (int i = 0; i < 5; i++) sb.append(' ').append(r.nextInt(1 << 20));
        sb.append(' ').append(r.nextInt(Integer.MAX_VALUE));
        r.nextLong(); // a long beyond 2^53: the port keeps longs in doubles (NOTES.md)
        sb.append(' ').append(r.nextDouble());
        sb.append(' ').append(r.nextFloat());
        sb.append(' ').append(r.nextBoolean());
        sb.append(' ').append(r.nextGaussian());
        sb.append(' ').append(r.nextGaussian());
        int[] xs = r.ints(8, 0, 10).toArray();
        for (int x : xs) sb.append(' ').append(x);
        xs = r.ints(4, -5, 1000).toArray();
        for (int x : xs) sb.append(' ').append(x);
        p(sb.toString());
        Random s = new Random(-7L);
        p("random(-7): " + s.nextInt(1000) + " " + s.nextInt() + " " + new Random(123456789012L).nextInt(50));
    }

    private void numbers() {
        float[] fs = { 0.1f, 1.1f, 2.0f, -33.0f, -12.5f, 1e7f, 9999999f, 1.0e-3f, 9.9e-4f, 3.14159f, 1f / 3, 2f / 3,
            100.5f, 0.0f, -0.0f, 16777217f, 1.4e-45f, 3.4028235e38f, 0.3f, 66.66f };
        StringBuilder sb = new StringBuilder("floats:");
        for (float f : fs) sb.append(' ').append(f);
        p(sb.toString());
        double[] ds = { 0.1, 1.0 / 3, 2.0, 100.5, 1e21, 1e7, 9999999.999, 123456789.0, 0.001, 0.0001, -0.0, 1e-300,
            4.9e-324, 1.7976931348623157e308, 0.1 + 0.2, 2.0 / 3, 66.66 };
        sb = new StringBuilder("doubles:");
        for (double d : ds) sb.append(' ').append(d);
        p(sb.toString());
        sb = new StringBuilder("int arithmetic:");
        int[] as = { 7, -7, 2147483647, -2147483648, 0, 13 };
        int[] bs = { 2, -2, 3, -1, 5 };
        for (int a : as) for (int b : bs) sb.append(' ').append(a / b).append('/').append(a % b).append('/').append(a * b).append('/').append(a + b);
        p(sb.toString());
        sb = new StringBuilder("rounding:");
        double[] rs = { 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 0.49999999999999994, 1e10, -1e10, 2.6, -2.6 };
        for (double d : rs) sb.append(' ').append(Math.round(d)).append('/').append(Math.round((float) d)).append('/').append((int) d).append('/').append((int) Math.floor(d)).append('/').append((long) d);
        p(sb.toString());
        float acc = 0;
        for (int i = 0; i < 100; i++) acc += 0.1f * i / 3;
        float m = 1;
        for (int i = 1; i < 30; i++) m *= 1.07f;
        p("float arithmetic: " + acc + " " + m + " " + (acc / 7) + " " + (int) (acc * 1.5f) + " " + (float) Math.sqrt(acc));
        p("hash of numbers: " + Integer.valueOf(-5).hashCode() + " " + Double.valueOf(2.5).hashCode() + " " + Float.floatToIntBits(2.5f)
            + " " + Long.valueOf(1L << 40).hashCode() + " " + Boolean.TRUE.hashCode());
        p("compare: " + Double.compare(0.0, -0.0) + " " + Float.compare(Float.NaN, 1f) + " " + Integer.compare(3, -3));
        Object od = 2.0;
        Object of = 1.5f;
        Double dd = 0.0;
        List<Double> ld = new ArrayList<>();
        ld.add(3.0);
        ld.add(dd + 1);
        Map<String, Float> mf = new HashMap<>();
        mf.put("x", 2f);
        double sum = 0;
        for (Double x : ld) sum += x;
        p("boxed: " + od + " " + of + " " + dd + " " + ld + " " + mf + " " + sum + " " + (dd == 0) + " " + Double.valueOf(4) + " " + od.equals(2.0) + " " + od.hashCode());
        p("parse: " + Integer.parseInt("-123") + " " + Double.parseDouble("1.5e3") + " " + Float.parseFloat("0.1") + " " + Integer.toString(255, 16));
    }

    private void strings() {
        String[] ss = { "", "a", "tile:1234", "model.unit.freeColonist", "Ä€ö ✓", "AaAaAa", "BBBBBB", "player:19" };
        StringBuilder sb = new StringBuilder("string hashes:");
        for (String s : ss) sb.append(' ').append(s.hashCode());
        p(sb.toString());
        p("compareTo: " + "abc".compareTo("abd") + " " + "abc".compareTo("ab") + " " + "B".compareTo("a") + " " + "Ä".compareTo("Z"));
        p("split: " + String.join("|", "a,b,,c,,".split(",")) + " / " + String.join("|", " x  y z ".trim().split("\\s+"))
            + " / " + "a.b.c".split("\\.").length + " / " + String.join("|", "k=v=w".split("=", 2)));
        p("format: " + String.format("%d %5d %-4s| %.2f %s %03d %x", 42, 7, "ab", 3.14159, true, 5, 255));
        p("case: " + "Hello World".toLowerCase() + " " + "hello".toUpperCase() + " " + "  trim  ".trim() + "|");
        p("replace: " + "a.b.c".replace('.', '/') + " " + "aaa".replace("aa", "b") + " " + "x1y22z".replaceAll("[0-9]+", "#"));
        p("chars: " + (char) ('a' + 2) + " " + (int) 'A' + " " + Character.isDigit('5') + " " + Character.toUpperCase('q') + " " + "abc".charAt(1));
    }

    private static String keys(Map<String, Integer> m) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Integer> e : m.entrySet()) sb.append(e.getKey()).append('=').append(e.getValue()).append(' ');
        return sb.toString().trim();
    }

    private void hashMaps() {
        Random r = new Random(3);
        HashMap<String, Integer> m = new HashMap<>();
        for (int i = 0; i < 200; i++) m.put("tile:" + r.nextInt(3000), i);
        p("hashmap 200: " + keys(m));
        for (int i = 0; i < 150; i++) m.remove("tile:" + r.nextInt(3000));
        Iterator<String> it = m.keySet().iterator();
        while (it.hasNext()) if (it.next().hashCode() % 3 == 0) it.remove();
        p("hashmap removed: " + keys(m));
        for (int i = 0; i < 60; i++) m.computeIfAbsent("unit:" + r.nextInt(500), k -> k.length());
        for (int i = 0; i < 60; i++) m.merge("good:" + r.nextInt(20), 1, Integer::sum);
        m.putIfAbsent("unit:1", 99);
        m.compute("good:3", (k, v) -> v == null ? -1 : v * 10);
        p("hashmap compute: " + keys(m));
        HashMap<String, Integer> copy = new HashMap<>(m);
        p("hashmap copy: " + keys(copy));
        HashMap<String, Integer> small = new HashMap<>(4);
        for (int i = 0; i < 30; i++) small.put("k" + (i * 37 % 101), i);
        p("hashmap(4): " + keys(small));
        small.clear();
        for (int i = 0; i < 5; i++) small.put("z" + i, i);
        p("hashmap cleared: " + keys(small));
        LinkedHashMap<String, Integer> lm = new LinkedHashMap<>();
        for (int i = 0; i < 20; i++) lm.put("x" + r.nextInt(30), i);
        lm.remove("x3");
        p("linkedhashmap: " + keys(lm));
        TreeMap<String, Integer> tm = new TreeMap<>(m);
        p("treemap: " + tm.firstKey() + " " + tm.lastKey() + " " + tm.size());
        Map<Integer, List<String>> groups = m.keySet().stream().collect(Collectors.groupingBy(String::length));
        StringBuilder sb = new StringBuilder("grouping:");
        for (Map.Entry<Integer, List<String>> e : groups.entrySet()) sb.append(' ').append(e.getKey()).append(':').append(e.getValue().size());
        p(sb.toString());
    }

    /** Keys with equal hash codes ("Aa" and "BB" hash alike) fill one bin: a tree in a table of 64 or more. */
    private void treeBins() {
        List<String> same = new ArrayList<>();
        for (int i = 0; i < 64; i++) {
            StringBuilder sb = new StringBuilder();
            for (int b = 0; b < 6; b++) sb.append(((i >> b) & 1) == 0 ? "Aa" : "BB");
            same.add(sb.toString());
        }
        Random r = new Random(11);
        Collections.shuffle(same, r);
        HashMap<String, Integer> m = new HashMap<>();
        for (int i = 0; i < 70; i++) m.put("f" + i, i);
        for (int i = 0; i < 40; i++) m.put(same.get(i), i);
        p("tree bin: " + keys(m));
        for (int i = 0; i < 40; i += 3) m.remove(same.get(i));
        p("tree bin removed: " + keys(m));
        for (int i = 70; i < 300; i++) m.put("f" + i, i);
        p("tree bin resized: " + keys(m));
        for (int i = 1; i < 40; i += 2) m.remove(same.get(i));
        p("tree bin untreeified: " + keys(m));
        for (int i = 40; i < 64; i++) m.computeIfAbsent(same.get(i), k -> 7);
        p("tree bin computed: " + keys(m));
    }

    private void sets() {
        Random r = new Random(5);
        List<String> xs = new ArrayList<>();
        for (int i = 0; i < 40; i++) xs.add("colony:" + r.nextInt(200));
        Set<String> s = new HashSet<>(xs);
        p("hashset: " + String.join(" ", s));
        Set<String> t = new HashSet<>();
        for (String x : xs) t.add(x.toUpperCase());
        t.removeIf(x -> x.endsWith("7"));
        p("hashset added: " + String.join(" ", t));
        Set<Integer> ints = new HashSet<>();
        for (int i = 0; i < 30; i++) ints.add(r.nextInt(1000) - 300);
        StringBuilder sb = new StringBuilder("integer set:");
        for (int i : ints) sb.append(' ').append(i);
        p(sb.toString());
    }

    private void queues() {
        Random r = new Random(9);
        PriorityQueue<Integer> q = new PriorityQueue<>(Comparator.comparingInt((Integer x) -> x % 10).thenComparing(Comparator.reverseOrder()));
        for (int i = 0; i < 25; i++) q.add(r.nextInt(100));
        q.remove(Integer.valueOf(q.toArray()[5].toString()));
        StringBuilder sb = new StringBuilder("priority queue:");
        for (Integer x : q) sb.append(' ').append(x);
        sb.append(" /");
        while (!q.isEmpty()) sb.append(' ').append(q.poll());
        p(sb.toString());
    }

    private void sorting() {
        Random r = new Random(13);
        List<String> l = new ArrayList<>();
        for (int i = 0; i < 30; i++) l.add((char) ('a' + r.nextInt(5)) + "" + i);
        List<String> byFirst = new ArrayList<>(l);
        byFirst.sort(Comparator.comparing((String x) -> x.charAt(0)));
        p("stable sort: " + String.join(" ", byFirst));
        Collections.shuffle(l, new Random(1));
        p("shuffled: " + String.join(" ", l));
        Collections.sort(l);
        p("sorted: " + String.join(" ", l));
        Collections.reverse(l);
        p("max/min: " + Collections.max(l) + " " + Collections.min(l, Comparator.comparing(String::length)));
    }

    private void streams() {
        List<Integer> xs = new ArrayList<>();
        for (int i = 0; i < 20; i++) xs.add((i * 7) % 13);
        p("streams: " + xs.stream().filter(x -> x > 3).map(x -> x * 2).collect(Collectors.toList())
            + " " + xs.stream().mapToInt(Integer::intValue).sum()
            + " " + xs.stream().distinct().count()
            + " " + xs.stream().max(Comparator.naturalOrder()).get()
            + " " + xs.stream().sorted(Comparator.reverseOrder()).limit(3).collect(Collectors.toList())
            + " " + xs.stream().map(String::valueOf).collect(Collectors.joining(",", "[", "]"))
            + " " + xs.stream().collect(Collectors.toSet()));
    }
}
