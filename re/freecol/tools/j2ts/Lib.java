import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.code.Symbol.MethodSymbol;
import com.sun.tools.javac.code.Symbol.VarSymbol;
import com.sun.tools.javac.code.Type;
import com.sun.tools.javac.code.TypeTag;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.JCTree.JCExpression;
import com.sun.tools.javac.tree.JCTree.JCMethodInvocation;

/**
 * The Java library as the translated code sees it: the runtime in web/games/freecol/src/jre implements
 * Java's classes under their Java names (JMap, JSet, JObject, JString, ... where the name is a JavaScript
 * global), with Java's method names; this class rewrites what cannot be a plain method call: methods on
 * strings and boxed numbers (JavaScript primitives here), Object's methods on values that may be
 * primitives, overloads that differ only by parameter type (List.remove(int) / remove(Object),
 * StringBuilder.append(char)), and Java semantics that JavaScript lacks (integer parsing, float
 * printing).
 */
public class Lib {
    static final Set<String> BOXED = Set.of("java.lang.Integer", "java.lang.Long", "java.lang.Float",
        "java.lang.Double", "java.lang.Short", "java.lang.Byte", "java.lang.Character", "java.lang.Boolean",
        "java.lang.Number");
    static final Set<String> FUNCTIONAL_LIB = Set.of("java.util.Comparator", "java.lang.Runnable",
        "java.util.concurrent.Callable");

    final Emit e;

    Lib(Emit e) {
        this.e = e;
    }

    String q(Symbol s) {
        return e.prog.qname(s);
    }

    void use(String s) {
        e.libUse.add(s);
    }

    /** Runtime export name of a library class (imported). */
    String libClass(ClassSymbol c) {
        String n = libTypeName(c);
        use("class " + c.flatname);
        return e.jre(n);
    }

    String libTypeName(ClassSymbol c) {
        String qn = q(c);
        switch (qn) {
        case "java.lang.Enum": return "JEnum";
        case "javax.swing.Timer": return "SwingTimer";
        case "java.awt.List": return "AwtList";
        case "java.lang.reflect.Array": return "JArray";
        case "java.lang.Class": return "JClass";
        default:
        }
        String flat = c.flatname.toString();
        String pk = c.packge().getQualifiedName().toString();
        String n = (pk.isEmpty() ? flat : flat.substring(pk.length() + 1)).replace('$', '_');
        if (Emit.GLOBALS.contains(n) || n.equals("Function") || n.equals("Iterator") && false) n = "J" + n;
        return n;
    }

    boolean isFunctional(Type t) {
        if (t == null || !t.hasTag(TypeTag.CLASS)) return false;
        Symbol s = t.tsym;
        if ((s.flags() & Flags.INTERFACE) == 0) return false;
        String qn = q(s);
        if (!(qn.startsWith("java.util.function.") || FUNCTIONAL_LIB.contains(qn) || (e.prog.isProgram(s) && e.prog.lambdaTargets.contains(s)))) return false;
        try {
            return e.prog.types.isFunctionalInterface((com.sun.tools.javac.code.Symbol.TypeSymbol) s);
        } catch (Exception ex) {
            return false;
        }
    }

    MethodSymbol samOf(Type t) {
        try {
            return (MethodSymbol) e.prog.types.findDescriptorSymbol(t.tsym);
        } catch (Exception ex) {
            return null;
        }
    }

    /** A default method of a library functional interface, on a function value. */
    String fiDefault(MethodSymbol m, String recv, List<String> args) {
        ClassSymbol owner = (ClassSymbol) m.owner;
        if (q(owner).equals("java.lang.Object")) return objectMethod(m, recv, args, null);
        if (!e.prog.isProgram(owner)) {
            use("fi " + owner.flatname + "." + m.name);
            List<String> a = new ArrayList<>();
            a.add(recv);
            a.addAll(args);
            String n = m.name.toString();
            // Comparator.thenComparing(Function keyExtractor) vs thenComparing(Comparator other)
            if (n.equals("thenComparing") && args.size() == 1 && ptype(m, 0) != null
                && q(ptype(m, 0).tsym).equals("java.util.function.Function")) n = "thenComparingKey";
            return libClass(owner) + "." + n + "(" + String.join(", ", a) + ")";
        }
        return null;
    }

