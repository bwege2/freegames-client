"""TypeScript for one C file: its functions, its static variables and the initial values of its
globals. CONVENTIONS.md says what C becomes in TypeScript."""
import os
import re

from . import ctypes_ as ct
from .analyze import strip
from .program import ASYNC_ROOTS

# JavaScript precedence (higher binds tighter)
P_COMMA, P_ASSIGN, P_COND, P_OR, P_AND, P_BOR, P_BXOR, P_BAND, P_EQ, P_REL, P_SHIFT, P_ADD, P_MUL, P_UNARY, P_POSTFIX, P_ATOM = \
    1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 20

BIN = {
    '*': P_MUL, '/': P_MUL, '%': P_MUL, '+': P_ADD, '-': P_ADD, '<<': P_SHIFT, '>>': P_SHIFT, '>>>': P_SHIFT,
    '<': P_REL, '>': P_REL, '<=': P_REL, '>=': P_REL, '==': P_EQ, '!=': P_EQ, '===': P_EQ, '!==': P_EQ,
    '&': P_BAND, '^': P_BXOR, '|': P_BOR, '&&': P_AND, '||': P_OR,
}

RESERVED = set('''break case catch class const continue debugger default delete do else enum export extends
false finally for function if import in instanceof new null return super switch this throw true try typeof
var void while with yield let static implements interface package private protected public await
arguments eval undefined NaN Infinity of async get set G P S Ptr VaList R Math Object Array Number String
Symbol Error JSON Promise Map Set Date console window document globalThis constructor prototype
Int8Array Uint8Array Int16Array Uint16Array Int32Array Uint32Array Float64Array Float32Array'''.split())

SIMPLE = re.compile(r'^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[\d+\])*$')


def jsname(n):
    return n + '_' if n in RESERVED else n


def wrap(e, need):
    code, prec = e
    return code if prec >= need else f'({code})'


def js_string(bs):
    """a JavaScript string literal of bytes (latin1)"""
    out = ['"']
    for b in bs:
        c = chr(b)
        if c == '"':
            out.append('\\"')
        elif c == '\\':
            out.append('\\\\')
        elif c == '\n':
            out.append('\\n')
        elif c == '\t':
            out.append('\\t')
        elif c == '\r':
            out.append('\\r')
        elif 32 <= b < 127:
            out.append(c)
        else:
            out.append(f'\\x{b:02x}')
    out.append('"')
    return ''.join(out)


C_ESC = {'n': 10, 't': 9, 'r': 13, '0': 0, 'a': 7, 'b': 8, 'f': 12, 'v': 11, '\\': 92, "'": 39, '"': 34, '?': 63, 'e': 27}


def c_string_bytes(lit):
    """the bytes of a C string literal as clang prints it ("..." with C escapes), without the NUL"""
    assert lit[0] == '"' and lit[-1] == '"', lit
    s = lit[1:-1]
    out = bytearray()
    i = 0
    while i < len(s):
        c = s[i]
        if c != '\\':
            out += c.encode('latin1') if ord(c) < 256 else c.encode('utf-8')
            i += 1
            continue
        i += 1
        c = s[i]
        if c == 'x':
            j = i + 1
            while j < len(s) and s[j] in '0123456789abcdefABCDEF':
                j += 1
            out.append(int(s[i + 1:j], 16) & 0xff)
            i = j
        elif c in '01234567':
            j = i
            while j < len(s) and j < i + 3 and s[j] in '01234567':
                j += 1
            out.append(int(s[i:j], 8) & 0xff)
            i = j
        else:
            out.append(C_ESC[c])
            i += 1
    return bytes(out)


class TranslateError(Exception):
    pass


def init_expr(d):
    """the initializer of a VarDecl (None without one)"""
    if not d.get('init'):
        return None
    xs = [c for c in d.get('inner', []) if 'valueCategory' in c or c.get('kind') in ('InitListExpr', 'ImplicitValueInitExpr')]
    return xs[-1] if xs else None


# expressions a macro's name may stand for
NAMEABLE = {'IntegerLiteral', 'CharacterLiteral', 'ParenExpr', 'CStyleCastExpr', 'UnaryOperator', 'BinaryOperator',
            'ConditionalOperator'}
IDENT = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')
_sources = {}


def source_text(path):
    """the bytes of a source file as clang read it (work/src is the C files' directory)"""
    if path not in _sources:
        import os
        from .program import WORK
        full = path if os.path.isabs(path) else os.path.join(WORK, 'src', path)
        try:
            with open(full, 'rb') as fh:
                _sources[path] = fh.read()
        except OSError:
            _sources[path] = None
    return _sources[path]


def mark_macro_tops(n, parent=None):
    """marks the nodes that are the outermost of a macro's expansion ('_mtop'): their parent (past
    implicit casts) does not come from the same macro"""
    if not isinstance(n, dict) or 'kind' not in n:
        return
    r = (n['_rb'][:3], n['_re'][:3]) if n.get('_rb') and n.get('_re') else None
    n['_mtop'] = r is not None and r != parent
    up = parent if n.get('kind') == 'ImplicitCastExpr' else r
    for c in n.get('inner', []):
        mark_macro_tops(c, up)


class LV:
    """an lvalue. kind: 'name' (code is a variable or property path), 'member' (base.field), 'index'
    (base[idx]), 'ptr' (p.a[p.o + k]: base is the Ptr's code, idx the offset), 'obj' (a struct or union
    object: code)"""

    def __init__(self, kind, t, code=None, base=None, idx=None, bits=None, field=None):
        self.kind, self.t, self.code, self.base, self.idx, self.bits, self.field = kind, t, code, base, idx, bits, field

    def get(self):
        if self.kind in ('name', 'obj'):
            return self.code
        if self.kind == 'member':
            return f'{self.base}.{self.field}'
        if self.kind == 'index':
            return f'{self.base}[{self.idx}]'
        if self.kind == 'ptr':
            if SIMPLE.match(self.base):
                return f'{self.base}.a[{self.base}.o{self._off()}]'
            return f'$rd({self.base}{", " + self.idx if self.idx != "0" else ""})'
        raise TranslateError(self.kind)

    def _off(self):
        return '' if self.idx == '0' else f' + {self.idx}'

    def stable(self):
        """can get() be evaluated twice?"""
        if self.kind in ('name', 'obj'):
            return True
        if self.kind == 'member':
            return bool(SIMPLE.match(self.base))
        if self.kind == 'index':
            return bool(SIMPLE.match(self.base)) and bool(re.match(r'^[\w$.]+$', self.idx))
        if self.kind == 'ptr':
            return bool(SIMPLE.match(self.base)) and bool(re.match(r'^[\w$.]+$', self.idx))
        return False

    def set(self, v):
        """an assignment expression storing the code v"""
        if self.bits is not None:
            v = f'({v}) & {(1 << self.bits) - 1}' if not (re.match(r'^-?\d+$', v) and 0 <= int(v) < (1 << self.bits)) else v
        if self.kind == 'ptr' and not SIMPLE.match(self.base):
            return f'$wr({self.base}, {self.idx}, {v})'
        return f'{self.get()} = {v}'


class FnCtx:
    def __init__(self, func):
        self.func = func
        self.locals = {}      # decl id -> (js name, type, boxed)
        self.names = set()
        self.temps = 0
        self.max_temps = 0
        self.machines = []    # goto state machines: stack of dicts
        self.label_machine = {}  # label decl id -> (machine, state)
        self.breakables = []  # stack: ('loop'|'switch'|'sm', label, node)
        self.label_count = 0
        self.hoisted = set()  # decl ids declared at the top of a machine / switch


