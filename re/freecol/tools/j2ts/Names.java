import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.code.Symbol.MethodSymbol;
import com.sun.tools.javac.code.Symbol.VarSymbol;
import com.sun.tools.javac.code.Type;
import com.sun.tools.javac.code.TypeTag;

/**
 * TypeScript names for Java members.
 *
 * Methods: methods that override each other form a family and share one name. A family keeps the Java
 * name unless, in some class, another family with the same name is visible (an overload, or a private
 * method of an ancestor, which in TypeScript would sit on the same prototype chain): then it is
 * name$Param1$Param2 (erased simple names, Arr for arrays, name$ without parameters). Families that
 * contain a method of the Java library keep the library's name (the runtime implements it).
 *
 * Fields: a field keeps its name unless it would collide with a method of the same name on the object
 * (name_) or with a field of an ancestor, which Java keeps apart (name$Class).
 */
public class Names {
    static final Set<String> RESERVED = Set.of("arguments", "await", "break", "case", "catch", "class",
        "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "eval", "export",
        "extends", "false", "finally", "for", "function", "if", "implements", "import", "in",
        "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public",
        "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void",
        "while", "with", "yield", "undefined", "NaN", "Infinity", "of", "any", "type", "number",
        "string", "boolean", "symbol", "object", "never", "unknown", "as", "async", "constructor",
        "declare", "get", "set", "module", "namespace", "require", "readonly", "keyof", "infer",
        "is", "abstract");
    static final Set<String> BAD_STATIC = Set.of("name", "length", "prototype", "caller", "arguments",
        "apply", "call", "bind", "constructor");

    final Program prog;
    final Map<MethodSymbol, MethodSymbol> parent = new HashMap<>();
    final Map<MethodSymbol, String> familyName = new HashMap<>();
    final Map<MethodSymbol, String> staticName = new HashMap<>();
    final Map<VarSymbol, String> fieldName = new HashMap<>();
    final Set<MethodSymbol> mangled = new HashSet<>();

    Names(Program prog) {
        this.prog = prog;
    }

    MethodSymbol find(MethodSymbol m) {
        MethodSymbol p = parent.get(m);
        if (p == null || p == m) return m;
        MethodSymbol r = find(p);
        parent.put(m, r);
        return r;
    }

    void union(MethodSymbol a, MethodSymbol b) {
        parent.putIfAbsent(a, a);
        parent.putIfAbsent(b, b);
        MethodSymbol ra = find(a), rb = find(b);
        if (ra != rb) parent.put(ra, rb);
    }

    static boolean isInstanceMethod(Symbol s) {
        return s instanceof MethodSymbol && (s.flags() & Flags.STATIC) == 0 && !s.isConstructor()
            && !s.name.toString().equals("<clinit>");
    }

    List<MethodSymbol> declared(ClassSymbol c) {
        List<MethodSymbol> r = new ArrayList<>();
        for (Symbol s : c.members().getSymbols()) if (isInstanceMethod(s)) r.add((MethodSymbol) s);
        return r;
    }

