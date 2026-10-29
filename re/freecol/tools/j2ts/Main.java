import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;

import com.sun.source.tree.CompilationUnitTree;
import com.sun.tools.javac.api.JavacTaskImpl;
import com.sun.tools.javac.api.JavacTool;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.JCTree.JCClassDecl;
import com.sun.tools.javac.tree.JCTree.JCCompilationUnit;

/**
 * j2ts: FreeCol's Java source to TypeScript (re/freecol/NOTES.md, "The translator").
 *
 *   java [exports] Main --src SRC_DIR --cp JARS --out OUT_DIR --jre REL_JRE_DIR --emit PREFIX[,PREFIX...]
 *        [--exclude PREFIX[,...]] [--report FILE]
 *
 * Compiles every .java under SRC_DIR with javac (parse, attribute, flow; nothing is generated), so that
 * every name, overload and type is resolved as javac resolves it, then writes one TypeScript module per
 * top-level class whose qualified name starts with an --emit prefix, OUT_DIR/a/b/C.ts for a.b.C, and
 * OUT_DIR/index.ts, which loads, links and initializes them. --report writes every member of the Java
 * library the emitted code uses (what the runtime in --jre must provide).
 */
public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> opt = new LinkedHashMap<>();
        for (int i = 0; i + 1 < args.length; i += 2) opt.put(args[i], args[i + 1]);
        Path out = Path.of(opt.get("--out"));
        String cp = opt.getOrDefault("--cp", "");
        String[] emit = opt.get("--emit").split(",");
        String[] exclude = opt.containsKey("--exclude") ? opt.get("--exclude").split(",") : new String[0];
        String jre = opt.getOrDefault("--jre", "jre");

        List<File> files = new ArrayList<>();
        for (String srcDir : opt.get("--src").split(",")) {
            try (var s = Files.walk(Path.of(srcDir))) {
                s.filter(p -> p.toString().endsWith(".java")).sorted().forEach(p -> files.add(p.toFile()));
            }
        }
        // --patch MODULE=DIR,...: the JDK's own sources for these modules, compiled as part of them
        List<String> patches = new ArrayList<>();
        if (opt.containsKey("--patch")) {
            for (String pm : opt.get("--patch").split(",")) {
                patches.add(pm);
                Path dir = Path.of(pm.substring(pm.indexOf('=') + 1));
                try (var s = Files.walk(dir)) {
                    s.filter(p -> p.toString().endsWith(".java")).sorted().forEach(p -> files.add(p.toFile()));
                }
            }
        }
        JavacTool tool = JavacTool.create();
        DiagnosticCollector<JavaFileObject> diags = new DiagnosticCollector<>();
        StandardJavaFileManager fm = tool.getStandardFileManager(diags, null, StandardCharsets.UTF_8);
        List<String> jopts = new ArrayList<>(List.of("-proc:none", "-encoding", "UTF-8", "-Xlint:none",
            "-nowarn", "-implicit:none"));
        if (patches.isEmpty()) {
            jopts.addAll(List.of("--release", "11"));
        } else {
            // patched modules are compiled against the running JDK (--release cannot patch)
            // javac patches one module when it also compiles sources of the unnamed module
            // (and puts those sources into the patched module too: it reads what they need)
            for (String pm : patches) {
                jopts.add("--patch-module");
                jopts.add(pm);
                jopts.add("--add-reads");
                jopts.add(pm.substring(0, pm.indexOf('=')) + "=ALL-UNNAMED,java.logging,java.xml,java.prefs,java.sql,java.management,java.naming");
            }
            jopts.addAll(List.of("--add-modules", "ALL-SYSTEM"));
            jopts.addAll(List.of("-Xmaxerrs", "100000"));
        }
        if (!cp.isEmpty()) { jopts.add("-cp"); jopts.add(cp); }
        JavacTaskImpl task = (JavacTaskImpl) tool.getTask(null, fm, diags, jopts, null,
            fm.getJavaFileObjectsFromFiles(files));
        List<JCCompilationUnit> units = new ArrayList<>();
        // a task listener makes javac keep doc comments (JavaCompiler.parse), which the output keeps
        task.addTaskListener(new com.sun.source.util.TaskListener() {});
        for (CompilationUnitTree cu : task.parse()) units.add((JCCompilationUnit) cu);
        task.analyze();
        int errors = 0;
        for (Diagnostic<? extends JavaFileObject> d : diags.getDiagnostics()) {
            if (d.getKind() == Diagnostic.Kind.ERROR) {
                errors++;
                if (errors < 30) System.err.println(d);
            }
        }
        if (errors > 0) {
            System.err.println(errors + " javac errors");
            System.exit(1);
        }
        System.err.println("javac: " + units.size() + " units attributed");

        Program prog = new Program(task.getContext(), units);
        Names names = new Names(prog);
        names.compute();
        if (opt.containsKey("--partial")) {
            // --partial PREFIX,...: these classes are translated only as far as the rest reaches them
            Reach reach = new Reach(prog, opt.get("--partial").split(","));
            List<ClassSymbol> roots = new ArrayList<>();
            for (ClassSymbol c : prog.decls.keySet()) {
                String q = prog.outermost(c).getQualifiedName().toString();
                if (matches(q, emit) && !matches(q, exclude) && !reach.isPartial(c) && !prog.isLocal(c)) roots.add(c);
            }
            reach.run(roots, opt.containsKey("--roots") ? Path.of(opt.get("--roots")) : null);
            prog.reach = reach;
            System.err.println("reach: " + reach.methods.size() + " methods, " + reach.instantiated.size()
                + " classes instantiated, " + reach.used.size() + " used");
            if (opt.containsKey("--reach-report")) {
                // per partial class: reached methods (and why the class is there)
                TreeMap<String, List<String>> rep = new TreeMap<>();
                for (ClassSymbol c : prog.decls.keySet()) {
                    if (!reach.isPartial(c) || !reach.emits(c)) continue;
                    List<String> ms = new ArrayList<>();
                    for (Symbol.MethodSymbol m : reach.methods) if (m.owner == c) ms.add(m.toString());
                    String why = (reach.instantiated.contains(c) ? "new " : "") + (reach.initialized.contains(c) ? "init " : "")
                        + (reach.reflective.contains(c) ? "reflect " : "");
                    rep.put(c.flatname.toString(), ms);
                    rep.get(c.flatname.toString()).add(0, "[" + why.trim() + "] " + ms.size());
                }
                StringBuilder sb = new StringBuilder();
                for (Map.Entry<String, List<String>> e : rep.entrySet()) {
                    sb.append(e.getKey()).append(' ').append(e.getValue().get(0)).append('\n');
                    for (String m : e.getValue().subList(1, e.getValue().size())) sb.append("    ").append(m).append('\n');
                }
                Files.writeString(Path.of(opt.get("--reach-report")), sb.toString());
            }
        }

        TreeMap<String, String> written = new TreeMap<>();
        TreeSet<String> libUse = new TreeSet<>();
        int failed = 0;
        for (JCCompilationUnit cu : units) {
            for (JCTree def : cu.defs) {
                if (!(def instanceof JCClassDecl)) continue;
                ClassSymbol cs = ((JCClassDecl) def).sym;
                String q = cs.getQualifiedName().toString();
                if (!matches(q, emit) || matches(q, exclude)) continue;
                if (!anyKept(prog, (JCClassDecl) def)) continue;
                Emit e = new Emit(prog, names, cu, (JCClassDecl) def, jre, libUse);
                String ts;
                try {
                    ts = e.emitModule();
                } catch (RuntimeException ex) {
                    // report and go on, to see every problem at once; the run fails at the end
                    failed++;
                    System.err.println("j2ts: " + q + ": " + ex.getMessage());
                    continue;
                }
                String rel = q.replace('.', '/') + ".ts";
                Path p = out.resolve(rel);
                Files.createDirectories(p.getParent());
                Files.writeString(p, ts, StandardCharsets.UTF_8);
                written.put(q, rel);
                prog.emitted.add(cs);
                prog.clinitDeps.putAll(e.clinitDeps);
            }
        }
        Files.writeString(out.resolve("index.ts"), Emit.indexModule(prog, names, written, jre),
            StandardCharsets.UTF_8);
        if (opt.containsKey("--report")) {
            Files.writeString(Path.of(opt.get("--report")), String.join("\n", libUse) + "\n");
        }
        System.err.println("j2ts: " + written.size() + " modules written to " + out);
        if (failed > 0) {
            System.err.println("j2ts: " + failed + " modules failed");
            System.exit(1);
        }
    }

    static boolean anyKept(Program prog, JCClassDecl cd) {
        if (prog.keepClass(cd.sym)) return true;
        for (JCTree d : cd.defs) if (d instanceof JCClassDecl && anyKept(prog, (JCClassDecl) d)) return true;
        return false;
    }

    static boolean matches(String q, String[] prefixes) {
        for (String p : prefixes) if (!p.isEmpty() && (q.equals(p) || q.startsWith(p.endsWith(".") ? p : p + "."))) return true;
        return false;
    }
}
