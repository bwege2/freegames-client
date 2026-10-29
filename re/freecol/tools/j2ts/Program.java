import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.code.Symbol;
import com.sun.tools.javac.code.Symbol.ClassSymbol;
import com.sun.tools.javac.code.Symtab;
import com.sun.tools.javac.code.Type;
import com.sun.tools.javac.code.TypeTag;
import com.sun.tools.javac.code.Types;
import com.sun.tools.javac.tree.JCTree.JCClassDecl;
import com.sun.tools.javac.tree.JCTree.JCCompilationUnit;
import com.sun.tools.javac.tree.TreeScanner;
import com.sun.tools.javac.util.Context;

/** The attributed program: every class javac compiled from the sources, and type helpers. */
public class Program {
    final Context context;
    final Types types;
    final Symtab syms;
    final List<JCCompilationUnit> units;
    /** Every class declared in the sources (top-level, member, local, anonymous), in source order. */
    final Map<ClassSymbol, JCClassDecl> decls = new LinkedHashMap<>();
    final Map<ClassSymbol, JCCompilationUnit> unitOf = new HashMap<>();
    /** Top-level classes written as modules. */
    final Set<ClassSymbol> emitted = new LinkedHashSet<>();
    /** Static-initializer dependencies: class -> classes its $clinit uses. */
    final Map<String, Set<String>> clinitDeps = new LinkedHashMap<>();
    /** Interfaces that some lambda or method reference implements: their values are functions. */
    final Set<Symbol> lambdaTargets = new java.util.HashSet<>();

    final com.sun.tools.javac.util.Names names;
    /** Reachability of the partially translated classes, or null (everything is translated). */
    Reach reach;

    /** A method is written unless its class is translated in part and it is not reached. */
    boolean keep(Symbol.MethodSymbol m) {
        return reach == null || !reach.isPartial(m.enclClass()) || reach.reached(m);
    }

    boolean keepClass(ClassSymbol c) {
        return reach == null || !reach.isPartial(c) || reach.emits(c);
    }

    boolean keepClinit(ClassSymbol c) {
        return reach == null || !reach.isPartial(c) || reach.clinitReached(c);
    }

    Program(Context context, List<JCCompilationUnit> units) {
        this.context = context;
        this.names = com.sun.tools.javac.util.Names.instance(context);
        this.types = Types.instance(context);
        this.syms = Symtab.instance(context);
        this.units = units;
        for (JCCompilationUnit cu : units) {
            new TreeScanner() {
                @Override public void visitClassDef(JCClassDecl t) {
                    decls.put(t.sym, t);
                    unitOf.put(t.sym, cu);
                    super.visitClassDef(t);
                }
                @Override public void visitLambda(com.sun.tools.javac.tree.JCTree.JCLambda t) {
                    if (t.target != null && t.target.tsym != null) lambdaTargets.add(t.target.tsym);
                    super.visitLambda(t);
                }
                @Override public void visitReference(com.sun.tools.javac.tree.JCTree.JCMemberReference t) {
                    if (t.target != null && t.target.tsym != null) lambdaTargets.add(t.target.tsym);
                    super.visitReference(t);
                }
            }.scan(cu);
        }
    }

    boolean isProgram(Symbol s) {
        ClassSymbol c = s instanceof ClassSymbol ? (ClassSymbol) s : s.enclClass();
        return c != null && decls.containsKey(c);
    }

    boolean isInterface(Symbol c) {
        return (c.flags() & Flags.INTERFACE) != 0;
    }

    boolean isStatic(Symbol s) {
        return (s.flags() & Flags.STATIC) != 0;
    }

    boolean isPrivate(Symbol s) {
        return (s.flags() & Flags.PRIVATE) != 0;
    }

    boolean isAnonymous(ClassSymbol c) {
        return c.name.isEmpty();
    }

    /** A class declared in a method body (local or anonymous). */
    boolean isLocal(ClassSymbol c) {
        return c.owner.kind == com.sun.tools.javac.code.Kinds.Kind.MTH
            || c.owner.kind == com.sun.tools.javac.code.Kinds.Kind.VAR
            || isAnonymous(c);
    }

    /** An inner (non-static) class has an enclosing instance. */
    boolean hasOuter(ClassSymbol c) {
        return c.hasOuterInstance() || (isLocal(c) && !isStaticContext(c));
    }

    boolean isStaticContext(ClassSymbol c) {
        Symbol o = c.owner;
        while (o != null && o.kind != com.sun.tools.javac.code.Kinds.Kind.PCK) {
            if ((o.flags() & Flags.STATIC) != 0) return true;
            if (o.kind == com.sun.tools.javac.code.Kinds.Kind.TYP) return false;
            o = o.owner;
        }
        return true;
    }

    /** All supertypes (classes and interfaces), transitively, nearest first, without c. */
    List<ClassSymbol> ancestors(ClassSymbol c) {
        List<ClassSymbol> out = new ArrayList<>();
        Set<ClassSymbol> seen = new LinkedHashSet<>();
        ArrayList<ClassSymbol> work = new ArrayList<>();
        work.add(c);
        while (!work.isEmpty()) {
            ClassSymbol x = work.remove(0);
            for (Type st : directSupertypes(x)) {
                ClassSymbol s = (ClassSymbol) st.tsym;
                if (seen.add(s)) {
                    out.add(s);
                    work.add(s);
                }
            }
        }
        return out;
    }

    List<Type> directSupertypes(ClassSymbol x) {
        List<Type> r = new ArrayList<>();
        Type sup = x.getSuperclass();
        if (sup != null && sup.hasTag(TypeTag.CLASS)) r.add(sup);
        for (Type i : x.getInterfaces()) if (i.hasTag(TypeTag.CLASS)) r.add(i);
        if (isInterface(x) && r.isEmpty()) r.add(syms.objectType);
        return r;
    }

    boolean isSubclass(ClassSymbol a, ClassSymbol b) {
        return a == b || a.isSubClass(b, types);
    }

    String qname(Symbol c) {
        return c.getQualifiedName().toString();
    }

    /** The binary name without the package: Unit$UnitState. */
    String flatLocal(ClassSymbol c) {
        String f = c.flatname.toString();
        String pk = c.packge().getQualifiedName().toString();
        return pk.isEmpty() ? f : f.substring(pk.length() + 1);
    }

    /** The top-level class enclosing c. */
    ClassSymbol outermost(ClassSymbol c) {
        ClassSymbol o = c;
        while (o.owner.kind != com.sun.tools.javac.code.Kinds.Kind.PCK) o = o.owner.enclClass();
        return o;
    }
}