    String libField(VarSymbol v, String recv, JCExpression recvTree) {
        ClassSymbol owner = (ClassSymbol) v.owner;
        String qn = q(owner);
        String n = v.name.toString();
        Object cv = v.getConstValue();
        if (cv != null && (v.flags() & Flags.STATIC) != 0) return e.constLiteral(cv, v.type);
        if ((v.flags() & Flags.STATIC) != 0) {
            switch (qn + "." + n) {
            case "java.lang.Boolean.TRUE": return "true";
            case "java.lang.Boolean.FALSE": return "false";
            case "java.lang.System.out": return e.jre("$J") + ".out";
            case "java.lang.System.err": return e.jre("$J") + ".err";
            case "java.lang.Integer.TYPE": return e.jre("$J") + ".cls('int')";
            case "java.lang.Float.TYPE": return e.jre("$J") + ".cls('float')";
            case "java.lang.Double.TYPE": return e.jre("$J") + ".cls('double')";
            case "java.lang.Boolean.TYPE": return e.jre("$J") + ".cls('boolean')";
            case "java.lang.Character.TYPE": return e.jre("$J") + ".cls('char')";
            case "java.lang.Long.TYPE": return e.jre("$J") + ".cls('long')";
            default:
            }
            use("field " + owner.flatname + "." + n);
            return libClass(owner) + "." + n;
        }
        use("field " + owner.flatname + "#" + n);
        return recv + "." + n;
    }

    String libNew(ClassSymbol c, MethodSymbol ctor, List<String> args, JCTree site) {
        String qn = q(c);
        String a = String.join(", ", args);
        List<Type> pts = ctor.type.getParameterTypes();
        switch (qn) {
        case "java.lang.String":
            use("new String(" + sig(ctor) + ")");
            return e.jre("JString") + ".newString(" + a + ")";
        case "java.lang.Double":
            if (!pts.isEmpty() && pts.get(0).isPrimitive()) return e.jre("$J") + ".boxD(" + args.get(0) + ")";
            return e.jre("$J") + ".boxD(" + e.jre("$J") + ".parseDouble(" + a + "))";
        case "java.lang.Integer": case "java.lang.Long": case "java.lang.Boolean":
            if (!pts.isEmpty() && pts.get(0).isPrimitive()) return args.get(0);
            use("new " + qn + "(" + sig(ctor) + ")");
            return e.jre("$J") + ".parse" + c.name + "(" + a + ")";
        case "java.lang.Float":
            if (!pts.isEmpty() && pts.get(0).isPrimitive()) return e.jre("$J") + ".boxF(" + args.get(0) + ")";
            return e.jre("$J") + ".boxF(" + e.jre("$J") + ".parseDouble(" + a + "))";
        case "java.lang.Object":
            return "new " + e.jre("JObject") + "()";
        default:
        }
        use("new " + c.flatname + "(" + sig(ctor) + ")");
        return "new " + libClass(c) + "(" + a + ")";
    }

    String sig(MethodSymbol m) {
        List<String> ps = new ArrayList<>();
        for (Type t : m.type.getParameterTypes()) ps.add(e.prog.types.erasure(t).toString());
        return String.join(",", ps);
    }

    Type ptype(MethodSymbol m, int i) {
        List<Type> pts = m.type.getParameterTypes();
        return i < pts.size() ? pts.get(i) : null;
    }

    boolean isChar(Type t) {
        return t != null && t.hasTag(TypeTag.CHAR);
    }

    String argType(JCTree site, int i) {
        return null;
    }

    /** The static type of the i-th argument at a call site, if known. */
    Type argT(JCTree site, int i) {
        if (site instanceof JCMethodInvocation) {
            JCMethodInvocation inv = (JCMethodInvocation) site;
            if (i < inv.args.size()) return inv.args.get(i).type;
        }
        return null;
    }