class Emitter:
    def __init__(self, prog, tu):
        self.prog = prog
        self.tu = tu
        self.imports = {}       # module -> set of names
        self.runtime = set()
        self.structs = set()
        self.module_vars = []   # (name, init code or None, comment)
        self.statics = {}       # (fn name, decl id) -> js name   /  ('', name) for file statics
        self.ctx = None
        self.warnings = []
        self.strings = 0
        self.static_local_map = {}
        self.consts = {}

    # ---- names ----
    def use_rt(self, name):
        self.runtime.add(name)
        return name

    def struct_name(self, rec):
        n = self.prog.class_name(rec)
        self.structs.add(n)
        return n

    def func_ref(self, name):
        """the TypeScript name of a C function referred to in this file"""
        f = self.prog.func(self.tu, name)
        if f is None:
            return self.use_rt(jsname(name))
        if f.tu != self.tu:
            self.imports.setdefault(f.tu, set()).add(jsname(name))
        return jsname(name)

    def is_async(self, name):
        f = self.prog.func(self.tu, name)
        return f is not None and f.is_async

    def ty(self, n):
        t = n.get('_t')
        if t is None:
            t = self.prog.type(n)
            n['_t'] = t
        return t

    # ---- types in TypeScript ----
    def ts_type(self, t):
        if isinstance(t, (ct.Int, ct.Enum, ct.Float)):
            return 'number'
        if isinstance(t, ct.Ptr):
            k = ct.ptr_kind(t)
            if k == 'obj' and isinstance(t.to, ct.Rec):
                return self.struct_name(t.to) + ' | null'
            if k == 'fn':
                return 'Function | null'
            if k == 'any':
                return 'any'
            return 'Ptr | null'
        if isinstance(t, ct.Rec):
            return self.struct_name(t)
        if isinstance(t, ct.Void):
            return 'void'
        return 'any'

    # ---- values of a type ----
    def zero(self, t):
        """code for a fresh zero value of type t"""
        if isinstance(t, (ct.Int, ct.Enum, ct.Float)):
            return '0'
        if isinstance(t, ct.Ptr):
            return 'null'
        if isinstance(t, ct.Rec):
            return f'new {self.struct_name(t)}()'
        if isinstance(t, ct.Arr):
            return self.new_array(t)
        if isinstance(t, ct.VaList):
            return 'null'
        if isinstance(t, ct.Opaque):
            return 'null'
        raise TranslateError(f'zero of {t.c()}')

    def new_array(self, t):
        n = t.n if t.n is not None else 0
        ta = ct.typed_array(t.of)
        if ta:
            return f'new {ta}({n})'
        if isinstance(t.of, ct.Rec):
            return f'{self.use_rt("$sarr")}({self.struct_name(t.of)}, {n})'
        if isinstance(t.of, ct.Arr):
            inner = self.new_array(t.of)
            return f'{self.use_rt("$arr")}({n}, () => {inner})'
        if isinstance(t.of, ct.Ptr):
            return f'new Array({n}).fill(null)'
        raise TranslateError(f'array of {t.of.c()}')

    # ---- expressions ----
    def rv(self, n):
        """(code, precedence) of the value of expression n"""
        k = n.get('kind')
        if k in NAMEABLE and '_rb' in n:
            name = self.macro_name(n)
            if name:
                return (name, P_ATOM)
        m = getattr(self, 'x_' + k, None)
        if m is None:
            raise TranslateError(f'expression {k}')
        return m(n)

    def code(self, n, need=P_COMMA + 1):
        return wrap(self.rv(n), need)

    def cond(self, n):
        """code of n in a boolean context (truthiness)"""
        n0 = n
        k = n.get('kind')
        if k == 'ParenExpr':
            return self.cond(n['inner'][0])
        if k == 'ImplicitCastExpr' and n.get('castKind') in ('IntegralToBoolean', 'PointerToBoolean', 'LValueToRValue', 'IntegralCast', 'NoOp'):
            if n.get('castKind') in ('IntegralToBoolean', 'PointerToBoolean'):
                return self.cond(n['inner'][0])
        if k == 'BinaryOperator' and n['opcode'] in ('&&', '||'):
            a = self.cond_e(n['inner'][0])
            b = self.cond_e(n['inner'][1])
            p = BIN[n['opcode']]
            return f'{wrap(a, p)} {n["opcode"]} {wrap(b, p + 1)}'
        if k == 'UnaryOperator' and n['opcode'] == '!':
            return f'!{wrap(self.cond_e(n["inner"][0]), P_UNARY)}'
        return wrap(self.rv_bool(n0), P_COMMA + 1)

    def cond_e(self, n):
        c = self.cond(n)
        k = strip(n).get('kind')
        if k == 'BinaryOperator' and strip(n)['opcode'] in ('&&', '||'):
            return (c, BIN[strip(n)['opcode']])
        if k == 'UnaryOperator' and strip(n)['opcode'] == '!':
            return (c, P_UNARY)
        return self.rv_bool(n)

    def rv_bool(self, n):
        """value of n where only its truth matters: comparisons stay booleans"""
        s = n
        while s.get('kind') == 'ParenExpr' or (s.get('kind') == 'ImplicitCastExpr' and s.get('castKind') in ('IntegralToBoolean', 'PointerToBoolean')):
            s = s['inner'][0]
        if s.get('kind') == 'BinaryOperator' and s['opcode'] in ('==', '!=', '<', '>', '<=', '>='):
            return self.compare(s)
        if s.get('kind') == 'BinaryOperator' and s['opcode'] in ('&&', '||'):
            return (self.cond(s), BIN[s['opcode']])
        if s.get('kind') == 'UnaryOperator' and s['opcode'] == '!':
            return (self.cond(s), P_UNARY)
        return self.rv(s)

    def as_int(self, e):
        """a boolean expression as C's 0/1"""
        return (f'{wrap(e, P_COND + 1)} ? 1 : 0', P_COND)

    def named(self, name, value):
        """a constant's name in the code: the value is remembered for consts.ts"""
        name = jsname(name)
        self.consts.setdefault(name, set()).add(value)
        return name

    def macro_name(self, n):
        """the name of the object-like macro that n is the whole expansion of, or None"""
        rb, re_ = n.get('_rb'), n.get('_re')
        if not rb or not re_ or rb[3] or rb[:3] != re_[:3] or rb[1] is None or not n.get('_mtop'):
            return None
        text = source_text(rb[0])
        if text is None:
            return None
        tok = text[rb[1]:rb[1] + rb[2]].decode('latin1')
        if not IDENT.match(tok) or tok in ('NULL', 'sizeof'):
            return None
        after = text[rb[1] + rb[2]:rb[1] + rb[2] + 64].decode('latin1').lstrip()
        if after.startswith('('):
            return None  # a function-like macro: the name is not the value
        v = self.const_value(n)
        if v is None:
            return None
        return self.named(tok, v)

    def x_ParenExpr(self, n):
        return self.rv(n['inner'][0])

    def x_ConstantExpr(self, n):
        return self.rv(n['inner'][0])

    def x_IntegerLiteral(self, n):
        v = int(n['value'])
        return (str(v), P_ATOM if v >= 0 else P_UNARY)

    def x_CharacterLiteral(self, n):
        v = int(n['value'])
        t = self.ty(n)
        if v >= 128 and isinstance(t, ct.Int) and t.signed and t.bits == 8:
            v -= 256
        return (str(v), P_ATOM if v >= 0 else P_UNARY)

    def x_FloatingLiteral(self, n):
        return (n['value'], P_ATOM)

    def x_StringLiteral(self, n):
        return (f'{self.use_rt("S")}({js_string(c_string_bytes(n["value"]))})', P_ATOM)

    def x_GenericSelectionExpr(self, n):
        for c in n.get('inner', [])[1:]:
            if c.get('selected'):
                return self.rv([x for x in c['inner'] if 'valueCategory' in x][-1])
        # clang marks the chosen association; else the first non-type one
        for c in n.get('inner', [])[1:]:
            if c.get('inner') and c['inner'][0].get('kind', '').endswith('Expr'):
                pass
        raise TranslateError('generic selection without a selected association')

    def x_DeclRefExpr(self, n):
        ref = n['referencedDecl']
        k = ref['kind']
        if k == 'EnumConstantDecl':
            v = self.prog.enums.get(ref['name'])
            if v is None:
                raise TranslateError('enum constant ' + ref['name'])
            return (self.named(ref['name'], v), P_ATOM)
        if k == 'FunctionDecl':
            return (self.func_ref(ref['name']), P_ATOM)
        return (self.var_lv(n).get(), P_ATOM)

    def var_lv(self, n):
        ref = n['referencedDecl']
        t = self.ty(n)
        name = ref['name']
        loc = self.ctx.locals.get(ref['id']) if self.ctx else None
        if loc is None:
            loc = self.static_local_map.get(ref['id'])
        if loc is not None:
            js, _t, boxed = loc
            if boxed:
                return LV('index', t, base=js, idx='0')
            if isinstance(t, ct.Rec):
                return LV('obj', t, code=js)
            return LV('name', t, code=js)
        v = self.prog.var(self.tu, name)
        if v is None:
            # a libc variable (stdout, stdin, ...)
            return LV('name', t, code=f'{self.use_rt("R")}.{name}')
        if v.static:
            js = self.statics.get(('', name)) or jsname(name)
            if getattr(v, 'boxed', False):
                return LV('index', t, base=js, idx='0')
            if isinstance(t, ct.Rec):
                return LV('obj', t, code=js)
            return LV('name', t, code=js)
        self.use_rt('G')
        if isinstance(t, ct.Rec):
            return LV('obj', t, code=f'G.{jsname(name)}')
        return LV('name', t, code=f'G.{jsname(name)}')

    def lv(self, n):
        """the lvalue n"""
        k = n.get('kind')
        if k == 'ParenExpr':
            return self.lv(n['inner'][0])
        if k == 'DeclRefExpr':
            return self.var_lv(n)
        if k == 'MemberExpr':
            return self.member_lv(n)
        if k == 'ArraySubscriptExpr':
            return self.subscript_lv(n)
        if k == 'UnaryOperator' and n['opcode'] == '*':
            return self.deref_lv(n['inner'][0], '0', self.ty(n))
        if k == 'StringLiteral':
            # an array lvalue: the literal's characters
            return LV('obj', self.ty(n), code=self.code(n))
        if k in ('ImplicitCastExpr', 'CStyleCastExpr') and n.get('castKind') in ('NoOp', 'LValueToRValue'):
            return self.lv(n['inner'][0])
        if k == 'CallExpr' or k == 'ConditionalOperator':
            # a struct value
            return LV('obj', self.ty(n), code=self.code(n, P_POSTFIX))
        if k == 'BinaryOperator' and n['opcode'] == '=' and isinstance(self.ty(n), ct.Rec):
            return LV('obj', self.ty(n), code=self.code(n, P_POSTFIX))
        if k == 'CompoundLiteralExpr':
            return LV('obj', self.ty(n), code=self.code(n['inner'][0], P_POSTFIX))
        raise TranslateError(f'lvalue {k}')

    def member_lv(self, n):
        base = n['inner'][0]
        bt = self.ty(base)
        if n.get('isArrow'):
            bcode = self.code(base, P_POSTFIX)
            rec = bt.to
        else:
            blv = self.lv(base)
            bcode = blv.get() if blv.kind == 'obj' else wrap((blv.get(), P_ATOM), P_POSTFIX)
            rec = bt
        field = n['name']
        bits = None
        if isinstance(rec, ct.Rec):
            for fname, ftype, w in self.prog.fields(rec):
                if fname == field:
                    bits = w
                    break
        t = self.ty(n)
        if isinstance(t, ct.Rec):
            return LV('obj', t, code=f'{bcode}.{field}')
        return LV('member', t, base=bcode, field=field, bits=bits)

    def subscript_lv(self, n):
        a, i = n['inner']
        at, it = self.ty(a), self.ty(i)
        if not isinstance(at, ct.Ptr):
            a, i = i, a
            at, it = it, at
        t = self.ty(n)
        sa = a
        while sa.get('kind') == 'ParenExpr':
            sa = sa['inner'][0]
        idx = self.code(i, P_ADD + 1)
        if sa.get('kind') == 'ImplicitCastExpr' and sa.get('castKind') == 'ArrayToPointerDecay':
            row = sa['inner'][0]
            while row.get('kind') == 'ParenExpr':
                row = row['inner'][0]
            if isinstance(t, ct.Rec) and row.get('kind') == 'ArraySubscriptExpr':
                # a[x][y] of a 2-dimensional array of structs: C's rows follow each other in memory,
                # and NetHack reads levl[x][y - 1] at y = 0 (the cell before: the last of row x - 1)
                ra, ri = row['inner']
                if not isinstance(self.ty(ra), ct.Ptr):
                    ra, ri = ri, ra
                rsa = ra
                while rsa.get('kind') == 'ParenExpr':
                    rsa = rsa['inner'][0]
                if rsa.get('kind') == 'ImplicitCastExpr' and rsa.get('castKind') == 'ArrayToPointerDecay':
                    at2 = self.ty(rsa['inner'][0])
                    vx, vy = self.const_value(ri), self.const_value(i)
                    inside = isinstance(at2, ct.Arr) and isinstance(at2.of, ct.Arr) and vx is not None and vy is not None \
                        and 0 <= vx < (at2.n or 0) and 0 <= vy < (at2.of.n or 0)
                    if not inside:
                        outer = self.lv(rsa['inner'][0])
                        ocode = outer.get() if outer.kind == 'obj' else wrap((outer.get(), P_ATOM), P_POSTFIX)
                        return LV('obj', t, code=f'{self.use_rt("$at2")}({ocode}, {self.code(ri)}, {self.code(i)})')
            arr = self.lv(row)
            acode = arr.get() if arr.kind == 'obj' else wrap((arr.get(), P_ATOM), P_POSTFIX)
            if isinstance(t, ct.Rec):
                return LV('obj', t, code=f'{acode}[{self.code(i)}]')
            return LV('index', t, base=acode, idx=self.code(i))
        return self.deref_lv(a, idx, t)

    def deref_lv(self, p, idx, t):
        """the lvalue p[idx] (*p when idx is '0')"""
        pt = self.ty(p)
        if isinstance(pt, ct.Ptr) and isinstance(pt.to, ct.Rec):
            pc = self.code(p, P_POSTFIX)
            if idx == '0':
                return LV('obj', t, code=pc)
            return LV('obj', t, code=f'{self.use_rt("$sadd")}({pc}, {idx})')
        if isinstance(pt, ct.Ptr) and isinstance(pt.to, ct.Func):
            return LV('name', t, code=self.code(p, P_POSTFIX))
        pc = self.code(p, P_POSTFIX)
        if isinstance(t, ct.Rec):
            # a struct reached through a Ptr (an element of an array of struct pointers' target...)
            return LV('obj', t, code=f'{self.use_rt("$rd")}({pc}, {idx})')
        if isinstance(t, ct.Arr):
            # p points to an array (a row): the row itself
            return LV('obj', t, code=f'{self.use_rt("$rd")}({pc}, {idx})' if not SIMPLE.match(pc) else f'{pc}.a[{pc}.o{"" if idx == "0" else " + " + idx}]')
        if not SIMPLE.match(pc):
            self.use_rt('$rd')
            self.use_rt('$wr')
        return LV('ptr', t, base=pc, idx=idx)

    def x_MemberExpr(self, n):
        return (self.member_lv(n).get(), P_ATOM)

    def x_ArraySubscriptExpr(self, n):
        return (self.subscript_lv(n).get(), P_ATOM)

    def x_CompoundLiteralExpr(self, n):
        return self.init_value(self.ty(n), n['inner'][0])

    # ---- casts ----
    def x_ImplicitCastExpr(self, n):
        return self.cast(n)

    def x_CStyleCastExpr(self, n):
        return self.cast(n)

    def cast(self, n):
        ck = n.get('castKind')
        inner = n['inner'][0]
        t = self.ty(n)
        if ck == 'LValueToRValue':
            lv = self.lv(inner)
            return (lv.get(), P_ATOM if lv.kind != 'ptr' or SIMPLE.match(lv.base) else P_ATOM)
        if ck in ('NoOp', 'FunctionToPointerDecay', 'BuiltinFnToFnPtr', 'ToVoid', 'IntegralToPointer', 'PointerToIntegral'):
            return self.rv(inner)
        if ck == 'NullToPointer':
            return ('null', P_ATOM)
        if ck == 'IntegralCast':
            return self.conv(inner, self.ty(inner), t)
        if ck in ('IntegralToBoolean', 'PointerToBoolean'):
            return self.as_int(self.rv_bool(inner))
        if ck == 'IntegralToFloating':
            return self.rv(inner)
        if ck == 'FloatingToIntegral':
            return self.conv_code(f'Math.trunc({self.code(inner)})', P_ATOM, ct.Int('long'), t)
        if ck == 'FloatingCast':
            return self.rv(inner)
        if ck == 'ArrayToPointerDecay':
            return self.decay(inner, t)
        if ck == 'BitCast':
            return self.bitcast(inner, self.ty(inner), t)
        raise TranslateError(f'cast {ck}')

    def decay(self, arr, t):
        """an array's value: a pointer to its first element"""
        s = arr
        while s.get('kind') == 'ParenExpr':
            s = s['inner'][0]
        if s.get('kind') == 'StringLiteral':
            return self.rv(s)
        at = self.ty(arr)
        lv = self.lv(arr)
        code = lv.get() if lv.kind == 'obj' else wrap((lv.get(), P_ATOM), P_POSTFIX)
        if isinstance(at, ct.Arr) and isinstance(at.of, ct.Rec):
            return (f'{code}[0]', P_ATOM)
        if isinstance(at, ct.VaList):
            return (code, P_ATOM)
        return (f'{self.use_rt("P")}({code})', P_ATOM)

    def bitcast(self, inner, ft, t):
        s = strip(inner)
        # allocation: (T *) alloc(size)
        if s.get('kind') == 'CallExpr':
            callee = strip(s['inner'][0])
            if callee.get('kind') == 'DeclRefExpr' and callee['referencedDecl']['name'] in ('alloc', 'malloc') and isinstance(t, ct.Ptr):
                return self.allocation(t.to, s['inner'][1])
        if isinstance(ft, ct.Ptr) and isinstance(t, ct.Ptr) and isinstance(ft.to, ct.Rec) and isinstance(t.to, ct.Int):
            # (char *) of a struct pointer: the struct itself (for the memory functions), or the bytes after it
            return (f'{self.use_rt("$bytes")}({self.code(inner)})', P_ATOM)
        if isinstance(ft, ct.Ptr) and isinstance(t, ct.Ptr):
            a, b = ft.to, t.to
            # char * <-> unsigned char *: a view of the same bytes
            if isinstance(a, ct.Int) and isinstance(b, ct.Int) and a.bits == 8 and b.bits == 8 and a.signed != b.signed:
                return (f'{self.use_rt("$view8")}({self.code(inner)}, {"true" if b.signed else "false"})', P_ATOM)
        return self.rv(inner)

    def allocation(self, to, size):
        if isinstance(to, ct.Rec):
            cls = self.struct_name(to)
            sz = self.prog.sizeof(to)
            ss = strip(size)
            if ss.get('kind') == 'UnaryExprOrTypeTraitExpr':
                return (f'new {cls}()', P_ATOM)
            if ss.get('kind') == 'BinaryOperator' and ss['opcode'] == '*' and any(
                    strip(x).get('kind') == 'UnaryExprOrTypeTraitExpr' for x in ss['inner']):
                return (f'{self.use_rt("$sarr")}({cls}, {self.code(size, P_MUL)} / {sz})[0]', P_ATOM)
            # a struct with more bytes after it (struct engr and its text)
            return (f'{self.use_rt("$salloc")}({cls}, {self.code(size)})', P_ATOM)
        ta = ct.typed_array(to)
        if ta:
            es = self.prog.sizeof(to)
            n = self.code(size, P_MUL + 1) if es == 1 else f'{self.code(size, P_MUL)} / {es}'
            return (f'{self.use_rt("P")}(new {ta}({n}))', P_ATOM)
        if isinstance(to, ct.Ptr):
            return (f'{self.use_rt("P")}(new Array({self.code(size, P_MUL)} / 8).fill(null))', P_ATOM)
        if isinstance(to, ct.Void):
            return (f'{self.use_rt("P")}(new Int8Array({self.code(size)}))', P_ATOM)
        raise TranslateError(f'allocation of {to.c()}')

    def const_value(self, n):
        """the value of a constant integer expression, or None"""
        k = n.get('kind')
        if k in ('IntegerLiteral',):
            return int(n['value'])
        if k == 'CharacterLiteral':
            return int(n['value'])
        if k == 'ConstantExpr' and 'value' in n:
            try:
                return int(n['value'])
            except ValueError:
                return None
        if k in ('ParenExpr', 'ConstantExpr'):
            return self.const_value(n['inner'][0])
        if k in ('ImplicitCastExpr', 'CStyleCastExpr') and n.get('castKind') in ('IntegralCast', 'NoOp'):
            v = self.const_value(n['inner'][0])
            if v is None:
                return None
            t = self.ty(n)
            if isinstance(t, (ct.Int, ct.Enum)):
                return self.wrap_int(v, t)
            return v
        if k == 'DeclRefExpr' and n['referencedDecl']['kind'] == 'EnumConstantDecl':
            return self.prog.enums.get(n['referencedDecl']['name'])
        if k == 'UnaryOperator' and n['opcode'] in ('-', '~', '+', '!'):
            v = self.const_value(n['inner'][0])
            if v is None:
                return None
            r = {'-': -v, '~': ~v, '+': v, '!': int(not v)}[n['opcode']]
            t = self.ty(n)
            return self.wrap_int(r, t) if isinstance(t, (ct.Int, ct.Enum)) else r
        if k == 'BinaryOperator' and n['opcode'] in ('|', '&', '^', '+', '-', '*', '<<', '>>'):
            a = self.const_value(n['inner'][0])
            b = self.const_value(n['inner'][1])
            if a is None or b is None:
                return None
            op = n['opcode']
            if op in ('<<', '>>') and (b < 0 or b > 63):
                return None
            ops = {'|': lambda: a | b, '&': lambda: a & b, '^': lambda: a ^ b, '+': lambda: a + b, '-': lambda: a - b,
                   '*': lambda: a * b, '<<': lambda: a << b, '>>': lambda: a >> b}
            r = ops[op]()
            t = self.ty(n)
            return self.wrap_int(r, t) if isinstance(t, (ct.Int, ct.Enum)) else r
        if k == 'UnaryExprOrTypeTraitExpr' and n.get('name') == 'sizeof':
            try:
                return int(self.rv(n)[0])
            except (ValueError, TranslateError):
                return None
        return None

    @staticmethod
    def wrap_int(v, t):
        bits, signed = t.bits, t.signed
        v &= (1 << bits) - 1
        if signed and v >= 1 << (bits - 1):
            v -= 1 << bits
        return v

    def conv(self, inner, ft, t):
        """inner (of type ft) converted to the integer type t"""
        e = self.rv(inner)
        if isinstance(t, (ct.Int, ct.Enum)) and not getattr(t, 'bool', False):
            v = self.const_value(inner)
            if v is not None:
                r = self.wrap_int(v, t)
                if r == v:
                    return e
                if not t.signed and t.bits == 64 and -(1 << 31) <= v < 0:
                    # an unsigned long mask like ~M2_PEACEFUL: its low 32 bits (CONVENTIONS.md)
                    return (f'{wrap(e, P_SHIFT + 1)} >>> 0', P_SHIFT)
                if re.match(r'^-?\d+$', e[0]) or abs(r) < 1 << 53:
                    return (str(r), P_ATOM if r >= 0 else P_UNARY)
        return self.conv_code(e[0], e[1], ft, t)

    def conv_code(self, code, prec, ft, t):
        if isinstance(ft, ct.Float) or isinstance(t, ct.Float):
            return (code, prec)
        if not isinstance(ft, (ct.Int, ct.Enum)) or not isinstance(t, (ct.Int, ct.Enum)):
            return (code, prec)
        fb, fs = ft.bits, ft.signed
        tb, ts = t.bits, t.signed
        if getattr(t, 'bool', False):
            return self.as_int((code, prec))
        e = (code, prec)
        if tb == 64:
            if not ts and fs:
                return (f'{self.use_rt("$u64")}({code})', P_ATOM)
            return e
        if tb == 32:
            if ts:
                if fb < 32 or (fb == 32 and fs):
                    return e
                return (f'{wrap(e, P_BOR + 1)} | 0', P_BOR)
            if not fs and fb <= 32:
                return e
            return (f'{wrap(e, P_SHIFT + 1)} >>> 0', P_SHIFT)
        if tb == 16:
            if fb < 16 and (ts or not fs):
                return e
            if fb == 16 and fs == ts:
                return e
            if ts:
                return (f'{wrap(e, P_SHIFT + 1)} << 16 >> 16', P_SHIFT)
            return (f'{wrap(e, P_BAND + 1)} & 0xffff', P_BAND)
        if tb == 8:
            if fb == 8 and fs == ts:
                return e
            if ts:
                return (f'{wrap(e, P_SHIFT + 1)} << 24 >> 24', P_SHIFT)
            return (f'{wrap(e, P_BAND + 1)} & 0xff', P_BAND)
        return e

    # ---- operators ----
    def x_UnaryOperator(self, n):
        op = n['opcode']
        a = n['inner'][0]
        t = self.ty(n)
        if op == '*':
            lv = self.deref_lv(a, '0', t)
            return (lv.get(), P_ATOM)
        if op == '&':
            return self.address(a)
        if op == '!':
            return self.as_int((f'!{wrap(self.cond_e(a), P_UNARY)}', P_UNARY))
        if op == '-':
            e = self.rv(a)
            r = (f'-{wrap(e, P_UNARY)}' if not e[0].startswith('-') else f'-({e[0]})', P_UNARY)
            return self.arith_result(r, t)
        if op == '+':
            return self.rv(a)
        if op == '~':
            r = (f'~{wrap(self.rv(a), P_UNARY)}', P_UNARY)
            if isinstance(t, ct.Int) and not t.signed:
                return (f'{r[0]} >>> 0', P_SHIFT)
            return r
        if op in ('++', '--'):
            return self.incdec(a, op, n.get('isPostfix', False), value=True)
        if op == '__extension__':
            return self.rv(a)
        raise TranslateError(f'unary {op}')

    def arith_result(self, e, t):
        """C's wrap-around for unsigned results"""
        if isinstance(t, ct.Int) and not t.signed and t.bits == 32:
            return (f'{wrap(e, P_SHIFT + 1)} >>> 0', P_SHIFT)
        return e

    def address(self, a):
        """&a"""
        s = a
        while s.get('kind') == 'ParenExpr':
            s = s['inner'][0]
        t = self.ty(s)
        k = s.get('kind')
        if k == 'DeclRefExpr' and s['referencedDecl']['kind'] == 'FunctionDecl':
            return self.rv(s)
        if k == 'UnaryOperator' and s['opcode'] == '*':
            return self.rv(s['inner'][0])
        if isinstance(t, ct.Rec):
            if k == 'ArraySubscriptExpr':
                # &a[i] for an array of structs: a[i], or the place after the end ($sat) when i may be
                # the array's length
                a0, i0 = s['inner']
                if not isinstance(self.ty(a0), ct.Ptr):
                    a0, i0 = i0, a0
                sa = a0
                while sa.get('kind') == 'ParenExpr':
                    sa = sa['inner'][0]
                if sa.get('kind') == 'ImplicitCastExpr' and sa.get('castKind') == 'ArrayToPointerDecay':
                    at = self.ty(sa['inner'][0])
                    v = self.const_value(i0)
                    if isinstance(at, ct.Arr) and (v is None or v >= (at.n or 0)):
                        arr = self.lv(sa['inner'][0])
                        acode = arr.get() if arr.kind == 'obj' else wrap((arr.get(), P_ATOM), P_POSTFIX)
                        return (f'{self.use_rt("$sat")}({acode}, {self.code(i0)})', P_ATOM)
            return (self.lv(s).get(), P_ATOM)
        if k == 'ArraySubscriptExpr':
            a0, i0 = s['inner']
            if not isinstance(self.ty(a0), ct.Ptr):
                a0, i0 = i0, a0
            sa = a0
            while sa.get('kind') == 'ParenExpr':
                sa = sa['inner'][0]
            if sa.get('kind') == 'ImplicitCastExpr' and sa.get('castKind') == 'ArrayToPointerDecay':
                arr = self.lv(sa['inner'][0])
                acode = arr.get() if arr.kind == 'obj' else wrap((arr.get(), P_ATOM), P_POSTFIX)
                return (f'{self.use_rt("P")}({acode}, {self.code(i0)})', P_ATOM)
            return (f'{self.code(a0, P_POSTFIX)}.add({self.code(i0)})', P_ATOM)
        if isinstance(t, ct.Arr):
            lv = self.lv(s)
            return (f'{self.use_rt("P")}({lv.get()})', P_ATOM)
        lv = self.lv(s)
        if lv.kind == 'index':
            return (f'{self.use_rt("P")}({lv.base}, {lv.idx})', P_ATOM)
        if lv.kind == 'member':
            return (f'{self.use_rt("P")}({lv.base}, {js_string(lv.field.encode())})', P_ATOM)
        if lv.kind == 'name' and lv.code.startswith('G.'):
            return (f'{self.use_rt("P")}(G, {js_string(lv.code[2:].encode())})', P_ATOM)
        if lv.kind == 'ptr':
            if lv.idx == '0':
                return (lv.base, P_ATOM)
            return (f'{lv.base}.add({lv.idx})', P_ATOM)
        raise TranslateError(f'address of {k} ({lv.kind} {lv.get()})')

    def ptr_add(self, pcode, pt, ncode, sub=False):
        """pointer + integer"""
        if isinstance(pt.to, ct.Rec):
            n = f'-{ncode}' if sub else ncode
            return (f'{self.use_rt("$sadd")}({pcode}, {n})', P_ATOM)
        n = (f'-{ncode}' if not ncode.startswith('-') else f'-({ncode})') if sub else ncode
        return (f'{pcode}.add({n})', P_ATOM)

    def incdec(self, a, op, postfix, value):
        """++/-- (value: the expression's value is used)"""
        lv = self.lv(a)
        t = self.ty(a)
        sub = op == '--'

        def newf(old):
            if isinstance(t, ct.Ptr):
                return self.ptr_add(wrap((old, P_ATOM), P_POSTFIX), t, '1', sub)[0]
            raw = f'{wrap((old, P_ATOM), P_ADD)} {"-" if sub else "+"} 1'
            wide = ct.Int('long') if getattr(t, 'bits', 64) == 64 else ct.Int('int')
            return wrap(self.conv_code(raw, P_ADD, wide, t), P_ASSIGN)
        native = not isinstance(t, ct.Ptr) and lv.bits is None and (
            isinstance(t, ct.Float) or (t.bits >= 32 and t.signed) or (lv.kind == 'index' and self.typed_index(a)))
        if native and lv.stable():
            g = lv.get()
            return (f'{g}{op}' if postfix else f'{op}{g}', P_POSTFIX if postfix else P_UNARY)
        if lv.stable():
            if not (value and postfix):
                return (lv.set(newf(lv.get())), P_ASSIGN)
            tmp = self.temp()
            return (f'({tmp} = {lv.get()}, {lv.set(newf(tmp))}, {tmp})', P_ATOM)
        return self.rmw(a, newf, postfix and value)

    def typed_index(self, a):
        """is a an element of a typed array (where JavaScript does C's wrap-around)?"""
        s = a
        while s.get('kind') == 'ParenExpr':
            s = s['inner'][0]
        if s.get('kind') != 'ArraySubscriptExpr':
            return False
        base = s['inner'][0]
        if base.get('kind') == 'ImplicitCastExpr' and base.get('castKind') == 'ArrayToPointerDecay':
            return ct.typed_array(self.ty(s)) is not None
        return False

    def temp(self):
        self.ctx.temps += 1
        self.ctx.max_temps = max(self.ctx.max_temps, self.ctx.temps)
        return f'$t{self.ctx.temps}'

    def rmw(self, a, newf, postfix):
        """read-modify-write of an lvalue whose base must be evaluated once"""
        s = a
        while s.get('kind') == 'ParenExpr':
            s = s['inner'][0]
        k = s.get('kind')
        lv = self.lv(s)
        tb = self.temp()
        if lv.kind == 'member':
            nlv = LV('member', lv.t, base=tb, field=lv.field, bits=lv.bits)
        elif lv.kind == 'index':
            ti = self.temp()
            pre = f'{tb} = {lv.base}, {ti} = {lv.idx}'
            nlv = LV('index', lv.t, base=tb, idx=ti)
            old = nlv.get()
            if postfix:
                to = self.temp()
                return (f'({pre}, {to} = {old}, {nlv.set(newf(to))}, {to})', P_ATOM)
            return (f'({pre}, {nlv.set(newf(old))})', P_ATOM)
        elif lv.kind == 'ptr':
            ti = self.temp()
            pre = f'{tb} = {lv.base}, {ti} = {lv.idx}'
            nlv = LV('ptr', lv.t, base=tb, idx=ti)
            old = nlv.get()
            if postfix:
                to = self.temp()
                return (f'({pre}, {to} = {old}, {nlv.set(newf(to))}, {to})', P_ATOM)
            return (f'({pre}, {nlv.set(newf(old))})', P_ATOM)
        else:
            raise TranslateError(f'read-modify-write of {lv.kind}')
        pre = f'{tb} = {lv.base}'
        old = nlv.get()
        if postfix:
            to = self.temp()
            return (f'({pre}, {to} = {old}, {nlv.set(newf(to))}, {to})', P_ATOM)
        return (f'({pre}, {nlv.set(newf(old))})', P_ATOM)

    def x_BinaryOperator(self, n):
        op = n['opcode']
        a, b = n['inner']
        t = self.ty(n)
        if op == '=':
            return self.assign(a, b, value=True)
        if op == ',':
            return (f'{self.code(a, P_COMMA)}, {self.code(b, P_COMMA + 1)}', P_COMMA)
        if op in ('&&', '||'):
            return self.as_int((self.cond(n), BIN[op]))
        if op in ('==', '!=', '<', '>', '<=', '>='):
            return self.as_int(self.compare(n))
        return self.arith(op, a, b, t)

    def compare(self, n):
        op = n['opcode']
        a, b = n['inner']
        at, bt = self.ty(a), self.ty(b)
        if isinstance(at, ct.Ptr) or isinstance(bt, ct.Ptr):
            sa, sb = strip(a), strip(b)
            anull = self.is_null(a)
            bnull = self.is_null(b)
            if op in ('==', '!='):
                if bnull or anull:
                    x = a if bnull else b
                    if op == '==':
                        return (f'!{self.code(x, P_UNARY)}', P_UNARY)
                    return (f'!!{self.code(x, P_UNARY)}', P_UNARY)
                pk = ct.ptr_kind(at if isinstance(at, ct.Ptr) else bt)
                pk2 = ct.ptr_kind(bt) if isinstance(bt, ct.Ptr) else pk
                if pk in ('obj', 'fn') and pk2 in ('obj', 'fn'):
                    return (f'{self.code(a, P_EQ + 1)} {op}= {self.code(b, P_EQ + 1)}', P_EQ)
                r = f'{self.use_rt("$peq")}({self.code(a)}, {self.code(b)})'
                return (r if op == '==' else f'!{r}', P_ATOM if op == '==' else P_UNARY)
            # relational
            pt = at if isinstance(at, ct.Ptr) else bt
            if isinstance(pt.to, ct.Rec):
                ia = f'{self.use_rt("$sidx")}({self.code(a)})'
                ib = f'{self.use_rt("$sidx")}({self.code(b)})'
            else:
                ia = f'{self.code(a, P_POSTFIX)}.o'
                ib = f'{self.code(b, P_POSTFIX)}.o'
            return (f'{ia} {op} {ib}', P_REL)
        jsop = {'==': '===', '!=': '!=='}.get(op, op)
        p = BIN[jsop]
        return (f'{self.code(a, p)} {jsop} {self.code(b, p + 1)}', p)

    def is_null(self, n):
        s = n
        while s.get('kind') in ('ParenExpr', 'ImplicitCastExpr', 'CStyleCastExpr'):
            if s.get('castKind') == 'NullToPointer':
                return True
            if not s.get('inner'):
                break
            s = s['inner'][0]
        return False

    def arith(self, op, a, b, t):
        at, bt = self.ty(a), self.ty(b)
        if isinstance(at, ct.Ptr) or isinstance(bt, ct.Ptr):
            if op == '-' and isinstance(at, ct.Ptr) and isinstance(bt, ct.Ptr):
                if isinstance(at.to, ct.Rec):
                    return (f'{self.use_rt("$sdiff")}({self.code(a)}, {self.code(b)})', P_ATOM)
                return (f'{self.code(a, P_POSTFIX)}.o - {self.code(b, P_POSTFIX)}.o', P_ADD)
            if op in ('+', '-'):
                if isinstance(at, ct.Ptr):
                    return self.ptr_add(self.code(a, P_POSTFIX), at, self.code(b, P_UNARY if op == '-' else P_COMMA + 1), op == '-')
                return self.ptr_add(self.code(b, P_POSTFIX), bt, self.code(a))
            raise TranslateError(f'pointer {op}')
        return self.arith_code(op, self.rv(a), self.rv(b), t, a, b)

    def arith_code(self, op, ea, eb, t, a=None, b=None):
        is_int = isinstance(t, (ct.Int, ct.Enum))
        bits = t.bits if is_int else 64
        signed = t.signed if is_int else True
        if not is_int:
            p = BIN[op]
            return (f'{wrap(ea, p)} {op} {wrap(eb, p + 1)}', p)
        if op == '/':
            if bits <= 32 and signed:
                return (f'{wrap(ea, P_MUL)} / {wrap(eb, P_MUL + 1)} | 0', P_BOR)
            if bits <= 32:
                return (f'{wrap(ea, P_MUL)} / {wrap(eb, P_MUL + 1)} >>> 0', P_SHIFT)
            return (f'Math.trunc({wrap(ea, P_MUL)} / {wrap(eb, P_MUL + 1)})', P_ATOM)
        if op == '%':
            r = (f'{wrap(ea, P_MUL)} % {wrap(eb, P_MUL + 1)}', P_MUL)
            return r
        if op == '*':
            lit = lambda e: re.match(r'^-?\d+$', e[0]) and abs(int(e[0])) < 65536
            if bits <= 32 and not lit(ea) and not lit(eb):
                r = (f'Math.imul({ea[0]}, {eb[0]})', P_ATOM)
            else:
                r = (f'{wrap(ea, P_MUL)} * {wrap(eb, P_MUL + 1)}', P_MUL)
            if bits == 32 and not signed:
                return (f'{wrap(r, P_SHIFT + 1)} >>> 0', P_SHIFT)
            return r
        if op in ('+', '-'):
            r = (f'{wrap(ea, P_ADD)} {op} {wrap(eb, P_ADD + 1)}', P_ADD)
            if bits == 32 and not signed:
                return (f'{wrap(r, P_SHIFT + 1)} >>> 0', P_SHIFT)
            return r
        if op == '<<':
            if bits == 64:
                return (f'{self.use_rt("$shl64")}({ea[0]}, {eb[0]})', P_ATOM)
            r = (f'{wrap(ea, P_SHIFT)} << {wrap(eb, P_SHIFT + 1)}', P_SHIFT)
            if not signed:
                return (f'{wrap(r, P_SHIFT)} >>> 0', P_SHIFT)
            return r
        if op == '>>':
            if bits == 64:
                return (f'{self.use_rt("$shr64")}({ea[0]}, {eb[0]})', P_ATOM)
            jop = '>>' if signed else '>>>'
            return (f'{wrap(ea, P_SHIFT)} {jop} {wrap(eb, P_SHIFT + 1)}', P_SHIFT)
        if op in ('&', '|', '^'):
            p = BIN[op]
            r = (f'{wrap(ea, p)} {op} {wrap(eb, p + 1)}', p)
            if not signed:
                return (f'{wrap(r, P_SHIFT + 1)} >>> 0', P_SHIFT)
            return r
        raise TranslateError(f'operator {op}')

    def assign(self, a, b, value):
        t = self.ty(a)
        if isinstance(t, ct.Rec):
            lv = self.lv(a)
            return (f'{wrap((lv.get(), P_ATOM), P_POSTFIX)}.$cp({self.code(b)})', P_ATOM)
        lv = self.lv(a)
        v = self.code(b, P_ASSIGN)
        if lv.kind == 'ptr' and not SIMPLE.match(lv.base):
            return (lv.set(v), P_ATOM)
        if self.side_effects(a) and self.side_effects(b):
            # C (clang) evaluates the right side first
            tmp = self.temp()
            return (f'({tmp} = {v}, {lv.set(tmp)})', P_ATOM)
        return (lv.set(v), P_ASSIGN)

    def side_effects(self, n):
        k = n.get('kind')
        if k in ('CallExpr',) or (k == 'UnaryOperator' and n['opcode'] in ('++', '--')) or k in ('BinaryOperator',) and n['opcode'] == '=' or k == 'CompoundAssignOperator':
            return True
        return any(self.side_effects(c) for c in n.get('inner', []) if isinstance(c, dict))

    def x_CompoundAssignOperator(self, n):
        op = n['opcode'][:-1]
        a, b = n['inner']
        t = self.ty(a)
        ct_t = self.prog.parse(n['computeResultType']['qualType']) if 'computeResultType' in n else t
        if isinstance(t, ct.Ptr):
            def newf(old):
                return self.ptr_add(wrap((old, P_ATOM), P_POSTFIX), t, self.code(b, P_UNARY if op == '-' else P_COMMA + 1), op == '-')[0]
        else:
            lt = self.prog.parse(n['computeLHSType']['qualType']) if 'computeLHSType' in n else t

            def newf(old):
                eo = self.conv_code(old, P_ATOM, t, lt)
                r = self.arith_code(op, eo, self.rv(b), ct_t)
                return wrap(self.conv_code(r[0], r[1], ct_t, t), P_ASSIGN)
        lv = self.lv(a)
        if lv.stable():
            # plain JavaScript op= where it does what C does
            if not isinstance(t, ct.Ptr) and lv.bits is None and op in ('+', '-') and isinstance(t, (ct.Int, ct.Enum, ct.Float)) and \
                    (isinstance(t, ct.Float) or (t.bits >= 32 and t.signed) or self.typed_index(a)) and \
                    isinstance(ct_t, (ct.Int, ct.Enum, ct.Float)) and not isinstance(self.ty(b), ct.Float) or \
                    (not isinstance(t, ct.Ptr) and lv.bits is None and op in ('|', '&', '^') and isinstance(t, (ct.Int, ct.Enum)) and t.signed and t.bits == 32):
                return (f'{lv.get()} {op}= {self.code(b, P_ASSIGN)}', P_ASSIGN)
            return (lv.set(newf(lv.get())), P_ASSIGN)
        return self.rmw(a, newf, False)

    def x_ConditionalOperator(self, n):
        c, a, b = n['inner']
        return (f'{wrap(self.cond_e(c), P_COND + 1)} ? {self.code(a, P_ASSIGN)} : {self.code(b, P_ASSIGN)}', P_COND)

    def x_BinaryConditionalOperator(self, n):
        raise TranslateError('?: without middle')

    def x_UnaryExprOrTypeTraitExpr(self, n):
        if n.get('name') != 'sizeof':
            raise TranslateError(n.get('name'))
        if 'argType' in n:
            t = self.prog.parse(n['argType'].get('desugaredQualType') or n['argType']['qualType'])
        else:
            t = self.ty(n['inner'][0])
        return (str(self.prog.sizeof(t)), P_ATOM)

    def x_ImplicitValueInitExpr(self, n):
        return (self.zero(self.ty(n)), P_ATOM)

    def x_StmtExpr(self, n):
        raise TranslateError('statement expression')

    def x_VAArgExpr(self, n):
        return (f'{self.code(n["inner"][0], P_POSTFIX)}.next()', P_ATOM)

    def x_PredefinedExpr(self, n):
        return (f'{self.use_rt("S")}({js_string(self.ctx.func.name.encode())})', P_ATOM)

    def x_CallExpr(self, n):
        callee = n['inner'][0]
        args = n['inner'][1:]
        sc = strip(callee)
        direct = sc.get('kind') == 'DeclRefExpr' and sc['referencedDecl']['kind'] == 'FunctionDecl'
        name = sc['referencedDecl']['name'] if direct else None
        if name == '__builtin_va_start':
            ap = strip(args[0])
            return (f'{self.lv(ap).get()} = new {self.use_rt("VaList")}($va)', P_ASSIGN)
        if name in ('__builtin_va_end',):
            return ('undefined', P_ATOM)
        if name == '__builtin_va_copy':
            return (f'{self.lv(strip(args[0])).get()} = {self.code(args[1], P_POSTFIX)}.copy()', P_ASSIGN)
        if name in ('alloc', 'malloc'):
            return (f'{self.use_rt("P")}(new Int8Array({self.code(args[0])}))', P_ATOM)
        if name == 'abs':
            return (f'Math.abs({self.code(args[0])})', P_ATOM)
        if name == '__errno_location':
            return (f'{self.use_rt("P")}({self.use_rt("R")}, "errno")', P_ATOM)
        if name == '__builtin_expect':
            return self.rv(args[0])
        ft = self.ty(callee)
        if isinstance(ft, ct.Ptr):
            ft = ft.to
        params = ft.params if isinstance(ft, ct.Func) else []
        codes = []
        for i, x in enumerate(args):
            xt = self.ty(x)
            c = self.code(x, P_ASSIGN)
            if isinstance(xt, ct.Rec):
                c = f'{wrap((c, P_ATOM), P_POSTFIX)}.$clone()'
            codes.append(c)
        if direct:
            fcode = self.func_ref(name)
            aw = self.is_async(name) or (self.prog.func(self.tu, name) is None and name in ASYNC_ROOTS)
        else:
            fcode = self.code(callee, P_POSTFIX)
            aw = n.get('_await', True)
        call = f'{fcode}({", ".join(codes)})'
        if aw:
            return (f'await {call}', P_UNARY)
        return (call, P_ATOM)

    def x_InitListExpr(self, n):
        return self.init_value(self.ty(n), n)

    # ---- initial values ----
    def init_value(self, t, init):
        """code for a fresh value of type t initialised by the C initializer init"""
        s = init
        while s.get('kind') in ('ParenExpr',):
            s = s['inner'][0]
        if isinstance(t, ct.Arr):
            ss = strip(s)
            if ss.get('kind') == 'StringLiteral':
                bs = c_string_bytes(ss['value'])
                n = t.n if t.n is not None else len(bs) + 1
                return (f'{self.use_rt("$cs")}({js_string(bs)}, {n})', P_ATOM)
            if s.get('kind') == 'ImplicitValueInitExpr':
                return (self.zero(t), P_ATOM)
            if s.get('kind') != 'InitListExpr':
                raise TranslateError(f'array initialised by {s.get("kind")}')
            items = s.get('inner', [])
            n = t.n if t.n is not None else len(items)
            filler = s.get('array_filler')
            ta = ct.typed_array(t.of)
            if ta:
                vals = [self.code(x) for x in items]
                while vals and vals[-1] == '0':
                    vals.pop()
                if not vals:
                    return (f'new {ta}({n})', P_ATOM)
                return (f'{self.use_rt("$ta")}({ta}, {n}, [{", ".join(vals)}])', P_ATOM)
            vals = [self.init_value(t.of, x)[0] for x in items]
            if len(vals) < n:
                if isinstance(t.of, ct.Rec):
                    vals += [f'new {self.struct_name(t.of)}()'] * (n - len(vals))
                elif isinstance(t.of, ct.Arr):
                    vals += [self.new_array(t.of)] * (n - len(vals))
                else:
                    vals += ['null'] * (n - len(vals))
            body = ',\n'.join(vals) if len(vals) > 3 else ', '.join(vals)
            if isinstance(t.of, ct.Rec):
                return (f'{self.use_rt("$sarrOf")}([{body}])', P_ATOM)
            if isinstance(t.of, ct.Arr) and ct.typed_array(t.of.of):
                return (f'{self.use_rt("$rows")}([{body}])', P_ATOM)
            return (f'[{body}]', P_ATOM)
        if isinstance(t, ct.Rec):
            if s.get('kind') == 'ImplicitValueInitExpr':
                return (self.zero(t), P_ATOM)
            if s.get('kind') != 'InitListExpr':
                return (f'{self.code(s, P_POSTFIX)}.$clone()', P_ATOM)
            cls = self.struct_name(t)
            fields = self.prog.fields(t)
            items = s.get('inner', [])
            if self.prog.record(t).get('tagUsed') == 'union':
                fld = s.get('field', {}).get('name')
                if not items:
                    return (f'new {cls}()', P_ATOM)
                ftype = [ft for fn, ft, _w in fields if fn == fld][0] if fld else fields[0][1]
                return (f'{cls}.$of_{fld or fields[0][0]}({self.init_value(ftype, items[0])[0]})', P_ATOM)
            vals = []
            for (fname, ftype, w), x in zip(fields, items):
                vals.append(self.init_value(ftype, x)[0])
            while vals and vals[-1] in ('0', 'null'):
                vals.pop()
            return (f'{cls}.$of({", ".join(vals)})', P_ATOM)
        if s.get('kind') == 'InitListExpr':
            items = s.get('inner', [])
            return self.rv(items[0]) if items else (self.zero(t), P_ATOM)
        if s.get('kind') == 'ImplicitValueInitExpr':
            return (self.zero(t), P_ATOM)
        return self.rv(s)

    # ---- statements ----
    def stmt(self, n, out, ind):
        k = n.get('kind')
        if not k:
            return
        m = getattr(self, 's_' + k, None)
        if m is None:
            # an expression statement
            out.append(ind + self.expr_stmt(n) + ';')
            return
        m(n, out, ind)

    def expr_stmt(self, n):
        k = n.get('kind')
        s = n
        while s.get('kind') in ('ParenExpr',) or (s.get('kind') == 'CStyleCastExpr' and s.get('castKind') == 'ToVoid'):
            s = s['inner'][0]
        k = s.get('kind')
        if k == 'UnaryOperator' and s['opcode'] in ('++', '--'):
            return self.incdec(s['inner'][0], s['opcode'], False, value=False)[0]
        if k == 'BinaryOperator' and s['opcode'] == ',':
            return f'{self.expr_stmt(s["inner"][0])}, {self.expr_stmt(s["inner"][1])}'
        if k == 'BinaryOperator' and s['opcode'] == '=':
            return self.assign(s['inner'][0], s['inner'][1], value=False)[0]
        if k == 'ConditionalOperator':
            c, a, b = s['inner']
            return f'{wrap(self.cond_e(c), P_COND + 1)} ? {self.code(a, P_ASSIGN)} : {self.code(b, P_ASSIGN)}'
        return self.code(s, P_COMMA)

    def s_CompoundStmt(self, n, out, ind, braces=True):
        items = n.get('inner', [])
        if braces:
            out.append(ind + '{')
            inner = ind + '  '
        else:
            inner = ind
        for c in items:
            self.stmt(c, out, inner)
        if braces:
            out.append(ind + '}')

    def zero_or_undefined(self, t):
        return self.zero(t)

    def box_zero(self, t):
        ta = ct.typed_array(t)
        if ta:
            return f'new {ta}(1)'
        return '[null]'

    # ---- goto: the function becomes a loop around a switch on a state; statements that contain a
    # label someone jumps to are lowered into states and jumps, the others stay as they are ----
    def has_label(self, n):
        key = id(n)
        memo = self.ctx.label_memo
        if key in memo:
            return memo[key]
        r = False
        if isinstance(n, dict):
            if n.get('kind') == 'LabelStmt' and n['declId'] in self.ctx.goto_targets:
                r = True
            else:
                r = any(self.has_label(c) for c in n.get('inner', []) if isinstance(c, dict))
        memo[key] = r
        return r

    def goto_code(self, state):
        return f'{{ $g = {state}; continue $L; }}'

    def new_state(self):
        self.ctx.nstates += 1
        return self.ctx.nstates

    def machine_body(self, body, out, ind):
        ctx = self.ctx
        ctx.nstates = 0
        for lid in sorted(ctx.goto_targets):
            ctx.label_state[lid] = self.new_state()
        out.append(f'{ind}let $g = 0;')
        decl_at = len(out)
        out.append(f'{ind}$L: for (;;) {{')
        out.append(f'{ind}  switch ($g) {{')
        out.append(f'{ind}  case 0:')
        ctx.breakables.append(('sm', '$L', None))
        ctx.hoist_out = []
        ctx.hoist_ind = ind
        self.low(body, out, ind + '    ')
        ctx.breakables.pop()
        out.append(f'{ind}  }}')
        out.append(f'{ind}  break;')
        out.append(f'{ind}}}')
        out[decl_at:decl_at] = ctx.hoist_out

    def mark(self, out, ind, state, what=''):
        out.append(f'{ind[:-2]}case {state}:{" // " + what if what else ""}')

    def hoist(self, d):
        """a declaration in a lowered block: declared before the machine"""
        ctx = self.ctx
        if d['id'] in ctx.hoisted:
            return
        name = jsname(d.get('name'))
        base, i = name, 2
        while name in ctx.names:
            name = f'{base}${i}'
            i += 1
        ctx.names.add(name)
        t = self.ty(d)
        boxed = d['id'] in ctx.addr_locals and not isinstance(t, (ct.Rec, ct.Arr))
        ctx.locals[d['id']] = (name, t, boxed)
        ctx.hoisted.add(d['id'])
        ctx.hoist_out.append(f'{ctx.hoist_ind}let {name} = {self.box_zero(t) if boxed else self.zero(t)};')

    def low(self, n, out, ind):
        """emits statement n inside the machine"""
        if not n:
            return
        if not self.has_label(n):
            k = n.get('kind')
            if k == 'DeclStmt':
                # declarations at the machine's level: before it (a jump may pass them)
                for d in n.get('inner', []):
                    if d.get('kind') == 'VarDecl' and d.get('storageClass') not in ('static', 'extern'):
                        self.hoist(d)
                self.s_DeclStmt(n, out, ind)
                return
            self.stmt(n, out, ind)
            return
        k = n['kind']
        ctx = self.ctx
        if k == 'CompoundStmt':
            for c in n.get('inner', []):
                self.low(c, out, ind)
        elif k == 'LabelStmt':
            if n['declId'] in ctx.goto_targets:
                self.mark(out, ind, ctx.label_state[n['declId']], n['name'])
            if n.get('inner'):
                self.low(n['inner'][0], out, ind)
        elif k == 'IfStmt':
            inner = n['inner']
            els = inner[2] if n.get('hasElse') else None
            end = self.new_state()
            if els is not None:
                other = self.new_state()
                out.append(f'{ind}if (!{wrap(self.cond_e(inner[0]), P_UNARY)}) {self.goto_code(other)}')
                self.low(inner[1], out, ind)
                out.append(f'{ind}{self.goto_code(end)}')
                self.mark(out, ind, other)
                self.low(els, out, ind)
            else:
                out.append(f'{ind}if (!{wrap(self.cond_e(inner[0]), P_UNARY)}) {self.goto_code(end)}')
                self.low(inner[1], out, ind)
            self.mark(out, ind, end)
        elif k == 'WhileStmt':
            top, end = self.new_state(), self.new_state()
            self.mark(out, ind, top)
            out.append(f'{ind}if (!{wrap(self.cond_e(n["inner"][0]), P_UNARY)}) {self.goto_code(end)}')
            ctx.breakables.append(('lowered', end, top))
            self.low(n['inner'][-1], out, ind)
            ctx.breakables.pop()
            out.append(f'{ind}{self.goto_code(top)}')
            self.mark(out, ind, end)
        elif k == 'DoStmt':
            top, cont, end = self.new_state(), self.new_state(), self.new_state()
            self.mark(out, ind, top)
            ctx.breakables.append(('lowered', end, cont))
            self.low(n['inner'][0], out, ind)
            ctx.breakables.pop()
            self.mark(out, ind, cont)
            out.append(f'{ind}if ({self.cond(n["inner"][1])}) {self.goto_code(top)}')
            self.mark(out, ind, end)
        elif k == 'ForStmt':
            init, _cv, c, inc, b = n['inner']
            if init:
                if init.get('kind') == 'DeclStmt':
                    for d in init['inner']:
                        self.hoist(d)
                    self.s_DeclStmt(init, out, ind)
                else:
                    out.append(f'{ind}{self.expr_stmt(init)};')
            top, cont, end = self.new_state(), self.new_state(), self.new_state()
            self.mark(out, ind, top)
            if c:
                out.append(f'{ind}if (!{wrap(self.cond_e(c), P_UNARY)}) {self.goto_code(end)}')
            ctx.breakables.append(('lowered', end, cont))
            self.low(b, out, ind)
            ctx.breakables.pop()
            self.mark(out, ind, cont)
            if inc:
                out.append(f'{ind}{self.expr_stmt(inc)};')
            out.append(f'{ind}{self.goto_code(top)}')
            self.mark(out, ind, end)
        elif k == 'SwitchStmt':
            c, b = n['inner'][0], n['inner'][-1]
            end = self.new_state()
            items = b.get('inner', []) if b.get('kind') == 'CompoundStmt' else [b]
            # every case label gets a state; a structured switch jumps there
            cases = []

            def collect(x):
                if not isinstance(x, dict):
                    return
                if x.get('kind') in ('CaseStmt', 'DefaultStmt'):
                    st = self.new_state()
                    ctx.case_state[id(x)] = st
                    cases.append((x, st))
                if x.get('kind') in ('SwitchStmt',):
                    return
                for y in x.get('inner', []):
                    collect(y)
            for x in items:
                collect(x)
            out.append(f'{ind}switch ({self.code(c)}) {{')
            has_default = False
            for x, st in cases:
                if x['kind'] == 'CaseStmt':
                    out.append(f'{ind}case {self.case_value(x["inner"][0])}: {self.goto_code(st)}')
                else:
                    has_default = True
                    out.append(f'{ind}default: {self.goto_code(st)}')
            if not has_default:
                out.append(f'{ind}default: {self.goto_code(end)}')
            out.append(f'{ind}}}')
            ctx.breakables.append(('lowered', end, None))
            for x in items:
                self.low_case(x, out, ind)
            ctx.breakables.pop()
            self.mark(out, ind, end)
        else:
            raise TranslateError(f'goto label inside {k}')

    def low_case(self, x, out, ind):
        while x.get('kind') in ('CaseStmt', 'DefaultStmt', 'LabelStmt'):
            if x['kind'] == 'LabelStmt':
                if x['declId'] in self.ctx.goto_targets:
                    self.mark(out, ind, self.ctx.label_state[x['declId']], x['name'])
            else:
                self.mark(out, ind, self.ctx.case_state[id(x)])
            x = x['inner'][-1] if x.get('inner') else {}
        if x:
            self.low(x, out, ind)

    def s_LabelStmt(self, n, out, ind):
        if n['declId'] in self.ctx.goto_targets:
            raise TranslateError(f'label {n["name"]} outside the goto machine')
        if n.get('inner'):
            self.stmt(n['inner'][0], out, ind)

    def s_GotoStmt(self, n, out, ind):
        tgt = n['targetLabelDeclId']
        out.append(f'{ind}{self.goto_code(self.ctx.label_state[tgt])}')

    def s_NullStmt(self, n, out, ind):
        out.append(ind + ';')

    def s_DeclStmt(self, n, out, ind):
        for d in n.get('inner', []):
            k = d.get('kind')
            if k == 'VarDecl':
                self.local_decl(d, out, ind)
            elif k in ('RecordDecl', 'TypedefDecl', 'EnumDecl'):
                continue
            else:
                raise TranslateError(f'declaration {k}')

    def local_decl(self, d, out, ind):
        sc = d.get('storageClass')
        if sc == 'extern':
            return
        if sc == 'static':
            # a module variable (initialised in $init)
            return
        hoisted = d['id'] in self.ctx.hoisted
        if not hoisted:
            self.declare_local(d)
        js, t, boxed = self.ctx.locals[d['id']]
        init = init_expr(d)
        kw = '' if hoisted else 'let '
        if boxed:
            if init is not None:
                if hoisted:
                    out.append(f'{ind}{js}[0] = {self.code(init, P_ASSIGN)};')
                else:
                    out.append(f'{ind}const {js} = {self.box_zero(t)};')
                    out.append(f'{ind}{js}[0] = {self.code(init, P_ASSIGN)};')
            elif not hoisted:
                out.append(f'{ind}const {js} = {self.box_zero(t)};')
            return
        if init is not None:
            if isinstance(t, (ct.Arr, ct.Rec)):
                v = self.init_value(t, init)[0]
            else:
                v = self.code(init, P_ASSIGN)
            out.append(f'{ind}{kw}{js} = {v};')
        elif not hoisted:
            out.append(f'{ind}let {js} = {self.zero(t)};')
        elif isinstance(t, (ct.Arr, ct.Rec)):
            out.append(f'{ind}{js} = {self.zero(t)};')

    def declare_local(self, d):
        ctx = self.ctx
        if d['id'] in ctx.locals:
            return
        name = jsname(d.get('name') or f'p{len(ctx.locals)}')
        base = name
        i = 2
        while name in ctx.names and ctx.shadow_ok is False:
            name = f'{base}${i}'
            i += 1
        ctx.names.add(name)
        t = self.ty(d)
        boxed = d['id'] in ctx.addr_locals and not isinstance(t, (ct.Rec, ct.Arr))
        ctx.locals[d['id']] = (name, t, boxed)

    def s_IfStmt(self, n, out, ind):
        inner = n['inner']
        c = inner[0]
        then = inner[1]
        els = inner[2] if n.get('hasElse') else None
        out.append(f'{ind}if ({self.cond(c)}) {{')
        self.body(then, out, ind + '  ')
        while els is not None and els.get('kind') == 'IfStmt':
            out.append(f'{ind}}} else if ({self.cond(els["inner"][0])}) {{')
            self.body(els['inner'][1], out, ind + '  ')
            els = els['inner'][2] if els.get('hasElse') else None
        if els is not None:
            out.append(f'{ind}}} else {{')
            self.body(els, out, ind + '  ')
        out.append(f'{ind}}}')

    def body(self, n, out, ind):
        if n.get('kind') == 'CompoundStmt':
            self.s_CompoundStmt(n, out, ind, braces=False)
        else:
            self.stmt(n, out, ind)

    def loop_label(self, n):
        lab = self.ctx.loop_labels.get(id(n))
        return f'{lab}: ' if lab else ''

    def s_WhileStmt(self, n, out, ind):
        c, b = n['inner'][0], n['inner'][-1]
        out.append(f'{ind}{self.loop_label(n)}while ({self.cond(c)}) {{')
        self.ctx.breakables.append(('loop', self.ctx.loop_labels.get(id(n)), n))
        self.body(b, out, ind + '  ')
        self.ctx.breakables.pop()
        out.append(f'{ind}}}')

    def s_DoStmt(self, n, out, ind):
        b, c = n['inner']
        out.append(f'{ind}{self.loop_label(n)}do {{')
        self.ctx.breakables.append(('loop', self.ctx.loop_labels.get(id(n)), n))
        self.body(b, out, ind + '  ')
        self.ctx.breakables.pop()
        out.append(f'{ind}}} while ({self.cond(c)});')

    def s_ForStmt(self, n, out, ind):
        init, _cv, c, inc, b = n['inner']
        icode = ''
        if init:
            if init.get('kind') == 'DeclStmt':
                parts = []
                for d in init['inner']:
                    self.declare_local(d)
                    js, t, boxed = self.ctx.locals[d['id']]
                    if boxed:
                        raise TranslateError('boxed for-variable')
                    v = self.code(init_expr(d), P_ASSIGN) if d.get('init') else self.zero(t)
                    parts.append(f'{js} = {v}')
                icode = 'let ' + ', '.join(parts)
            else:
                icode = self.expr_stmt(init)
        ccode = self.cond(c) if c else ''
        inccode = self.expr_stmt(inc) if inc else ''
        out.append(f'{ind}{self.loop_label(n)}for ({icode}; {ccode}; {inccode}) {{')
        self.ctx.breakables.append(('loop', self.ctx.loop_labels.get(id(n)), n))
        self.body(b, out, ind + '  ')
        self.ctx.breakables.pop()
        out.append(f'{ind}}}')

    def s_SwitchStmt(self, n, out, ind):
        c, b = n['inner'][0], n['inner'][-1]
        # declarations directly in the switch's body: before it (a case may jump past them)
        items = b.get('inner', []) if b.get('kind') == 'CompoundStmt' else [b]
        for x in items:
            for d in self.direct_decls(x):
                self.declare_local(d)
                js, t, boxed = self.ctx.locals[d['id']]
                self.ctx.hoisted.add(d['id'])
                out.append(f'{ind}let {js} = {self.box_zero(t) if boxed else self.zero(t)};')
        out.append(f'{ind}{self.loop_label(n)}switch ({self.code(c)}) {{')
        self.ctx.breakables.append(('switch', self.ctx.loop_labels.get(id(n)), n))
        for x in items:
            self.case_item(x, out, ind)
        self.ctx.breakables.pop()
        out.append(f'{ind}}}')

    def direct_decls(self, x):
        out = []
        while x.get('kind') in ('CaseStmt', 'DefaultStmt', 'LabelStmt'):
            x = x['inner'][-1] if x.get('inner') else {}
        if x.get('kind') == 'DeclStmt':
            for d in x.get('inner', []):
                if d.get('kind') == 'VarDecl' and d.get('storageClass') not in ('static', 'extern'):
                    out.append(d)
        return out

    def case_item(self, x, out, ind):
        while x.get('kind') in ('CaseStmt', 'DefaultStmt', 'LabelStmt'):
            if x['kind'] == 'LabelStmt':
                pass
            elif x['kind'] == 'CaseStmt':
                val = self.case_value(x['inner'][0])
                out.append(f'{ind}case {val}:')
            else:
                out.append(f'{ind}default:')
            x = x['inner'][-1] if x.get('inner') else {}
        if x:
            self.stmt(x, out, ind + '  ')

    def case_value(self, v):
        inner = v['inner'][0] if v.get('kind') == 'ConstantExpr' and v.get('inner') else v
        while inner.get('kind') == 'ImplicitCastExpr' and inner.get('inner'):
            inner = inner['inner'][0]
        c = self.rv(inner)[0]
        if IDENT.match(c):
            return c
        return v.get('value') if v.get('kind') == 'ConstantExpr' and 'value' in v else self.code(v)

    def s_CaseStmt(self, n, out, ind):
        raise TranslateError('case label outside a switch body')

    s_DefaultStmt = s_CaseStmt

    def s_BreakStmt(self, n, out, ind):
        out.append(ind + self.jump('break') + ';')

    def s_ContinueStmt(self, n, out, ind):
        out.append(ind + self.jump('continue') + ';')

    def jump(self, kw):
        """break/continue: a jump to a state when its loop or switch was lowered"""
        for entry in reversed(self.ctx.breakables):
            kind = entry[0]
            if kind == 'sm':
                continue
            if kind == 'lowered':
                _k, brk, cont = entry
                if kw == 'break':
                    return self.goto_code(brk)
                if cont is None:
                    continue
                return self.goto_code(cont)
            if kw == 'continue' and kind == 'switch':
                continue
            return kw
        raise TranslateError(f'{kw} outside a loop')

    def s_ReturnStmt(self, n, out, ind):
        if n.get('inner'):
            e = n['inner'][0]
            t = self.ty(e)
            c = self.code(e, P_COMMA + 1)
            if isinstance(t, ct.Rec):
                c = f'{wrap((c, P_ATOM), P_POSTFIX)}.$clone()'
            out.append(f'{ind}return {c};')
        else:
            out.append(f'{ind}return;')

    # ---- functions ----
    def prescan(self, fnode):
        """address-taken locals, goto targets, loops that need labels"""
        ctx = self.ctx
        ctx.addr_locals = set()
        ctx.goto_targets = set()
        ctx.loop_labels = {}
        ctx.shadow_ok = True

        def visit(n, parents):
            if not isinstance(n, dict):
                return
            k = n.get('kind')
            if k == 'UnaryOperator' and n.get('opcode') == '&':
                s = n['inner'][0]
                while s.get('kind') == 'ParenExpr':
                    s = s['inner'][0]
                if s.get('kind') == 'DeclRefExpr' and s['referencedDecl']['kind'] in ('VarDecl', 'ParmVarDecl'):
                    ctx.addr_locals.add(s['referencedDecl']['id'])
            if k == 'GotoStmt':
                ctx.goto_targets.add(n['targetLabelDeclId'])
            for c in n.get('inner', []):
                visit(c, parents + [n])
        visit(fnode, [])
        ctx.label_memo = {}
        ctx.label_state = {}
        ctx.case_state = {}
        ctx.nstates = 0

    def function(self, f):
        n = f.node
        self.ctx = FnCtx(f)
        ctx = self.ctx
        self.prescan(n)
        ft = self.ty(n)
        params = [c for c in n.get('inner', []) if c.get('kind') == 'ParmVarDecl']
        body = [c for c in n.get('inner', []) if c.get('kind') == 'CompoundStmt'][0]
        pcodes = []
        prologue = []
        for i, p in enumerate(params):
            pname = jsname(p.get('name') or f'_p{i}')
            t = self.ty(p)
            if isinstance(t, ct.Arr):
                t = ct.Ptr(t.of)
            if p['id'] in ctx.addr_locals and not isinstance(t, ct.Rec):
                ctx.locals[p['id']] = (pname, t, True)
                pcodes.append(f'{pname}$: {self.ts_type(t)}')
                prologue.append(f'  const {pname} = {self.box_zero(t)};')
                prologue.append(f'  {pname}[0] = {pname}$;')
            else:
                ctx.locals[p['id']] = (pname, t, False)
                pcodes.append(f'{pname}: {self.ts_type(t)}')
            ctx.names.add(pname)
        if isinstance(ft, ct.Func) and ft.variadic:
            pcodes.append('...$va: any[]')
        out = []
        self.static_locals(f, body)
        bout = []
        if ctx.goto_targets:
            self.machine_body(body, bout, '  ')
        else:
            self.s_CompoundStmt(body, bout, '  ', braces=False)
        ret = self.ts_type(ft.ret) if isinstance(ft, ct.Func) else 'any'
        is_async = f.is_async
        exp = '' if f.static else 'export '
        head = f'{exp}{"async " if is_async else ""}function {jsname(f.name)}({", ".join(pcodes)}): {"Promise<" + ret + ">" if is_async else ret} {{'
        out.append(head)
        out.extend(prologue)
        decl = []
        if ctx.max_temps:
            decl.append(', '.join(f'$t{i + 1}: any' for i in range(ctx.max_temps)))
        if decl:
            out.append(f'  let {", ".join(decl)};')
        out.extend(bout)
        out.append('}')
        self.ctx = None
        return out

    def static_locals(self, f, body):
        """static variables of a function: module variables named function$variable"""
        found = []

        def visit(n):
            if not isinstance(n, dict):
                return
            if n.get('kind') == 'VarDecl' and n.get('storageClass') == 'static':
                found.append(n)
            for c in n.get('inner', []):
                visit(c)
        visit(body)
        for d in found:
            js = f'{f.name}${d["name"]}'
            t = self.ty(d)
            boxed = d['id'] in self.ctx.addr_locals and not isinstance(t, (ct.Rec, ct.Arr))
            self.ctx.locals[d['id']] = (js, t, boxed)
            self.static_local_map[d['id']] = (js, t, boxed)
            init = init_expr(d)
            self.module_vars.append((js, t, init, boxed))

    # ---- the module ----
    def module(self):
        prog = self.prog
        tu = self.tu
        o = prog.tus[tu]
        funcs = []
        file_vars = []
        for d in o['decls']:
            if d['kind'] == 'FunctionDecl':
                f = prog.func(tu, d['name'])
                if f is not None and f.node is d and f.name not in prog.excluded and (tu, f.name) not in prog.excluded:
                    funcs.append(f)
            elif d['kind'] == 'VarDecl':
                if d.get('storageClass') == 'extern' and not d.get('init'):
                    continue
                v = prog.var(tu, d['name'])
                if v is not None and v.node is d:
                    file_vars.append(v)
        # file statics whose address is taken are boxed
        def find_addr(n):
            if isinstance(n, dict):
                if n.get('kind') == 'UnaryOperator' and n.get('opcode') == '&':
                    x = n['inner'][0]
                    while x.get('kind') == 'ParenExpr':
                        x = x['inner'][0]
                    if x.get('kind') == 'DeclRefExpr' and x['referencedDecl']['kind'] == 'VarDecl':
                        v = prog.static_vars.get((tu, x['referencedDecl']['name']))
                        if v is not None and v.node['id'] == x['referencedDecl']['id']:
                            t = prog.type(v.node)
                            if not isinstance(t, (ct.Rec, ct.Arr)):
                                v.boxed = True
                for c in n.get('inner', []):
                    find_addr(c)
        for d in o['decls']:
            find_addr(d)
        for d in o['decls']:
            mark_macro_tops(d)
        body = []
        errors = []
        for f in funcs:
            try:
                body.extend(self.function(f))
                body.append('')
            except (TranslateError, KeyError, ValueError, AttributeError, TypeError, IndexError, AssertionError) as e:
                if os.environ.get('C2TS_TRACE'):
                    raise
                errors.append((f.name, str(e)))
                body.append(f'// TRANSLATION FAILED: {f.name}: {e}')
                body.append(f'export function {jsname(f.name)}(...a: any[]): any {{ throw new Error("untranslated: {f.name}"); }}')
                body.append('')
                self.ctx = None
        # initial values
        init = []
        decls = []
        for v in file_vars:
            t = prog.type(v.node)
            ini = init_expr(v.node)
            try:
                val = self.init_value(t, ini)[0] if ini is not None else self.zero(t)
            except TranslateError as e:
                errors.append((v.name, str(e)))
                val = 'undefined /* FAILED */'
            if v.static and getattr(v, 'boxed', False):
                decls.append(f'let {jsname(v.name)}: any;')
                init.append(f'  {jsname(v.name)} = {self.box_zero(t)};')
                init.append(f'  {jsname(v.name)}[0] = {val};')
            elif v.static:
                decls.append(f'let {jsname(v.name)}: {self.ts_type(t)};')
                init.append(f'  {jsname(v.name)} = {val};')
            else:
                self.use_rt('G')
                init.append(f'  G.{jsname(v.name)} = {val};')
        self.ctx = FnCtx(None)
        self.ctx.addr_locals = set()
        for js, t, ini, boxed in self.module_vars:
            try:
                val = self.init_value(t, ini)[0] if ini is not None else self.zero(t)
            except TranslateError as e:
                errors.append((js, str(e)))
                val = 'undefined /* FAILED */'
            decls.append(f'let {js}: {self.ts_type(t) if not boxed else "any"};')
            if boxed:
                init.append(f'  {js} = {self.box_zero(t)};')
                init.append(f'  {js}[0] = {val};')
            else:
                init.append(f'  {js} = {val};')
        self.ctx = None
        head = [f'// @ts-nocheck', f'// NetHack 3.6.7 {o["file"]}, translated to TypeScript by re/nethack/tools/c2ts (do not edit).']
        imps = []
        for m in sorted(self.imports):
            imps.append(f'import {{ {", ".join(sorted(self.imports[m]))} }} from \'./{m}.ts\';')
        if self.structs:
            imps.append(f'import {{ {", ".join(sorted(self.structs))} }} from \'./structs.ts\';')
        if self.runtime:
            imps.append(f'import {{ {", ".join(sorted(self.runtime))} }} from \'./rt/index.ts\';')
        tail = ['export function $init(): void {'] + init + ['}']
        text = '\n'.join(head + imps + ['//@@CONSTS@@', ''] + decls + [''] + body + tail) + '\n'
        return text, errors
