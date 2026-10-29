import java.awt.Font;
import java.awt.FontMetrics;
import java.io.File;
import java.io.PrintWriter;

import javax.swing.JLabel;

/**
 * Java2D's font metrics as Swing measures text (JComponent.getFontMetrics), for the logical fonts
 * (DejaVu behind them, oracle/run.sh) and FreeCol's own font, at the sizes and styles FreeCol uses: the
 * port's font metrics are checked against OUT/fonts.txt (test/fonts.test.ts).
 *   java ... FontProbe OUT_DIR
 */
public class FontProbe {
    public static void main(String[] a) throws Exception {
        File out = new File(a[0]);
        out.mkdirs();
        JLabel label = new JLabel();
        Font shadowed = Font.createFont(Font.TRUETYPE_FONT,
            new File("data/base/resources/fonts/ShadowedBlack.ttf"));
        try (PrintWriter pw = new PrintWriter(new File(out, "fonts.txt"), "UTF-8")) {
            String[] names = { "Dialog", "Serif", "SansSerif", "Monospaced", "ShadowedBlack" };
            for (String name : names) {
                for (int style = 0; style < 4; style++) {
                    for (float size : new float[] { 8, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 48 }) {
                        Font f = name.equals("ShadowedBlack") ? shadowed.deriveFont(style, size) : new Font(name, style, Math.round(size));
                        FontMetrics m = label.getFontMetrics(f);
                        pw.print(name + " " + style + " " + size + " family=" + f.getFamily() + " ascent=" + m.getAscent()
                            + " descent=" + m.getDescent() + " leading=" + m.getLeading() + " height=" + m.getHeight()
                            + " maxAdvance=" + m.getMaxAdvance() + " widths=");
                        for (int c = 32; c < 384; c++) {
                            if (c > 32) pw.print(',');
                            pw.print(f.canDisplay(c) ? m.charWidth(c) : -1);
                        }
                        pw.print(" text=" + m.stringWidth("Colonization of the New World, 1492: Fort Oranje"));
                        pw.println();
                    }
                }
            }
        }
        System.out.println("fonts written");
        System.exit(0);
    }
}