    void compute() {
        // 1. families
        for (ClassSymbol c : prog.decls.keySet()) {
            List<ClassSymbol> anc = prog.ancestors(c);
            for (MethodSymbol m : declared(c)) {
                parent.putIfAbsent(m, m);
                if (prog.isPrivate(m)) continue;
                for (ClassSymbol a : anc) {
                    for (Symbol s : a.members().getSymbolsByName(m.name)) {
                        if (!isInstanceMethod(s) || prog.isPrivate(s)) continue;
                        if (m.overrides(s, c, prog.types, false)) union(m, (MethodSymbol) s);
                    }
                }
            }
            if (!prog.isInterface(c)) {
                for (ClassSymbol a : anc) {
                    if (!prog.isInterface(a)) continue;
                    for (Symbol s : a.members().getSymbols()) {
                        if (!isInstanceMethod(s)) continue;
                        MethodSymbol impl = ((MethodSymbol) s).implementation(c, prog.types, true);
                        if (impl != null && impl != s && !prog.isPrivate(impl)) union((MethodSymbol) s, impl);
                    }
                }
            }
        }
        // 2. family properties
        Map<MethodSymbol, List<MethodSymbol>> members = new HashMap<>();
        for (MethodSymbol m : new ArrayList<>(parent.keySet())) members.computeIfAbsent(find(m), k -> new ArrayList<>()).add(m);
        Set<MethodSymbol> libRoots = new HashSet<>();
        for (Map.Entry<MethodSymbol, List<MethodSymbol>> e : members.entrySet()) {
            for (MethodSymbol m : e.getValue()) if (!prog.isProgram(m)) libRoots.add(e.getKey());
        }
        // 3. conflicts: per class, everything on the prototype chain grouped by name
        Set<MethodSymbol> conflict = new HashSet<>();
        for (ClassSymbol c : prog.decls.keySet()) {
            Map<String, Set<MethodSymbol>> byName = new HashMap<>();
            List<ClassSymbol> chain = new ArrayList<>();
            chain.add(c);
            chain.addAll(prog.ancestors(c));
            for (ClassSymbol a : chain) {
                for (Symbol s : a.members().getSymbols()) {
                    if (!isInstanceMethod(s)) continue;
                    if (!prog.isProgram(s) && prog.isPrivate(s)) continue;
                    MethodSymbol m = (MethodSymbol) s;
                    parent.putIfAbsent(m, m);
                    byName.computeIfAbsent(m.name.toString(), k -> new HashSet<>()).add(find(m));
                }
            }
            for (Set<MethodSymbol> fams : byName.values()) {
                if (fams.size() < 2) continue;
                for (MethodSymbol f : fams) if (!libRoots.contains(f)) conflict.add(f);
            }
        }
        // 4. names
        for (Map.Entry<MethodSymbol, List<MethodSymbol>> e : members.entrySet()) {
            MethodSymbol root = e.getKey();
            String base = root.name.toString();
            if (libRoots.contains(root)) {
                familyName.put(root, base);
            } else if (conflict.contains(root)) {
                MethodSymbol top = topOf(e.getValue());
                String n = base + "$" + sig(top);
                if (prog.isPrivate(top)) n = n + "$" + prog.flatLocal(top.enclClass()).replace('$', '_');
                familyName.put(root, n);
                mangled.add(root);
            } else {
                familyName.put(root, base);
            }
        }
        // 4b. library overloads implemented side by side: a program class that implements two library methods of
        // one name (writeCharacters(char[],int,int) and writeCharacters(String)) gets them as name$Params and a
        // method of the plain name that picks one by its arguments (Emit.emitDispatchers)
        for (ClassSymbol c : prog.decls.keySet()) {
            Map<String, Set<MethodSymbol>> byName = new HashMap<>();
            for (MethodSymbol m : declared(c)) {
                if (prog.isPrivate(m)) continue;
                MethodSymbol r = find(m);
                if (libRoots.contains(r)) byName.computeIfAbsent(m.name.toString(), k -> new HashSet<>()).add(r);
            }
            for (Set<MethodSymbol> rs : byName.values()) {
                if (rs.size() < 2) continue;
                for (MethodSymbol r : rs) dispatched.put(r, r.name + "$" + sig(libMember(members.get(r))));
            }
        }
        // 5. static methods: mangle overloads within the declaring class
        for (ClassSymbol c : prog.decls.keySet()) {
            Map<String, List<MethodSymbol>> byName = new LinkedHashMap<>();
            for (Symbol s : c.members().getSymbols()) {
                if (s instanceof MethodSymbol && prog.isStatic(s) && !s.isConstructor()
                    && !s.name.toString().equals("<clinit>")) {
                    byName.computeIfAbsent(s.name.toString(), k -> new ArrayList<>()).add((MethodSymbol) s);
                }
            }
            for (Map.Entry<String, List<MethodSymbol>> e : byName.entrySet()) {
                for (MethodSymbol m : e.getValue()) {
                    String n = e.getValue().size() > 1 ? e.getKey() + "$" + sig(m) : e.getKey();
                    if (BAD_STATIC.contains(n)) n = n + "_";
                    staticName.put(m, n);
                }
            }
        }
        // 6. fields
        Set<String> methodNames = new HashSet<>(familyName.values());
        for (ClassSymbol c : prog.decls.keySet()) {
            Set<String> statics = new HashSet<>();
            for (Symbol s : c.members().getSymbols()) {
                if (s instanceof MethodSymbol && prog.isStatic(s)) statics.add(staticName.getOrDefault(s, s.name.toString()));
            }
            Set<String> libMethods = new HashSet<>();
            Set<String> ancFields = new HashSet<>();
            for (ClassSymbol a : prog.ancestors(c)) {
                for (Symbol s : a.members().getSymbols()) {
                    if (isInstanceMethod(s) && !prog.isProgram(s)) libMethods.add(s.name.toString());
                    if (s instanceof VarSymbol && !prog.isStatic(s) && prog.isProgram(s)) ancFields.add(s.name.toString());
                }
            }
            for (Symbol s : c.members().getSymbols()) {
                if (!(s instanceof VarSymbol)) continue;
                VarSymbol v = (VarSymbol) s;
                String n = v.name.toString();
                if (prog.isStatic(v)) {
                    if (BAD_STATIC.contains(n) || statics.contains(n)) n = n + "_";
                } else {
                    if (ancFields.contains(n)) n = n + "$" + prog.flatLocal(c).replace('$', '_');
                    else if (methodNames.contains(n) || libMethods.contains(n) || n.equals("constructor")) n = n + "_";
                }
                fieldName.put(v, n);
            }
        }
        System.err.println("names: " + members.size() + " method families, " + mangled.size() + " mangled");
    }

