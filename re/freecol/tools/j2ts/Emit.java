import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import com.sun.source.tree.MemberReferenceTree.ReferenceMode;
import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.code.Kinds.Kind;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.code.Symbol.MethodSymbol;
import com.sun.tools.javac.code.Symbol.VarSymbol;
import com.sun.tools.javac.code.Type;
import com.sun.tools.javac.code.TypeTag;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.JCTree.*;
import com.sun.tools.javac.tree.TreeInfo;
import com.sun.tools.javac.tree.TreeScanner;

/**
 * Writes one TypeScript module for one top-level Java class (with its member classes).
 *
 * Conventions (re/freecol/NOTES.md, "The translator"):
 * - A Java constructor is an init method _Class (or _Class$sig), called on a fresh object:
 *   new Unit()._Unit(game, id). It calls the superclass's init first, then runs the field
 *   initializers, then the body, and returns this: Java's order exactly.
 * - Inner classes keep their enclosing instance in $outer (set by .$o(outer) before the init).
 * - Static initializers are $clinit(), run once for all classes by index.ts in dependency order.
 * - A module imports only its superclasses; every other class is bound at link time
 *   ($J.module(..., () => { Game = $J.load('...Game'); })), so that the import graph has no cycles.
 * - Values of functional interfaces (Predicate, Comparator, ...) are plain functions.
 */
public class Emit {
    final Program prog;
    final Names names;
    final JCCompilationUnit cu;
    final JCClassDecl top;
    final String jreRel;
    final Set<String> libUse;
    final Lib lib;

    final StringBuilder out = new StringBuilder();
    int indent = 0;
    final Deque<ClassSymbol> classStack = new ArrayDeque<>();
    final Deque<MethodSymbol> methodStack = new java.util.LinkedList<>();
    /** program classes referenced from this module (qname -> local binding). */
    final Map<String, String> linked = new TreeMap<>();
    final Map<String, String> eager = new LinkedHashMap<>();
    final Set<String> jre = new TreeSet<>();
    final Set<ClassSymbol> local = new LinkedHashSet<>();
    final Map<String, Set<String>> clinitDeps = new LinkedHashMap<>();
    /** while emitting a $clinit: the classes it touches. */
    Set<String> clinitCollect = null;
    int lambdaDepth = 0;
    boolean inHashCode = false;
    int tmp = 0;
    final Map<String, ClassSymbol> bindingOwner = new HashMap<>();

    Emit(Program prog, Names names, JCCompilationUnit cu, JCClassDecl top, String jreDir, Set<String> libUse) {
        this.prog = prog;
        this.names = names;
        this.cu = cu;
        this.top = top;
        this.libUse = libUse;
        int depth = top.sym.packge().getQualifiedName().toString().split("\\.").length;
        StringBuilder r = new StringBuilder();
        for (int i = 0; i < depth; i++) r.append("../");
        this.jreRel = r + jreDir + "/index.ts";
        this.lib = new Lib(this);
    }

    // ---------------------------------------------------------------- output helpers

    /** The declaration's Javadoc, as a comment. */
    void doc(JCTree t) {
        if (cu.docComments == null) return;
        String text = cu.docComments.getCommentText(t);
        if (text == null || text.isBlank()) return;
        line("/**");
        for (String l : text.strip().split("\n")) {
            if (l.startsWith(" ")) l = l.substring(1);
            line(" *" + (l.isEmpty() ? "" : " " + l.replace("*/", "*\\/")));
        }
        line(" */");
    }

    void line(String s) {
        for (int i = 0; i < indent; i++) out.append("  ");
        out.append(s).append('\n');
    }

    String q(Symbol s) {
        return prog.qname(s);
    }

    String jre(String name) {
        jre.add(name.contains(".") ? name.substring(0, name.indexOf('.')) : name);
        return name;
    }

    // ---------------------------------------------------------------- module

    String emitModule() {
        List<JCClassDecl> classes = new ArrayList<>();
        collectMembers(top, classes);
        for (JCClassDecl c : classes) local.add(c.sym);
        classes = sortBySuper(classes);
        StringBuilder body = new StringBuilder();
        for (JCClassDecl c : classes) {
            out.setLength(0);
            emitClass(c);
            body.append(out).append('\n');
        }
        for (String h : hoisted) body.append(h).append('\n');
        out.setLength(0);
        // module footer: definitions and links
        StringBuilder foot = new StringBuilder();
        for (JCClassDecl c : classes) foot.append(defineCall(c.sym)).append('\n');
        StringBuilder link = new StringBuilder();
        for (Map.Entry<String, String> e : linked.entrySet()) {
            link.append("  ").append(e.getValue()).append(" = $J.load('").append(e.getKey()).append("');\n");
        }
        jre.add("$J");
        if (link.length() > 0) foot.append("$J.module(() => {\n").append(link).append("});\n");

        StringBuilder m = new StringBuilder();
        String src = cu.getSourceFile().getName();
        String origin;
        if (src.contains("/jdk-src/")) origin = "OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) " + src.substring(src.indexOf("/jdk-src/") + 9);
        else if (src.contains("/mig/")) origin = "MigLayout 5.3 " + src.substring(src.indexOf("/mig/") + 5);
        else if (src.contains("/net/sf/")) origin = "FreeCol 1.2.0 src" + src.substring(src.indexOf("/net/sf/"));
        else origin = src.substring(src.lastIndexOf('/') + 1);
        m.append("// @ts-nocheck\n");
        m.append("// ").append(origin).append(", translated to TypeScript by re/freecol/tools/j2ts (do not edit).\n");
        // the source file's header (its copyright and license notice), kept as it is
        try {
            String text = cu.getSourceFile().getCharContent(true).toString();
            // the first comment that holds a copyright notice (at the top, or after the imports)
            java.util.regex.Matcher hm = java.util.regex.Pattern.compile("/\\*[\\s\\S]*?\\*/").matcher(text);
            while (hm.find()) {
                if (hm.group().contains("Copyright") || hm.group().contains("COPYRIGHT")) {
                    m.append(hm.group()).append('\n');
                    break;
                }
            }
        } catch (java.io.IOException ex) {
            throw new RuntimeException(ex);
        }
        m.append("import { ").append(String.join(", ", jre)).append(" } from '").append(jreRel).append("';\n");
        for (Map.Entry<String, String> e : eager.entrySet()) {
            String file = eagerFile.getOrDefault(e.getKey(), e.getKey());
            m.append("import { ").append(e.getValue()).append(" } from '").append(relPath(file)).append("';\n");
        }
        if (!linked.isEmpty()) m.append("\nlet ").append(String.join(", ", linked.values())).append(";\n");
        m.append('\n').append(body).append(foot);
        return m.toString();
    }

    void collectMembers(JCClassDecl c, List<JCClassDecl> acc) {
        if (prog.keepClass(c.sym)) acc.add(c);
        for (JCTree d : c.defs) if (d instanceof JCClassDecl) collectMembers((JCClassDecl) d, acc);
    }

    List<JCClassDecl> sortBySuper(List<JCClassDecl> in) {
        List<JCClassDecl> outl = new ArrayList<>();
        Set<ClassSymbol> done = new LinkedHashSet<>();
        Map<ClassSymbol, JCClassDecl> by = new LinkedHashMap<>();
        for (JCClassDecl c : in) by.put(c.sym, c);
        for (JCClassDecl c : in) visitSort(c.sym, by, done, outl);
        return outl;
    }

    void visitSort(ClassSymbol c, Map<ClassSymbol, JCClassDecl> by, Set<ClassSymbol> done, List<JCClassDecl> outl) {
        if (done.contains(c) || !by.containsKey(c)) return;
        done.add(c);
        Type sup = c.getSuperclass();
        if (sup != null && sup.tsym instanceof ClassSymbol) visitSort((ClassSymbol) sup.tsym, by, done, outl);
        outl.add(by.get(c));
    }

    String relPath(String qname) {
        String[] from = q(top.sym.packge()).split("\\.");
        String[] to = qname.split("\\.");
        int common = 0;
        while (common < from.length && common < to.length - 1 && from[common].equals(to[common])) common++;
        StringBuilder sb = new StringBuilder();
        if (common == from.length) sb.append("./");
        for (int i = common; i < from.length; i++) sb.append("../");
        for (int i = common; i < to.length; i++) {
            sb.append(to[i]);
            if (i < to.length - 1) sb.append('/');
        }
        return sb.append(".ts").toString();
    }

    String defineCall(ClassSymbol c) {
        StringBuilder sb = new StringBuilder();
        sb.append("$J.define(").append(tsName(c)).append(", '").append(c.flatname).append("', { kind: '")
            .append(prog.isInterface(c) ? "interface" : (c.flags() & Flags.ENUM) != 0 ? "enum" : "class").append('\'');
        List<String> ifs = new ArrayList<>();
        for (Type i : c.getInterfaces()) ifs.add("'" + ((ClassSymbol) i.tsym).flatname + "'");
        if (!ifs.isEmpty()) sb.append(", ifaces: [").append(String.join(", ", ifs)).append(']');
        Type sup = c.getSuperclass();
        if (sup != null && sup.tsym != null && sup.hasTag(TypeTag.CLASS)) sb.append(", sup: '").append(((ClassSymbol) sup.tsym).flatname).append('\'');
        // constructors and renamed methods, for reflection
        List<String> ctors = new ArrayList<>();
        List<String> meths = new ArrayList<>();
        for (Symbol s : c.members().getSymbols()) {
            if (!(s instanceof MethodSymbol)) continue;
            MethodSymbol m = (MethodSymbol) s;
            if (m.isConstructor()) {
                if (prog.isAnonymous(c)) continue;
                ctors.add("'" + erasedParams(m) + "': '" + names.ctor(m) + "'");
            } else if (!m.name.toString().equals("<clinit>")) {
                String n = names.declName(m);
                if (!n.equals(m.name.toString())) {
                    meths.add("'" + m.name + "(" + erasedParams(m) + ")': '" + n + "'");
                }
            }
        }
        if (!ctors.isEmpty()) sb.append(", ctors: { ").append(String.join(", ", ctors)).append(" }");
        // the return types of FreeCol's getters, for reflection (Introspector converts strings to them)
        List<String> returns = new ArrayList<>();
        if (c.flatname.toString().startsWith("net.sf.freecol.")) {
            for (Symbol s : c.members().getSymbols()) {
                if (!(s instanceof MethodSymbol) || s.isConstructor() || prog.isStatic(s)) continue;
                MethodSymbol m = (MethodSymbol) s;
                String n = m.name.toString();
                if (!m.params().isEmpty() || !(n.startsWith("get") || n.startsWith("is") || n.startsWith("has")) || !prog.keep(m)) continue;
                Type rt = prog.types.erasure(m.getReturnType());
                if (rt.hasTag(TypeTag.VOID)) continue;
                String r = rt.isPrimitive() ? rt.toString() : rt.hasTag(TypeTag.CLASS) ? ((ClassSymbol) rt.tsym).flatname.toString() : null;
                if (r == null || r.equals("java.lang.Object")) continue;
                returns.add("'" + names.declName(m) + "': '" + r + "'");
            }
        }
        if (!returns.isEmpty()) sb.append(", returns: { ").append(String.join(", ", returns)).append(" }");
        if (!meths.isEmpty()) sb.append(", meths: { ").append(String.join(", ", meths)).append(" }");
        if (hasClinit.contains(c)) {
            // static fields that Java initializes when the class is first used (not constants)
            List<String> lazy = new ArrayList<>();
            for (Symbol s : c.members().getSymbols()) {
                if (s instanceof VarSymbol && prog.isStatic(s)
                    && !(((VarSymbol) s).getConstValue() != null && (s.flags() & Flags.FINAL) != 0)) {
                    lazy.add("'" + names.field((VarSymbol) s) + "'");
                }
            }
            if ((c.flags() & Flags.ENUM) != 0) lazy.add("'$VALUES'");
            java.util.Collections.reverse(lazy);
            sb.append(", clinit: true, lazy: [").append(String.join(", ", lazy)).append("]");
        }
        if (prog.hasOuter(c)) sb.append(", inner: true");
        sb.append(" });");
        return sb.toString();
    }

    String erasedParams(MethodSymbol m) {
        List<String> ps = new ArrayList<>();
        for (Type t : m.type.getParameterTypes()) {
            Type e = prog.types.erasure(t);
            // Class.getName: binary names (Outer$Inner) for classes
            ps.add(e.hasTag(TypeTag.CLASS) ? ((ClassSymbol) e.tsym).flatname.toString() : e.toString());
        }
        return String.join(",", ps);
    }

