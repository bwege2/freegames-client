"""The translator: python3 -I tools/translate.py [--aul] [--out DIR]

Reads clang's trees of the engine (work/ast/*.json, written by ast.sh), translates the files of
tools/units.txt and everything they use, and writes one TypeScript module per original source file
(header and implementation together) into DIR/gen (default web/games/openclonk/src/gen/), and gen/index.ts.
--aul: the standalone script engine of the headless build instead (tools/units-aul.txt, work/ast-aul/,
into src/aul/): the tests compare it with the original's c4script.

Modules reference each other through the registry `$` (rt/registry.ts): every class, function and global
variable is registered there under its name, so that modules can import each other in any order; only a
class's base class is imported directly (for `extends`)."""
import glob
import json
import os
import re
import sys

from . import types as ty
from .config import C_STRUCT_PREFIXES, C_STRUCT_FIELDS, C_STRUCT_DEFAULTS, NATIVE_CLASSES
from .config import PROFILE, NARROW64, UNITS, UNIT_ORDER, LIBC, GL, AL, FT, SDL, PNG, JPEG, NATIVE, IGNORE_BASES, SKIP, NOT_PORTED, NATIVE_METHODS, UNIT_ONLY, OPAQUE, OPAQUE_CLASSES, EXTRA_CLASSES, SUSPEND, CTOR_DISPATCH
from .emit import FuncEmitter, Unsupported, kids, zero, E, P_ASSIGN, P_CALL, strip, fit, lit_int, ret_of
from .program import Program, module_of, JS_RESERVED
from .stdmap import Std

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
REV = '36de799'

TYPED = {(8, True): 'Int8Array', (8, False): 'Uint8Array', (16, True): 'Int16Array', (16, False): 'Uint16Array',
         (32, True): 'Int32Array', (32, False): 'Uint32Array', (64, True): 'BigInt64Array', (64, False): 'BigUint64Array'}


# the imports a function's translation asks for, while it is translated (Translator.function caches it)
RECORDING = []


class Module:
    def __init__(self, path):
        self.path = path
        self.imports = {}
        self.parts = []
        self.inits = []           # lines of the module's $init (globals)
        self.registered = []      # names put into $
        self.files = set()

    def need(self, name, module):
        if module != self.path:
            self.imports.setdefault(module, set()).add(name)
        for rec in RECORDING:
            rec.append((self, name, module))
        return name

    def text(self):
        out = ['// @ts-nocheck',
               f'// OpenClonk {REV}: {", ".join(sorted(self.files))}, translated by re/openclonk/tools/cpp2ts. Do not edit.']
        here = os.path.dirname(self.path)
        imps = dict(self.imports)
        imps.setdefault('rt/registry', set()).add('$')
        for m in sorted(imps):
            rel = os.path.relpath(m, here)
            if not rel.startswith('.'):
                rel = './' + rel
            out.append(f'import {{ {", ".join(sorted(imps[m]))} }} from \'{rel}.ts\';')
        for _, lines in sorted(self.parts, key=lambda p: p[0]):
            out.append('')
            out.extend(lines)
        out.append('')
        out.append('export function $init(): void {')
        out.extend('  ' + ln for _, ln in sorted(self.inits, key=lambda x: x[0]))
        out.append('}')
        if self.registered:
            out.append('')
            out.append(f'Object.assign($, {{ {", ".join(sorted(set(self.registered)))} }});')
        return '\n'.join(out) + '\n'


def is_std_string(t):
    return re.search(r'(basic_string|(^|::)string$)', t.name or '') is not None


def loc_key(e):
    n = e.node
    loc = n.get('loc') or {}
    return (loc.get('line') or (loc.get('expansionLoc') or {}).get('line') or 0)