    /** Java's string conversion for a value of the method's i-th parameter type (print, append, valueOf). */
    String stringy(MethodSymbol m, int i, String arg, JCTree site) {
        Type t = ptype(m, i);
        if (t == null) return arg;
        switch (t.getTag()) {
        case CHAR: return "String.fromCharCode(" + arg + ")";
        case FLOAT: return e.jre("$J") + ".fstr(" + arg + ")";
        case DOUBLE: return e.jre("$J") + ".dstr(" + arg + ")";
        case INT: case LONG: case SHORT: case BYTE: case BOOLEAN: return "String(" + arg + ")";
        case ARRAY:
            if (((Type.ArrayType) t).elemtype.hasTag(TypeTag.CHAR)) return e.jre("JString") + ".fromChars(" + arg + ")";
            return e.jre("$J") + ".str(" + arg + ")";
        default:
            if (q(t.tsym).equals("java.lang.String")) return arg;
            // a boxed char (a number here) given as an Object
            if (site instanceof com.sun.tools.javac.tree.JCTree.JCMethodInvocation) {
                List<com.sun.tools.javac.tree.JCTree.JCExpression> as = ((com.sun.tools.javac.tree.JCTree.JCMethodInvocation) site).args;
                if (i < as.size() && as.get(i).type != null && as.get(i).type.hasTag(TypeTag.CLASS)
                    && q(as.get(i).type.tsym).equals("java.lang.Character")) return e.jre("$J") + ".cstr(" + arg + ")";
            }
            return e.jre("$J") + ".str(" + arg + ")";
        }
    }

    String objectMethod(MethodSymbol m, String recv, List<String> args, JCExpression recvTree) {
        String n = m.name.toString();
        switch (n) {
        case "equals": return e.jre("$J") + ".equals(" + recv + ", " + args.get(0) + ")";
        case "hashCode": return e.jre("$J") + ".hashCode(" + recv + ")";
        case "toString": return e.jre("$J") + ".str(" + recv + ")";
        case "getClass": return e.jre("$J") + ".getClass(" + recv + ")";
        // monitors: the client's scheduler blocks and wakes its threads; elsewhere they do nothing
        case "wait": return e.jre("$J") + ".monitorWait(" + recv + (args.isEmpty() ? "" : ", " + String.join(", ", args)) + ")";
        case "notify": return e.jre("$J") + ".monitorNotify(" + recv + ", false)";
        case "notifyAll": return e.jre("$J") + ".monitorNotify(" + recv + ", true)";
        default: return null;
        }
    }

    boolean primitiveLike(Type t) {
        if (t == null) return true;
        if (t.hasTag(TypeTag.TYPEVAR) || t.hasTag(TypeTag.ARRAY)) return true;
        if (!t.hasTag(TypeTag.CLASS)) return true;
        String qn = q(t.tsym);
        return qn.equals("java.lang.Object") || qn.equals("java.lang.String") || qn.equals("java.lang.CharSequence")
            || qn.equals("java.lang.Comparable") || qn.equals("java.io.Serializable") || BOXED.contains(qn) || isFunctional(t)
            || qn.equals("java.lang.Enum") && false;
    }