    final Set<ClassSymbol> hasClinit = new LinkedHashSet<>();

    // ---------------------------------------------------------------- class references

    /** The TypeScript expression for a class used as a value. */
    String classRef(ClassSymbol c) {
        if (clinitCollect != null && prog.isProgram(c) && !prog.isLocal(c)) clinitCollect.add(c.flatname.toString());
        if (!prog.isProgram(c)) return lib.libClass(c);
        if (prog.isLocal(c)) return hoistName(c) + "()";
        String n = tsName(c);
        if (local.contains(c)) return n;
        String qn = c.flatname.toString();
        ClassSymbol prev = bindingOwner.get(n);
        if (prev != null && prev != c) {
            n = n + "_" + Integer.toHexString(qn.hashCode() & 0xfff);
        }
        bindingOwner.put(n, c);
        if (!eager.containsKey(qn)) linked.put(qn, n);
        return n;
    }

    static final Set<String> GLOBALS = Set.of("Object", "String", "Number", "Boolean", "Math", "Error",
        "Array", "Date", "Symbol", "Function", "Promise", "Proxy", "Reflect", "JSON", "Map", "Set");

    String tsName(ClassSymbol c) {
        String n = prog.isLocal(c) ? c.name.toString() : prog.flatLocal(c);
        if (GLOBALS.contains(n)) n = n + "_";
        return n;
    }

    /** Superclass of a class declaration, imported eagerly when it is a program class in another module. */
    String superRef(ClassSymbol c) {
        Type sup = c.getSuperclass();
        if (prog.isInterface(c)) return null;
        if ((c.flags() & Flags.ENUM) != 0 && !prog.isProgram(sup.tsym)) return jre("JEnum");
        if (sup == null || !sup.hasTag(TypeTag.CLASS)) return jre("JObject");
        ClassSymbol s = (ClassSymbol) sup.tsym;
        if (!prog.isProgram(s)) return lib.libClass(s);
        if (local.contains(s) || prog.isLocal(s)) return tsName(s);
        String qn = s.flatname.toString();
        ClassSymbol topS = prog.outermost(s);
        String n = tsName(s);
        linked.remove(qn);
        eager.put(qn, n);
        // the module file is the top-level class's; a member class is exported from it
        eagerFile.put(qn, topS.flatname.toString());
        return n;
    }

    final Map<String, String> eagerFile = new HashMap<>();

    // ---------------------------------------------------------------- types (annotations only)

    String tsType(Type t) {
        if (t == null) return "any";
        switch (t.getTag()) {
        case BOOLEAN: return "boolean";
        case BYTE: case SHORT: case CHAR: case INT: case LONG: case FLOAT: case DOUBLE: return "number";
        case VOID: return "void";
        case BOT: return "null";
        case ARRAY: return tsType(((Type.ArrayType) t).elemtype) + "[]";
        case TYPEVAR: return t.tsym.name.toString();
        case WILDCARD: {
            Type.WildcardType w = (Type.WildcardType) t;
            return w.kind == com.sun.tools.javac.code.BoundKind.EXTENDS ? tsType(w.type) : "any";
        }
        case CLASS: {
            ClassSymbol c = (ClassSymbol) t.tsym;
            String qn = q(c);
            if (qn.equals("java.lang.String")) return "string";
            if (qn.equals("java.lang.Object")) return "any";
            if (Lib.BOXED.contains(qn)) return qn.equals("java.lang.Boolean") ? "boolean" : "number";
            String n = prog.isProgram(c) ? tsName(c) : lib.libTypeName(c);
            if (!t.getTypeArguments().isEmpty()) {
                List<String> as = new ArrayList<>();
                for (Type a : t.getTypeArguments()) as.add(tsType(a));
                n = n + "<" + String.join(", ", as) + ">";
            }
            return n;
        }
        default: return "any";
        }
    }

    // ---------------------------------------------------------------- classes

    void emitClass(JCClassDecl cd) {
        ClassSymbol c = cd.sym;
        classStack.push(c);
        String name = tsName(c);
        String tps = typeParams(cd.typarams);
        doc(cd);
        if (prog.isInterface(c)) {
            line("export class " + name + tps + " {");
        } else {
            String sup = superRef(c);
            line("export class " + name + tps + " extends " + sup + " {");
        }
        indent++;
        emitClassBody(cd, false);
        indent--;
        line("}");
        classStack.pop();
    }

    String typeParams(List<JCTypeParameter> tps) {
        if (tps == null || tps.isEmpty()) return "";
        List<String> s = new ArrayList<>();
        for (JCTypeParameter p : tps) s.add(p.name.toString());
        return "<" + String.join(", ", s) + ">";
    }

    /** Fields, init methods, methods, $clinit. For anonymous classes (anon = true) no statics. */
    void emitClassBody(JCClassDecl cd, boolean anon) {
        ClassSymbol c = cd.sym;
        boolean isEnum = (c.flags() & Flags.ENUM) != 0;
        List<JCTree> instanceInit = new ArrayList<>();
        List<JCTree> staticInit = new ArrayList<>();
        List<JCMethodDecl> ctors = new ArrayList<>();
        List<JCMethodDecl> methods = new ArrayList<>();
        List<JCVariableDecl> enumConsts = new ArrayList<>();
        for (JCTree d : cd.defs) {
            if (d instanceof JCVariableDecl) {
                JCVariableDecl v = (JCVariableDecl) d;
                if ((v.mods.flags & Flags.ENUM) != 0) { enumConsts.add(v); continue; }
                // Java serialization's class versions: nothing in the port serializes objects that way
                if ((v.name.contentEquals("serialVersionUID") || v.name.contentEquals("serialPersistentFields"))
                    && (v.sym.flags() & Flags.STATIC) != 0) continue;
                boolean st = (v.sym.flags() & Flags.STATIC) != 0;
                String fname = names.field(v.sym);
                doc(v);
                if (st) {
                    Object cv = v.sym.getConstValue();
                    if (cv != null && (v.sym.flags() & Flags.FINAL) != 0) {
                        line("static readonly " + fname + ": " + tsType(v.sym.type) + " = " + constLiteral(cv, v.sym.type) + ";");
                    } else {
                        line("static " + fname + ": " + tsType(v.sym.type) + " = " + defaultValue(v.sym.type) + ";");
                        if (v.init != null) staticInit.add(v);
                    }
                } else {
                    line(fname + ": " + tsType(v.sym.type) + " = " + defaultValue(v.sym.type) + ";");
                    if (v.init != null) instanceInit.add(v);
                }
            } else if (d instanceof JCBlock) {
                if ((((JCBlock) d).flags & Flags.STATIC) != 0) staticInit.add(d);
                else instanceInit.add(d);
            } else if (d instanceof JCMethodDecl) {
                JCMethodDecl m = (JCMethodDecl) d;
                if (m.sym.isConstructor()) ctors.add(m);
                else methods.add(m);
            }
        }
        if (isEnum && !enumConsts.isEmpty()) {
            for (JCVariableDecl v : enumConsts) line("static " + names.field(v.sym) + ": " + tsName(c) + " = null;");
            line("static $VALUES: " + tsName(c) + "[] = null;");
        }
        // instance initializer: a method when several constructors share it
        boolean sharedInit = !instanceInit.isEmpty() && (ctors.size() > 1 || anon);
        if (sharedInit) {
            line((anon ? "$init_anon" : "$init_" + tsName(c).replace('$', '_')) + "() {");
            indent++;
            methodStack.push(null);
            emitInstanceInit(instanceInit);
            methodStack.pop();
            if (anon) line("return this;");
            indent--;
            line("}");
        }
        if (!anon) {
            for (JCMethodDecl m : ctors) if (prog.keep(m.sym)) emitCtor(cd, m, instanceInit, sharedInit, isEnum);
        }
        for (JCMethodDecl m : methods) if (prog.keep(m.sym)) emitMethod(m);
        emitDispatchers(c, methods);
        if (isEnum) {
            line("static values(): " + tsName(c) + "[] { return " + classRefSelf(c) + ".$VALUES.slice(); }");
            line("static valueOf(name: string): " + tsName(c) + " { return " + jre("$J") + ".enumValueOf(" + classRefSelf(c) + ", name); }");
        }
        if (!anon && prog.keepClinit(c) && (!staticInit.isEmpty() || !enumConsts.isEmpty())) {
            hasClinit.add(c);
            clinitCollect = new LinkedHashSet<>();
            line("static $clinit() {");
            indent++;
            methodStack.push(null);
            int ord = 0;
            List<String> vals = new ArrayList<>();
            for (JCVariableDecl v : enumConsts) {
                JCNewClass nc = (JCNewClass) v.init;
                String cref = classRefSelf(c);
                String obj = newEnumConstant(c, nc, v.name.toString(), ord++);
                line(cref + "." + names.field(v.sym) + " = " + obj + ";");
                vals.add(cref + "." + names.field(v.sym));
            }
            if (!enumConsts.isEmpty()) line(classRefSelf(c) + ".$VALUES = [" + String.join(", ", vals) + "];");
            for (JCTree t : staticInit) {
                if (t instanceof JCVariableDecl) {
                    JCVariableDecl v = (JCVariableDecl) t;
                    line(classRefSelf(c) + "." + names.field(v.sym) + " = " + conv(v.init, v.sym.type) + ";");
                } else {
                    emitBlockContents((JCBlock) t);
                }
            }
            methodStack.pop();
            indent--;
            line("}");
            Set<String> deps = clinitCollect;
            deps.remove(c.flatname.toString());
            clinitDeps.put(c.flatname.toString(), deps);
            clinitCollect = null;
        }
    }

    String classRefSelf(ClassSymbol c) {
        return prog.isLocal(c) ? c.name.toString() : tsName(c);
    }

    void emitInstanceInit(List<JCTree> inits) {
        for (JCTree t : inits) {
            if (t instanceof JCVariableDecl) {
                JCVariableDecl v = (JCVariableDecl) t;
                line("this." + names.field(v.sym) + " = " + conv(v.init, v.sym.type) + ";");
            } else {
                emitBlockContents((JCBlock) t);
            }
        }
    }

    String newEnumConstant(ClassSymbol c, JCNewClass nc, String name, int ord) {
        MethodSymbol ctor = (MethodSymbol) nc.constructor;
        List<String> args = new ArrayList<>();
        args.add(str(name));
        args.add(String.valueOf(ord));
        args.addAll(callArgs(ctor, nc.args, nc.varargsElement, nc.constructorType));
        String init = "." + names.ctor(ctor) + "(" + String.join(", ", args) + ")";
        if (nc.def != null) {
            return "new (" + hoist(nc.def, c) + ")()" + init + (anonHasInit(nc.def) ? ".$init_anon()" : "");
        }
        return "new " + classRefSelf(c) + "()" + init;
    }

    void emitCtor(JCClassDecl cd, JCMethodDecl m, List<JCTree> instanceInit, boolean sharedInit, boolean isEnum) {
        ClassSymbol c = cd.sym;
        methodStack.push(m.sym);
        List<String> ps = new ArrayList<>();
        if (isEnum) { ps.add("$name: string"); ps.add("$ordinal: number"); }
        for (JCVariableDecl p : m.params) ps.add(Names.local(p.name.toString()) + ": " + tsType(p.sym.type));
        doc(m);
        line(names.ctor(m.sym) + "(" + String.join(", ", ps) + "): this {");
        indent++;
        List<JCStatement> stats = m.body.stats;
        boolean delegates = false;
        int startAt = 0;
        if (!stats.isEmpty() && TreeInfo.isSelfCall(stats.get(0))) {
            JCMethodInvocation call = (JCMethodInvocation) ((JCExpressionStatement) stats.get(0)).expr;
            MethodSymbol target = (MethodSymbol) TreeInfo.symbol(call.meth);
            String nm = TreeInfo.name(call.meth).toString();
            List<String> args = new ArrayList<>();
            if (isEnum && nm.equals("this")) { args.add("$name"); args.add("$ordinal"); }
            args.addAll(callArgs(target, call.args, call.varargsElement, call.meth.type));
            if (nm.equals("this")) {
                delegates = true;
                line("this." + names.ctor(target) + "(" + String.join(", ", args) + ");");
            } else {
                superInit(c, target, args, isEnum);
            }
            startAt = 1;
        } else {
            superInit(c, null, new ArrayList<>(), isEnum);
        }
        if (!delegates && !instanceInit.isEmpty()) {
            if (sharedInit) line("this.$init_" + tsName(c).replace('$', '_') + "();");
            else emitInstanceInit(instanceInit);
        }
        int i = 0;
        for (JCStatement s : stats) {
            if (i++ < startAt) continue;
            stmt(s);
        }
        line("return this;");
        indent--;
        line("}");
        methodStack.pop();
    }

