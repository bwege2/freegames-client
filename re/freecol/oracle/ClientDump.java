import java.awt.Component;
import java.awt.Container;
import java.awt.Font;
import java.awt.Frame;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.PrintWriter;
import java.util.concurrent.atomic.AtomicReference;

import javax.imageio.ImageIO;
import javax.swing.AbstractButton;
import javax.swing.JLabel;
import javax.swing.SwingUtilities;
import javax.swing.text.JTextComponent;

/**
 * The client oracle (step 4): the original FreeCol client, started as a player starts it (no intro, no
 * sound, windowed), under Xvfb with the DejaVu fonts (oracle/run.sh). When the screen named by SCREEN is
 * up it writes the Swing component tree (class, bounds, visibility, text, font, preferred size) to
 * OUT/SCREEN.tree and the screen's pixels to OUT/SCREEN.png; the port's client writes the same tree, and
 * test/client.test.ts compares them.
 *   java ... ClientDump DATA_DIR OUT_DIR WIDTHxHEIGHT [SCREEN [click=TEXT|wait=CLASS]...]
 * SCREEN names the output; the steps after it lead from the main menu to the screen (main: none; sleep=MS
 * waits). Also writes the keyboard's focus owner and focused window to OUT/SCREEN.focus.
 */
public class ClientDump {
    public static void main(String[] a) throws Exception {
        String data = a[0];
        File out = new File(a[1]);
        String size = a[2];
        String screen = a.length > 3 ? a[3] : "main";
        for (String d : new String[] { "c", "d", "k" }) new File(out, d).mkdirs();
        Thread t = new Thread(() -> net.sf.freecol.FreeCol.main(new String[] {
            "--freecol-data", data,
            "--user-config-directory", new File(out, "c").getPath(),
            "--user-data-directory", new File(out, "d").getPath(),
            "--user-cache-directory", new File(out, "k").getPath(),
            "--default-locale", "en_US", "--no-intro", "--no-splash", "--no-sound",
            "--no-memory-check", "--no-java-check", "--windowed", size }), "FreeCol main");
        t.setDaemon(true);
        t.start();
        Frame shown = waitFor("net.sf.freecol.client.gui.panel.MainPanel", 120_000);
        Thread.sleep(1500); // let painting settle
        // the steps to the screen: click=TEXT clicks the showing button with that text (the window's mouse events), wait=CLASS waits for a
        // showing component of that class
        for (int i = 4; i < a.length; i++) {
            System.out.println("step " + a[i]);
            if (a[i].startsWith("click=")) {
                String text = a[i].substring(6);
                AtomicReference<AbstractButton> b = new AtomicReference<>();
                SwingUtilities.invokeAndWait(() -> {
                    for (Frame f : Frame.getFrames()) if (b.get() == null) b.set(button(f, text));
                });
                if (b.get() == null) throw new IllegalStateException("no button " + text);
                // a click as the player makes it: the window under the mouse gets the mouse's events (moved,
                // pressed, released, clicked), as the toolkit makes them from the X server's
                SwingUtilities.invokeAndWait(() -> {
                    java.awt.Component c = b.get();
                    java.awt.Window w = SwingUtilities.getWindowAncestor(c);
                    java.awt.Point p = SwingUtilities.convertPoint(c, c.getWidth() / 2, c.getHeight() / 2, w);
                    java.awt.Point s = new java.awt.Point(p);
                    SwingUtilities.convertPointToScreen(s, w);
                    java.awt.EventQueue q = java.awt.Toolkit.getDefaultToolkit().getSystemEventQueue();
                    long when = System.currentTimeMillis();
                    int[][] evs = { { java.awt.event.MouseEvent.MOUSE_MOVED, 0, 0 },
                        { java.awt.event.MouseEvent.MOUSE_PRESSED, java.awt.event.InputEvent.BUTTON1_DOWN_MASK, 1 },
                        { java.awt.event.MouseEvent.MOUSE_RELEASED, 0, 1 }, { java.awt.event.MouseEvent.MOUSE_CLICKED, 0, 1 } };
                    for (int[] e : evs) {
                        q.postEvent(new java.awt.event.MouseEvent(w, e[0], when, e[1], p.x, p.y, s.x, s.y, e[2], false,
                            e[0] == java.awt.event.MouseEvent.MOUSE_MOVED ? 0 : java.awt.event.MouseEvent.BUTTON1));
                    }
                });
            } else if (a[i].startsWith("wait=")) {
                shown = waitFor(a[i].substring(5), 120_000);
                Thread.sleep(1500);
            } else if (a[i].startsWith("sleep=")) {
                Thread.sleep(Long.parseLong(a[i].substring(6)));
            }
        }
        final Frame frame = shown;
        AtomicReference<String> tree = new AtomicReference<>();
        SwingUtilities.invokeAndWait(() -> {
            StringBuilder sb = new StringBuilder();
            dump(frame, 0, sb);
            tree.set(sb.toString());
        });
        try (PrintWriter pw = new PrintWriter(new File(out, screen + ".tree"), "UTF-8")) {
            pw.print(tree.get());
        }
        // the keyboard's focus: owner and focused window (where the keys go)
        AtomicReference<String> focus = new AtomicReference<>();
        SwingUtilities.invokeAndWait(() -> {
            java.awt.KeyboardFocusManager k = java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager();
            focus.set("owner " + (k.getFocusOwner() == null ? "null" : k.getFocusOwner().getClass().getName()) + "\nwindow "
                + (k.getFocusedWindow() == null ? "null" : k.getFocusedWindow().getClass().getName()) + "\n");
        });
        try (PrintWriter pw = new PrintWriter(new File(out, screen + ".focus"), "UTF-8")) {
            pw.print(focus.get());
        }
        Rectangle r = frame.getBounds();
        // the frame painted into an image, as Swing paints it on the screen
        BufferedImage img = new BufferedImage(r.width, r.height, BufferedImage.TYPE_INT_RGB);
        SwingUtilities.invokeAndWait(() -> {
            java.awt.Graphics2D g = img.createGraphics();
            frame.paint(g);
            g.dispose();
        });
        ImageIO.write(img, "png", new File(out, screen + ".png"));
        System.out.println("dumped " + screen + " " + r);
        System.exit(0);
    }