    /** A call of a library method; null for the default (recv.name(args) or Class.name(args)). */
    String libCall(MethodSymbol m, String recv, JCExpression recvTree, boolean superCall, List<String> args, JCTree site) {
        ClassSymbol owner = (ClassSymbol) m.owner;
        String oq = q(owner);
        String n = m.name.toString();
        boolean st = (m.flags() & Flags.STATIC) != 0;
        String a = String.join(", ", args);
        String J = "$J";
        Type rt = recvTree != null ? recvTree.type : null;
        if (recv == null && !st && !superCall) recv = e.thisFor(owner);
        if (superCall) {
            use("super " + owner.flatname + "." + n + "(" + sig(m) + ")");
            return "super." + n + "(" + a + ")";
        }

        // arrays: clone() is a copy
        if (owner.flatname.toString().equals("Array") && n.equals("clone")) return recv + ".slice()";

        // Object's methods on values that may be strings, numbers, functions
        if (oq.equals("java.lang.Object") && !st) {
            if (rt == null || primitiveLike(rt) || !e.prog.isProgram(rt.tsym)) {
                String r = objectMethod(m, recv, args, recvTree);
                if (r != null) return r;
            }
            return null;
        }
        if (!st && (n.equals("equals") || n.equals("hashCode") || n.equals("toString") || n.equals("compareTo"))
            && rt != null && primitiveLike(rt) && !oq.startsWith("java.util.") ) {
            if (n.equals("compareTo")) return e.jre(J) + ".compareTo(" + recv + ", " + args.get(0) + ")";
            String r = objectMethod(m, recv, args, recvTree);
            if (r != null) return r;
        }

        switch (oq) {
        case "java.lang.String": case "java.lang.CharSequence": return string(m, recv, args, site);
        case "java.lang.Integer": case "java.lang.Long": case "java.lang.Short": case "java.lang.Byte":
        case "java.lang.Float": case "java.lang.Double": case "java.lang.Number": case "java.lang.Boolean":
        case "java.lang.Character":
            return boxed(m, recv, args, site);
        case "java.lang.Math": case "java.lang.StrictMath": return math(m, args);
        case "java.lang.System": return system(m, args);
        case "java.lang.Comparable":
            return e.jre(J) + ".compareTo(" + recv + ", " + args.get(0) + ")";
        case "java.lang.StringBuilder": case "java.lang.StringBuffer": case "java.lang.AbstractStringBuilder":
            return builder(m, recv, args, site);
        case "java.io.PrintStream": case "java.io.PrintWriter":
            if (n.equals("print") || n.equals("println")) {
                use("print " + n);
                if (args.isEmpty()) return recv + "." + n + "()";
                return recv + "." + n + "(" + stringy(m, 0, args.get(0), site) + ")";
            }
            break;
        case "java.lang.Enum":
            switch (n) {
            case "valueOf": return e.jre(J) + ".enumValueOf(" + a + ")";
            default: return null;
            }
        default:
        }
        // collections: overloads that differ by parameter type
        if (!st && n.equals("remove") && args.size() == 1 && isList(owner) && ptype(m, 0) != null && ptype(m, 0).hasTag(TypeTag.INT)) {
            use("List.removeAt");
            return recv + ".removeAt(" + a + ")";
        }
        if (!st && n.equals("toArray")) {
            use(owner.flatname + ".toArray");
            // toArray(T[] a) fills a when it is large enough, and returns it (callers may use a only)
            if (args.size() == 1 && ptype(m, 0) != null && ptype(m, 0).hasTag(TypeTag.ARRAY)) {
                return e.jre("$J") + ".toArrayInto(" + recv + ".toArray(), " + args.get(0) + ")";
            }
            return recv + ".toArray()";
        }
        if (st) {
            use("static " + owner.flatname + "." + n + "(" + sig(m) + ")");
            return libClass(owner) + "." + n + "(" + a + ")";
        }
        use(owner.flatname + "#" + n + "(" + sig(m) + ")");
        return null;
    }

    boolean isList(ClassSymbol c) {
        Type list = e.prog.types.erasure(e.prog.syms.enterClass(e.prog.syms.java_base, e.prog.context.get(com.sun.tools.javac.util.Names.namesKey).fromString("java.util.List")).type);
        return e.prog.types.isSubtype(e.prog.types.erasure(c.type), list);
    }