    void superInit(ClassSymbol c, MethodSymbol target, List<String> args, boolean isEnum) {
        if (isEnum) {
            line("this._JEnum($name, $ordinal);");
            return;
        }
        Type sup = c.getSuperclass();
        if (sup == null || !sup.hasTag(TypeTag.CLASS)) return;
        ClassSymbol s = (ClassSymbol) sup.tsym;
        if (q(s).equals("java.lang.Object")) return;
        if (!prog.isProgram(s)) {
            line("this._" + lib.libClass(s) + "(" + String.join(", ", args) + ");");
            return;
        }
        if (target == null) {
            for (Symbol x : s.members().getSymbolsByName(s.name.table.names.init)) {
                if (((MethodSymbol) x).params().isEmpty()) target = (MethodSymbol) x;
            }
            if (target == null) {
                // javac's default constructor
                for (Symbol x : s.members().getSymbolsByName(s.name.table.names.init)) target = (MethodSymbol) x;
            }
        }
        if (target != null) line("this." + names.ctor(target) + "(" + String.join(", ", args) + ");");
    }

    /**
     * For library overloads a class implements side by side (Names.dispatched): the plain name, which picks the
     * overload by the arguments' number and kinds, as the runtime's own classes take their overloads.
     */
    void emitDispatchers(ClassSymbol c, List<JCMethodDecl> methods) {
        java.util.Set<String> names0 = new java.util.TreeSet<>();
        for (JCMethodDecl m : methods) {
            if (m.sym.isConstructor() || prog.isStatic(m.sym) || m.body == null) continue;
            if (!names.declName(m.sym).equals(names.method(m.sym))) names0.add(names.method(m.sym));
        }
        for (String n : names0) {
            // the overloads of the chain (program classes), each family once
            java.util.LinkedHashMap<String, List<Type>> entries = new java.util.LinkedHashMap<>();
            boolean libSuper = false;
            for (ClassSymbol a = c; a != null; ) {
                if (!prog.isProgram(a)) { libSuper = !q(a).equals("java.lang.Object"); break; }
                for (Symbol s : a.members().getSymbols()) {
                    if (!(s instanceof MethodSymbol) || s.isConstructor() || prog.isStatic(s) || !s.name.toString().equals(n)) continue;
                    MethodSymbol ms = (MethodSymbol) s;
                    if ((ms.flags() & Flags.ABSTRACT) != 0 || !prog.keep(ms)) continue;
                    String d = names.declName(ms);
                    if (!d.equals(names.method(ms))) entries.putIfAbsent(d, names.dispatchParams(ms));
                }
                Type sup = a.getSuperclass();
                a = sup != null && sup.hasTag(TypeTag.CLASS) ? (ClassSymbol) sup.tsym : null;
            }
            List<Map.Entry<String, List<Type>>> es = new ArrayList<>(entries.entrySet());
            // fewer arguments first; among as many, the more specific parameters first
            es.sort((x, y) -> x.getValue().size() != y.getValue().size() ? x.getValue().size() - y.getValue().size()
                : specificity(y.getValue()) - specificity(x.getValue()));
            line(n + "(...a: any[]): any {");
            indent++;
            for (Map.Entry<String, List<Type>> e : es) {
                List<String> conds = new ArrayList<>();
                conds.add("a.length === " + e.getValue().size());
                for (int i = 0; i < e.getValue().size(); i++) {
                    String t = argTest("a[" + i + "]", prog.types.erasure(e.getValue().get(i)));
                    if (t != null) conds.add(t);
                }
                line("if (" + String.join(" && ", conds) + ") return this." + e.getKey() + "(...a);");
            }
            if (libSuper) line("return super." + n + "(...a);");
            else line("throw new Error('no overload of " + n + " for these arguments');");
            indent--;
            line("}");
        }
    }

    int specificity(List<Type> ps) {
        int n = 0;
        for (Type t : ps) if (!q(t.tsym).equals("java.lang.Object")) n++;
        return n;
    }

    /** A test that an argument can be of the parameter's type, or null when any value can. */
    String argTest(String x, Type t) {
        if (t.isPrimitive()) return t.hasTag(TypeTag.BOOLEAN) ? "typeof " + x + " === 'boolean'" : "typeof " + x + " === 'number'";
        if (t.hasTag(TypeTag.ARRAY)) return "(" + x + " == null || Array.isArray(" + x + ") || ArrayBuffer.isView(" + x + "))";
        String qn = q(t.tsym);
        if (qn.equals("java.lang.Object")) return null;
        if (qn.equals("java.lang.String")) return "(" + x + " == null || typeof " + x + " === 'string')";
        return "(" + x + " == null || " + jre("$J") + ".isa(" + x + ", " + classRef((ClassSymbol) t.tsym) + "))";
    }

    void emitMethod(JCMethodDecl m) {
        MethodSymbol ms = m.sym;
        if (m.body == null && (ms.flags() & Flags.NATIVE) != 0) {
            // a native method: the runtime's implementation, registered by class and name ($J.natives)
            boolean st = prog.isStatic(ms);
            line((st ? "static " : "") + names.method(ms) + "(...$a: any[]): any {");
            indent++;
            line("return " + jre("$J") + ".nativeCall('" + ((ClassSymbol) ms.owner).flatname + "', '" + ms.name + "', this, $a);");
            indent--;
            line("}");
            return;
        }
        if (m.body == null) return; // abstract, interface method
        methodStack.push(ms);
        boolean st = prog.isStatic(ms);
        String name = names.declName(ms);
        List<String> ps = new ArrayList<>();
        for (JCVariableDecl p : m.params) ps.add(Names.local(p.name.toString()) + ": " + tsType(p.sym.type));
        boolean oldHash = inHashCode;
        inHashCode = ms.name.toString().equals("hashCode");
        doc(m);
        line((st ? "static " : "") + name + typeParams(m.typarams) + "(" + String.join(", ", ps) + "): " + tsType(ms.getReturnType()) + " {");
        indent++;
        emitBlockContents(m.body);
        indent--;
        line("}");
        inHashCode = oldHash;
        methodStack.pop();
    }

    // ---------------------------------------------------------------- statements

    void emitBlockContents(JCBlock b) {
        for (JCStatement s : b.stats) stmt(s);
    }

    void stmt(JCStatement s) {
        if (!(s instanceof JCBlock) && !(s instanceof JCClassDecl)) {
            // pattern variables (x instanceof T t): declared before the statement, function-wide as Java's
            // scope may reach the statements after it (if (!(x instanceof T t)) return; t...)
            java.util.LinkedHashSet<String> vars = new java.util.LinkedHashSet<>();
            new com.sun.tools.javac.tree.TreeScanner() {
                @Override public void visitBindingPattern(com.sun.tools.javac.tree.JCTree.JCBindingPattern p) {
                    vars.add(Names.local(p.var.name.toString()));
                }
                @Override public void visitClassDef(JCClassDecl c) {}
                @Override public void visitLambda(JCLambda l) {}
            }.scan(s);
            if (!vars.isEmpty()) line("var " + String.join(", ", vars) + ";");
        }
        switch (s.getTag()) {
        case BLOCK:
            line("{");
            indent++;
            emitBlockContents((JCBlock) s);
            indent--;
            line("}");
            break;
        case VARDEF: {
            JCVariableDecl v = (JCVariableDecl) s;
            String n = Names.local(v.name.toString());
            if (hoistedLocals.contains(v.sym)) {
                if (v.init != null) line(n + " = " + conv(v.init, v.sym.type) + ";");
                break;
            }
            if (v.init == null) line("let " + n + ": " + tsType(v.sym.type) + ";");
            else line("let " + n + " = " + conv(v.init, v.sym.type) + ";");
            break;
        }
        case EXEC:
            line(expr(((JCExpressionStatement) s).expr, 0) + ";");
            break;
        case IF: {
            JCIf i = (JCIf) s;
            line("if (" + cond(i.cond) + ") {");
            body(i.thenpart);
            JCStatement el = i.elsepart;
            while (el instanceof JCIf) {
                JCIf ei = (JCIf) el;
                line("} else if (" + cond(ei.cond) + ") {");
                body(ei.thenpart);
                el = ei.elsepart;
            }
            if (el != null) {
                line("} else {");
                body(el);
            }
            line("}");
            break;
        }
        case WHILELOOP: {
            JCWhileLoop w = (JCWhileLoop) s;
            line("while (" + cond(w.cond) + ") {");
            body(w.body);
            line("}");
            break;
        }
        case DOLOOP: {
            JCDoWhileLoop w = (JCDoWhileLoop) s;
            line("do {");
            body(w.body);
            line("} while (" + cond(w.cond) + ");");
            break;
        }
        case FORLOOP: {
            JCForLoop f = (JCForLoop) s;
            List<String> init = new ArrayList<>();
            boolean decl = false;
            for (JCStatement st : f.init) {
                if (st instanceof JCVariableDecl) {
                    JCVariableDecl v = (JCVariableDecl) st;
                    decl = true;
                    init.add(Names.local(v.name.toString()) + (v.init == null ? "" : " = " + conv(v.init, v.sym.type)));
                } else {
                    init.add(expr(((JCExpressionStatement) st).expr, 1));
                }
            }
            List<String> step = new ArrayList<>();
            for (JCExpressionStatement st : f.step) step.add(expr(st.expr, 1));
            line("for (" + (decl ? "let " : "") + String.join(", ", init) + "; " + (f.cond == null ? "" : expr(f.cond, 0))
                + "; " + String.join(", ", step) + ") {");
            body(f.body);
            line("}");
            break;
        }
        case FOREACHLOOP: {
            JCEnhancedForLoop f = (JCEnhancedForLoop) s;
            if (f.expr.type instanceof Type.ArrayType) {
                line("for (let " + Names.local(f.var.name.toString()) + " of " + iterable(f.expr) + ") {");
                body(f.body);
                line("}");
                break;
            }
            // Iterable: Java's own loop over iterator(), hasNext() and next()
            String it = "$it" + (tmp++);
            line("for (const " + it + " = " + expr(f.expr, P_POSTFIX) + ".iterator(); " + it + ".hasNext(); ) {");
            indent++;
            line("let " + Names.local(f.var.name.toString()) + " = " + it + ".next();");
            indent--;
            body(f.body);
            line("}");
            break;
        }
        case LABELLED: {
            JCLabeledStatement l = (JCLabeledStatement) s;
            line(l.label + ":");
            stmt(l.body);
            break;
        }
        case SWITCH: {
            JCSwitch sw = (JCSwitch) s;
            switchBody(sw.selector, sw.cases);
            break;
        }
        case YIELD: {
            // only in a switch expression, which is a function: its value is returned
            line("return " + expr(((JCYield) s).value, 0) + ";");
            break;
        }
        case BREAK: {
            JCBreak b = (JCBreak) s;
            line("break" + (b.label != null ? " " + b.label : "") + ";");
            break;
        }
        case CONTINUE: {
            JCContinue b = (JCContinue) s;
            line("continue" + (b.label != null ? " " + b.label : "") + ";");
            break;
        }
        case RETURN: {
            JCReturn r = (JCReturn) s;
            MethodSymbol m = methodStack.peek();
            if (r.expr == null) {
                line(m != null && m.isConstructor() && lambdaDepth == 0 ? "return this;" : "return;");
            } else {
                Type rt = lambdaReturn != null && lambdaDepth > 0 ? lambdaReturn : (m != null ? m.getReturnType() : null);
                line("return " + (rt != null ? conv(r.expr, rt) : expr(r.expr, 0)) + ";");
            }
            break;
        }
        case THROW:
            line("throw " + expr(((JCThrow) s).expr, 0) + ";");
            break;
        case TRY:
            emitTry((JCTry) s);
            break;
        case SYNCHRONIZED:
            line("{");
            indent++;
            emitBlockContents(((JCSynchronized) s).body);
            indent--;
            line("}");
            break;
        case SKIP:
            break;
        case ASSERT:
            line("// assert " + ((JCAssert) s).cond.toString().replace('\n', ' '));
            break;
        case CLASSDEF: {
            JCClassDecl cd = (JCClassDecl) s;
            String fn = hoist(cd, null);
            line("// class " + cd.sym.name + ": " + fn + ", below");
            break;
        }
        default:
            throw new RuntimeException("statement " + s.getTag() + " at " + pos(s));
        }
    }

