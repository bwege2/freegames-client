import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.code.Kinds;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.code.Symbol.MethodSymbol;
import com.sun.tools.javac.code.Symbol.VarSymbol;
import com.sun.tools.javac.code.Type;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.JCTree.JCBlock;
import com.sun.tools.javac.tree.JCTree.JCClassDecl;
import com.sun.tools.javac.tree.JCTree.JCFieldAccess;
import com.sun.tools.javac.tree.JCTree.JCIdent;
import com.sun.tools.javac.tree.JCTree.JCLiteral;
import com.sun.tools.javac.tree.JCTree.JCMemberReference;
import com.sun.tools.javac.tree.JCTree.JCMethodDecl;
import com.sun.tools.javac.tree.JCTree.JCMethodInvocation;
import com.sun.tools.javac.tree.JCTree.JCNewClass;
import com.sun.tools.javac.tree.JCTree.JCVariableDecl;
import com.sun.tools.javac.tree.TreeInfo;
import com.sun.tools.javac.tree.TreeScanner;

/**
 * Reachability (rapid type analysis) for the classes translated only in part: the JDK's own classes
 * (--partial prefixes). Everything of the other emitted classes (FreeCol, MigLayout) is a root; from
 * there, a method is reached when reached code calls it (a virtual call reaches its implementation in
 * every instantiated class), a class is instantiated by `new`, initialized by a static use, and the
 * hand-written runtime's own uses of translated classes are roots listed in --roots (Class or
 * Class#method). A class named by a string literal (Swing's look and feel tables name UI classes) is
 * reached reflectively: its constructors and static methods. A method of an instantiated class that
 * overrides a library method is reached (the library may call it).
 */
public class Reach {
    final Program prog;
    final String[] partial;
    final Map<MethodSymbol, JCMethodDecl> bodies = new HashMap<>();
    final Map<String, ClassSymbol> byFlatname = new HashMap<>();
    final Map<String, List<ClassSymbol>> bySimpleUI = new HashMap<>();

    final Set<MethodSymbol> methods = new LinkedHashSet<>();
    final Set<ClassSymbol> instantiated = new LinkedHashSet<>();
    final Set<ClassSymbol> initialized = new LinkedHashSet<>();
    final Set<ClassSymbol> reflective = new HashSet<>();
    /** Classes referred to by reached code (types, instanceof, class literals): emitted, maybe empty. */
    final Set<ClassSymbol> used = new LinkedHashSet<>();
    final Map<String, List<MethodSymbol>> virtualByName = new HashMap<>();
    final Set<MethodSymbol> virtual = new HashSet<>();
    final ArrayDeque<Runnable> work = new ArrayDeque<>();

    Reach(Program prog, String[] partial) {
        this.prog = prog;
        this.partial = partial;
        for (Map.Entry<ClassSymbol, JCClassDecl> e : prog.decls.entrySet()) {
            byFlatname.put(e.getKey().flatname.toString(), e.getKey());
            String simple = e.getKey().name.toString();
            if (simple.endsWith("UI")) bySimpleUI.computeIfAbsent(simple, k -> new ArrayList<>()).add(e.getKey());
            for (JCTree d : e.getValue().defs) {
                if (d instanceof JCMethodDecl) bodies.put(((JCMethodDecl) d).sym, (JCMethodDecl) d);
            }
        }
    }

    boolean isPartial(ClassSymbol c) {
        return Main.matches(prog.outermost(c).getQualifiedName().toString(), partial);
    }

    /** Reached in a partially translated class (others are emitted whole). */
    boolean reached(MethodSymbol m) {
        return methods.contains(m);
    }

    boolean emits(ClassSymbol c) {
        return used.contains(c) || instantiated.contains(c) || initialized.contains(c);
    }

    boolean clinitReached(ClassSymbol c) {
        return initialized.contains(c);
    }