class Translator:
    def __init__(self, prog):
        self.missing = set()
        self.prog = prog
        self.mods = {}
        self.errors = []
        self.std = Std(self)
        self.children = {}
        self.fcache = {}
        for c in prog.classes:
            for b in prog.bases_of(c):
                self.children.setdefault(b.key, []).append(c)
        self.gnames()
        self.relocate_specializations()
        self.colored, self.colored_names = set(), set()
        if SUSPEND:
            self.coroutines()

    def ctor_dispatch(self, c):
        """is class c derived from a root of config.CTOR_DISPATCH (or one itself)"""
        if not CTOR_DISPATCH or c is None:
            return False
        hit = getattr(c, '_ctor_dispatch', None)
        if hit is None:
            hit = self.class_short(c) in CTOR_DISPATCH or any(self.class_short(a) in CTOR_DISPATCH for a in self.ancestors(c))
            c._ctor_dispatch = hit
        return hit

    def overrides(self, m):
        """does method m override a virtual method of a base class"""
        return m.cls is not None and any(x.kind == 'method' and x.name == m.name and self.is_virtual(x)
                                         for a in self.ancestors(m.cls) for x in a.members)

    def relocate_specializations(self):
        """a template's specialization lives in the module of its template, unless its base class comes from a module set
        up later (C4GUI::CallbackButton<C4StartupOptionsDlg, C4StartupOptionsDlg::SmallButton> derives from SmallButton):
        then in that module, as the module of a base class is loaded first (its class must exist when the derived one is
        defined) and the template's module would import a module that imports it"""
        for e in self.prog.classes:
            if e.cls is not None or '<' not in e.key or e.module is None:
                continue
            try:
                b = self.extends_base(e)
            except (ValueError, Unsupported):
                continue
            while b is not None and b.cls is not None:
                b = b.cls
            if b is None or b.module is None or b.module == e.module:
                continue
            if UNIT_ORDER.get(b.module, -1) > UNIT_ORDER.get(e.module, 10 ** 6):
                e.module, e.file = b.module, b.file

    # ---- modal loops (config.SUSPEND): the functions translated as generators

    def qname(self, e):
        """Class::method of a method entity, as config.py names methods"""
        return f'{ty.strip_ns(e.cls.key)}::{e.node.get("name")}' if e.cls is not None else e.node.get('name')

    def direct_calls(self, e):
        """the entities that function e calls in its body (not in its lambdas, which run when they are called)"""
        tu, n = e.best()
        out = []
        stack = [c for c in kids(n) if c.get('kind') == 'CompoundStmt']
        while stack:
            x = stack.pop()
            k = x.get('kind')
            if k == 'LambdaExpr':
                continue
            if k in ('CallExpr', 'CXXMemberCallExpr', 'CXXOperatorCallExpr') and kids(x):
                c = kids(x)[0]
                while c.get('kind') in ('ImplicitCastExpr', 'ParenExpr', 'MaterializeTemporaryExpr', 'CXXBindTemporaryExpr') and kids(c):
                    c = kids(c)[0]
                d = None
                if c.get('kind') == 'DeclRefExpr':
                    d = self.prog.ref(tu, c['referencedDecl']['id'])
                elif c.get('kind') == 'MemberExpr':
                    d = self.prog.ref(tu, c['referencedMemberDecl'])
                if d is not None and d.kind in ('func', 'method'):
                    out.append(d)
            stack.extend(kids(x))
        return out

    def coroutines(self):
        """colours the functions that wait in a modal loop: the loops of config.SUSPEND and, transitively, every function
        that calls a coloured one directly (a virtual call counts by the method it names). Constructors and destructors
        cannot wait (a generator cannot construct): they start such a call as a coroutine of its own (rt/coro.ts $spawn),
        as do calls through a virtual method that only an override colours, member function pointers and lambdas."""
        callers = {}
        for e in self.prog.by_key.values():
            if e.kind not in ('func', 'method') or not e.has_body():
                continue
            if e.node['kind'] in ('CXXConstructorDecl', 'CXXDestructorDecl'):
                continue
            for d in self.direct_calls(e):
                callers.setdefault(d.key, set()).add(e.key)
        work = [e.key for e in self.prog.by_key.values() if e.kind == 'method' and self.qname(e) in SUSPEND]
        if len(work) != len(SUSPEND):
            raise SystemExit(f'cpp2ts: SUSPEND names {sorted(SUSPEND)}, found {work}')
        self.colored = set(work)
        while work:
            for c in callers.get(work.pop(), ()):
                if c not in self.colored:
                    self.colored.add(c)
                    work.append(c)
        # the virtual methods an override of which is a generator (a call of one may answer with a generator), and the
        # classes whose member function pointers may name one (the class, its bases and the classes derived from it)
        self.maybe_keys = set()
        self.colored_classes = set()
        for k in self.colored:
            m = self.prog.by_key[k]
            if m.kind != 'method' or m.cls is None:
                continue
            for a in self.ancestors(m.cls):
                self.colored_classes.add(self.class_short(a))
                for x in a.members:
                    if x.kind == 'method' and x.name == m.name:
                        self.maybe_keys.add(x.key)
            stack = [m.cls]
            while stack:
                c = stack.pop()
                self.colored_classes.add(self.class_short(c))
                stack.extend(self.children.get(c.key, ()))
        self.colored_names = {self.prog.by_key[k].name for k in self.colored if self.prog.by_key[k].kind == 'method'}

    @staticmethod
    def class_short(c):
        """a class's own name, without namespaces, outer classes and template arguments"""
        return ty.strip_ns(c.key.split('<')[0]).split('::')[-1]

    def pointer_color(self, ptr_type):
        """a call through a member function pointer of this type (void (C4StartupMainDlg::*)(C4GUI::Control *)): 'maybe'
        if the class may have a method that is a generator"""
        m = re.search(r'([\w:]+)(?:<[^()]*>)?::\*\)', ptr_type or '')
        if not self.colored or m is None:
            return 'maybe' if self.colored else None
        return 'maybe' if m.group(1).split('::')[-1] in self.colored_classes else None

    def call_color(self, callee):
        """how a call of entity callee waits: 'gen' (a generator, yield* it), 'maybe' (a virtual call that an override
        may answer with a generator: rt/coro.ts $co / $spawn), None (an ordinary function)"""
        if callee is None or not self.colored:
            return None
        if callee.key in self.colored:
            return 'maybe' if callee.kind == 'method' and self.is_virtual(callee) else 'gen'
        if callee.kind == 'method' and callee.key in self.maybe_keys and self.is_virtual(callee):
            return 'maybe'
        return None

    def is_colored(self, e):
        return e is not None and e.key in self.colored

    # ---- names

    def gnames(self):
        """the registry names: unique over classes, functions and globals"""
        used = {}
        for e in sorted(self.prog.by_key.values(), key=lambda e: e.key):
            e.gname = e.name
            if (e.cls is not None and e.kind != 'class') or e.kind not in ('class', 'func', 'var') or not e.name:
                continue
            nm = e.name
            if e.internal and e.kind == 'var':
                nm = f'{e.name}${re.sub(r"[^A-Za-z0-9]", "_", os.path.basename(str(e.module)))}'
            if nm in JS_RESERVED or nm == '$':
                nm += '_'
            base = nm
            i = 2
            while nm in used and used[nm] is not e:
                nm = f'{base}${i}'
                i += 1
            used[nm] = e
            e.gname = nm

    def mod_path(self, e):
        while e.cls is not None:
            e = e.cls
        if e.native:
            return 'rt/native'
        return PROFILE.out + '/' + e.module

    def eref(self, mod, e):
        """how module mod names entity e"""
        e.reached = True
        if e.kind == 'var':
            return f'$.{e.gname}'
        if e.native:
            return mod.need(e.name, 'rt/native')
            return f'$.{e.gname}'
        if e.kind in ('class', 'func'):
            if self.mod_path(e) == mod.path:
                return e.gname
            return f'$.{e.gname}'
        raise Unsupported(f'reference to {e.kind} {e.name}')

    def libc(self, mod, name):
        if name in LIBC:
            return mod.need(LIBC[name], 'rt/libc')
        for table, module in ((GL, 'rt/gl'), (AL, 'rt/al'), (FT, 'rt/freetype'), (SDL, 'rt/sdl'), (PNG, 'rt/libpng'),
                              (JPEG, 'rt/libjpeg')):
            if name in table:
                return mod.need(table[name], module)
        if name in NATIVE:
            # a function of a header the trees leave out (thirdparty/timsort's StdMesh_tim_sort): rt/native.ts
            return mod.need(name, 'rt/native')
        raise Unsupported(f'call of unknown {name}')

    def static_call(self, e):
        """a non-virtual method that a subclass declares again (hides): called on its own class"""
        if e.node.get('virtual') or e.cls is None:
            return False
        if self.is_virtual(e):
            return False
        return self.hidden_below(e.cls, e.name)

    def is_virtual(self, e):
        """virtual (declared so here, or overriding a virtual method of a base)"""
        if e.node.get('virtual'):
            return True
        for c in self.ancestors(e.cls):
            for m in c.members:
                if m.kind == 'method' and m.name == e.name and m.node.get('virtual'):
                    return True
        return False

    def ancestors(self, c):
        out = []
        stack = list(self.prog.bases_of(c))
        while stack:
            b = stack.pop()
            out.append(b)
            stack.extend(self.prog.bases_of(b))
        return out

    def hidden_below(self, c, name):
        for d in self.children.get(c.key, ()):
            if any(m.kind == 'method' and m.name == name for m in d.members):
                return True
            if self.hidden_below(d, name):
                return True
        return False

    # ---- construction

    def default_ctor(self, c):
        for m in c.members:
            if m.node['kind'] == 'CXXConstructorDecl' and not self.prog.is_copy_ctor(m):
                ps = [p for p in kids(m.node) if p.get('kind') == 'ParmVarDecl']
                if all(any(k.get('kind') for k in kids(p)) for p in ps):
                    return m
        return None

    def needs_init(self, c, seen=None):
        """does default construction do more than the field initializers?"""
        if getattr(c, '_needs', None) is not None:
            return c._needs
        c._needs = False
        d = self.default_ctor(c)
        r = False
        if d is not None and d.has_body():
            body = [k for k in kids(d.node) if k.get('kind') == 'CompoundStmt']
            if not d.node.get('isImplicit') and not d.node.get('explicitlyDefaulted'):
                r = True
            for k in kids(d.node):
                if k.get('kind') == 'CXXCtorInitializer':
                    x = kids(k)
                    if 'baseInit' in k:
                        b = self.prog.class_of_type(ty.parse(k['baseInit']))
                        if b is not None and self.needs_init(b):
                            r = True
                    elif x and x[0].get('kind') not in ('CXXDefaultInitExpr',):
                        r = True
            if body and kids(body[0]):
                r = True
        for b in self.prog.bases_of(c):
            if self.needs_init(b):
                r = True
        c._needs = r
        return r

    def new_default(self, mod, c):
        name = self.eref(mod, c)
        if self.needs_init(c):
            d = self.default_ctor(c)
            if d is None:
                raise Unsupported(f'no default constructor for {c.name}')
            d.reached = True
            return f'new {name}().{d.name}()'
        return f'new {name}()'

    def construct_from_args(self, fe, t, args):
        """new T(args) where the constructor is not in the call (make_unique, emplace_back)"""
        c = self.prog.class_of_type(t)
        if c is None:
            if t.strip().kind == 'rec' and not args:
                return E(self.std.default(fe, t), P_CALL)
            if t.strip().kind != 'rec' and len(args) <= 1:
                return fe.ex(args[0]) if args else E(zero(t))
            return self.std.construct(fe, None, t, args)
        if not args:
            return E(self.new_default(fe.mod, c), P_CALL)
        cands = []
        for m in c.members:
            if m.node['kind'] != 'CXXConstructorDecl' or self.prog.is_copy_ctor(m):
                continue
            ps = [ty.parse(p['type']) for p in kids(m.node) if p.get('kind') == 'ParmVarDecl']
            need = [p for p in kids(m.node) if p.get('kind') == 'ParmVarDecl' and not any(k.get('kind') for k in kids(p))]
            if len(need) <= len(args) <= len(ps):
                ok = all(self.compatible(fe.T(a), p) for a, p in zip(args, ps))
                if ok:
                    cands.append((m, ps))
        if len(cands) > 1:
            # the best match: parameters of the arguments' own kinds
            def score(cand):
                # the same class counts more than the same kind (C4KeyBinding(const C4KeyCodeEx &, ...) for a
                # C4KeyCodeEx, not C4KeyBinding(const CodeList &, ...))
                same = sum(1 for a, p in zip(args, cand[1]) if fe.T(a).strip().kind == 'rec' and p.strip().kind == 'rec'
                           and self.prog.class_of_type(fe.T(a)) is not None
                           and self.prog.class_of_type(fe.T(a)) is self.prog.class_of_type(p))
                # a library class for a library class (C4KeyBinding(const CodeList &, ...) for a std::vector<C4KeyCodeEx>,
                # C4StartupOptionsDlg::KeySelDialog), not for a class of the engine
                lib = sum(1 for a, p in zip(args, cand[1]) if fe.T(a).strip().kind == 'rec' and p.strip().kind == 'rec'
                          and self.prog.class_of_type(fe.T(a)) is None and self.prog.class_of_type(p) is None)
                return sum(1 for a, p in zip(args, cand[1]) if fe.T(a).strip().kind == p.strip().kind) + same + lib - \
                    len(cand[1]) * 0.01
            best = max(score(x) for x in cands)
            cands = [x for x in cands if score(x) == best]
        if len(cands) != 1:
            if len(args) == 1 and self.prog.class_of_type(fe.T(args[0])) is c:
                return fe.copy(args[0])
            raise Unsupported(f'constructor of {c.name} for {len(args)} arguments: {len(cands)} candidates')
        m, ps = cands[0]
        m.reached = True
        vals = []
        for a, p in zip(args, ps):
            v = fe.arg(a, p)
            if p.strip().kind == 'rec' and is_std_string(p.strip()) and fe.T(a).strip().kind in ('ptr', 'arr'):
                v = f'{fe.mod.need("StdString", "rt/std")}.of({v})'
            vals.append(v)
        return E(f'new {self.eref(fe.mod, c)}().{m.name}({", ".join(vals)})', P_CALL)

    def compatible(self, a, p):
        a, p = a.strip(), p.strip()
        if p.kind == a.kind:
            if p.kind == 'rec':
                return self.prog.class_of_type(a) is self.prog.class_of_type(p) or True
            return True
        if p.kind in ('int', 'float', 'bool') and a.kind in ('int', 'float', 'bool'):
            return True
        if p.kind == 'ptr' and a.kind in ('null', 'arr'):
            return True
        if p.kind == 'rec' and is_std_string(p) and a.kind in ('ptr', 'arr'):
            return True     # const char * -> std::string
        return False

    def std_array(self, mod, t):
        """a std::array<T, N> (as its desugared type names it) value-initialized: N elements of T's zero, as an array
        of T is (numbers in a typed array); the translated code indexes it as an array"""
        from .stdmap import tmpl, targ_str
        _, args = tmpl(t.strip())
        if len(args) != 2 or not re.fullmatch(r'\d+', targ_str(args[1]).strip()):
            raise Unsupported(f'std::array without its size: {t.name}')
        return self.array_of(mod, ty.parse_str(targ_str(args[0])), targ_str(args[1]).strip())

    def zero_of(self, mod, t):
        t = t.strip()
        if t.kind == 'rec':
            if t.name.startswith('std::array'):
                return self.std_array(mod, t)
            c = self.prog.class_of_type(t)
            if c is None:
                class _F:
                    pass
                fe = _F()
                fe.mod = mod
                return self.std.default(fe, t)
            return self.new_default(mod, c)
        if t.kind == 'arr':
            return self.array_of(mod, t.to.strip(), str(t.n))
        return zero(t)

    def array_of(self, mod, el, n):
        el = el.strip()
        if el.kind == 'int' and el.name == 'intptr':
            return f'new Array({n}).fill(0)'
        if el.kind == 'int' and el.bits <= 64:
            if el.n64:
                return f'new Float64Array({n})'
            return f'new {TYPED[(el.bits, el.signed)]}({n})'
        if el.kind == 'float':
            return f'new {"Float32Array" if el.bits == 32 else "Float64Array"}({n})'
        if el.kind == 'bool':
            return f'new Array({n}).fill(false)'
        if el.kind in ('ptr', 'func'):
            return f'new Array({n}).fill(null)'
        if el.kind in ('rec', 'arr'):
            try:
                return f'{mod.need("$oarr", "rt/ptr")}({n}, () => {self.zero_of(mod, el)})'
            except Unsupported:
                # a struct the translation does not name (StdEnumAdapt<int32_t>::Entry): plain objects that know their places
                # (C4Command's EnumAdaptCommandEntries, walked with pointer arithmetic by StdEnumAdapt::CompileFunc)
                return f'{mod.need("$oarr", "rt/ptr")}({n}, () => ({{}}))'
        raise Unsupported(f'array of {el.text}')

    def array_init(self, fe, t, il):
        """an array with an initializer: a string literal or a list"""
        el = t.to.strip()
        s = strip(il)
        if s.get('kind') == 'StringLiteral':
            return f'{fe.ptr("$cs")}({fe.ex(s)}, {t.n or 0})'
        if s.get('kind') in ('CXXConstructExpr', 'CXXTemporaryObjectExpr') and not kids(s):
            return self.array_of(fe.mod, el, t.n or 0)
        if s.get('kind') != 'InitListExpr':
            raise Unsupported('array initializer')
        vals = kids(s)
        if el.kind in ('int', 'float') and el.bits <= 64:
            items = []
            for x in vals:
                v = fe.const(x)
                items.append(lit_int(v, el.big) if v is not None else fe.ex(x).at(P_ASSIGN))
            n = t.n or len(items)
            arr = ('Float64Array' if el.n64 else TYPED[(el.bits, el.signed)]) if el.kind == 'int' else ('Float32Array' if el.bits == 32 else 'Float64Array')
            if len(items) > 16:
                rows = ',\n'.join('  ' + ', '.join(items[i:i + 16]) for i in range(0, len(items), 16))
                body = '[\n' + rows + ',\n]'
            else:
                body = '[' + ', '.join(items) + ']'
            if n != len(items):
                return f'{fe.mod.need("$ta", "rt/ptr")}({arr}, {n}, {body})'
            return f'new {arr}({body})'
        items = []
        for x in vals:
            if x.get('kind') == 'ImplicitValueInitExpr':
                items.append(self.zero_of(fe.mod, el))
            else:
                items.append(fe.ex(x).at(P_ASSIGN))
        n = t.n or len(items)
        while len(items) < n:
            items.append(self.zero_of(fe.mod, el))
        if len(items) > 4:
            r = '[\n' + ',\n'.join('  ' + x for x in items) + ',\n]'
        else:
            r = '[' + ', '.join(items) + ']'
        if el.kind == 'rec':
            r = f'{fe.mod.need("$own", "rt/ptr")}({r})'
        return r

    def static_local(self, fe, d, ind):
        """a static local: a global, initialized when the function first runs"""
        fname = fe.fe.gname if fe.fe is not None and getattr(fe.fe, 'gname', None) else (fe.fe.name if fe.fe else 'g')
        if fe.cls is not None:
            fname = fe.cls.gname + '$' + fname
        name = f'{fname}${d["name"]}'
        g = f'$.{name}'
        fe.locals[d['id']] = type(list(fe.locals.values())[0])(g, 'val') if fe.locals else None
        from .emit import Local
        fe.locals[d['id']] = Local(g, 'val')
        t = ty.parse(d['type'])
        init = [c for c in kids(d) if 'kind' in c]
        pad = '  ' * ind
        if d['id'] in fe.boxed:
            raise Unsupported('address of a static local')
        if t.kind == 'arr':
            v = self.array_init(fe, t, init[0]) if init else self.array_of(fe.mod, t.to, str(t.n))
        elif init:
            v = fe.ex(init[0]).at(P_ASSIGN)
        else:
            v = self.zero_of(fe.mod, t)
        return [pad + f'if (!(\'{name}\' in $)) {g} = {v};']

    # ---- the whole program

    def mod(self, e):
        p = self.mod_path(e)
        if p not in self.mods:
            self.mods[p] = Module(p)
        m = self.mods[p]
        if e.file:
            m.files.add(e.file)
        return m

    def run(self, roots):
        for r in roots:
            r.reached = True
        before = -1
        while True:
            self.mods, self.errors = {}, []
            for e in sorted([e for e in self.prog.by_key.values() if e.reached], key=lambda e: e.key):
                if e.native or e.kind in ('method', 'field', 'svar'):
                    continue
                if e.cls is not None and e.kind != 'class':
                    continue
                if e.clash and e.kind == 'func':
                    self.errors.append(f'overloads with the same name: {e.name} ({e.key})')
                try:
                    lines = getattr(self, 'emit_' + e.kind)(e)
                except Unsupported as x:
                    where = ''
                    if os.environ.get('CPP2TS_TRACE'):
                        import traceback
                        where = ' at ' + ' < '.join(f'{f.name}:{f.lineno}' for f in reversed(traceback.extract_tb(x.__traceback__)[-6:]))
                    self.errors.append(f'{e.kind} {e.name} ({e.file}): {x}{where}')
                    continue
                except Exception as x:
                    import traceback
                    tb = traceback.extract_tb(x.__traceback__)[-1]
                    self.errors.append(f'{e.kind} {e.name} ({e.file}): BUG {type(x).__name__} {x} at {tb.name}:{tb.lineno}')
                    continue
                if lines is None:
                    continue
                m = self.mod(e)
                m.parts.append(((0 if e.kind == 'class' else 1, self.class_order(e), loc_key(e)), lines))
            # a virtual method that is called: its overrides in every subclass that is used
            for e in list(self.prog.by_key.values()):
                if e.kind == 'method' and e.reached and e.cls is not None and self.is_virtual(e):
                    stack = list(self.children.get(e.cls.key, ()))
                    while stack:
                        d = stack.pop()
                        stack.extend(self.children.get(d.key, ()))
                        if not d.reached:
                            continue
                        for m in d.members:
                            if m.kind == 'method' and m.name == e.name:
                                m.reached = True
            now = sum(1 for e in self.prog.by_key.values() if e.reached)
            if now == before:
                break
            before = now

    def class_order(self, e):
        d = 0
        while e.kind == 'class':
            b = self.extends_base(e)
            if b is None:
                break
            d += 1
            e = b
        return d

    # ---- functions

    def inherited_default(self, cls, name, index):
        """the default argument a base class gives for parameter `index`: C++ overrides inherit it"""
        if cls is None:
            return None
        seen, stack = set(), list(self.prog.bases_of(cls))
        while stack:
            b = stack.pop(0)
            if b.key in seen:
                continue
            seen.add(b.key)
            for m in b.members:
                if m.kind != 'method' or m.name != name:
                    continue
                ps = [p for p in m.node.get('inner', ()) if p.get('kind') == 'ParmVarDecl']
                if index < len(ps):
                    init = [c for c in ps[index].get('inner', ()) if 'kind' in c and not c['kind'].endswith('Attr')]
                    if init:
                        return init[0]
            stack.extend(self.prog.bases_of(b))
        return None

    def params(self, fe, n, used):
        out = []
        for p in kids(n):
            if p.get('kind') != 'ParmVarDecl':
                continue
            t = ty.parse(p['type'])
            mode = 'ref' if fe.by_ptr(t) else ('box' if p['id'] in fe.boxed else 'val')
            nm = fe.local_name(p, 'val' if mode == 'box' else mode)
            if p.get('name') and p['id'] not in used:
                nm = '_' + nm
                fe.locals[p['id']].name = nm
            pname = nm + ('$' if mode == 'box' else '')
            if mode == 'box':
                fe.locals[p['id']].mode = 'box'
            s = pname
            init = [c for c in kids(p) if 'kind' in c and not c['kind'].endswith('Attr')]
            if not init and n.get('kind') in ('CXXMethodDecl', 'CXXConstructorDecl', 'CXXDestructorDecl'):
                inherited = self.inherited_default(fe.cls, n.get('name'), len(out))
                if inherited is not None:
                    init = [inherited]
            if init:
                try:
                    s += ' = ' + (fe.addr(init[0]).at(P_ASSIGN) if mode == 'ref' else fe.ex(init[0]).at(P_ASSIGN))
                except Unsupported:
                    pass
            out.append((s, nm if mode == 'box' else None))
        if n.get('variadic'):
            out.append(('...$va', None))
        return out

    def used_ids(self, n):
        ids = set()
        stack = [n]
        while stack:
            x = stack.pop()
            if x.get('kind') == 'DeclRefExpr':
                ids.add(x['referencedDecl']['id'])
            stack.extend(kids(x))
        return ids

    def function(self, e, mod, cls=None, prefix='export function '):
        # A function's text depends only on its tree: the rounds of run() translate it once. A later round
        # replays the imports it asked for (the entities it reached stay marked).
        key = (e.key, mod.path, cls.key if cls is not None else None, prefix)
        hit = self.fcache.get(key)
        if hit is not None:
            lines, needs = hit
            self.prog.ctx, self.prog.ctx_ns = e.cls, getattr(e, 'ns', None) or []
            for name, module in needs:
                mod.need(name, module)
            return list(lines) if lines is not None else None
        rec = []
        RECORDING.append(rec)
        try:
            lines = self.function_(e, mod, cls, prefix)
        finally:
            RECORDING.remove(rec)
        if all(m is mod for m, _, _ in rec):
            self.fcache[key] = (list(lines) if lines is not None else None, [(nm, md) for _, nm, md in rec])
        return lines

    def function_(self, e, mod, cls=None, prefix='export function '):
        tu, n = e.best()
        fe = FuncEmitter(self, mod, tu, e, cls)
        self.prog.ctx, self.prog.ctx_ns = e.cls, getattr(e, 'ns', None) or []
        body = [c for c in kids(n) if c.get('kind') == 'CompoundStmt']
        if not body:
            if n.get('pure'):
                return None
            if cls is None:
                # used, but defined in a file that is not translated: fails when it is called
                self.missing.add(e.node.get('name'))
                return [f'{prefix}{e.gname}(..._) {{ return {mod.need("$missing", "rt/std")}({json.dumps(e.node.get("name"))}); }}']
            raise Unsupported(f'no body for {e.name}')
        fe.analyze(n)
        used = self.used_ids(n)
        is_ctor = n['kind'] == 'CXXConstructorDecl'
        fe.in_ctor = is_ctor
        fe.in_ctor_or_dtor = is_ctor or n['kind'] == 'CXXDestructorDecl'
        ps = self.params(fe, n, used)
        static = 'static ' if cls is not None and n.get('storageClass') == 'static' else ''
        name = e.name if cls is not None else e.gname
        if n['kind'] == 'CXXDestructorDecl':
            name = '$dtor'
        if self.is_colored(e):
            # it waits in a modal loop (config.SUSPEND): a generator
            if prefix.endswith('function '):
                prefix = prefix[:-1] + '* '
            else:
                name = '*' + name
        head = f'{prefix}{static}{name}({", ".join(p[0] for p in ps)}) {{'
        lines = [head]
        for s, boxed in ps:
            if boxed:
                lines.append(f'  const {boxed} = [{boxed}$];')
        if is_ctor:
            lines += self.ctor_inits(fe, e, n, cls)
            if self.ctor_dispatch(cls):
                # from here on the object is of this class for its virtual methods (config.CTOR_DISPATCH)
                lines.append(f'  this.$dyn = {cls.gname};')
        elif cls is not None and n['kind'] == 'CXXMethodDecl' and not static and not self.is_colored(e) and \
                self.ctor_dispatch(cls) and self.overrides(e):
            # a call while a base class is constructed goes to that class's version (config.CTOR_DISPATCH)
            lines.append(f'  {{ const $c = this.$dyn; if ($c !== undefined && $c !== {cls.gname} && {cls.gname}.prototype instanceof $c) '
                         f'return $c.prototype.{e.name}.apply(this, arguments); }}')
        blines = fe.body(body[0], 1)
        if n['kind'] == 'CXXDestructorDecl':
            b = self.extends_base(cls)
            if b is not None and self.has_dtor(b):
                blines.append('  super.$dtor();')
        if fe.temps:
            lines.append(f'  let {", ".join(fe.temps)};')
        lines += blines
        if is_ctor:
            lines.append('  return this;')
        lines.append('}')
        for c in fe.consts:
            pat = re.compile(r'(?<![\w$.])' + re.escape(c) + r'\b')
            decl = [i for i, ln in enumerate(lines) if re.match(r'\s*const ' + re.escape(c) + ' = ', ln)]
            if len(decl) == 1 and sum(1 for ln in lines if pat.search(ln)) == 1:
                del lines[decl[0]]
        return lines

    def ctor_inits(self, fe, e, n, cls):
        out = []
        # references are bound after every field is constructed: C4GraphicsResource's fonts are references to its
        # Font* members, which the constructor below constructs; a copy of the member before it is constructed would
        # be a different object, and the font loaded into the member would never be seen through the reference.
        refs = []
        base = None if self.vector_base(cls) else self.extends_base(cls)
        for c in kids(n):
            if c.get('kind') != 'CXXCtorInitializer':
                continue
            x = kids(c)[0] if kids(c) else None
            if 'baseInit' in c:
                b = self.prog.class_of_type(ty.parse(c['baseInit']))
                if b is None:
                    # std::runtime_error(msg) and the like: the message what() returns
                    tn = ty.strip_ns(ty.qual_of(c['baseInit']))
                    if tn in ('exception', 'runtime_error', 'logic_error', 'out_of_range', 'invalid_argument') and x is not None:
                        y = x
                        while y.get('kind') in ('ExprWithCleanups', 'CXXBindTemporaryExpr', 'MaterializeTemporaryExpr'):
                            y = kids(y)[0]
                        if y.get('kind') == 'CXXConstructExpr' and kids(y):
                            out.append(f'  this.$setmsg({fe.ex(kids(y)[0]).at(P_ASSIGN)});')
                    continue
                if b is not base:
                    if b in self.mixins(cls):
                        if x is not None and x['kind'] == 'ExprWithCleanups':
                            x = kids(x)[0]
                        if x is not None and x['kind'] == 'CXXConstructExpr':
                            ctor = fe.find_ctor(b, x['ctorType'])
                            if ctor is not None and not (ctor.node.get('isImplicit') and not self.needs_init(b)) and \
                                    not (ctor.node.get('explicitlyDefaulted') and not kids(x)) and not self.prog.is_copy_ctor(ctor):
                                ctor.reached = True
                                out.append(f'  {self.eref(fe.mod, b)}.prototype.{ctor.name}.call(this'
                                           f'{", " if kids(x) else ""}{fe.args(kids(x), fe.params_of(ctor))});')
                    continue
                if x is None:
                    continue
                if x['kind'] == 'ExprWithCleanups':
                    x = kids(x)[0]
                if x['kind'] != 'CXXConstructExpr':
                    continue
                ctor = fe.find_ctor(b, x['ctorType'])
                if ctor is None:
                    continue
                if ctor.node.get('explicitlyDefaulted') and not kids(x) or ctor.node.get('isImplicit') and not self.needs_init(b):
                    continue
                if self.prog.is_copy_ctor(ctor):
                    out.append(f'  super.$assign({fe.ex(kids(x)[0])});')
                    continue
                ctor.reached = True
                out.append(f'  super.{ctor.name}({fe.args(kids(x), fe.params_of(ctor))});')
                continue
            if 'delegatingInit' in c and x is not None:
                # C(args) : C(other args): the other constructor on this object
                if x['kind'] == 'ExprWithCleanups':
                    x = kids(x)[0]
                if x['kind'] in ('CXXConstructExpr', 'CXXTemporaryObjectExpr'):
                    ctor = fe.find_ctor(cls, x['ctorType'])
                    if ctor is not None and self.prog.is_copy_ctor(ctor):
                        out.append(f'  this.$assign({fe.ex(kids(x)[0])});')
                    elif ctor is not None:
                        ctor.reached = True
                        a = fe.args(kids(x), fe.params_of(ctor))
                        out.append(f'  {self.eref(fe.mod, cls)}.prototype.{ctor.name}.call(this{", " + a if a else ""});')
                continue
            if 'baseInit' not in c and 'anyInit' not in c:
                continue
            f = c.get('anyInit')
            if f is None or x is None:
                continue
            if x['kind'] == 'CXXDefaultInitExpr':
                # the field's in-class initializer (a template's fields have it only here)
                if not kids(x):
                    continue
                x = kids(x)[0]
            fld = self.prog.ref(fe.tu, f['id'])
            if fld is None and f.get('kind') == 'IndirectFieldDecl':
                # a member of an anonymous union: this.$uN.member
                path = self.indirect(cls, f['name'])
                if path is None:
                    raise Unsupported(f'indirect field {f["name"]}')
                ft = ty.parse(f['type'])
                out.append(f'  this.{path} = {fe.ex(x).at(P_ASSIGN)};')
                continue
            if fld is None:
                continue
            name = fld.name
            if fld.cls is not cls and cls is not None:
                # a member of an anonymous union inside the class
                name = self.indirect(cls, fld.name) or name
            ft = ty.parse(fld.node['type'])
            if ft.kind == 'ref':
                v = fe.addr(x) if fe.by_ptr(ft) else fe.ex(x)
                refs.append(f'  this.{name} = {v.at(P_ASSIGN)};')
                continue
            if ft.kind == 'arr':
                sx = strip(x)
                if sx.get('kind') in ('InitListExpr', 'StringLiteral'):
                    out.append(f'  this.{name} = {self.array_init(fe, ft, x)};')
                elif sx.get('kind') in ('CXXConstructExpr', 'ImplicitValueInitExpr', 'ArrayInitLoopExpr'):
                    if sx.get('kind') == 'ArrayInitLoopExpr':
                        out.append(f'  this.{name} = {fe.ex(kids(kids(sx)[0])[0])}.slice();')
                    else:
                        out.append(f'  this.{name} = {self.array_of(fe.mod, ft.to, str(ft.n))};')
                else:
                    out.append(f'  this.{name} = {fe.ex(x)};')
                continue
            out.append(f'  this.{name} = {fe.ex(x).at(P_ASSIGN)};')
        return out + refs

    def indirect(self, cls, name):
        """the path to a member of an anonymous union or struct of cls: $u1.pData"""
        for m in cls.members:
            if m.kind == 'field' and not m.node.get('name'):
                c = self.prog.class_of_type(ty.parse(m.node['type']))
                if c is None:
                    continue
                for f in c.members:
                    if f.kind == 'field' and f.name == name:
                        return f'{m.name}.{name}'
                sub = self.indirect(c, name)
                if sub:
                    return f'{m.name}.{sub}'
        return None

    def emit_func(self, e):
        if e.module in OPAQUE or e.name in SKIP:
            return None
        if e.node.get('name', '').startswith('operator new') or e.node.get('name', '').startswith('operator delete'):
            return None
        m = self.mod(e)
        if e.node.get('name') in NOT_PORTED and e.cls is None:
            # not translated: fails when it is called (config.NOT_PORTED says why it is never called)
            kw = 'function' if e.internal else 'export function'
            m.registered.append(e.gname)
            return ['', f'{kw} {e.gname}(..._) {{ return {m.need("$missing", "rt/std")}({json.dumps(e.node["name"])}); }}']
        lines = self.function(e, m, prefix='function ' if e.internal else 'export function ')
        if lines is None:
            return None
        m.registered.append(e.gname)
        return lines

    # ---- classes

    def bases(self, c):
        out = []
        for b in c.node.get('bases', ()):
            if ty.qual_of(b['type']) in IGNORE_BASES:
                continue
            be = self.prog.class_of_type(ty.parse(b['type']))
            if be is None:
                tn = ty.strip_ns(ty.qual_of(b['type']))
                if tn in ('exception', 'runtime_error', 'logic_error', 'out_of_range', 'invalid_argument'):
                    continue
                if re.match(r'^(vector|set)<', tn):
                    # a library container as a base (vector_base, set_base): the class is the runtime's container
                    continue
                raise Unsupported(f'base {b["type"]}')
            out.append(be)
        return out

    def has_state(self, c):
        return any(m.kind == 'field' for m in c.members) or any(self.has_state(b) for b in self.bases(c))

    def extends_base(self, c):
        if c is None:
            return None
        if self.vector_base(c):
            # an array (vector_base); its class bases are mixins
            return None
        st = self.stateful_bases(c)
        bs = self.bases(c)
        return st[0] if st else (bs[0] if bs else None)

    def stateful_bases(self, c):
        return [b for b in self.bases(c) if self.has_state(b) or any(
            m.kind == 'method' and m.has_body() and m.node.get('storageClass') != 'static' and not m.node.get('isImplicit')
            and m.node['kind'] == 'CXXMethodDecl' for m in b.members) or any(m.node.get('virtual') for m in b.members if m.kind == 'method')]

    def mixins(self, c):
        """the further base classes with state: their fields are the class's own, their methods copied ($mixin)"""
        if self.vector_base(c):
            # class C4GraphCollection : public C4Graph, public std::vector<C4Graph *>: an array with C4Graph's members
            return self.stateful_bases(c)
        return self.stateful_bases(c)[1:]

    def has_dtor(self, c):
        for m in c.members:
            if m.kind == 'method' and m.node['kind'] == 'CXXDestructorDecl' and not m.node.get('isImplicit'):
                body = [k for k in kids(m.node) if k.get('kind') == 'CompoundStmt']
                if body and kids(body[0]):
                    return True
        b = self.extends_base(c)
        return b is not None and self.has_dtor(b)

    def vector_base(self, c):
        for b in c.node.get('bases', ()):
            if re.match(r'^(std::)?vector<', ty.strip_ns(ty.qual_of(b['type'])).strip()) or \
                    re.match(r'^std::vector<', ty.qual_of(b['type']).strip()):
                return True
        return False

    def set_base(self, c):
        return any(re.match(r'^(std::)?set<', ty.qual_of(b['type']).strip()) for b in c.node.get('bases', ()))

    def std_base(self, c):
        for b in c.node.get('bases', ()):
            tn = ty.strip_ns(ty.qual_of(b['type']))
            if tn in ('exception', 'runtime_error', 'logic_error', 'out_of_range', 'invalid_argument'):
                return True
        return False

    def emit_class(self, e):
        if e.gname in NATIVE_CLASSES:
            # written by the runtime (config.NATIVE_CLASSES): this module passes it on
            mod = self.mod(e)
            mod.registered.append(e.gname)
            mod.need(e.gname, NATIVE_CLASSES[e.gname])
            return [f'export {{ {e.gname} }};']
        if e.module in OPAQUE or e.gname in OPAQUE_CLASSES:
            mod = self.mod(e)
            mod.registered.append(e.gname)
            return [f'export class {e.gname} {{', '  $clone() { return this; }', '  $assign(_o) { return this; }', '  procs = [];', '  MusicSystem = { ClearGame() {}, Clear() {}, Stop() {} };', '  SoundSystem = { ClearGame() {}, Clear() {}, Stop() {} };', '  Added() {}', '  Removed() {}', '  Removing() {}', '  OnScheduler() {}',
                    '  init() { return this; }', '  init$v() { return this; }', '  None() { return this; }', '  Init() { return this; }', '  Execute() {}', '  Close() { return true; }',
                    '  Open() { return false; }', '  Load() { return 0; }', '  Clear() {}', '  Default() {}',
                    '  Set() { return true; }', '  Check() { return true; }', '  Lock() {}', '  Unlock() {}',
                    '  isEnabled() { return false; }', '  isHost() { return false; }',
                    '  isLobbyActive() { return false; }', '  DoLobby() { return true; }',
                    '  RetrieveScenario() { return false; }', '  FinalInit() { return true; }', '  Unload() {}',
                    '  CompileFunc() {}', '  FixShiftKeys() {}', '  ResolveIncompleteSkeletons() {}', '  RemoveSkeletonsInGroup() {}', '}']
        mod = self.mod(e)
        tu, n = e.best()
        if not n.get('completeDefinition'):
            return None
        self.prog.ctx = e
        if n.get('tagUsed') == 'union':
            return self.emit_union(e, mod)
        base = None if self.vector_base(e) else self.extends_base(e)
        for b in self.bases(e):
            b.reached = True
        if base is not None:
            bp = self.mod_path(base)
            bn = mod.need(base.gname, bp) if bp != mod.path else base.gname
            ext = f' extends {bn}'
        elif self.std_base(e):
            ext = f' extends {mod.need("StdException", "rt/std")}'
        elif self.vector_base(e):
            # class C4RectList : public std::vector<C4Rect>: a JavaScript array, as the runtime's vectors are
            ext = ' extends Array'
        elif self.set_base(e):
            # class HostilitySet : public std::set<const C4Player *>: the runtime's set
            ext = f' extends {mod.need("StdSet", "rt/std")}'
        else:
            ext = ''
        lines = [f'export class {e.gname}{ext} {{']
        if PROFILE.game and not base and not ext:
            # a plain struct of numbers: its C++ layout (fields with byte offsets, size), for the runtime that copies
            # it as bytes (memcpy into a mapped vertex buffer, StdMesh::UpdateVBO; OpenGL uploads)
            try:
                sl = FuncEmitter(self, mod, tu, None, None).struct_layout(ty.T('rec', name=e.key))
            except (Unsupported, ValueError):
                sl = None
            if sl and sl[0]:
                lines.append(f'  static $layout = {json.dumps([list(f) for f in sl[0]])};')
                lines.append(f'  static $size = {sl[1]};')
        fields = []
        for m in e.members:
            if m.kind == 'svar':
                mt, mn = m.best()
                for t2, n2 in m.inst:
                    if [c for c in kids(n2) if 'kind' in c]:
                        mt, mn = t2, n2
                        break
                init = [c for c in kids(mn) if 'kind' in c and not c['kind'].endswith('Attr')]
                fe = FuncEmitter(self, mod, mt, None, e)
                t = ty.parse(mn['type'])
                try:
                    if t.kind == 'arr':
                        val = self.array_init(fe, t, init[-1]) if init else self.array_of(mod, t.to, str(t.n))
                    else:
                        val = fe.ex(init[-1]).at(P_ASSIGN) if init else self.zero_of(mod, t)
                except Unsupported:
                    # an opaque renderer/editor constructor: keep the field, fail if it is really used
                    val = 'null'
                # static members are set up by $init (they may need other classes)
                mod.inits.append(((0,), f'{e.gname}.{m.name} = {val};'))
                lines.append(f'  static {m.name};')
        own_fields = [m for m in e.members if m.kind == 'field']
        for mx in self.mixins(e):
            mod.inits.append(((0,), f'{mod.need("$mixin", "rt/std")}({e.gname}, {self.eref(mod, mx)});'))
            stack = [mx]
            while stack:
                b = stack.pop()
                own_fields += [m for m in b.members if m.kind == 'field']
                stack += self.bases(b)
        for m in own_fields:
            if m.kind == 'field':
                mt, mn = m.best()
                t = ty.parse(mn['type'])
                fe = FuncEmitter(self, mod, mt, None, e)
                init = [c for c in kids(mn) if 'kind' in c and not c['kind'].endswith('Attr')]
                fields.append((m, t))
                if not m.name:
                    continue
                if t.kind == 'rec' and (t.name.startswith('std::array') or (isinstance(t.text, str) and 'std::array' in t.text)):
                    lines.append(f'  {m.name} = {self.std_array(mod, t)};')
                    continue
                if init:
                    if t.kind == 'arr':
                        lines.append(f'  {m.name} = {self.array_init(fe, t, init[-1])};')
                    else:
                        lines.append(f'  {m.name} = {fe.ex(init[-1]).at(P_ASSIGN)};')
                elif t.kind == 'ref':
                    lines.append(f'  {m.name} = null;')
                else:
                    lines.append(f'  {m.name} = {self.zero_of(mod, t)};')
        whole = e.module in UNITS and e.module not in UNIT_ONLY
        for m in e.members:
            if m.kind == 'method' and not m.has_body() and m.reached and not m.node.get('pure') \
                    and not m.node.get('isImplicit') and not m.node.get('explicitlyDefaulted') \
                    and m.node['kind'] != 'CXXDestructorDecl' and m.node.get('name') != 'operator=' \
                    and not self.prog.is_copy_ctor(m):
                # A method defined outside the translated units (a renderer/editor/network class that is
                # only reached through a header). Do not generate a stub for every template member: a
                # class with thousands of instantiations otherwise makes the translator allocate GBs.
                if e.module not in UNITS:
                    continue
                # used, but defined in a file that is not translated: fails when it is called
                qn = f'{ty.strip_ns(e.key)}::{m.node.get("name")}'
                self.missing.add(qn)
                st = 'static ' if m.node.get('storageClass') == 'static' else ''
                lines.append('')
                lines.append(f'  {st}{m.name}(..._) {{ return {mod.need("$missing", "rt/std")}({json.dumps(qn)}); }}')
                continue
            if m.kind != 'method' or not m.has_body() or not (whole or m.reached or m.node['kind'] == 'CXXDestructorDecl'):
                continue
            mn = m.node
            if mn['kind'] == 'CXXDestructorDecl':
                if mn.get('isImplicit') or not self.has_dtor(e):
                    continue
            elif mn.get('isImplicit'):
                if mn['kind'] == 'CXXConstructorDecl' and not self.prog.is_copy_ctor(m) and self.needs_init(e) and \
                        self.default_ctor(e) is m:
                    pass
                else:
                    continue
            if self.prog.is_copy_ctor(m) or (mn.get('name') == 'operator=' and self.is_copy_assign(m, e)
                                             and '&&' not in ty.qual_of(mn['type'])):
                continue
            if mn.get('explicitlyDefaulted') and mn.get('name') == 'operator=':
                # `C4Group &operator=(C4Group &&) = default;` has no body; the generic $assign covers it
                continue
            if mn['kind'] == 'CXXConstructorDecl' and mn.get('explicitlyDefaulted') and not self.needs_init(e):
                continue
            qn = f'{ty.strip_ns(e.key)}::{mn.get("name")}'
            if qn in NOT_PORTED:
                # not translated: fails when it is called (config.NOT_PORTED says why it is never called)
                st = 'static ' if mn.get('storageClass') == 'static' else ''
                lines.append('')
                lines.append(f'  {st}{m.name}(..._) {{ return {mod.need("$missing", "rt/std")}({json.dumps(qn)}); }}')
                continue
            why = SKIP.get(qn)
            if why:
                lines.append('')
                lines.append(f'  {m.name}() {{ /* not translated: {why} */ }}')
                continue
            if qn in NATIVE_METHODS:
                nn = mod.need('$N', 'rt/native')
                st = 'static ' if mn.get('storageClass') == 'static' else ''
                lines.append('')
                lines.append(f'  {st}{m.name}(...a) {{ return {nn}.{qn.replace("::", "_")}.apply(this, a); }} // rt/native.ts')
                continue
            try:
                fl = self.function(m, mod, e, prefix='')
            except Unsupported as x:
                raise Unsupported(f'{m.name}: {x}')
            if fl is None:
                continue
            lines.append('')
            lines += ['  ' + ln for ln in fl]
        # copies
        cc = [m for m in e.members if m.kind == 'method' and self.prog.is_copy_ctor(m) and not m.node.get('isImplicit')
              and not m.node.get('explicitlyDefaulted') and m.has_body() and not ty.qual_of(m.node['type']).count('&&')]
        ca = [m for m in e.members if m.kind == 'method' and m.node.get('name') == 'operator=' and self.is_copy_assign(m, e)
              and not m.node.get('isImplicit') and not m.node.get('explicitlyDefaulted') and m.has_body()]
        lines.append('')
        if cc:
            fl = self.function(cc[0], mod, e, prefix='')
            fl[0] = fl[0].replace(f'{cc[0].name}(', '$copy(', 1)
            lines += ['  ' + ln for ln in fl]
            lines.append(f'  $clone() {{ return new {e.gname}().$copy(this); }}')
        else:
            lines.append(f'  $clone() {{ return new {e.gname}().$assign(this); }}')
        if ca:
            fl = self.function(ca[0], mod, e, prefix='')
            fl[0] = fl[0].replace(f'{ca[0].name}(', '$assign(', 1)
            lines += ['  ' + ln for ln in fl]
        else:
            body = []
            if base:
                body.append('super.$assign(o);')
            elif self.vector_base(e):
                # the vector's elements (copies of class values)
                body.append('this.length = 0;')
                body.append('for (const x of o) this.push(x && x.$clone ? x.$clone() : x);')
            elif self.set_base(e):
                body.append('this.items = o.items.slice();')
            for m, t in fields:
                if not m.name:
                    continue
                if t.kind == 'rec':
                    if self.prog.class_of_type(t) is not None:
                        body.append(f'this.{m.name}.$assign(o.{m.name});')
                    else:
                        body.append(f'this.{m.name} = {self.std_copy(mod, t, "o." + m.name)};')
                elif t.kind == 'arr':
                    body.append(f'this.{m.name} = {self.array_copy(mod, t, "o." + m.name)};')
                else:
                    body.append(f'this.{m.name} = o.{m.name};')
            lines.append('  $assign(o) {')
            lines += ['    ' + b for b in body]
            lines.append('    return this;')
            lines.append('  }')
        lines.append('}')
        mod.registered.append(e.gname)
        return lines

    def array_copy(self, mod, t, s, depth=0):
        """a copy of a C array as C++ copies it: its numbers, and for arrays of arrays (float m[3][4]) or of class values
        each element copied, the copies knowing their places (rt $own), so that no row or object is shared"""
        el = t.to.strip() if t.to is not None else None
        v = f'$e{depth}'
        if el is not None and el.kind == 'arr':
            return f'{mod.need("$own", "rt/ptr")}({s}.map(({v}) => {self.array_copy(mod, el, v, depth + 1)}))'
        if el is not None and el.kind == 'rec' and self.prog.class_of_type(el) is not None:
            return f'{mod.need("$own", "rt/ptr")}({s}.map(({v}) => {v}.$clone()))'
        return f'{s}.slice()'

    def std_copy(self, mod, t, s):
        from .stdmap import tmpl, SEQ, SMART
        name, _ = tmpl(t)
        if name in SEQ:
            return f'{s}.slice()'
        if name in SMART or name in ('function', 'lambda', 'time_point', 'duration', 'locale'):
            return s
        if name and (name.startswith(C_STRUCT_PREFIXES) or name in C_STRUCT_FIELDS or name in C_STRUCT_DEFAULTS):
            # a C library's struct (an object of the runtime): its members
            return f'({{ ...{s} }})'
        return f'{s}.$clone()'

    def is_copy_assign(self, m, c):
        ps = [p for p in kids(m.node) if p.get('kind') == 'ParmVarDecl']
        if len(ps) != 1:
            return False
        t = ty.parse(ps[0]['type'])
        old, self.prog.ctx = self.prog.ctx, m.cls
        try:
            return self.prog.class_of_type(t.strip()) is c
        finally:
            self.prog.ctx = old

    def emit_union(self, e, mod):
        """a union: one value behind every member"""
        fields = [m for m in e.members if m.kind == 'field' and m.name]
        first = ty.parse(fields[0].node['type']).strip() if fields else None
        z = 'null' if first is not None and first.kind in ('ptr', 'func') else '0'
        recs = [(m, self.prog.class_of_type(ty.parse(m.node['type']).strip())) for m in fields
                if ty.parse(m.node['type']).strip().kind == 'rec']
        if len(recs) == 1 and recs[0][1] is not None:
            # a struct and scalars (C4DefGraphics: struct { C4Surface *Bitmap, ... } Bmp; StdMesh *Mesh;): the
            # struct is the value, the other members share its first field's memory
            rm, rc = recs[0]
            f0 = [f for f in rc.members if f.kind == 'field' and f.name][0]
            lines = [f'export class {e.gname} {{', f'  $v = {self.zero_of(mod, ty.parse(rm.node["type"]))};']
            for m in fields:
                if m is rm:
                    lines.append(f'  get {m.name}() {{ return this.$v; }}')
                    lines.append(f'  set {m.name}(v) {{ this.$v.$assign(v); }}')
                else:
                    lines.append(f'  get {m.name}() {{ return this.$v.{f0.name}; }}')
                    lines.append(f'  set {m.name}(v) {{ this.$v.{f0.name} = v; }}')
            lines.append(f'  $clone() {{ const u = new {e.gname}(); u.$v.$assign(this.$v); return u; }}')
            lines.append('  $assign(o) { this.$v.$assign(o.$v); return this; }')
            lines.append('}')
            mod.registered.append(e.gname)
            return lines
        lines = [f'export class {e.gname} {{', f'  $v = {z};']
        for m in fields:
            mt = ty.parse(m.node['type']).strip()
            rc = self.prog.class_of_type(mt) if mt.kind == 'rec' else None
            if rc is not None:
                # one of several structs (StdMeshMaterialTextureUnit::Transformation: Scroll, Rotate, ...): the
                # union holds the one last used
                cn = self.eref(mod, rc)
                lines.append(f'  get {m.name}() {{ const v = this.$v; return v instanceof {cn} ? v : (this.$v = {self.new_default(mod, rc)}); }}')
                lines.append(f'  set {m.name}(v) {{ this.$v = v.$clone(); }}')
                continue
            if mt.kind in ('ptr', 'func'):
                # a pointer member reads the integer 0 as null
                lines.append(f'  get {m.name}() {{ const v = this.$v; return v === 0 ? null : v; }}')
            elif mt.kind in ('int', 'bool'):
                lines.append(f'  get {m.name}() {{ const v = this.$v; return v === null ? 0 : v; }}')
            else:
                lines.append(f'  get {m.name}() {{ return this.$v; }}')
            lines.append(f'  set {m.name}(v) {{ this.$v = v; }}')
        for m in e.members:
            if m.kind == 'method' and m.has_body() and not m.node.get('isImplicit') and m.node['kind'] != 'CXXDestructorDecl' \
                    and not self.prog.is_copy_ctor(m):
                fl = self.function(m, mod, e, prefix='')
                if fl:
                    lines.append('')
                    lines += ['  ' + ln for ln in fl]
        if any(ty.parse(m.node['type']).strip().kind == 'rec' for m in fields):
            lines.append(f'  $clone() {{ const u = new {e.gname}(); u.$v = this.$v && this.$v.$clone ? this.$v.$clone() : this.$v; return u; }}')
            lines.append('  $assign(o) { this.$v = o.$v && o.$v.$clone ? o.$v.$clone() : o.$v; return this; }')
        else:
            lines.append(f'  $clone() {{ const u = new {e.gname}(); u.$v = this.$v; return u; }}')
            lines.append('  $assign(o) { this.$v = o.$v; return this; }')
        lines.append('}')
        mod.registered.append(e.gname)
        return lines

    # ---- globals

    def emit_var(self, e):
        mod = self.mod(e)
        tu, n = e.best()
        defs = [(t2, n2) for t2, n2 in e.inst if n2.get('storageClass') != 'extern' or [c for c in kids(n2) if 'kind' in c]]
        if not defs:
            if e.node.get('storageClass') == 'extern':
                # declared here, defined in a file not translated (or native)
                return None
        else:
            tu, n = defs[0]
            for t2, n2 in defs:
                if [c for c in kids(n2) if 'kind' in c]:
                    tu, n = t2, n2
                    break
        fe = FuncEmitter(self, mod, tu, None, None)
        t = ty.parse(n['type'])
        init = [c for c in kids(n) if 'kind' in c and not c['kind'].endswith('Attr')]
        g = f'$.{e.gname}'
        # C++ sets up a file's globals in the order they are defined
        okey = (1, (n.get('loc') or {}).get('offset') or ((n.get('loc') or {}).get('expansionLoc') or {}).get('offset') or 0)
        if t.kind == 'arr':
            el = t.to.strip()
            narrow = e.name in NARROW64
            if init:
                if narrow:
                    t = ty.T('arr', to=ty.T('int', 32, True), n=t.n)
                v = self.array_init(fe, t, init[0])
            else:
                v = self.array_of(mod, el, str(t.n))
            mod.inits.append((okey, f'{g} = {v};'))
            return []
        if t.kind == 'rec':
            if not init:
                c = self.prog.class_of_type(t)
                v = self.new_default(mod, c) if c is not None else self.std.default(fe, t)
            else:
                v = fe.ex(init[0]).at(P_ASSIGN)
            m = re.fullmatch(r'new ([\w$.]+)\(\)\.([\w$]+)\((.*)\)', v)
            if m:
                # the object exists (and is the global) before its constructor runs, as in C++
                mod.inits.append((okey, f'{g} = new {m.group(1)}(); {g}.{m.group(2)}({m.group(3)});'))
            else:
                mod.inits.append((okey, f'{g} = {v};'))
            return []
        if t.kind == 'ref':
            mod.inits.append((okey, f'{g} = {(fe.addr(init[0]) if fe.by_ptr(t) else fe.ex(init[0])).at(P_ASSIGN)};'))
            return []
        v = fe.ex(init[0]).at(P_ASSIGN) if init else self.zero_of(mod, t)
        mod.inits.append((okey, f'{g} = {v};'))
        return []


