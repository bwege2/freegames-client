import java.io.File;
import java.util.Locale;

import net.sf.freecol.common.i18n.Messages;
import net.sf.freecol.common.io.FreeColDirectories;
import net.sf.freecol.common.io.FreeColRules;
import net.sf.freecol.common.io.FreeColSavegameFile;
import net.sf.freecol.server.FreeColServer;

/**
 * The load/save oracle: the original FreeCol 1.2.0 server loads each savegame and saves it again, as
 * the server does when a saved game is continued and saved. The port must write the same
 * savegame.xml from the same input (test/roundtrip.test.ts).
 *   java -cp FreeCol.jar:CLASSES RoundTrip DATA_DIR OUT_DIR SAVE.fsg...
 * Writes OUT_DIR/NAME (the re-saved game) for each SAVE.
 */
public class RoundTrip {
    public static void main(String[] a) throws Exception {
        try {
            run(a);
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(2);
        }
        System.exit(0);
    }

    static void run(String[] a) throws Exception {
        File out = new File(a[1]);
        for (String d : new String[] { "c", "d", "k" }) new File(out, "user/" + d).mkdirs();
        FreeColDirectories.setDataDirectory(a[0]);
        FreeColDirectories.setUserConfigDirectory(new File(out, "user/c").getPath());
        FreeColDirectories.setUserDataDirectory(new File(out, "user/d").getPath());
        FreeColDirectories.setUserCacheDirectory(new File(out, "user/k").getPath());
        FreeColDirectories.setUserDirectories();
        Messages.loadMessageBundle(Locale.US);
        FreeColRules.loadRules();
        for (int i = 2; i < a.length; i++) {
            File in = new File(a[i]);
            FreeColServer server = new FreeColServer(new FreeColSavegameFile(in), null, null, 0, "oracle");
            File dst = new File(out, in.getName());
            server.saveGame(dst, null, null);
            server.shutdown();
            System.out.println("saved " + dst + " " + dst.length());
        }
    }
}
