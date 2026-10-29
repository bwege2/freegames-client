import java.io.File;
import java.io.StringWriter;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Locale;

import net.sf.freecol.FreeCol;
import net.sf.freecol.common.i18n.Messages;
import net.sf.freecol.common.io.FreeColDirectories;
import net.sf.freecol.common.io.FreeColRules;
import net.sf.freecol.common.io.FreeColXMLWriter;
import net.sf.freecol.common.model.Specification;

/**
 * The rules oracle: the original reads a rule set (data/rules/RULES/specification.xml and what it
 * extends), prepares it for a difficulty level as a new game does, and serializes it. The port must
 * produce the same text (test/rules.test.ts).
 *   java -cp FreeCol.jar:CLASSES SpecDump DATA_DIR OUT_DIR RULES:DIFFICULTY...
 * Writes OUT_DIR/RULES-DIFFICULTY.xml.
 */
public class SpecDump {
    public static void main(String[] a) throws Exception {
        try {
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
                String[] rd = a[i].split(":");
                Specification spec = FreeCol.loadSpecification(FreeColRules.getFreeColRulesFile(rd[0]), null,
                    "model.difficulty." + rd[1]);
                File f = new File(out, rd[0] + "-" + rd[1] + ".xml");
                StringWriter sw = new StringWriter();
                FreeColXMLWriter xw = new FreeColXMLWriter(sw, FreeColXMLWriter.WriteScope.toSave());
                // Specification.toXML is protected: the savegame writer calls it from the package
                Method m = Specification.class.getDeclaredMethod("toXML", FreeColXMLWriter.class);
                m.setAccessible(true);
                m.invoke(spec, xw);
                xw.close();
                Files.writeString(f.toPath(), sw.toString(), StandardCharsets.UTF_8);
                System.out.println("wrote " + f + " " + f.length());
            }
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(2);
        }
        System.exit(0);
    }
}