def main():
    args = [a for a in sys.argv[1:] if a not in ('--aul', '--sim')]
    out = os.path.join(ROOT, 'web', 'games', 'openclonk', 'src')
    if args[:1] == ['--out']:
        out = args[1]
    asts = sorted(glob.glob(os.path.join(ROOT, 're', 'openclonk', 'work', PROFILE.ast, '*.json')))
    prog = Program(asts)
    tr = Translator(prog)
    for _e in prog.by_key.values():
        if _e.kind == 'class' and ty.strip_ns(_e.key).split('::')[-1] in EXTRA_CLASSES:
            _e.reached = True
    # a class derived from one the runtime writes (StdThread): the runtime calls its virtual methods (Execute)
    roots = prog.roots(UNITS)
    for _e in prog.classes:
        if any(b.name in NATIVE_CLASSES or ty.strip_ns(b.key) in NATIVE_CLASSES for b in prog.bases_of(_e)):
            for _m in _e.members:
                if _m.kind == 'method' and (_m.node.get('virtual') or any(
                        a.get('kind') == 'OverrideAttr' for a in _m.node.get('inner', ()))):
                    roots.append(_m)
    tr.run(roots)
    if tr.errors:
        for x in sorted(set(tr.errors)):
            print('cpp2ts:', x, file=sys.stderr)
        print(f'cpp2ts: {len(set(tr.errors))} errors', file=sys.stderr)
        sys.exit(1)
    gen = os.path.join(out, PROFILE.out)
    old = set(glob.glob(os.path.join(gen, '**', '*.ts'), recursive=True))
    written = set()
    mods = sorted(p for p in tr.mods if p.startswith(PROFILE.out + '/'))
    cut = len(PROFILE.out) + 1
    for p in mods:
        f = os.path.join(out, p + '.ts')
        os.makedirs(os.path.dirname(f), exist_ok=True)
        if p[cut:] in OPAQUE:
            # an opaque module sets up no globals, except its constants (C4Network2's C4NetStdPortTCP, which the
            # config's defaults take by reference)
            tr.mods[p].inits[:] = [i for i in tr.mods[p].inits
                                   if re.fullmatch(r'\$\.[\w$]+ = -?\d+(\.\d+)?;', i[1].strip())]
        text = tr.mods[p].text()
        if not PROFILE.aul:
            # InplaceReconstruct<T> is a destructor+placement-new; the destructor half becomes a bogus
            # obj.None() in the translation. The $assign(new T()) after it already reinitializes the object.
            text = text.replace('  obj.None();\n', '')
        with open(f, 'w') as fh:
            fh.write(text)
        written.add(f)
    order = sorted(mods, key=lambda p: (UNIT_ORDER.get(p[cut:], 10 ** 6), p))
    idx = ['// @ts-nocheck', f'// OpenClonk {REV}: every translated module, initialized in the order of tools/{PROFILE.units} '
           '(re/openclonk/tools/cpp2ts, do not edit).', "import { bootstrap } from '../rt/sim.ts';"]
    for i, p in enumerate(order):
        idx.append(f"import {{ $init as $init{i} }} from './{p[cut:]}.ts';")
    idx.append('')
    idx.append('let done = false;')
    idx.append('/** sets up the global variables of all modules (C++\'s static initialization), once;')
    idx.append(' *  fresh: again, as a new process would (tests run many programs) */')
    idx.append('export function initGlobals(fresh = false): void {')
    idx.append('  if (done && !fresh) return;')
    idx.append('  done = true;')
    idx.append('  bootstrap();')
    for i, _ in enumerate(order):
        idx.append(f'  $init{i}();')
    idx.append('}')
    f = os.path.join(gen, 'index.ts')
    with open(f, 'w') as fh:
        fh.write('\n'.join(idx) + '\n')
    written.add(f)
    for f in old - written:
        os.remove(f)
    natives = sorted({e.name for e in prog.by_key.values() if e.native and e.reached})
    print(f'cpp2ts: {len(written)} modules into {gen}; native: {", ".join(natives)}')
    with open(os.path.join(ROOT, 're', 'openclonk', 'work', f'missing-{PROFILE.out}.txt'), 'w') as fh:
        fh.write('\n'.join(sorted(tr.missing)) + '\n')
    print(f'cpp2ts: {len(tr.missing)} functions used but not translated (work/missing-{PROFILE.out}.txt)')
    if tr.colored:
        waits = sorted(tr.qname(prog.by_key[k]) for k in tr.colored if prog.by_key[k].reached)
        with open(os.path.join(ROOT, 're', 'openclonk', 'work', f'coroutines-{PROFILE.out}.txt'), 'w') as fh:
            fh.write('\n'.join(waits) + '\n')
        print(f'cpp2ts: {len(waits)} functions wait in a modal loop, generators (work/coroutines-{PROFILE.out}.txt)')


main()