    void run(List<ClassSymbol> roots, Path rootsFile) throws java.io.IOException {
        for (ClassSymbol c : roots) {
            JCClassDecl cd = prog.decls.get(c);
            instantiate(c);
            initialize(c);
            for (JCTree d : cd.defs) if (d instanceof JCMethodDecl) reach(((JCMethodDecl) d).sym);
        }
        if (rootsFile != null) {
            for (String line : Files.readAllLines(rootsFile)) {
                line = line.strip();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String cls = line.contains("#") ? line.substring(0, line.indexOf('#')) : line;
                if (cls.equals("*")) {
                    // every method of this name in the program (methods found by name through reflection)
                    String mn = line.substring(2);
                    for (MethodSymbol m : bodies.keySet()) if (m.name.contentEquals(mn) && isPartial((ClassSymbol) m.owner)) reach(m);
                    continue;
                }
                ClassSymbol c = byFlatname.get(cls);
                if (c == null) throw new IllegalArgumentException("--roots: no class " + cls);
                used.add(c);
                if (!line.contains("#")) {
                    reflect(c);
                    continue;
                }
                String mn = line.substring(line.indexOf('#') + 1);
                if (mn.equals("*")) {
                    // every method: a class the runtime subclasses (its methods are inherited)
                    instantiate(c);
                    for (Symbol s : c.members().getSymbols()) if (s instanceof MethodSymbol) reach((MethodSymbol) s);
                    continue;
                }
                boolean any = false;
                for (Symbol s : c.members().getSymbolsByName(prog.names.fromString(mn))) {
                    if (s instanceof MethodSymbol) {
                        any = true;
                        if (((MethodSymbol) s).isConstructor()) instantiate(c);
                        if (prog.isStatic(s) || ((MethodSymbol) s).isConstructor()) reach((MethodSymbol) s);
                        else virtualCall((MethodSymbol) s);
                    }
                }
                if (!any) throw new IllegalArgumentException("--roots: no method " + line);
            }
        }
        while (!work.isEmpty()) work.poll().run();
    }

    void use(Symbol s) {
        if (s instanceof ClassSymbol && prog.decls.containsKey(s)) {
            ClassSymbol c = (ClassSymbol) s;
            if (used.add(c)) {
                // its supertypes are emitted with it
                for (ClassSymbol a : prog.ancestors(c)) if (prog.decls.containsKey(a)) used.add(a);
                Symbol o = c.owner;
                while (o != null && o.kind == Kinds.Kind.TYP) {
                    use(o);
                    o = o.owner;
                }
            }
        }
    }

    void reflect(ClassSymbol c) {
        if (!reflective.add(c)) return;
        instantiate(c);
        initialize(c);
        for (Symbol s : c.members().getSymbols()) {
            if (s instanceof MethodSymbol && (((MethodSymbol) s).isConstructor() || prog.isStatic(s))) reach((MethodSymbol) s);
        }
    }

    void initialize(ClassSymbol c) {
        if (!prog.decls.containsKey(c) || !initialized.add(c)) return;
        use(c);
        Type sup = c.getSuperclass();
        if (sup != null && sup.tsym instanceof ClassSymbol) initialize((ClassSymbol) sup.tsym);
        JCClassDecl cd = prog.decls.get(c);
        work.add(() -> {
            for (JCTree d : cd.defs) {
                if (d instanceof JCVariableDecl && prog.isStatic(((JCVariableDecl) d).sym)) scan(((JCVariableDecl) d).init);
                else if (d instanceof JCVariableDecl && (((JCVariableDecl) d).mods.flags & Flags.ENUM) != 0) scan(((JCVariableDecl) d).init);
                else if (d instanceof JCBlock && (((JCBlock) d).flags & Flags.STATIC) != 0) scan(d);
            }
        });
    }

    void instantiate(ClassSymbol c) {
        if (!prog.decls.containsKey(c) || !instantiated.add(c)) return;
        use(c);
        initialize(c);
        // instance initializers of c and its program superclasses
        for (ClassSymbol k = c; k != null && prog.decls.containsKey(k); ) {
            JCClassDecl cd = prog.decls.get(k);
            work.add(() -> {
                for (JCTree d : cd.defs) {
                    if (d instanceof JCVariableDecl && !prog.isStatic(((JCVariableDecl) d).sym)) scan(((JCVariableDecl) d).init);
                    else if (d instanceof JCBlock && (((JCBlock) d).flags & Flags.STATIC) == 0) scan(d);
                }
            });
            Type sup = k.getSuperclass();
            k = sup != null && sup.tsym instanceof ClassSymbol ? (ClassSymbol) sup.tsym : null;
        }
        work.add(() -> {
            // the virtual calls made so far reach c's implementations
            Set<String> names = new HashSet<>();
            List<ClassSymbol> all = new ArrayList<>();
            all.add(c);
            all.addAll(prog.ancestors(c));
            for (ClassSymbol k : all) {
                for (Symbol s : k.members().getSymbols()) {
                    if (!(s instanceof MethodSymbol) || prog.isStatic(s) || ((MethodSymbol) s).isConstructor()) continue;
                    if (prog.decls.containsKey(k)) {
                        names.add(s.name.toString());
                    } else {
                        // a library method: the library may call it
                        MethodSymbol impl = ((MethodSymbol) s).implementation(c, prog.types, false);
                        if (impl != null && prog.decls.containsKey(impl.owner)) reach(impl);
                    }
                }
            }
            for (String n : names) {
                for (MethodSymbol m : virtualByName.getOrDefault(n, List.of())) dispatch(m, c);
            }
        });
    }