    String localSuper(ClassSymbol c) {
        Type sup = c.getSuperclass();
        if (sup == null || !sup.hasTag(TypeTag.CLASS) || q(sup.tsym).equals("java.lang.Object")) return jre("JObject");
        return classRef((ClassSymbol) sup.tsym);
    }

    String ifaceList(ClassSymbol c) {
        List<String> ifs = new ArrayList<>();
        for (Type i : c.getInterfaces()) ifs.add("'" + ((ClassSymbol) i.tsym).flatname + "'");
        return "[" + String.join(", ", ifs) + "]";
    }

    String pos(JCTree t) {
        return cu.getSourceFile().getName() + ":" + cu.getLineMap().getLineNumber(t.pos);
    }

    void body(JCStatement s) {
        indent++;
        if (s instanceof JCBlock) emitBlockContents((JCBlock) s);
        else stmt(s);
        indent--;
    }

    String switchSelector(JCExpression sel) {
        return cond(sel);
    }

    /** A condition without Java's mandatory parentheses. */
    String cond(JCExpression c) {
        while (c instanceof JCParens) c = ((JCParens) c).expr;
        return expr(c, 0);
    }

    /** A switch statement; cases with arrows (Java 14) end with a break. */
    /** Locals declared directly in a switch's cases: declared before the switch (Java's scope is the whole switch). */
    final java.util.Set<Symbol> hoistedLocals = new java.util.HashSet<>();

    void switchBody(JCExpression selector, List<JCCase> cases) {
        List<String> hoisted = new ArrayList<>();
        for (JCCase c : cases) {
            if (c.caseKind == com.sun.source.tree.CaseTree.CaseKind.RULE) continue;
            for (JCStatement st : c.stats) {
                if (st instanceof JCVariableDecl) {
                    JCVariableDecl v = (JCVariableDecl) st;
                    hoistedLocals.add(v.sym);
                    hoisted.add(Names.local(v.name.toString()) + ": " + tsType(v.sym.type));
                }
            }
        }
        if (!hoisted.isEmpty()) {
            line("{");
            indent++;
            line("let " + String.join(", ", hoisted) + ";");
        }
        switchCases(selector, cases);
        if (!hoisted.isEmpty()) {
            indent--;
            line("}");
        }
    }

    void switchCases(JCExpression selector, List<JCCase> cases) {
        line("switch (" + switchSelector(selector) + ") {");
        indent++;
        for (JCCase c : cases) {
            for (JCCaseLabel lab : c.labels) {
                if (lab instanceof JCDefaultCaseLabel) line("default:");
                else line("case " + caseLabel(((JCConstantCaseLabel) lab).expr, selector.type) + ":");
            }
            indent++;
            if (c.caseKind == com.sun.source.tree.CaseTree.CaseKind.RULE) {
                line("{");
                indent++;
                for (JCStatement st : c.stats) stmt(st);
                line("break;");
                indent--;
                line("}");
            } else {
                for (JCStatement st : c.stats) stmt(st);
            }
            indent--;
        }
        indent--;
        line("}");
    }

    /** A switch expression: a function called in place, whose yields return. */
    String switchExpression(JCSwitchExpression sw) {
        int mark = out.length();
        int ind = indent;
        indent = 1;
        switchBody(sw.selector, sw.cases);
        indent = ind;
        String body = out.substring(mark);
        out.setLength(mark);
        return "(() => {\n" + body + "})()";
    }

    String caseLabel(JCExpression e, Type selType) {
        Symbol s = TreeInfo.symbol(e);
        if (s instanceof VarSymbol && (s.flags() & Flags.ENUM) != 0) {
            return classRef((ClassSymbol) s.owner) + "." + names.field((VarSymbol) s);
        }
        return expr(e, 0);
    }

    String iterable(JCExpression e) {
        return expr(e, 0);
    }

    void emitTry(JCTry t) {
        boolean res = !t.resources.isEmpty();
        boolean outer = res && (!t.catchers.isEmpty() || t.finalizer != null);
        if (res) {
            line("{");
            indent++;
        }
        if (outer) {
            // the catch clauses also catch what the resources' initializers throw
            line("try {");
            indent++;
        }
        if (res) {
            // one try per resource: a resource is closed when one after it fails to open
            List<String> resNames = new ArrayList<>();
            for (JCTree r : t.resources) {
                String n;
                if (r instanceof JCVariableDecl) {
                    JCVariableDecl v = (JCVariableDecl) r;
                    n = Names.local(v.name.toString());
                    line("const " + n + " = " + expr(v.init, 0) + ";");
                } else {
                    n = "$res" + (tmp++);
                    line("const " + n + " = " + expr((JCExpression) r, 0) + ";");
                }
                resNames.add(n);
                line("try {");
                indent++;
            }
            emitBlockContents(t.body);
            for (int i = resNames.size() - 1; i >= 0; i--) {
                indent--;
                line("} finally {");
                line("  if (" + resNames.get(i) + " != null) " + resNames.get(i) + ".close();");
                line("}");
            }
            if (outer) indent--;
        } else {
            line("try {");
            indent++;
            emitBlockContents(t.body);
            indent--;
        }
        if (!res || outer) {
            if (!t.catchers.isEmpty()) {
                String ev = "$e" + (tmp++);
                line("} catch (" + ev + ") {");
                indent++;
                boolean first = true;
                boolean closedAll = false;
                for (JCCatch c : t.catchers) {
                    List<Type> alts = new ArrayList<>();
                    if (c.param.vartype instanceof JCTypeUnion) {
                        for (JCExpression a : ((JCTypeUnion) c.param.vartype).alternatives) alts.add(a.type);
                    } else alts.add(c.param.sym.type);
                    List<String> conds = new ArrayList<>();
                    boolean all = false;
                    for (Type a : alts) {
                        String qn = q(a.tsym);
                        if (qn.equals("java.lang.Throwable")) all = true;
                        conds.add(jre("$J") + ".isa(" + ev + ", " + classRef((ClassSymbol) a.tsym) + ")");
                    }
                    String n = Names.local(c.param.name.toString());
                    if (all) {
                        line((first ? "" : "} else ") + "{");
                        closedAll = true;
                    } else {
                        line((first ? "if (" : "} else if (") + String.join(" || ", conds) + ") {");
                    }
                    indent++;
                    line("let " + n + " = " + jre("$J") + ".exc(" + ev + ");");
                    emitBlockContents(c.body);
                    indent--;
                    first = false;
                    if (closedAll) break;
                }
                if (!closedAll) {
                    line("} else {");
                    line("  throw " + ev + ";");
                }
                line("}");
                indent--;
            }
            if (t.finalizer != null) {
                line("} finally {");
                indent++;
                emitBlockContents(t.finalizer);
                indent--;
            }
            line("}");
        }
        if (res) {
            indent--;
            line("}");
        }
    }

    // ---------------------------------------------------------------- expressions

    static final int P_ASSIGN = 3, P_COND = 4, P_OR = 5, P_AND = 6, P_BOR = 7, P_BXOR = 8, P_BAND = 9,
        P_EQ = 10, P_REL = 11, P_SHIFT = 12, P_ADD = 13, P_MUL = 14, P_UNARY = 16, P_POSTFIX = 17, P_PRIMARY = 20;

    int lastPrec;

    /** Emits an expression; wraps it in parentheses if its precedence is below minPrec. */
    String expr(JCExpression e, int minPrec) {
        String s = expr0(e);
        int p = lastPrec;
        if (p < minPrec) {
            lastPrec = P_PRIMARY;
            return "(" + s + ")";
        }
        lastPrec = p;
        return s;
    }

    String wrap(String s, int prec, int minPrec) {
        lastPrec = prec < minPrec ? P_PRIMARY : prec;
        return prec < minPrec ? "(" + s + ")" : s;
    }

    String expr0(JCExpression e) {
        lastPrec = P_PRIMARY;
        switch (e.getTag()) {
        case PARENS: {
            String s = expr(((JCParens) e).expr, 0);
            lastPrec = P_PRIMARY;
            return "(" + s + ")";
        }
        case LITERAL: return literal((JCLiteral) e);
        case IDENT: return ident((JCIdent) e);
        case SELECT: return select((JCFieldAccess) e);
        case APPLY: return invoke((JCMethodInvocation) e);
        case NEWCLASS: return newClass((JCNewClass) e);
        case NEWARRAY: return newArray((JCNewArray) e);
        case ASSIGN: {
            JCAssign a = (JCAssign) e;
            String l = expr(a.lhs, P_UNARY);
            String r = conv(a.rhs, a.lhs.type);
            lastPrec = P_ASSIGN;
            return l + " = " + r;
        }
        case CONDEXPR: {
            JCConditional c = (JCConditional) e;
            String cond = expr(c.cond, P_OR);
            String a = conv(c.truepart, e.type);
            a = lastPrec <= P_ASSIGN ? "(" + a + ")" : a;
            String b = conv(c.falsepart, e.type);
            b = lastPrec < P_ASSIGN ? "(" + b + ")" : b;
            lastPrec = P_COND;
            return cond + " ? " + a + " : " + b;
        }
        case TYPECAST: return cast((JCTypeCast) e);
        case TYPETEST: {
            JCInstanceOf t = (JCInstanceOf) e;
            Type tt = t.pattern.type;
            boolean unfn = unfnNeeded(t.expr.type, tt);
            String x = unfn ? jre("$J") + ".unfn(" + expr(t.expr, P_ASSIGN) + ")" : expr(t.expr, P_REL + 1);
            if (t.pattern instanceof com.sun.tools.javac.tree.JCTree.JCBindingPattern) {
                // the pattern's variable takes the value (declared by stmt)
                String v = Names.local(((com.sun.tools.javac.tree.JCTree.JCBindingPattern) t.pattern).var.name.toString());
                x = "(" + v + " = " + (unfn ? x : expr(t.expr, P_ASSIGN)) + ")";
            }
            return wrap(instanceOf(x, tt), P_REL, 0);
        }
        case INDEXED: {
            JCArrayAccess a = (JCArrayAccess) e;
            return expr(a.indexed, P_POSTFIX) + "[" + expr(a.index, 0) + "]";
        }
        case LAMBDA: return objectIfNeeded(lambda((JCLambda) e), ((JCLambda) e).target);
        case REFERENCE: return objectIfNeeded(memberRef((JCMemberReference) e), ((JCMemberReference) e).target);
        case SWITCH_EXPRESSION: return switchExpression((JCSwitchExpression) e);
        default:
            if (e instanceof JCUnary) return unary((JCUnary) e);
            if (e instanceof JCAssignOp) return assignOp((JCAssignOp) e);
            if (e instanceof JCBinary) return binary((JCBinary) e);
            throw new RuntimeException("expression " + e.getTag() + " at " + pos(e));
        }
    }

    // ---- literals

    String literal(JCLiteral l) {
        Object v = l.value;
        switch (l.typetag) {
        case BOT: return "null";
        case BOOLEAN: return ((Integer) v) != 0 ? "true" : "false";
        case CHAR: return charLit((Integer) v);
        case CLASS: return str((String) v);
        default: return numLit(v, l.type);
        }
    }

    String charLit(int c) {
        String shown = c >= 32 && c < 127 && c != '\'' && c != '\\' && c != '*' && c != '/' ? "'" + (char) c + "'" : "\\u" + String.format("%04x", c);
        return c + " /* " + shown + " */";
    }

    String numLit(Object v, Type t) {
        if (v instanceof Float) {
            float f = (Float) v;
            if (Float.isNaN(f)) return "NaN";
            if (Float.isInfinite(f)) return f > 0 ? "Infinity" : "-Infinity";
            String s = Float.toString(f);
            if ((double) f == Double.parseDouble(s)) return jsNum(s);
            lastPrec = P_PRIMARY;
            return "Math.fround(" + jsNum(s) + ")";
        }
        if (v instanceof Double) {
            double d = (Double) v;
            if (Double.isNaN(d)) return "NaN";
            if (Double.isInfinite(d)) return d > 0 ? "Infinity" : "-Infinity";
            String s = jsNum(Double.toString(d));
            if (d < 0) lastPrec = P_UNARY;
            return s;
        }
        if (v instanceof Long) {
            long x = (Long) v;
            if (Math.abs(x) > (1L << 53)) System.err.println("warning: long literal beyond 2^53: " + x + " in " + cu.getSourceFile().getName());
            if (x < 0) lastPrec = P_UNARY;
            return Long.toString(x);
        }
        if (v instanceof Number) {
            long x = ((Number) v).longValue();
            if (x < 0) lastPrec = P_UNARY;
            return Long.toString(x);
        }
        return String.valueOf(v);
    }

