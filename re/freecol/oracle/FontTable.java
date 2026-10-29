import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.font.FontRenderContext;
import java.awt.font.LineMetrics;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;

import javax.swing.JLabel;

/**
 * Java2D's text metrics as Swing lays out text (JComponent.getFontMetrics: integer advances, hinted, no
 * antialiasing), for the fonts FreeCol's client uses: the logical fonts (DejaVu behind them, oracle/run.sh)
 * and FreeCol's ShadowedBlack, every style, sizes MIN..MAX, for the characters in RANGES. Advances of
 * hinted glyphs at small sizes are the font's hinting program's; the port lays text out with this table
 * (web/games/freecol/src/port/client/fonts.ts) and computes what is not in it from the font's own advances.
 *   java ... FontTable OUT_FILE
 * Format (big-endian): "JFM1", u16 fonts, u16 styles, u16 min size, u16 max size, u16 ranges, ranges as
 * u16 pairs [first, last]; then for each font, style, size: i16 ascent, descent, leading, maxAdvance;
 * f32 line metrics ascent, descent, leading, strikethrough offset, strikethrough thickness, underline
 * offset, underline thickness; then one u8 advance per character of the ranges (255: cannot display).
 */
public class FontTable {
    static final String[] FONTS = { "Dialog", "Serif", "Monospaced", "ShadowedBlack" };
    static final int MIN = 6, MAX = 48;
    static final int[][] RANGES = { { 0x20, 0x24f }, { 0x2000, 0x206f }, { 0x20a0, 0x20bf }, { 0x2100, 0x215f },
        { 0x2190, 0x21ff }, { 0x2200, 0x22ff }, { 0x2500, 0x25ff } };

    public static void main(String[] a) throws Exception {
        JLabel label = new JLabel();
        Font shadowed = Font.createFont(Font.TRUETYPE_FONT, new File("data/base/resources/fonts/ShadowedBlack.ttf"));
        FontRenderContext frc = new FontRenderContext(null, false, false);
        try (DataOutputStream out = new DataOutputStream(new BufferedOutputStream(new FileOutputStream(a[0])))) {
            out.writeBytes("JFM1");
            out.writeShort(FONTS.length);
            out.writeShort(4);
            out.writeShort(MIN);
            out.writeShort(MAX);
            out.writeShort(RANGES.length);
            for (int[] r : RANGES) {
                out.writeShort(r[0]);
                out.writeShort(r[1]);
            }
            for (String name : FONTS) {
                for (int style = 0; style < 4; style++) {
                    for (int size = MIN; size <= MAX; size++) {
                        Font f = name.equals("ShadowedBlack") ? shadowed.deriveFont(style, (float)size) : new Font(name, style, size);
                        FontMetrics m = label.getFontMetrics(f);
                        out.writeShort(m.getAscent());
                        out.writeShort(m.getDescent());
                        out.writeShort(m.getLeading());
                        out.writeShort(m.getMaxAdvance());
                        LineMetrics lm = f.getLineMetrics("Xg", frc);
                        out.writeFloat(lm.getAscent());
                        out.writeFloat(lm.getDescent());
                        out.writeFloat(lm.getLeading());
                        out.writeFloat(lm.getStrikethroughOffset());
                        out.writeFloat(lm.getStrikethroughThickness());
                        out.writeFloat(lm.getUnderlineOffset());
                        out.writeFloat(lm.getUnderlineThickness());
                        for (int[] r : RANGES) {
                            for (int c = r[0]; c <= r[1]; c++) {
                                int w = f.canDisplay(c) ? m.charWidth(c) : 255;
                                out.writeByte(Math.min(w, 255));
                            }
                        }
                    }
                }
            }
        }
        System.out.println("font table written");
        System.exit(0);
    }
}