    /** Waits until a showing component of the class is in some frame. */
    static Frame waitFor(String cls, long ms) throws Exception {
        long end = System.currentTimeMillis() + ms;
        while (System.currentTimeMillis() < end) {
            AtomicReference<Frame> found = new AtomicReference<>();
            SwingUtilities.invokeAndWait(() -> {
                for (Frame f : Frame.getFrames()) if (f.isShowing() && find(f, cls)) found.set(f);
            });
            if (found.get() != null) return found.get();
            Thread.sleep(200);
        }
        throw new IllegalStateException("no " + cls + " within " + ms + " ms");
    }

    static AbstractButton button(Component c, String text) {
        if (c instanceof AbstractButton && c.isShowing() && text.equals(((AbstractButton) c).getText())) return (AbstractButton) c;
        if (c instanceof Container) {
            for (Component k : ((Container) c).getComponents()) {
                AbstractButton b = button(k, text);
                if (b != null) return b;
            }
        }
        return null;
    }

    static boolean find(Component c, String cls) {
        if (c.getClass().getName().equals(cls) && c.isShowing()) return true;
        if (c instanceof Container) for (Component k : ((Container) c).getComponents()) if (find(k, cls)) return true;
        return false;
    }

    static void dump(Component c, int depth, StringBuilder sb) {
        for (int i = 0; i < depth; i++) sb.append("  ");
        Rectangle b = c.getBounds();
        sb.append(c.getClass().getName()).append(' ').append(b.x).append(',').append(b.y).append(' ')
            .append(b.width).append('x').append(b.height);
        if (!c.isVisible()) sb.append(" hidden");
        java.awt.Dimension p = c.getPreferredSize();
        sb.append(" pref ").append(p.width).append('x').append(p.height);
        Font f = c.getFont();
        if (f != null) sb.append(" font ").append(f.getFamily()).append('/').append(f.getStyle()).append('/').append(f.getSize2D());
        String text = c instanceof JLabel ? ((JLabel) c).getText() : c instanceof AbstractButton ? ((AbstractButton) c).getText()
            : c instanceof JTextComponent ? ((JTextComponent) c).getText() : null;
        if (text != null && !text.isEmpty()) sb.append(" \"").append(text.replace("\n", "\\n")).append('"');
        sb.append('\n');
        if (c instanceof Container) for (Component k : ((Container) c).getComponents()) dump(k, depth + 1, sb);
    }
}