    static String jsNum(String javaRepr) {
        String s = javaRepr;
        if (s.endsWith(".0")) s = s.substring(0, s.length() - 2);
        s = s.replace(".0E", "E");
        return s;
    }

    String constLiteral(Object cv, Type t) {
        switch (t.getTag()) {
        case BOOLEAN: return ((Integer) cv) != 0 ? "true" : "false";
        case CHAR: return charLit((Integer) cv);
        case CLASS: return cv instanceof String ? str((String) cv) : String.valueOf(cv);
        default: {
            String s = numLit(cv, t);
            lastPrec = P_PRIMARY;
            return s;
        }
        }
    }

    static String str(String s) {
        StringBuilder sb = new StringBuilder("'");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
            case '\'': sb.append("\\'"); break;
            case '\\': sb.append("\\\\"); break;
            case '\n': sb.append("\\n"); break;
            case '\r': sb.append("\\r"); break;
            case '\t': sb.append("\\t"); break;
            default:
                if (c < 32 || c == 0x2028 || c == 0x2029 || (c >= 0xd800 && c <= 0xdfff)) sb.append(String.format("\\u%04x", (int) c));
                else sb.append(c);
            }
        }
        return sb.append('\'').toString();
    }

    String defaultValue(Type t) {
        switch (t.getTag()) {
        case BOOLEAN: return "false";
        case BYTE: case SHORT: case CHAR: case INT: case LONG: case FLOAT: case DOUBLE: return "0";
        default: return "null";
        }
    }

    // ---- names

    /** this, or this.$outer..., for a member owned by (a supertype of) owner. */
    String thisFor(Symbol owner) {
        StringBuilder sb = new StringBuilder("this");
        // the enclosing instances, innermost first (an inner class of an inner class reaches two levels out)
        for (ClassSymbol c = classStack.peek(); c != null; ) {
            if (owner instanceof ClassSymbol && (c == owner || c.isSubClass(owner, prog.types))) return sb.toString();
            if (!prog.hasOuter(c)) break;
            sb.append(".$outer");
            Symbol o = c.owner;
            c = o == null ? null : o.enclClass();
        }
        return sb.toString();
    }

    String ident(JCIdent id) {
        Symbol s = id.sym;
        String n = id.name.toString();
        if (n.equals("this")) return "this";
        if (n.equals("super")) return "super";
        if (s instanceof ClassSymbol) return classRef((ClassSymbol) s);
        if (s instanceof VarSymbol) {
            VarSymbol v = (VarSymbol) s;
            if (v.owner.kind == Kind.MTH || v.owner.kind == Kind.VAR || v.owner.kind != Kind.TYP) return localVar(v);
            return fieldAccess(v, null, null);
        }
        if (s instanceof Symbol.PackageSymbol) return n;
        return n;
    }

    /** A field, static or instance; recv is the explicit receiver code or null for implicit. */
    String fieldAccess(VarSymbol v, String recv, JCExpression recvTree) {
        ClassSymbol owner = (ClassSymbol) v.owner;
        // a library superclass's instance field used without a receiver (AbstractList.modCount): this's
        if (!prog.isProgram(owner) && recv == null && !prog.isStatic(v)) recv = thisFor(owner);
        if (!prog.isProgram(owner)) return lib.libField(v, recv, recvTree);
        String f = names.field(v);
        if (prog.isStatic(v)) {
            Object cv = v.getConstValue();
            if (cv != null && (v.flags() & Flags.FINAL) != 0 && false) return constLiteral(cv, v.type);
            return classRef(owner) + "." + f;
        }
        if (recv == null) recv = thisFor(owner);
        return recv + "." + f;
    }

    String select(JCFieldAccess fa) {
        Symbol s = fa.sym;
        String n = fa.name.toString();
        if (s instanceof ClassSymbol) return classRef((ClassSymbol) s);
        if (s instanceof Symbol.PackageSymbol) return n;
        if (n.equals("class")) {
            return jre("$J") + ".cls(" + classLit(fa.selected.type) + ")";
        }
        if (n.equals("this")) return thisFor(fa.selected.type.tsym);
        if (n.equals("length") && fa.selected.type.hasTag(TypeTag.ARRAY)) return expr(fa.selected, P_POSTFIX) + ".length";
        if (s instanceof VarSymbol) {
            VarSymbol v = (VarSymbol) s;
            if (prog.isStatic(v)) return fieldAccess(v, null, null);
            String recv;
            if (fa.selected instanceof JCIdent && ((JCIdent) fa.selected).name.toString().equals("super")) recv = "this";
            else recv = expr(fa.selected, P_POSTFIX);
            return fieldAccess(v, recv, fa.selected);
        }
        return expr(fa.selected, P_POSTFIX) + "." + n;
    }

    String classLit(Type t) {
        if (t.isPrimitive() || t.hasTag(TypeTag.VOID)) return "'" + t + "'";
        if (t.hasTag(TypeTag.ARRAY)) return "'" + prog.types.erasure(t) + "'";
        return classRef((ClassSymbol) t.tsym);
    }

    // ---- invocations

    String invoke(JCMethodInvocation inv) {
        Symbol s = TreeInfo.symbol(inv.meth);
        if (!(s instanceof MethodSymbol)) throw new RuntimeException("call without method at " + pos(inv));
        MethodSymbol m = (MethodSymbol) s;
        Type mtype = inv.meth.type;
        List<String> args = callArgs(m, inv.args, inv.varargsElement, mtype);
        String recv = null;
        JCExpression recvTree = null;
        boolean superCall = false;
        String ifaceSuper = null;
        if (inv.meth instanceof JCFieldAccess) {
            JCFieldAccess fa = (JCFieldAccess) inv.meth;
            recvTree = fa.selected;
            if (recvTree instanceof JCIdent && ((JCIdent) recvTree).name.toString().equals("super")) {
                superCall = true;
            } else if (recvTree instanceof JCFieldAccess && ((JCFieldAccess) recvTree).name.toString().equals("super")) {
                // Iface.super.m() or Outer.super.m()
                Symbol qs = ((JCFieldAccess) recvTree).selected.type.tsym;
                if (prog.isInterface(qs)) ifaceSuper = classRef((ClassSymbol) qs);
                else superCall = true;
            } else if (!prog.isStatic(m)) {
                recv = expr(recvTree, P_POSTFIX);
            }
        }
        String r = call(m, recv, recvTree, superCall, ifaceSuper, args, inv);
        // a Double or Float from the library (a map's value, a collector's average) is boxed as the
        // translated code boxes its own
        if (!prog.isProgram(m) && inv.type != null && inv.type.hasTag(TypeTag.CLASS)) {
            String rq = q(inv.type.tsym);
            if (rq.equals("java.lang.Double") || rq.equals("java.lang.Float")) {
                lastPrec = P_PRIMARY;
                return jre("$J") + (rq.equals("java.lang.Float") ? ".boxF(" : ".boxD(") + r + ")";
            }
        }
        return r;
    }

    /** Arguments with conversions to the parameter types; varargs packed into an array. */
    List<String> callArgs(MethodSymbol m, List<JCExpression> args, Type varargsElement, Type mtype) {
        List<Type> ptypes = mtype != null && mtype.getParameterTypes() != null ? mtype.getParameterTypes() : m.type.getParameterTypes();
        if (ptypes.size() != m.type.getParameterTypes().size()) ptypes = m.type.getParameterTypes();
        List<String> out = new ArrayList<>();
        int np = ptypes.size();
        int i = 0;
        List<String> packed = null;
        for (JCExpression a : args) {
            Type pt;
            if (varargsElement != null && i >= np - 1) {
                pt = varargsElement;
                if (packed == null) packed = new ArrayList<>();
                packed.add(conv(a, pt));
            } else {
                pt = i < np ? ptypes.get(i) : null;
                out.add(pt == null ? expr(a, P_ASSIGN) : conv(a, pt));
            }
            i++;
        }
        boolean lib = !prog.isProgram(m);
        if (varargsElement != null) {
            // the runtime's varargs methods take rest parameters; translated ones an array
            if (lib) { if (packed != null) out.addAll(packed); }
            else out.add("[" + (packed == null ? "" : String.join(", ", packed)) + "]");
        } else if (lib && m.isVarArgs() && args.size() == np && np > 0) {
            int last = out.size() - 1;
            out.set(last, "..." + out.get(last));
        }
        return out;
    }

    String call(MethodSymbol m, String recv, JCExpression recvTree, boolean superCall, String ifaceSuper,
                List<String> args, JCTree site) {
        ClassSymbol owner = (ClassSymbol) m.owner;
        String a = String.join(", ", args);
        if (!prog.isProgram(m)) {
            String r = lib.libCall(m, recv, recvTree, superCall, args, site);
            if (r != null) return r;
        }
        if (prog.isStatic(m)) {
            return classRef(owner) + "." + names.method(m) + "(" + a + ")";
        }
        // a call on a value of a functional interface: the value is a function
        if (recv != null && recvTree != null && lib.isFunctional(recvTree.type) && isSam(m, recvTree.type)) {
            // the program's own interfaces (Swing's listeners, LazyValue) are also implemented by classes,
            // whose objects reach here unconverted when they were stored as Object: $J.fn makes them functions
            if (prog.isProgram(recvTree.type.tsym)) return jre("$J") + ".fn(" + recv + ", '" + names.method(m) + "')(" + a + ")";
            return recv + "(" + a + ")";
        }
        if (recv != null && recvTree != null && lib.isFunctional(recvTree.type) && !isSam(m, recvTree.type)) {
            String r = lib.fiDefault(m, recv, args);
            if (r != null) return r;
        }
        String name = names.method(m);
        if (superCall) return "super." + (prog.isProgram(m) ? names.declName(m) : name) + "(" + a + ")";
        if (ifaceSuper != null) return ifaceSuper + ".prototype." + name + ".call(this" + (a.isEmpty() ? "" : ", " + a) + ")";
        if (recv == null) recv = thisFor(owner);
        return recv + "." + name + "(" + a + ")";
    }

    /** The single abstract method of the functional interface t (or an override of it). */
    boolean isSam(MethodSymbol m, Type t) {
        MethodSymbol sam = lib.samOf(t);
        if (sam == null) return false;
        return m == sam || (m.name.equals(sam.name) && m.params().size() == sam.params().size()
            && (m.flags() & Flags.DEFAULT) == 0 && !prog.isStatic(m));
    }

    boolean isAbstract(MethodSymbol m) {
        return (m.flags() & Flags.ABSTRACT) != 0;
    }

    // ---- object creation

    String newClass(JCNewClass nc) {
        MethodSymbol ctor = (MethodSymbol) nc.constructor;
        ClassSymbol c = (ClassSymbol) nc.type.tsym;
        if (nc.def != null) return newAnonymous(nc);
        List<String> args = callArgs(ctor, nc.args, nc.varargsElement, nc.constructorType);
        if (!prog.isProgram(c)) {
            String r = lib.libNew(c, ctor, args, nc);
            lastPrec = P_PRIMARY;
            return r;
        }
        String outer = "";
        if (prog.hasOuter(c)) {
            String o = nc.encl != null ? expr(nc.encl, 0) : thisFor(outerOf(c));
            outer = ".$o(" + o + ")";
        }
        if (clinitCollect != null) clinitCollect.add(c.flatname.toString());
        String cls = prog.isLocal(c) ? "(" + classRef(c) + ")" : classRef(c);
        return "new " + cls + "()" + outer + captureArgs(c) + "." + names.ctor(ctor) + "(" + String.join(", ", args) + ")";
    }

    /** The class whose instance an inner or local class captures. */
    Symbol outerOf(ClassSymbol c) {
        Symbol o = c.owner;
        while (!(o instanceof ClassSymbol)) o = o.owner;
        return o;
    }

    String newAnonymous(JCNewClass nc) {
        JCClassDecl def = nc.def;
        ClassSymbol c = def.sym;
        Type sup = c.getSuperclass();
        boolean ifaceBased = !c.getInterfaces().isEmpty() && (sup == null || q(sup.tsym).equals("java.lang.Object"));
        Type iface = ifaceBased ? c.getInterfaces().head : null;
        if (iface != null && lib.isFunctional(iface)) {
            String simple = simpleFunctional(def, iface);
            if (simple != null) return simple;
        }
        ClassSymbol supSym = sup != null && sup.hasTag(TypeTag.CLASS) ? (ClassSymbol) sup.tsym : null;
        String expr = "new (" + hoist(def, null) + ")()";
        if (prog.hasOuter(c)) expr += ".$o(" + thisFor(outerOf(c)) + ")";
        expr += captureArgs(c);
        if (supSym != null && !q(supSym).equals("java.lang.Object")) {
            MethodSymbol superCtor = superCtorOfAnon(nc, supSym);
            List<String> args = superCtor == null ? List.of() : callArgs(superCtor, nc.args, nc.varargsElement, superCtor.type);
            if (prog.isProgram(supSym)) {
                if (superCtor != null) expr += "." + names.ctor(superCtor) + "(" + String.join(", ", args) + ")";
            } else {
                expr += "._" + lib.libClass(supSym) + "(" + String.join(", ", args) + ")";
            }
        }
        if (anonHasInit(def)) expr += ".$init_anon()";
        if (iface != null && lib.isFunctional(iface)) {
            MethodSymbol sam = lib.samOf(iface);
            expr = jre("$J") + ".fn(" + expr + ", '" + names.method(sam) + "')";
        }
        return expr;
    }

    MethodSymbol superCtorOfAnon(JCNewClass nc, ClassSymbol supSym) {
        // javac gives the anonymous class a constructor that calls the superclass constructor chosen
        // for the arguments; find that one by the arguments' count and types
        MethodSymbol anonCtor = (MethodSymbol) nc.constructor;
        JCClassDecl def = nc.def;
        for (JCTree d : def.defs) {
            if (d instanceof JCMethodDecl && ((JCMethodDecl) d).sym.isConstructor()) {
                JCMethodDecl md = (JCMethodDecl) d;
                for (JCStatement st : md.body.stats) {
                    if (TreeInfo.isSelfCall(st)) {
                        Symbol t = TreeInfo.symbol(((JCMethodInvocation) ((JCExpressionStatement) st).expr).meth);
                        if (t instanceof MethodSymbol) return (MethodSymbol) t;
                    }
                }
            }
        }
        for (Symbol x : supSym.members().getSymbolsByName(supSym.name.table.names.init)) {
            if (((MethodSymbol) x).params().size() == anonCtor.params().size()) return (MethodSymbol) x;
        }
        return null;
    }

    boolean anonHasInit(JCClassDecl def) {
        for (JCTree d : def.defs) {
            if (d instanceof JCVariableDecl && ((JCVariableDecl) d).init != null && (((JCVariableDecl) d).sym.flags() & Flags.STATIC) == 0) return true;
            if (d instanceof JCBlock && (((JCBlock) d).flags & Flags.STATIC) == 0) return true;
        }
        return false;
    }

    /** Classes of method bodies (anonymous, local, enum constant bodies), defined once at module level. */
    final List<String> hoisted = new ArrayList<>();
    /** The local variables a hoisted class captures, kept in its fields $cv_name. */
    final Map<ClassSymbol, List<VarSymbol>> captures = new HashMap<>();

    static boolean isLocalVar(Symbol s) {
        return s instanceof VarSymbol && (s.owner.kind == Kind.MTH || s.owner.kind == Kind.VAR);
    }

    List<VarSymbol> computeCaptures(JCClassDecl def) {
        Set<Symbol> declared = new java.util.HashSet<>();
        Set<VarSymbol> refs = new LinkedHashSet<>();
        new TreeScanner() {
            @Override public void visitVarDef(JCVariableDecl t) {
                declared.add(t.sym);
                super.visitVarDef(t);
            }
            @Override public void visitIdent(JCIdent t) {
                if (isLocalVar(t.sym)) refs.add((VarSymbol) t.sym);
            }
        }.scan(def);
        List<VarSymbol> r = new ArrayList<>();
        for (VarSymbol v : refs) if (!declared.contains(v)) r.add(v);
        return r;
    }

    /**
     * Defines a class of a method body once, at module level, as a function that makes it on first use
     * (after the module's classes are linked): Outer$1(). Captured local variables become fields set by
     * $c(...) when an instance is made, before its constructor runs (as javac's synthetic fields).
     */
    String hoist(JCClassDecl def, ClassSymbol enumBase) {
        ClassSymbol c = def.sym;
        boolean anon = prog.isAnonymous(c) || enumBase != null;
        List<VarSymbol> caps = computeCaptures(def);
        captures.put(c, caps);
        String name = hoistName(c);
        StringBuilder saved = new StringBuilder(out);
        int savedIndent = indent;
        Deque<MethodSymbol> savedMethods = new java.util.LinkedList<>(methodStack);
        out.setLength(0);
        indent = 2;
        classStack.push(c);
        int oldLambda = lambdaDepth;
        lambdaDepth = 0;
        Type oldLR = lambdaReturn;
        lambdaReturn = null;
        boolean oldHash = inHashCode;
        emitClassBody(def, anon);
        if (!caps.isEmpty()) {
            List<String> ps = new ArrayList<>();
            List<String> as = new ArrayList<>();
            for (VarSymbol v : caps) {
                ps.add("$" + v.name);
                as.add("this.$cv_" + v.name + " = $" + v.name + ";");
            }
            line("$c(" + String.join(", ", ps) + "): this {");
            line("  " + String.join(" ", as));
            line("  return this;");
            line("}");
        }
        inHashCode = oldHash;
        lambdaDepth = oldLambda;
        lambdaReturn = oldLR;
        classStack.pop();
        indent = savedIndent;
        methodStack.clear();
        methodStack.addAll(savedMethods);
        String bodyText = out.toString();
        out.setLength(0);
        out.append(saved);
        String sup = enumBase != null ? tsName(enumBase) : localSuper(c);
        StringBuilder sb = new StringBuilder();
        sb.append("let $").append(name).append(": any = null;\n");
        sb.append("/** ").append(anon ? "An anonymous class" : "The local class " + c.name).append(" (").append(posOf(def)).append("). */\n");
        sb.append("function ").append(name).append("(): any {\n");
        sb.append("  return $").append(name).append(" ??= ").append(jre("$J")).append(".local(class extends ").append(sup).append(" {\n")
            .append(bodyText).append("  }, '").append(c.flatname).append("', ").append(ifaceList(c)).append(");\n}\n");
        hoisted.add(sb.toString());
        return name + "()";
    }

    String hoistName(ClassSymbol c) {
        return prog.flatLocal(c).replace('.', '_');
    }

    String posOf(JCTree t) {
        String f = cu.getSourceFile().getName();
        return f.substring(f.lastIndexOf('/') + 1) + ":" + cu.getLineMap().getLineNumber(t.pos);
    }

    /** $c(captured values) for a new instance of a hoisted class, or "". */
    String captureArgs(ClassSymbol c) {
        List<VarSymbol> caps = captures.get(c);
        if (caps == null || caps.isEmpty()) return "";
        List<String> as = new ArrayList<>();
        for (VarSymbol v : caps) as.add(localVar(v));
        return ".$c(" + String.join(", ", as) + ")";
    }

    /** A local variable: by its name, or from the fields of the classes that captured it. */
    String localVar(VarSymbol v) {
        StringBuilder sb = new StringBuilder("this");
        for (ClassSymbol c : classStack) {
            List<VarSymbol> caps = captures.get(c);
            if (caps == null) break;
            if (caps.contains(v)) return sb + ".$cv_" + v.name;
            if (!prog.hasOuter(c)) break;
            sb.append(".$outer");
        }
        return Names.local(v.name.toString());
    }

    /** An anonymous class implementing a functional interface with just its one method: an arrow function. */
    String simpleFunctional(JCClassDecl def, Type iface) {
        JCMethodDecl only = null;
        for (JCTree d : def.defs) {
            if (d instanceof JCMethodDecl) {
                JCMethodDecl md = (JCMethodDecl) d;
                if (md.sym.isConstructor()) continue;
                if (only != null) return null;
                only = md;
            } else {
                return null;
            }
        }
        if (only == null || usesThis(only, def.sym)) return null;
        List<String> ps = new ArrayList<>();
        for (JCVariableDecl p : only.params) ps.add(Names.local(p.name.toString()));
        StringBuilder saved = new StringBuilder(out);
        int savedIndent = indent;
        out.setLength(0);
        indent++;
        lambdaDepth++;
        Type oldLR = lambdaReturn;
        lambdaReturn = only.sym.getReturnType();
        emitBlockContents(only.body);
        lambdaReturn = oldLR;
        lambdaDepth--;
        indent = savedIndent;
        String bodyText = out.toString();
        out.setLength(0);
        out.append(saved);
        StringBuilder sb = new StringBuilder();
        sb.append("(").append(String.join(", ", ps)).append(") => {\n").append(bodyText);
        for (int i = 0; i < indent; i++) sb.append("  ");
        sb.append("}");
        lastPrec = P_ASSIGN;
        return sb.toString();
    }

    boolean usesThis(JCTree t, ClassSymbol anon) {
        boolean[] found = { false };
        new TreeScanner() {
            @Override public void visitIdent(JCIdent id) {
                String n = id.name.toString();
                if (n.equals("this") || n.equals("super")) found[0] = true;
                Symbol s = id.sym;
                if (s != null && (s instanceof MethodSymbol || s instanceof VarSymbol) && s.owner instanceof ClassSymbol
                    && !prog.isStatic(s) && anon.isSubClass(s.owner, prog.types)) found[0] = true;
            }
            @Override public void visitClassDef(JCClassDecl cd) {
                found[0] = true; // nested classes: keep the general form
            }
        }.scan(t);
        return found[0];
    }

    String newArray(JCNewArray na) {
        if (na.elems != null) {
            Type et = ((Type.ArrayType) na.type).elemtype;
            List<String> es = new ArrayList<>();
            for (JCExpression e : na.elems) es.add(conv(e, et));
            return "[" + String.join(", ", es) + "]";
        }
        Type t = na.type;
        List<String> dims = new ArrayList<>();
        for (JCExpression d : na.dims) dims.add(expr(d, 0));
        Type et = t;
        for (int i = 0; i < na.dims.size(); i++) et = ((Type.ArrayType) et).elemtype;
        String def = et.hasTag(TypeTag.ARRAY) ? "null" : defaultValue(et);
        if (dims.size() == 1) return jre("$J") + ".newArray(" + dims.get(0) + ", " + def + ")";
        return jre("$J") + ".newArrayN([" + String.join(", ", dims) + "], " + def + ")";
    }

    // ---- lambdas and method references

    Type lambdaReturn = null;

    String lambda(JCLambda l) {
        List<String> ps = new ArrayList<>();
        for (JCVariableDecl p : l.params) ps.add(Names.local(p.name.toString()));
        Type desc = prog.types.findDescriptorType(l.target);
        Type rt = desc.getReturnType();
        String head = "(" + String.join(", ", ps) + ") => ";
        lambdaDepth++;
        Type old = lambdaReturn;
        lambdaReturn = rt;
        String r;
        if (l.body instanceof JCExpression) {
            JCExpression b = (JCExpression) l.body;
            String code = rt.hasTag(TypeTag.VOID) ? expr(b, P_ASSIGN) : conv(b, rt);
            if (lastPrec < P_ASSIGN || code.startsWith("{")) code = "(" + code + ")";
            r = head + code;
        } else {
            StringBuilder saved = new StringBuilder(out);
            int savedIndent = indent;
            out.setLength(0);
            indent++;
            emitBlockContents((JCBlock) l.body);
            indent = savedIndent;
            String bodyText = out.toString();
            out.setLength(0);
            out.append(saved);
            StringBuilder sb = new StringBuilder(head).append("{\n").append(bodyText);
            for (int i = 0; i < indent; i++) sb.append("  ");
            r = sb.append("}").toString();
        }
        lambdaReturn = old;
        lambdaDepth--;
        lastPrec = P_ASSIGN;
        return r;
    }

    String memberRef(JCMemberReference mr) {
        Type desc = prog.types.findDescriptorType(mr.target);
        int n = desc.getParameterTypes().size();
        List<String> ps = new ArrayList<>();
        for (int i = 0; i < n; i++) ps.add("$p" + i);
        String head = "(" + String.join(", ", ps) + ") => ";
        Symbol s = mr.sym;
        String body;
        switch (mr.kind) {
        case ARRAY_CTOR:
            body = jre("$J") + ".newArray($p0, null)";
            break;
        case TOPLEVEL: case IMPLICIT_INNER: {
            MethodSymbol ctor = (MethodSymbol) s;
            ClassSymbol c = (ClassSymbol) ctor.owner;
            List<String> args = refArgs(ctor, ps, 0);
            if (!prog.isProgram(c)) body = lib.libNew(c, ctor, args, mr);
            else {
                String outer = prog.hasOuter(c) ? ".$o(" + thisFor(outerOf(c)) + ")" : "";
                body = "new " + (prog.isLocal(c) ? "(" + classRef(c) + ")" : classRef(c)) + "()" + outer + captureArgs(c) + "." + names.ctor(ctor) + "(" + String.join(", ", args) + ")";
            }
            break;
        }
        case STATIC: {
            MethodSymbol m = (MethodSymbol) s;
            body = call(m, null, null, false, null, refArgs(m, ps, 0), mr);
            break;
        }
        case UNBOUND: {
            MethodSymbol m = (MethodSymbol) s;
            body = call(m, "$p0", fakeRecv(mr.expr.type), false, null, refArgs(m, ps, 1), mr);
            break;
        }
        case SUPER: {
            MethodSymbol m = (MethodSymbol) s;
            body = call(m, null, null, true, null, refArgs(m, ps, 0), mr);
            break;
        }
        case BOUND: default: {
            MethodSymbol m = (MethodSymbol) s;
            String recv = expr(mr.expr, P_POSTFIX);
            boolean simple = mr.expr instanceof JCIdent;
            if (simple) {
                body = call(m, recv, mr.expr, false, null, refArgs(m, ps, 0), mr);
            } else {
                body = call(m, "$r", mr.expr, false, null, refArgs(m, ps, 0), mr);
                lastPrec = P_PRIMARY;
                return "(($r) => " + head + body + ")(" + recv + ")";
            }
            break;
        }
        }
        lastPrec = P_ASSIGN;
        if (body.startsWith("{")) body = "(" + body + ")";
        return head + body;
    }

    /** A lambda for an interface whose values are objects (Iterable, Comparable): an object with the method. */
    String objectIfNeeded(String fn, Type target) {
        if (target == null || lib.isFunctional(target)) return fn;
        MethodSymbol sam = lib.samOf(target);
        if (sam == null) return fn;
        lastPrec = P_PRIMARY;
        return jre("$J") + ".lambdaObj(" + fn + ", '" + names.method(sam) + "', '" + ((ClassSymbol) target.tsym).flatname + "')";
    }

    JCExpression fakeRecv(Type t) {
        JCIdent id = com.sun.tools.javac.tree.TreeMaker.instance(prog.context).Ident(prog.context.get(com.sun.tools.javac.util.Names.namesKey).fromString("$p0"));
        id.type = t;
        return id;
    }

    List<String> refArgs(MethodSymbol m, List<String> ps, int from) {
        List<String> args = new ArrayList<>(ps.subList(Math.min(from, ps.size()), ps.size()));
        int np = m.params().size();
        if (m.isVarArgs() && args.size() != np) {
            List<String> fixed = new ArrayList<>(args.subList(0, np - 1));
            fixed.add("[" + String.join(", ", args.subList(np - 1, args.size())) + "]");
            return fixed;
        }
        return args;
    }

    // ---- operators

    enum K { I, L, F, D, B, S, O }

    K kind(Type t) {
        if (t == null) return K.O;
        switch (t.getTag()) {
        case BYTE: case SHORT: case CHAR: case INT: return K.I;
        case LONG: return K.L;
        case FLOAT: return K.F;
        case DOUBLE: return K.D;
        case BOOLEAN: return K.B;
        case CLASS:
            String qn = q(t.tsym);
            if (qn.equals("java.lang.String")) return K.S;
            Type u = prog.types.unboxedType(t);
            if (u != null && u.isPrimitive()) return kind(u);
            return K.O;
        default: return K.O;
        }
    }

    K promote(K a, K b) {
        if (a == K.D || b == K.D) return K.D;
        if (a == K.F || b == K.F) return K.F;
        if (a == K.L || b == K.L) return K.L;
        return K.I;
    }

    String binary(JCBinary b) {
        JCTree.Tag op = b.getTag();
        K lk = kind(b.lhs.type), rk = kind(b.rhs.type);
        if (op == JCTree.Tag.PLUS && kind(b.type) == K.S) {
            String l = strOperand(b.lhs, P_ADD);
            String r = strOperand(b.rhs, P_ADD + 1);
            return wrap(l + " + " + r, P_ADD, 0);
        }
        switch (op) {
        case AND: return wrap(expr(b.lhs, P_AND) + " && " + expr(b.rhs, P_AND + 1), P_AND, 0);
        case OR: return wrap(expr(b.lhs, P_OR) + " || " + expr(b.rhs, P_OR + 1), P_OR, 0);
        case EQ: case NE: {
            boolean nl = isNull(b.lhs) || isNull(b.rhs);
            String o = op == JCTree.Tag.EQ ? (nl ? "==" : "===") : (nl ? "!=" : "!==");
            // a boxed number compared with a primitive one is unboxed (Java's numeric comparison)
            boolean numeric = !nl && (b.lhs.type.isPrimitive() || b.rhs.type.isPrimitive());
            String ls = numeric ? cmpOperand(b.lhs, rk, P_EQ) : expr(b.lhs, P_EQ);
            String rs = numeric ? cmpOperand(b.rhs, lk, P_EQ + 1) : expr(b.rhs, P_EQ + 1);
            return wrap(ls + " " + o + " " + rs, P_EQ, 0);
        }
        case LT: case GT: case LE: case GE:
            return wrap(cmpOperand(b.lhs, rk, P_REL) + " " + opText(op) + " " + cmpOperand(b.rhs, lk, P_REL + 1), P_REL, 0);
        default:
        }
        if (lk == K.B && rk == K.B) {
            // non-short-circuit boolean operators
            String o = op == JCTree.Tag.BITAND ? "&" : op == JCTree.Tag.BITOR ? "|" : "^";
            lastPrec = P_UNARY;
            return "!!(" + expr(b.lhs, P_BAND) + " " + o + " " + expr(b.rhs, P_BAND + 1) + ")";
        }
        K k = (op == JCTree.Tag.SL || op == JCTree.Tag.SR || op == JCTree.Tag.USR) ? (lk == K.L ? K.L : K.I) : promote(lk, rk);
        return arith(op, k, b.lhs, b.rhs);
    }

    /** An operand of a comparison: an integer compared with a float is converted to float first, as Java does. */
    String cmpOperand(JCExpression e, K other, int prec) {
        K k = kind(e.type);
        if (other == K.F && (k == K.I || k == K.L)) {
            String v = num(e, P_ASSIGN);
            lastPrec = P_PRIMARY;
            return "Math.fround(" + v + ")";
        }
        return num(e, prec);
    }

    /** An lvalue that can be written twice (x, this.x, a.b.c, but not a[i++] or f().x). */
    boolean pure(JCExpression e) {
        if (e instanceof JCIdent) return true;
        if (e instanceof JCFieldAccess) return pure(((JCFieldAccess) e).selected);
        if (e instanceof JCArrayAccess) {
            JCArrayAccess a = (JCArrayAccess) e;
            return pure(a.indexed) && (a.index instanceof JCIdent || a.index instanceof JCLiteral);
        }
        return false;
    }

    /** An operand of an int sum: a nested int sum (also in parentheses) without its own | 0. */
    String intSumOperand(JCExpression e, int prec) {
        JCExpression x = e;
        while (x instanceof JCParens) x = ((JCParens) x).expr;
        if (x instanceof JCBinary) {
            JCBinary b = (JCBinary) x;
            JCTree.Tag op = b.getTag();
            if ((op == JCTree.Tag.PLUS || op == JCTree.Tag.MINUS) && kind(b.type) == K.I
                && promote(kind(b.lhs.type), kind(b.rhs.type)) == K.I) {
                String s = intSumOperand(b.lhs, opPrec(op)) + " " + opText(op) + " " + intSumOperand(b.rhs, opPrec(op) + 1);
                return wrap(s, P_ADD, prec);
            }
        }
        return expr(e, prec);
    }

    String arith(JCTree.Tag op, K k, JCExpression l, JCExpression r) {
        String ls, rs;
        switch (k) {
        case I:
            switch (op) {
            case MUL:
                ls = num(l, P_ASSIGN); rs = num(r, P_ASSIGN);
                lastPrec = P_PRIMARY;
                return "Math.imul(" + ls + ", " + rs + ")";
            case DIV:
                ls = num(l, P_ASSIGN); rs = num(r, P_ASSIGN);
                lastPrec = P_PRIMARY;
                return jre("$J") + ".idiv(" + ls + ", " + rs + ")";
            case PLUS: case MINUS: {
                // Java's int sums wrap around: one | 0 at the top of a chain of int sums (exact in a double)
                String s = intSumOperand(l, opPrec(op)) + " " + opText(op) + " " + intSumOperand(r, opPrec(op) + 1);
                lastPrec = P_BOR;
                return "(" + s + ") | 0";
            }
            default:
                return wrap(num(l, opPrec(op)) + " " + opText(op) + " " + num(r, opPrec(op) + 1), opPrec(op), 0);
            }
        case L:
            switch (op) {
            case DIV: case SL: case SR: case USR: case BITAND: case BITOR: case BITXOR: {
                ls = num(l, P_ASSIGN); rs = num(r, P_ASSIGN);
                lastPrec = P_PRIMARY;
                String f = op == JCTree.Tag.DIV ? "ldiv" : op == JCTree.Tag.SL ? "lshl" : op == JCTree.Tag.SR ? "lshr"
                    : op == JCTree.Tag.USR ? "lushr" : op == JCTree.Tag.BITAND ? "land" : op == JCTree.Tag.BITOR ? "lor" : "lxor";
                return jre("$J") + "." + f + "(" + ls + ", " + rs + ")";
            }
            default:
                return wrap(num(l, opPrec(op)) + " " + opText(op) + " " + num(r, opPrec(op) + 1), opPrec(op), 0);
            }
        case F: {
            String s = num(l, opPrec(op)) + " " + opText(op) + " " + num(r, opPrec(op) + 1);
            lastPrec = P_PRIMARY;
            return "Math.fround(" + s + ")";
        }
        default:
            return wrap(num(l, opPrec(op)) + " " + opText(op) + " " + num(r, opPrec(op) + 1), opPrec(op), 0);
        }
    }

    boolean isNull(JCExpression e) {
        return e instanceof JCLiteral && ((JCLiteral) e).typetag == TypeTag.BOT;
    }

    String strOperand(JCExpression e, int prec) {
        K k = kind(e.type);
        if (e.type != null && e.type.hasTag(TypeTag.CHAR)) {
            lastPrec = P_PRIMARY;
            return "String.fromCharCode(" + expr(e, P_ASSIGN) + ")";
        }
        if (e.type != null && e.type.hasTag(TypeTag.CLASS) && q(e.type.tsym).equals("java.lang.Character")) {
            // a boxed char (a number here, or null)
            String s = expr(e, P_ASSIGN);
            lastPrec = P_PRIMARY;
            return jre("$J") + ".cstr(" + s + ")";
        }
        if (k == K.F && e.type.isPrimitive()) { String s = expr(e, P_ASSIGN); lastPrec = P_PRIMARY; return jre("$J") + ".fstr(" + s + ")"; }
        if (k == K.D && e.type.isPrimitive()) { String s = expr(e, P_ASSIGN); lastPrec = P_PRIMARY; return jre("$J") + ".dstr(" + s + ")"; }
        if (k == K.F || k == K.D) { String s = expr(e, P_ASSIGN); lastPrec = P_PRIMARY; return jre("$J") + ".str(" + s + ")"; }
        if (k == K.S || k == K.I || k == K.L || k == K.B) {
            if (prec == P_ADD && k != K.S && e instanceof JCBinary && ((JCBinary) e).getTag() == JCTree.Tag.PLUS) {
                // a numeric sum on the left of a string concatenation: keep it a sum
                return expr(e, P_PRIMARY);
            }
            return expr(e, prec);
        }
        String s = expr(e, P_ASSIGN);
        lastPrec = P_PRIMARY;
        return jre("$J") + ".str(" + s + ")";
    }

    static String opText(JCTree.Tag op) {
        switch (op) {
        case PLUS: return "+"; case MINUS: return "-"; case MUL: return "*"; case DIV: return "/"; case MOD: return "%";
        case SL: return "<<"; case SR: return ">>"; case USR: return ">>>";
        case LT: return "<"; case GT: return ">"; case LE: return "<="; case GE: return ">=";
        case BITAND: return "&"; case BITOR: return "|"; case BITXOR: return "^";
        case PLUS_ASG: return "+"; case MINUS_ASG: return "-"; case MUL_ASG: return "*"; case DIV_ASG: return "/";
        case MOD_ASG: return "%"; case SL_ASG: return "<<"; case SR_ASG: return ">>"; case USR_ASG: return ">>>";
        case BITAND_ASG: return "&"; case BITOR_ASG: return "|"; case BITXOR_ASG: return "^";
        default: throw new RuntimeException("op " + op);
        }
    }

    static int opPrec(JCTree.Tag op) {
        switch (op) {
        case MUL: case DIV: case MOD: return P_MUL;
        case PLUS: case MINUS: return P_ADD;
        case SL: case SR: case USR: return P_SHIFT;
        case BITAND: return P_BAND; case BITXOR: return P_BXOR; case BITOR: return P_BOR;
        default: return P_REL;
        }
    }

    static JCTree.Tag baseOp(JCTree.Tag t) {
        switch (t) {
        case PLUS_ASG: return JCTree.Tag.PLUS; case MINUS_ASG: return JCTree.Tag.MINUS; case MUL_ASG: return JCTree.Tag.MUL;
        case DIV_ASG: return JCTree.Tag.DIV; case MOD_ASG: return JCTree.Tag.MOD; case SL_ASG: return JCTree.Tag.SL;
        case SR_ASG: return JCTree.Tag.SR; case USR_ASG: return JCTree.Tag.USR; case BITAND_ASG: return JCTree.Tag.BITAND;
        case BITOR_ASG: return JCTree.Tag.BITOR; case BITXOR_ASG: return JCTree.Tag.BITXOR;
        default: throw new RuntimeException("op " + t);
        }
    }

    String assignOp(JCAssignOp a) {
        JCTree.Tag op = baseOp(a.getTag());
        K lk = kind(a.lhs.type), rk = kind(a.rhs.type);
        String l = expr(a.lhs, P_UNARY);
        if (lk == K.S) {
            String r = strOperand(a.rhs, P_ASSIGN);
            lastPrec = P_ASSIGN;
            return l + " += " + r;
        }
        if (lk == K.B) {
            String o = opText(op);
            String r = expr(a.rhs, P_BAND + 1);
            lastPrec = P_ASSIGN;
            return l + " = !!(" + l + " " + o + " " + r + ")";
        }
        boolean shift = op == JCTree.Tag.SL || op == JCTree.Tag.SR || op == JCTree.Tag.USR;
        K k = shift ? (lk == K.L ? K.L : K.I) : promote(lk, rk);
        boolean wrapSum = (op == JCTree.Tag.PLUS || op == JCTree.Tag.MINUS) && pure(a.lhs);
        boolean simple = (k == lk) && (k == K.D || (k == K.I && op != JCTree.Tag.MUL && op != JCTree.Tag.DIV
            && a.lhs.type.getTag() == TypeTag.INT && !wrapSum)
            || (k == K.L && (op == JCTree.Tag.PLUS || op == JCTree.Tag.MINUS || op == JCTree.Tag.MUL || op == JCTree.Tag.MOD)));
        if (simple) {
            String r = expr(a.rhs, P_ASSIGN);
            lastPrec = P_ASSIGN;
            return l + " " + opText(op) + "= " + r;
        }
        String v = arith(op, k, a.lhs, a.rhs);
        v = narrow(v, k, a.lhs.type);
        lastPrec = P_ASSIGN;
        return l + " = " + v;
    }

    /** Narrows a value of kind k to the type t (implicit in compound assignments). */
    String narrow(String v, K k, Type t) {
        switch (t.getTag()) {
        case INT:
            if (k == K.D || k == K.F) return jre("$J") + ".d2i(" + v + ")";
            if (k == K.L) return "(" + v + ") | 0";
            return v;
        case CHAR: return "(" + v + ") & 0xffff";
        case SHORT: return "((" + v + ") << 16) >> 16";
        case BYTE: return "((" + v + ") << 24) >> 24";
        case LONG: if (k == K.D || k == K.F) return jre("$J") + ".d2l(" + v + ")"; return v;
        case FLOAT: if (k == K.D) return "Math.fround(" + v + ")"; return v;
        default: return v;
        }
    }

    String unary(JCUnary u) {
        switch (u.getTag()) {
        case NOT: return wrap("!" + expr(u.arg, P_UNARY), P_UNARY, 0);
        case COMPL: return wrap("~" + expr(u.arg, P_UNARY), P_UNARY, 0);
        case NEG: {
            String a = expr(u.arg, P_UNARY);
            if (a.startsWith("-")) a = "(" + a + ")";
            K k = kind(u.type);
            if (k == K.F) { lastPrec = P_PRIMARY; return "Math.fround(-" + a + ")"; }
            return wrap("-" + a, P_UNARY, 0);
        }
        case POS: return wrap("+" + expr(u.arg, P_UNARY), P_UNARY, 0);
        case PREINC: return wrap("++" + expr(u.arg, P_UNARY), P_UNARY, 0);
        case PREDEC: return wrap("--" + expr(u.arg, P_UNARY), P_UNARY, 0);
        case POSTINC: return wrap(expr(u.arg, P_POSTFIX) + "++", P_POSTFIX, 0);
        case POSTDEC: return wrap(expr(u.arg, P_POSTFIX) + "--", P_POSTFIX, 0);
        default: throw new RuntimeException("unary " + u.getTag());
        }
    }

    String cast(JCTypeCast c) {
        Type to = c.clazz.type;
        Type from = c.expr.type;
        if (to.isPrimitive()) {
            K fk = kind(from), tk = kind(to);
            String v = expr(c.expr, P_ASSIGN);
            switch (to.getTag()) {
            case INT:
                if (fk == K.D || fk == K.F) { lastPrec = P_PRIMARY; return jre("$J") + ".d2i(" + v + ")"; }
                if (fk == K.L) return wrap("(" + v + ") | 0", P_BOR, 0);
                return expr(c.expr, 0);
            case LONG:
                if (fk == K.D || fk == K.F) { lastPrec = P_PRIMARY; return jre("$J") + ".d2l(" + v + ")"; }
                return expr(c.expr, 0);
            case FLOAT:
                if (fk == K.F) return expr(c.expr, 0);
                lastPrec = P_PRIMARY;
                return "Math.fround(" + v + ")";
            case DOUBLE:
                return expr(c.expr, 0);
            case CHAR:
                if (from.hasTag(TypeTag.CHAR)) return expr(c.expr, 0);
                if (fk == K.D || fk == K.F) return wrap(jre("$J") + ".d2i(" + v + ") & 0xffff", P_BAND, 0);
                return wrap("(" + v + ") & 0xffff", P_BAND, 0);
            case SHORT:
                return wrap("((" + (fk == K.D || fk == K.F ? jre("$J") + ".d2i(" + v + ")" : v) + ") << 16) >> 16", P_SHIFT, 0);
            case BYTE:
                return wrap("((" + (fk == K.D || fk == K.F ? jre("$J") + ".d2i(" + v + ")" : v) + ") << 24) >> 24", P_SHIFT, 0);
            case BOOLEAN:
                return expr(c.expr, 0);
            default:
                return expr(c.expr, 0);
            }
        }
        if (unfnNeeded(from, to)) {
            lastPrec = P_PRIMARY;
            return jre("$J") + ".unfn(" + expr(c.expr, P_ASSIGN) + ")";
        }
        return conv(c.expr, to);
    }

    /**
     * A value of a functional interface type may be an object made a function ($J.fn): cast to a class or to
     * another interface, it is the object again.
     */
    boolean unfnNeeded(Type from, Type to) {
        return from != null && to != null && lib.isFunctional(from) && to.hasTag(TypeTag.CLASS) && !lib.isFunctional(to)
            && !q(to.tsym).equals("java.lang.Object");
    }

    String instanceOf(String x, Type t) {
        if (t.hasTag(TypeTag.ARRAY)) return "Array.isArray(" + x + ")";
        ClassSymbol c = (ClassSymbol) t.tsym;
        if (prog.isProgram(c) && !prog.isInterface(c)) return x + " instanceof " + classRef(c);
        return jre("$J") + ".isa(" + x + ", " + classRef(c) + ")";
    }

    /** An expression converted to a target type: functional interfaces, numeric widening to float. */
    String conv(JCExpression e, Type target) {
        if (target == null) return expr(e, P_ASSIGN);
        if (lib.isFunctional(target) && e.type != null && !isNull(e) && !(e instanceof JCLambda) && !(e instanceof JCMemberReference)
            && e.type.hasTag(TypeTag.CLASS) && !lib.isFunctional(e.type) && !q(e.type.tsym).equals("java.lang.Object")
            && !(e instanceof JCNewClass && ((JCNewClass) e).def != null)) {
            MethodSymbol sam = lib.samOf(target);
            if (sam != null) {
                String v = expr(e, P_ASSIGN);
                lastPrec = P_PRIMARY;
                MethodSymbol impl = sam;
                ClassSymbol ec = (ClassSymbol) e.type.tsym;
                if (prog.isProgram(ec)) {
                    MethodSymbol im = sam.implementation(ec, prog.types, true);
                    if (im != null) impl = im;
                }
                return jre("$J") + ".fn(" + v + ", '" + names.method(impl) + "')";
            }
        }
        if (target.isPrimitive() && e.type != null) {
            K tk = kind(target), ek = kind(e.type);
            if (tk == K.F && (ek == K.I || ek == K.L) && !(e instanceof JCLiteral)) {
                String v = expr(e, P_ASSIGN);
                lastPrec = P_PRIMARY;
                return "Math.fround(" + v + ")";
            }
            if (tk == K.F && ek == K.D) {
                String v = expr(e, P_ASSIGN);
                lastPrec = P_PRIMARY;
                return "Math.fround(" + v + ")";
            }
            // unboxing a Double or Float (an object here)
            if (!e.type.isPrimitive() && (ek == K.D || ek == K.F) && !isNull(e)) {
                String v = expr(e, P_UNARY);
                lastPrec = P_UNARY;
                return "+" + v;
            }
        }
        // boxing a float or double: an object that prints as Java prints it
        if (!target.isPrimitive() && e.type != null && e.type.isPrimitive() && !target.hasTag(TypeTag.BOT)) {
            K ek = kind(e.type);
            if (ek == K.D || ek == K.F) {
                boolean toFloat = target.hasTag(TypeTag.CLASS) && q(target.tsym).equals("java.lang.Float") || (ek == K.F && !(target.hasTag(TypeTag.CLASS) && q(target.tsym).equals("java.lang.Double")));
                String v = expr(e, P_ASSIGN);
                lastPrec = P_PRIMARY;
                return jre("$J") + (toFloat ? ".boxF(" : ".boxD(") + v + ")";
            }
        }
        return expr(e, P_ASSIGN);
    }

    /** A numeric operand: a boxed Double or Float (an object here) is unboxed. */
    String num(JCExpression e, int prec) {
        if (e.type != null && !e.type.isPrimitive() && !isNull(e)) {
            K k = kind(e.type);
            if (k == K.D || k == K.F) {
                String v = expr(e, P_UNARY);
                return wrap("+" + v, P_UNARY, prec);
            }
        }
        return expr(e, prec);
    }

    // ---------------------------------------------------------------- index module

    static String indexModule(Program prog, Names names, Map<String, String> written, String jreDir) {
        StringBuilder sb = new StringBuilder();
        sb.append("// @ts-nocheck\n");
        sb.append("// FreeCol 1.2.0: every translated class, linked and initialized (re/freecol/tools/j2ts, do not edit).\n");
        sb.append("import { $J } from './" + jreDir + "/index.ts';\n");
        for (String rel : written.values()) sb.append("import './").append(rel).append("';\n");
        // static initialization order: dependencies first (Java initializes a class on first use)
        List<String> order = new ArrayList<>();
        Set<String> done = new LinkedHashSet<>();
        for (String c : prog.clinitDeps.keySet()) visitClinit(c, prog.clinitDeps, done, order, new LinkedHashSet<>());
        sb.append("\n$J.linkAll();\n");
        sb.append("$J.clinitAll([\n");
        for (String c : order) if (prog.clinitDeps.containsKey(c)) sb.append("  '").append(c).append("',\n");
        sb.append("]);\n");
        return sb.toString();
    }

    static void visitClinit(String c, Map<String, Set<String>> deps, Set<String> done, List<String> order, Set<String> onPath) {
        if (done.contains(c) || onPath.contains(c)) return;
        onPath.add(c);
        Set<String> ds = deps.get(c);
        if (ds != null) for (String d : ds) visitClinit(d, deps, done, order, onPath);
        onPath.remove(c);
        done.add(c);
        order.add(c);
    }
}
