import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.TreeMap;

/**
 * The JDK's own text resources that Swing and AWT look up (their look and feels' strings: buttons of
 * option panes and file choosers, key names), for every locale the JDK has them in, as properties
 * files: OUT/<bundle base name>[_<locale>].properties. The port's ResourceBundle reads them
 * (web/games/freecol/assets/jdk). The bundles are compiled classes in the JDK image (from its
 * properties files), so they are read through ResourceBundle here.
 *   java JdkResources OUT_DIR
 */
public class JdkResources {
    static final String[] BUNDLES = { "com.sun.swing.internal.plaf.basic.resources.basic",
        "com.sun.swing.internal.plaf.metal.resources.metal", "sun.awt.resources.awt" };
    static final String[] LOCALES = { "", "de", "es", "fr", "it", "ja", "ko", "pt_BR", "sv", "zh_CN", "zh_HK", "zh_TW" };

    public static void main(String[] a) throws Exception {
        File out = new File(a[0]);
        out.mkdirs();
        for (String b : BUNDLES) {
            for (String l : LOCALES) {
                // the bundle class itself (a ListResourceBundle without a parent: its own keys only)
                ResourceBundle rb;
                try {
                    rb = (ResourceBundle) Class.forName(b + (l.isEmpty() ? "" : "_" + l)).getConstructor().newInstance();
                } catch (ClassNotFoundException e) {
                    continue;
                }
                TreeMap<String, String> map = new TreeMap<>();
                for (Enumeration<String> ks = rb.getKeys(); ks.hasMoreElements(); ) {
                    String k = ks.nextElement();
                    map.put(k, String.valueOf(rb.getObject(k)));
                }
                File f = new File(out, b + (l.isEmpty() ? "" : "_" + l) + ".properties");
                try (Writer w = new OutputStreamWriter(new FileOutputStream(f), StandardCharsets.UTF_8)) {
                    w.write("# " + b + " " + (l.isEmpty() ? "(default)" : l) + ", from the JDK (GPL-2.0 with the Classpath Exception)\n");
                    for (var e : map.entrySet()) w.write(esc(e.getKey(), true) + "=" + esc(e.getValue(), false) + "\n");
                }
            }
        }
        System.out.println("resources written");
        System.exit(0);
    }

    static String esc(String s, boolean key) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
            case '\\': sb.append("\\\\"); break;
            case '\n': sb.append("\\n"); break;
            case '\t': sb.append("\\t"); break;
            case '\r': sb.append("\\r"); break;
            case '=': case ':': case '#': case '!': sb.append(key ? "\\" + c : String.valueOf(c)); break;
            case ' ': sb.append(key || i == 0 ? "\\ " : " "); break;
            default: sb.append(c);
            }
        }
        return sb.toString();
    }
}