    String string(MethodSymbol m, String recv, List<String> args, JCTree site) {
        String n = m.name.toString();
        boolean st = (m.flags() & Flags.STATIC) != 0;
        String S = e.jre("JString");
        String a = String.join(", ", args);
        Type p0 = ptype(m, 0);
        if (st) {
            switch (n) {
            case "valueOf": case "copyValueOf":
                if (args.size() == 1) return stringy(m, 0, args.get(0), site);
                break;
            case "format": case "join":
                break;
            default:
            }
            use("static String." + n + "(" + sig(m) + ")");
            return S + "." + n + "(" + a + ")";
        }
        switch (n) {
        case "length": e.lastPrec = Emit.P_PRIMARY; return recv + ".length";
        case "isEmpty": return "(" + recv + ".length === 0)";
        case "charAt": return recv + ".charCodeAt(" + a + ")";
        case "equals": return "(" + recv + " === " + args.get(0) + ")";
        case "substring": case "startsWith": case "endsWith": case "toUpperCase": case "toLowerCase":
            if (n.startsWith("to")) return recv + "." + n + "()";
            return recv + "." + n + "(" + a + ")";
        case "indexOf": case "lastIndexOf":
            if (isChar(p0) || (p0 != null && p0.hasTag(TypeTag.INT))) {
                List<String> b = new ArrayList<>(args);
                b.set(0, "String.fromCharCode(" + args.get(0) + ")");
                return recv + "." + n + "(" + String.join(", ", b) + ")";
            }
            return recv + "." + n + "(" + a + ")";
        case "contains": return recv + ".includes(" + a + ")";
        case "concat": return "(" + recv + " + " + a + ")";
        case "toString": case "intern": return recv;
        case "replace":
            if (isChar(p0)) return S + ".replaceChar(" + recv + ", " + a + ")";
            return S + ".replace(" + recv + ", " + a + ")";
        default:
            use("String#" + n + "(" + sig(m) + ")");
            return S + "." + n + "(" + recv + (a.isEmpty() ? "" : ", " + a) + ")";
        }
    }

    String boxed(MethodSymbol m, String recv, List<String> args, JCTree site) {
        String n = m.name.toString();
        ClassSymbol owner = (ClassSymbol) m.owner;
        String cn = owner.name.toString();
        boolean st = (m.flags() & Flags.STATIC) != 0;
        String a = String.join(", ", args);
        String J = e.jre("$J");
        Type p0 = ptype(m, 0);
        if (!st) {
            switch (n) {
            case "intValue": case "longValue": case "doubleValue": case "shortValue": case "byteValue":
                if (cn.equals("Float") || cn.equals("Double") || cn.equals("Number")) {
                    if (n.equals("intValue") || n.equals("longValue")) return J + ".d2i(+" + recv + ")";
                }
                return "(+" + recv + ")";
            case "floatValue": return "Math.fround(+" + recv + ")";
            case "booleanValue": case "charValue": return recv;
            case "compareTo": return J + ".compareTo(" + recv + ", " + a + ")";
            case "equals": return J + ".equals(" + recv + ", " + a + ")";
            case "hashCode": return J + ".hashCode(" + recv + ")";
            case "toString": return J + ".str(" + recv + ")";
            default:
                use(owner.flatname + "#" + n);
                return J + "." + cn + "_" + n + "(" + recv + (a.isEmpty() ? "" : ", " + a) + ")";
            }
        }
        switch (cn + "." + n) {
        case "Integer.valueOf": case "Long.valueOf": case "Short.valueOf": case "Byte.valueOf":
        case "Character.valueOf": case "Boolean.valueOf":
            if (p0 != null && p0.isPrimitive()) return args.get(0);
            return J + ".parse" + (cn.equals("Integer") ? "Int" : cn) + "(" + a + ")";
        case "Float.valueOf":
            if (p0 != null && p0.isPrimitive()) return J + ".boxF(" + args.get(0) + ")";
            return J + ".boxF(" + J + ".parseDouble(" + a + "))";
        case "Double.valueOf":
            if (p0 != null && p0.isPrimitive()) return J + ".boxD(" + args.get(0) + ")";
            return J + ".boxD(" + J + ".parseDouble(" + a + "))";
        case "Integer.parseInt": case "Short.parseShort": case "Byte.parseByte": return J + ".parseInt(" + a + ")";
        case "Long.parseLong": return J + ".parseLong(" + a + ")";
        case "Double.parseDouble": return J + ".parseDouble(" + a + ")";
        case "Float.parseFloat": return "Math.fround(" + J + ".parseDouble(" + a + "))";
        case "Boolean.parseBoolean": return J + ".parseBoolean(" + a + ")";
        case "Integer.toString": case "Long.toString": case "Short.toString": case "Byte.toString":
            if (args.size() == 2) return "(" + args.get(0) + ").toString(" + args.get(1) + ")";
            return "String(" + a + ")";
        case "Boolean.toString": return "String(" + a + ")";
        case "Float.toString": return J + ".fstr(" + a + ")";
        case "Double.toString": return J + ".dstr(" + a + ")";
        case "Character.toString": return "String.fromCharCode(" + a + ")";
        case "Integer.compare": case "Long.compare": case "Short.compare": case "Character.compare":
        case "Boolean.compare":
            return J + ".icmp(" + a + ")";
        case "Float.compare": case "Double.compare": return J + ".dcmp(" + a + ")";
        case "Integer.max": case "Long.max": case "Float.max": case "Double.max": return "Math.max(" + a + ")";
        case "Integer.min": case "Long.min": case "Float.min": case "Double.min": return "Math.min(" + a + ")";
        case "Integer.sum": case "Long.sum": return "(" + args.get(0) + " + " + args.get(1) + ")";
        case "Double.sum": return "(" + args.get(0) + " + " + args.get(1) + ")";
        case "Float.sum": return "Math.fround(" + args.get(0) + " + " + args.get(1) + ")";
        case "Integer.hashCode": return args.get(0);
        case "Boolean.hashCode": return "(" + args.get(0) + " ? 1231 : 1237)";
        default:
        }
        use("static " + owner.flatname + "." + n + "(" + sig(m) + ")");
        String cls = cn.equals("Character") ? e.jre("Character") : J;
        if (cn.equals("Character")) return cls + "." + n + "(" + a + ")";
        return J + "." + cn + "_" + n + "(" + a + ")";
    }