    /** Families of library methods that program classes implement next to an overload: root -> name$Params. */
    final Map<MethodSymbol, String> dispatched = new HashMap<>();

    /** The library method of a family (whose parameters name it). */
    MethodSymbol libMember(List<MethodSymbol> ms) {
        for (MethodSymbol m : ms) if (!prog.isProgram(m)) return m;
        return ms.get(0);
    }

    /** The name a method is declared under: name$Params for a dispatched library overload, else method(m). */
    String declName(MethodSymbol m) {
        if (!prog.isStatic(m)) {
            parent.putIfAbsent(m, m);
            String d = dispatched.get(find(m));
            if (d != null) return d;
        }
        return method(m);
    }

    /** The parameters of a dispatched family (its library method's). */
    List<Type> dispatchParams(MethodSymbol m) {
        MethodSymbol root = find(m);
        for (Map.Entry<MethodSymbol, MethodSymbol> e : parent.entrySet()) {
            if (!prog.isProgram(e.getKey()) && find(e.getKey()) == root) return e.getKey().type.getParameterTypes();
        }
        return m.type.getParameterTypes();
    }

    /** The member whose class is not a subclass of another member's class (the declaration). */
    MethodSymbol topOf(List<MethodSymbol> ms) {
        MethodSymbol best = null;
        for (MethodSymbol m : ms) {
            boolean top = true;
            for (MethodSymbol o : ms) {
                if (o != m && o.owner != m.owner && ((ClassSymbol) m.owner).isSubClass(o.owner, prog.types)) top = false;
            }
            if (top && (best == null || m.owner.getQualifiedName().toString().compareTo(best.owner.getQualifiedName().toString()) < 0)) best = m;
        }
        return best == null ? ms.get(0) : best;
    }

    String sig(MethodSymbol m) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Type t : m.type.getParameterTypes()) {
            if (!first) sb.append('$');
            first = false;
            sb.append(simple(prog.types.erasure(t)));
        }
        return sb.toString();
    }

    String simple(Type t) {
        if (t.hasTag(TypeTag.ARRAY)) return simple(((Type.ArrayType) t).elemtype) + "Arr";
        if (t.isPrimitive()) return t.toString();
        return t.tsym.name.toString();
    }

    /** The TypeScript name of a method (instance: its family's; static: per class). */
    String method(MethodSymbol m) {
        if (prog.isStatic(m)) {
            String n = staticName.get(m);
            return n != null ? n : m.name.toString();
        }
        parent.putIfAbsent(m, m);
        String n = familyName.get(find(m));
        return n != null ? n : m.name.toString();
    }

    String field(VarSymbol v) {
        String n = fieldName.get(v);
        return n != null ? n : v.name.toString();
    }

    static String local(String n) {
        return RESERVED.contains(n) ? n + "$" : n;
    }

    /** Constructor init method name: _Class or _Class$sig when the class has several. */
    String ctor(MethodSymbol m) {
        ClassSymbol c = (ClassSymbol) m.owner;
        int n = 0;
        for (Symbol s : c.members().getSymbolsByName(m.name)) if (s.isConstructor()) n++;
        String base = "_" + tsLocal(c);
        return n > 1 ? base + "$" + sig(m) : base;
    }

    String tsLocal(ClassSymbol c) {
        if (prog.isAnonymous(c)) return "anon";
        if (prog.isLocal(c)) return c.name.toString();
        return prog.flatLocal(c);
    }

    TreeSet<String> stats() {
        return new TreeSet<>();
    }
}