    void dispatch(MethodSymbol m, ClassSymbol c) {
        if (!(m.owner instanceof ClassSymbol) || !c.isSubClass(m.owner, prog.types)) return;
        MethodSymbol impl = m.implementation(c, prog.types, false);
        if (impl != null && prog.decls.containsKey(impl.owner)) reach(impl);
        if (impl == null || prog.isInterface((ClassSymbol) impl.owner)) {
            // an interface's default method that c inherits (javac's implementation() may not name it)
            for (ClassSymbol k : prog.ancestors(c)) {
                if (!prog.isInterface(k) || !prog.decls.containsKey(k)) continue;
                for (Symbol s : k.members().getSymbolsByName(m.name)) {
                    if (s instanceof MethodSymbol && (s.flags() & Flags.DEFAULT) != 0
                        && (s == m || ((MethodSymbol) s).overrides(m, k, prog.types, false))) reach((MethodSymbol) s);
                }
            }
        }
    }

    void virtualCall(MethodSymbol m) {
        if (!virtual.add(m)) return;
        virtualByName.computeIfAbsent(m.name.toString(), k -> new ArrayList<>()).add(m);
        List<ClassSymbol> now = new ArrayList<>(instantiated);
        for (ClassSymbol c : now) dispatch(m, c);
        // an abstract or interface method of a lambda target is implemented by the lambda itself
    }

    void reach(MethodSymbol m) {
        if (!prog.decls.containsKey(m.owner) || !methods.add(m)) return;
        use(m.owner);
        if (prog.isStatic(m)) initialize((ClassSymbol) m.owner);
        JCMethodDecl md = bodies.get(m);
        if (md != null && md.body != null) work.add(() -> scan(md.body));
    }

    void scan(JCTree t) {
        if (t == null) return;
        new TreeScanner() {
            @Override public void visitApply(JCMethodInvocation t) {
                Symbol s = TreeInfo.symbol(t.meth);
                if (s instanceof MethodSymbol) {
                    MethodSymbol m = (MethodSymbol) s;
                    boolean superCall = t.meth instanceof JCFieldAccess && TreeInfo.name(((JCFieldAccess) t.meth).selected) == prog.names._super;
                    if (m.isConstructor() || prog.isStatic(m) || prog.isPrivate(m) || superCall) reach(m);
                    else virtualCall(m);
                    if (prog.isStatic(m) && m.owner instanceof ClassSymbol) initialize((ClassSymbol) m.owner);
                }
                super.visitApply(t);
            }
            @Override public void visitNewClass(JCNewClass t) {
                ClassSymbol c = t.def != null ? t.def.sym : (ClassSymbol) t.constructor.owner;
                instantiate(c);
                if (t.constructor instanceof MethodSymbol) reach((MethodSymbol) t.constructor);
                if (t.def != null) {
                    // an anonymous class's methods are reached as an instantiated class's are; its body here
                    for (JCTree d : t.def.defs) {
                        if (d instanceof JCMethodDecl && ((JCMethodDecl) d).sym.isConstructor()) reach(((JCMethodDecl) d).sym);
                    }
                    scan(t.args);
                    scan(t.encl);
                    return;
                }
                super.visitNewClass(t);
            }
            @Override public void visitClassDef(JCClassDecl t) {
                // local classes: reached through `new`
            }
            @Override public void visitReference(JCMemberReference t) {
                if (t.sym instanceof MethodSymbol) {
                    MethodSymbol m = (MethodSymbol) t.sym;
                    if (m.isConstructor()) {
                        instantiate((ClassSymbol) m.owner);
                        reach(m);
                    } else if (prog.isStatic(m) || prog.isPrivate(m)) reach(m);
                    else virtualCall(m);
                }
                super.visitReference(t);
            }
            @Override public void visitIdent(JCIdent t) {
                ref(t.sym);
            }
            @Override public void visitSelect(JCFieldAccess t) {
                ref(t.sym);
                super.visitSelect(t);
            }
            @Override public void visitLiteral(JCLiteral t) {
                if (t.value instanceof String) {
                    String s = (String) t.value;
                    ClassSymbol c = byFlatname.get(s);
                    if (c != null) reflect(c);
                    for (ClassSymbol k : bySimpleUI.getOrDefault(s, List.of())) reflect(k);
                }
            }
            void ref(Symbol s) {
                if (s == null) return;
                if (s instanceof ClassSymbol) use(s);
                else if (s instanceof VarSymbol && s.owner instanceof ClassSymbol && prog.isStatic(s)) initialize((ClassSymbol) s.owner);
            }
            @Override public void scan(JCTree tree) {
                if (tree != null && tree.type != null && tree.type.tsym instanceof ClassSymbol) use(tree.type.tsym);
                super.scan(tree);
            }
        }.scan(t);
    }
}