    String math(MethodSymbol m, List<String> args) {
        String n = m.name.toString();
        String a = String.join(", ", args);
        Type p0 = ptype(m, 0);
        switch (n) {
        case "max": case "min": case "abs": case "floor": case "ceil": case "sqrt": case "sin": case "cos": case "tan":
        case "atan": case "atan2": case "exp": case "log": case "log10": case "signum": case "hypot": case "asin": case "acos":
            if (p0 != null && p0.hasTag(TypeTag.FLOAT) && (n.equals("abs") || n.equals("signum"))) return "Math.fround(Math." + n + "(" + a + "))";
            if (n.equals("abs") && p0 != null && p0.hasTag(TypeTag.INT)) return "Math.abs(" + a + ")";
            if (n.equals("pow")) break;
            return "Math." + n + "(" + a + ")";
        case "pow": return e.jre("$J") + ".pow(" + a + ")";
        case "round":
            if (p0 != null && p0.hasTag(TypeTag.FLOAT)) return e.jre("$J") + ".roundf(" + a + ")";
            return e.jre("$J") + ".round(" + a + ")";
        case "rint": return e.jre("$J") + ".rint(" + a + ")";
        case "floorDiv": return e.jre("$J") + ".floorDiv(" + a + ")";
        case "floorMod": return e.jre("$J") + ".floorMod(" + a + ")";
        case "random": return "Math.random()";
        case "toRadians": return "(" + a + " * Math.PI / 180)";
        case "toDegrees": return "(" + a + " * 180 / Math.PI)";
        default:
            use("Math." + n);
            return e.jre("$J") + ".math_" + n + "(" + a + ")";
        }
        return "Math." + n + "(" + a + ")";
    }

    String system(MethodSymbol m, List<String> args) {
        String n = m.name.toString();
        String a = String.join(", ", args);
        use("System." + n);
        return e.jre("$J") + ".system_" + n + "(" + a + ")";
    }

    String builder(MethodSymbol m, String recv, List<String> args, JCTree site) {
        String n = m.name.toString();
        switch (n) {
        case "append":
            if (args.size() == 1) return recv + ".append(" + stringy(m, 0, args.get(0), site) + ")";
            break;
        case "insert":
            if (args.size() == 2) return recv + ".insert(" + args.get(0) + ", " + stringy(m, 1, args.get(1), site) + ")";
            break;
        case "charAt": return recv + ".charAt(" + args.get(0) + ")";
        default:
        }
        use("StringBuilder#" + n + "(" + sig(m) + ")");
        return recv + "." + n + "(" + String.join(", ", args) + ")";
    }
}
