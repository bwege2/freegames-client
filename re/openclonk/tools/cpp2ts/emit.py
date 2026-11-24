"""Statements and expressions: clang's tree of a function body -> TypeScript (CONVENTIONS.md)."""
import json
import re
import struct

from . import types as ty
from .config import FIELD_ARRAYS, NARROW64, PACK, RAII, RAII_ITERATORS, LIB_ENUM_VALUES, C_STRUCT_FIELDS, C_STRUCT_PREFIXES, SUSPEND

# JavaScript precedences (higher binds tighter)
P_ATOM, P_MEMBER, P_CALL, P_UNARY, P_EXP, P_MUL, P_ADD, P_SHIFT, P_REL, P_EQ = 20, 19, 18, 15, 14, 13, 12, 11, 10, 9
P_BAND, P_BXOR, P_BOR, P_LAND, P_LOR, P_COND, P_ASSIGN, P_COMMA = 8, 7, 6, 5, 4, 3, 2, 1

BINPREC = {'*': P_MUL, '/': P_MUL, '%': P_MUL, '+': P_ADD, '-': P_ADD, '<<': P_SHIFT, '>>': P_SHIFT, '>>>': P_SHIFT,
           '<': P_REL, '>': P_REL, '<=': P_REL, '>=': P_REL, '===': P_EQ, '!==': P_EQ, '&': P_BAND, '^': P_BXOR,
           '|': P_BOR, '&&': P_LAND, '||': P_LOR}

CASTS_SAME = ('LValueToRValue', 'NoOp', 'FunctionToPointerDecay', 'UncheckedDerivedToBase', 'DerivedToBase',
              'BaseToDerived', 'ConstructorConversion', 'UserDefinedConversion', 'ToVoid', 'Dynamic',
              'LValueBitCast', 'AtomicToNonAtomic', 'NonAtomicToAtomic')
CASTS_NUM = ('IntegralCast', 'IntegralToBoolean', 'IntegralToFloating', 'FloatingToIntegral', 'FloatingCast',
             'FloatingToBoolean', 'PointerToBoolean', 'BooleanToSignedIntegral', 'MemberPointerToBoolean')


BOX_TYPED = {(8, True): 'Int8Array', (8, False): 'Uint8Array', (16, True): 'Int16Array', (16, False): 'Uint16Array',
             (32, True): 'Int32Array', (32, False): 'Uint32Array', (64, True): 'BigInt64Array', (64, False): 'BigUint64Array'}


class Unsupported(Exception):
    pass


def lit_int(v, big):
    s = str(v) if abs(v) < 1000000 else ('-' if v < 0 else '') + hex(abs(v))
    return s + ('n' if big else '')


def is_f32(v):
    try:
        return struct.unpack('f', struct.pack('f', v))[0] == v
    except OverflowError:
        return False


class E:
    """an emitted expression: text and precedence; simple: an assignable path (identifiers, members);
    elem: (array, index) when it is an element of a library container (for its address)"""
    __slots__ = ('s', 'p', 'elem')

    def __init__(self, s, p=P_ATOM, elem=None):
        self.s, self.p, self.elem = s, p, elem

    def at(self, p):
        return self.s if self.p >= p else '(' + self.s + ')'

    def __str__(self):
        return self.s

    @property
    def simple(self):
        return re.fullmatch(r'[\w$]+(\.[\w$]+|\[[\w$.]+\])*', self.s) is not None


def kids(n):
    if 'array_filler' in n and n.get('kind') == 'InitListExpr':
        # clang writes an initializer list with a filler as [filler, elements...]
        return [c for c in n['array_filler'][1:] if c]
    # documentation comments (FullComment, with -fparse-all-comments) are no code
    return [c for c in n.get('inner', []) if c and not c.get('kind', '').endswith('Comment')]


def strip_casts(n):
    """through parentheses and every cast"""
    while n.get('kind') in ('ParenExpr', 'ImplicitCastExpr', 'CStyleCastExpr', 'CXXStaticCastExpr', 'CXXReinterpretCastExpr',
                            'CXXConstCastExpr', 'CXXFunctionalCastExpr') and kids(n):
        n = kids(n)[0]
    return n


def member_fn_type(n):
    """whether n's type is a pointer to a member function (bool (C::*)(int)), not to a data member (int C::*, which
    clang may print as int (C::*), or char (C::*)[16])"""
    t = n.get('type', {})
    q = (t.get('desugaredQualType') or t.get('qualType') or '') if isinstance(t, dict) else str(t)
    return re.search(r'::\*\)\s*\(', q) is not None or re.search(r'::\*\)$', q) is None and '(' in q and '::*' not in q


def tmpl_name(t):
    """the template's name of a library type (function for std::function<...>), or None"""
    from .stdmap import tmpl
    try:
        return tmpl(t)[0]
    except Exception:
        return None


def is_smart(t):
    """a smart pointer type (std::unique_ptr, std::shared_ptr, ...), which is its object or null"""
    t = t.strip()
    if t.kind != 'rec' or not t.name:
        return False
    tree = ty.tparse(t.name)
    return (tree if isinstance(tree, str) else tree[0]) in ('unique_ptr', 'shared_ptr', 'weak_ptr', '__shared_ptr_access', '__shared_ptr')


def strip(n):
    """through parentheses and casts that change nothing"""
    while n.get('kind') in ('ParenExpr', 'ImplicitCastExpr', 'ExprWithCleanups', 'MaterializeTemporaryExpr',
                            'CXXBindTemporaryExpr', 'ConstantExpr') and kids(n) and \
            (n.get('kind') != 'ImplicitCastExpr' or n.get('castKind') in ('NoOp', 'LValueToRValue')):
        n = kids(n)[0]
    return n


def c_string(lit):
    """a StringLiteral's value (C-escaped, quoted) as bytes"""
    s = lit
    if s.startswith('u8"'):
        s = s[2:]
    if s.startswith('L"') or s.startswith('u"') or s.startswith('U"'):
        raise Unsupported('wide string literal')
    s = s[1:-1]
    out = bytearray()
    i = 0
    while i < len(s):
        c = s[i]
        if c != '\\':
            out += c.encode('utf-8')
            i += 1
            continue
        i += 1
        c = s[i]
        if c in 'ntrabfv\\\'"?':
            out.append({'n': 10, 't': 9, 'r': 13, 'a': 7, 'b': 8, 'f': 12, 'v': 11, '\\': 92, "'": 39, '"': 34, '?': 63}[c])
            i += 1
        elif c == 'x':
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
            raise Unsupported(f'escape \\{c}')
    return bytes(out)


class Local:
    __slots__ = ('name', 'mode')

    def __init__(self, name, mode):
        self.name, self.mode = name, mode   # mode: val, box (name[0]), ref (a Ptr: name.a[name.o])


class FuncEmitter:
    """emits one function body; tr is the translator (names, modules), mod the module written"""

    def __init__(self, tr, mod, tu, fe=None, cls=None):
        self.tr, self.mod, self.prog, self.tu, self.fe, self.cls = tr, mod, tr.prog, tu, fe, cls
        self.locals = {}
        self.param_names = set()
        # the names declared in each enclosing block (the parameters' first): a local that shadows one of an
        # enclosing block gets a name of its own, as JavaScript's let is in its temporal dead zone from the start of
        # its block (C4Landscape::DigMaterial2Objects: pars used, then declared again in the same block)
        self.scope_names = [set()]
        self.in_ctor = False
        self.in_ctor_or_dtor = False
        self.consts = []
        self.boxed = set()
        self.byte_boxed = set()       # boxed locals whose bytes are copied (memcpy): typed arrays
        self.ntemp = 0
        self.temps = []
        self.labels = set()
        self.goto_labels = {}         # label decl id -> the JavaScript label that forward gotos break out of
        self.lambda_depth = 0         # inside a lambda (an arrow function, which cannot wait: config.SUSPEND)

    # ---- helpers

    def T(self, n):
        return ty.parse(n['type'])

    def rt(self, name, module='rt/int'):
        return self.mod.need(name, module)

    def ptr(self, name):
        return self.mod.need(name, 'rt/ptr')

    def temp(self):
        self.ntemp += 1
        t = f'$t{self.ntemp}'
        self.temps.append(t)
        return t

    def local_name(self, d, mode='val'):
        from .program import JS_RESERVED
        nm = d.get('name') or '_' + str(len(self.locals))
        if nm in JS_RESERVED or nm == '$':
            nm += '_'
        # a name used twice in a function (shadowing in C++ blocks) stays usable: JS has block scope too;
        # parameters of an expanded pack (args, args, ...) are numbered
        if d.get('kind') == 'ParmVarDecl':
            base, k = nm, 1
            while nm in self.param_names:
                k += 1
                nm = f'{base}${k}'
            self.param_names.add(nm)
            self.scope_names[0].add(nm)
        elif d['id'] in self.locals:
            nm = self.locals[d['id']].name
        elif any(nm in names for names in self.scope_names[:-1]):
            base, k = nm, 1
            while any(nm in names for names in self.scope_names):
                k += 1
                nm = f'{base}${k}'
        if d.get('kind') != 'ParmVarDecl':
            self.scope_names[-1].add(nm)
        self.locals[d['id']] = Local(nm, mode)
        return nm

    param_names = None

    def eref(self, e):
        return self.tr.eref(self.mod, e)

    def class_of(self, t):
        c = self.prog.class_of_type(t)
        if c is None:
            raise Unsupported(f'no class for {t.strip().text if t.kind != "rec" else t.name}')
        return c

    def cref(self, c):
        return self.tr.eref(self.mod, c)

    def analyze(self, body):
        """locals whose address is taken (or that a non-const reference binds to) become boxes"""
        stack = [body]
        while stack:
            n = stack.pop()
            k = n.get('kind')
            if k == 'UnaryOperator' and n.get('opcode') == '&':
                self.mark_addr(kids(n)[0])
            elif k == 'CallExpr' and kids(n) and strip_casts(kids(n)[0]).get('kind') == 'DeclRefExpr' and \
                    strip_casts(kids(n)[0])['referencedDecl'].get('name') in ('memcpy', 'memmove', 'memcmp'):
                # memcpy(&value, bytes, sizeof value): the value's box is a typed array, so that the bytes are
                # its representation (Ogre::DataStream::Peek<T>)
                for a in kids(n)[1:3]:
                    a = strip_casts(a)
                    if a.get('kind') == 'UnaryOperator' and a.get('opcode') == '&':
                        x = strip(kids(a)[0])
                        if x.get('kind') == 'DeclRefExpr':
                            self.byte_boxed.add(x['referencedDecl']['id'])
            elif k in ('CallExpr', 'CXXMemberCallExpr', 'CXXOperatorCallExpr', 'CXXConstructExpr', 'CXXTemporaryObjectExpr'):
                for a, pt in self.args_params(n):
                    if pt is not None and self.by_ptr(pt):
                        self.mark_addr(a)
                if k == 'CXXOperatorCallExpr' and len(kids(n)) == 3 and \
                        re.search(r'basic_i(string)?stream', ty.qual_of(kids(n)[1].get('type', ''))):
                    self.mark_addr(kids(n)[2])      # stream >> value: the value is written through a reference
            elif k == 'VarDecl' and kids(n):
                t = ty.parse(n['type'])
                if t.kind == 'ref' and self.by_ptr(t):
                    self.mark_addr(kids(n)[-1])
            stack.extend(kids(n))

    def mark_addr(self, a):
        a = strip(a)
        if a.get('kind') == 'ConditionalOperator':
            # a reference bound to c ? x : y (C4MCMap::RenderTo: pToBufBkg ? *pToBufBkg : dummyPix): both lvalues
            for b in kids(a)[1:]:
                self.mark_addr(b)
            return
        if a.get('kind') == 'DeclRefExpr' and a['referencedDecl'].get('kind') in ('VarDecl', 'ParmVarDecl'):
            d = self.tu.nodes.get(a['referencedDecl']['id'])
            if d is not None and not d.get('mangledName') or (d is not None and d.get('storageClass') not in ('static', 'extern') and self.tu.up(d) and self.tu.up(d).get('kind') not in ('TranslationUnitDecl', 'NamespaceDecl')):
                t = ty.parse(d['type'])
                if t.kind not in ('rec', 'ref', 'arr') or is_smart(t):
                    # a smart pointer is its object (or null); its address is a box like a plain pointer's
                    self.boxed.add(d['id'])

    def smart_ref(self, t):
        """a non-const lvalue reference to a smart pointer (std::unique_ptr<T> &strategy = cond ? a : b; for (auto &conv :
        vector_of_unique_ptrs) conv.reset()): a local of this type is a Ptr to the slot, as the smart pointer is its
        object or null"""
        if t.kind != 'ref' or not is_smart(t.to):
            return False
        txt = ty.qual_of(t.text) if isinstance(t.text, str) else ''
        return not txt.endswith('&&') and not re.match(r'^\s*const\b', t.text or '')

    def by_ptr(self, t):
        """a reference passed as a Ptr: a non-const lvalue reference to something that is not a class"""
        if t.kind != 'ref':
            return False
        txt = ty.qual_of(t.text) if isinstance(t.text, str) else ''
        if txt.endswith('&&'):
            return False
        inner = t.to
        if inner.kind in ('rec', 'func', 'arr'):
            return False        # objects and arrays are passed as themselves
        return not re.match(r'^\s*const\b', t.text) and not re.search(r'\*\s*const\s*&$', t.text)

    def args_params(self, n):
        """(argument node, parameter type or None) of a call"""
        k = n['kind']
        ks = kids(n)
        callee = None
        args = ks
        if k in ('CallExpr', 'CXXMemberCallExpr', 'CXXOperatorCallExpr'):
            args = ks[1:]
            try:
                callee, obj, d = self.callee_entity(ks[0])
            except Unsupported:
                callee, d = None, {}
            if k == 'CallExpr' and ((callee is None and 'callee' in d) or
                                    (callee is not None and callee.kind in ('var', 'field', 'svar'))):
                ps = fn_params((d.get('callee') or strip_casts(ks[0])).get('type')) or []
                return [(a, ps[i] if i < len(ps) else None) for i, a in enumerate(args)]
            if callee is None and k == 'CXXOperatorCallExpr' and d.get('name') == 'operator()' and \
                    '(lambda' in (self.T(ks[1]).strip().name or '') and self.T(ks[1]).strip().kind == 'rec':
                op = self.tu.nodes.get(d.get('id')) or {}
                ps = [ty.parse(p['type']) for p in kids(op) if p.get('kind') == 'ParmVarDecl']
                return [(a, ps[i] if i < len(ps) else None) for i, a in enumerate(ks[2:])]
            if k == 'CXXOperatorCallExpr' and callee is not None and callee.kind == 'method' and \
                    callee.node.get('storageClass') != 'static':
                args = ks[2:]
        elif k in ('CXXConstructExpr', 'CXXTemporaryObjectExpr'):
            try:
                c = self.prog.class_of_type(self.T(n))
                callee = self.find_ctor(c, n['ctorType']) if c else None
            except Exception:
                callee = None
        ps = []
        if callee is not None:
            ps = [ty.parse(p['type']) for p in kids(callee.node) if p.get('kind') == 'ParmVarDecl']
        return [(a, ps[i] if i < len(ps) else None) for i, a in enumerate(args)]

    # ---- conversions between scalar types

    def conv(self, e, src, dst):
        src, dst = src.strip(), dst.strip()
        if dst.kind == 'bool':
            if src.kind == 'bool':
                return e
            if src.kind == 'int':
                return E(f'{e.at(P_EQ + 1)} !== {"0n" if src.big else "0"}', P_EQ)
            if src.kind == 'float':
                return E(f'{e.at(P_EQ + 1)} !== 0', P_EQ)
            if src.kind in ('ptr', 'rec', 'func', 'null'):
                return E(f'{e.at(P_EQ + 1)} != null', P_EQ)
            raise Unsupported(f'to bool from {src.text}')
        if dst.kind == 'int':
            if dst.bits > 64:
                raise Unsupported('128-bit integer')
            if src.kind == 'bool':
                return E(f'{e.at(P_COND + 1)} ? {"1n : 0n" if dst.big else "1 : 0"}', P_COND)
            if src.kind == 'float':
                if dst.big:
                    return E(f'{self.rt("ftoi64" if dst.signed else "ftou64")}({e})', P_CALL)
                if dst.n64:
                    return E(f'Math.trunc({e})', P_CALL)
                if dst.bits == 32:
                    return E(f'{self.rt("ftoi32" if dst.signed else "ftou32")}({e})', P_CALL)
                return self.narrow(E(f'{self.rt("ftoi32")}({e})', P_CALL), dst)
            if src.kind == 'ptr' or src.kind == 'null':
                raise Unsupported('pointer to integer')
            if src.kind == 'rec' and 'SourceType' in ((getattr(src, 'text', '') or '') + (getattr(src, 'name', '') or '')):
                return e
            if src.kind != 'int':
                raise Unsupported(f'to int from {src.text}')
            if src.bits > 64:
                raise Unsupported('128-bit integer')
            if src.big and dst.big:
                if src.signed == dst.signed:
                    return e
                return E(f'{self.rt("i64" if dst.signed else "u64")}({e})', P_CALL)
            if src.big and dst.n64:
                return E(f'{self.rt("n64" if dst.signed else "nu64")}({e})', P_CALL)
            if src.n64 and dst.big:
                if not dst.signed:
                    return E(f'{self.rt("u64")}(BigInt({e}))', P_CALL)
                return E(f'BigInt({e})', P_CALL)
            if dst.n64:
                # into a 64-bit number: the value, made unsigned or signed as C++ does
                if re.fullmatch(r'-?\d+', e.s):
                    return E(str(fit(int(e.s), dst)), P_ATOM)
                if src.signed and not dst.signed:
                    return E(f'{self.rt("$u64n")}({e})', P_CALL)
                if src.n64 and not src.signed and dst.signed:
                    return E(f'{self.rt("$i64n")}({e})', P_CALL)
                return e
            if src.big:
                if dst.bits == 32:
                    return E(f'{self.rt("n32" if dst.signed else "nu32")}({e})', P_CALL)
                return self.narrow(E(f'{self.rt("n32")}({e})', P_CALL), dst)
            if dst.big:
                if re.fullmatch(r'-?\d+', e.s):
                    v = int(e.s)
                    return E(lit_int(fit(v, dst), True), P_ATOM)
                if not dst.signed and src.signed:
                    return E(f'{self.rt("u64")}(BigInt({e}))', P_CALL)
                return E(f'BigInt({e})', P_CALL)
            if dst.bits > src.bits and (dst.signed or not src.signed):
                return e
            if dst.bits == src.bits and dst.signed == src.signed:
                return e
            return self.narrow(e, dst)
        if dst.kind == 'int' and src.kind == 'enum':
            return e
        if dst.kind == 'int' and src.kind == 'rec' and 'SourceType' in (src.name or ''):
            return e
        if dst.kind == 'bool' and (src.kind == 'rec' or 'std::function' in (ty.qual_of(src.text) if isinstance(src.text, str) else '')):
            return E(f'!!{e.at(P_CALL)}', P_UNARY)
        if dst.kind == 'float':
            if src.kind == 'float':
                if dst.bits == 32 and src.bits == 64:
                    return E(f'Math.fround({e})', P_CALL)
                return e
            if src.kind == 'int':
                x = f'Number({e})' if src.big else e.s
                return E(f'Math.fround({x})', P_CALL) if dst.bits == 32 else (E(x, P_CALL) if src.big else e)
            if src.kind == 'bool':
                return E(f'{e.at(P_COND + 1)} ? 1 : 0', P_COND)
        raise Unsupported(f'conversion {src.text} -> {dst.text}')

    def narrow(self, e, dst):
        b, s = dst.bits, dst.signed
        if re.fullmatch(r'-?\d+', e.s):
            return E(str(fit(int(e.s), dst)), P_ATOM)
        if dst.n64:
            return e
        if b == 32:
            return E(f'{e.at(P_BOR + 1)} | 0', P_BOR) if s else E(f'{e.at(P_SHIFT + 1)} >>> 0', P_SHIFT)
        if s:
            k = 32 - b
            return E(f'{e.at(P_SHIFT + 1)} << {k} >> {k}', P_SHIFT)
        return E(f'{e.at(P_BAND + 1)} & {hex((1 << b) - 1)}', P_BAND)

    def wrap(self, e, t):
        if t.kind != 'int':
            if t.kind == 'float' and t.bits == 32:
                return E(f'Math.fround({e})', P_CALL)
            return e
        if t.big:
            return E(f'{self.rt("i64" if t.signed else "u64")}({e})', P_CALL)
        return self.narrow(e, t)

    # ---- constants

    def const(self, n):
        k = n.get('kind')
        if k == 'IntegerLiteral':
            return int(n['value'])
        if k == 'CXXBoolLiteralExpr':
            return 1 if n['value'] else 0
        if k == 'CharacterLiteral':
            return int(n['value'])
        if k == 'ConstantExpr' and 'value' in n:
            try:
                return int(n['value'])
            except ValueError:
                pass
        if k in ('ParenExpr', 'ConstantExpr', 'SubstNonTypeTemplateParmExpr', 'CXXDefaultArgExpr'):
            c = [x for x in kids(n) if 'kind' in x and not x['kind'].endswith('Decl') and x['kind'] != 'TemplateArgument'
                 and not x['kind'].endswith('Type')]
            return self.const(c[-1]) if c else None
        if k in ('ImplicitCastExpr', 'CStyleCastExpr', 'CXXFunctionalCastExpr', 'CXXStaticCastExpr'):
            if n.get('castKind') not in ('IntegralCast', 'NoOp', 'LValueToRValue', 'IntegralToBoolean'):
                return None
            if not kids(n):
                return None
            v = self.const(kids(n)[0])
            if v is None:
                return None
            t = self.T(n)
            if t.kind == 'bool':
                return 1 if v else 0
            if t.kind != 'int' or t.bits > 64:
                return None
            return fit(v, t)
        if k == 'UnaryExprOrTypeTraitExpr' and n.get('name') in ('sizeof', 'alignof'):
            try:
                if 'argType' in n:
                    return self.size_of(ty.parse(n['argType']))
                return self.size_of(self.T(kids(n)[0]))
            except (ValueError, Unsupported):
                return None
        if k == 'SizeOfPackExpr':
            return self.pack_size(n)
        if k == 'OffsetOfExpr' and n.get('_offsetof'):
            # offsetof(Type, member): prune.py takes both from the source (clang's JSON does not name them)
            try:
                return self.offset_of(*n['_offsetof'])
            except (ValueError, Unsupported):
                return None
        if k == 'UnaryOperator':
            v = self.const(kids(n)[0])
            if v is None:
                return None
            t = self.T(n)
            op = n['opcode']
            r = {'-': -v, '+': v, '~': ~v, '!': 0 if v else 1}.get(op)
            if r is None or t.kind not in ('int', 'bool') or t.bits > 64:
                return None
            return fit(r, t) if t.kind == 'int' else r
        if k == 'BinaryOperator':
            ks = kids(n)
            if len(ks) != 2:
                return None
            a, b = (self.const(x) for x in ks)
            if a is None or b is None:
                return None
            t = self.T(n)
            op = n['opcode']
            try:
                r = {'+': lambda: a + b, '-': lambda: a - b, '*': lambda: a * b,
                     '/': lambda: int(a / b) if b else None, '%': lambda: a - b * int(a / b) if b else None,
                     '<<': lambda: a << b if 0 <= b < 128 else None, '>>': lambda: a >> b if b >= 0 else None,
                     '&': lambda: a & b, '|': lambda: a | b,
                     '^': lambda: a ^ b, '<': lambda: int(a < b), '>': lambda: int(a > b),
                     '<=': lambda: int(a <= b), '>=': lambda: int(a >= b), '==': lambda: int(a == b),
                     '!=': lambda: int(a != b), '&&': lambda: int(bool(a and b)), '||': lambda: int(bool(a or b))}[op]()
            except KeyError:
                return None
            if r is None:
                return None
            if t.kind == 'int' and t.bits <= 64:
                return fit(r, t)
            return r if t.kind == 'bool' else None
        if k == 'ConditionalOperator':
            c, a, b = (self.const(x) for x in kids(n))
            if c is None or a is None or b is None:
                return None
            return a if c else b
        if k == 'DeclRefExpr':
            d = n['referencedDecl']
            if d.get('kind') == 'EnumConstantDecl':
                v = self.prog.enum_values.get(d['id'], {}).get(self.tu.name) if False else self.prog.enum_value(self.tu, d['id'])
                return v
            if d.get('kind') == 'VarDecl':
                node = self.tu.nodes.get(d['id'])
                # constexpr, or a const integer with a constant initializer (C4Constants.h: const int NO_OWNER = -1):
                # a constant expression in C++, set up before any code runs
                if node is not None and kids(node) and (node.get('constexpr') or
                                                        re.match(r'^const\b', ty.qual_of(node.get('type', {})) or '')):
                    t = self.T(node)
                    if t.kind in ('int', 'bool') and t.bits <= 64:
                        init = [c for c in kids(node) if 'kind' in c and not c['kind'].endswith('Attr')]
                        return self.const(init[-1]) if init else None
        return None

    def size_of(self, t):
        t = t.strip()
        return self.layout(t)[0]

    def offset_of(self, tname, member):
        """offsetof(tname, member) as clang lays the class out for x86-64 (layout); member may be a.b or a[i]"""
        t, off = ty.parse_str(tname), 0
        exact = [c for c in self.prog.classes if c.key == tname or c.key.endswith('::' + tname)]
        first = exact[0] if len(exact) == 1 else None
        for part in re.findall(r'[A-Za-z_]\w*|\[\d+\]', member):
            if part.startswith('['):
                if t.kind != 'arr':
                    raise Unsupported(f'offsetof {tname}, {member}')
                off += int(part[1:-1]) * self.size_of(t.to)
                t = t.to.strip()
                continue
            # the class by its full name (C4Particle::DrawingData::Vertex: other classes are called Vertex too)
            c, first = (first, None) if first is not None else (self.prog.class_of_type(t), None)
            if c is None:
                raise Unsupported(f'offsetof {tname}, {member}')
            at, found = 0, None
            if any(m.kind == 'method' and m.node.get('virtual') for m in c.members):
                at = 8
            for b in c.node.get('bases', ()):
                bs, ba = self.layout(ty.parse(b['type']))
                at = (at + ba - 1) // ba * ba + bs
            packed = any(x.get('kind') == 'MaxFieldAlignmentAttr' for x in kids(c.node))
            pack = PACK.get(c.node.get('name'), 1) if packed else None
            for m in c.members:
                if m.kind != 'field':
                    continue
                ft = ty.parse(m.node['type'])
                fs, fa = self.layout(ft)
                if pack:
                    fa = min(fa, pack)
                at = (at + fa - 1) // fa * fa
                if m.node.get('name') == part:
                    found = (at, ft.strip())
                    break
                at += fs
            if found is None:
                raise Unsupported(f'offsetof {tname}, {member}')
            off += found[0]
            t = found[1]
        return off

    def layout(self, t):
        """(size, alignment) as clang lays out t for x86-64"""
        t = t.strip()
        if t.kind == 'rec':
            c = self.prog.class_of_type(t)
            if c is None and (ty.strip_ns(t.name).startswith(C_STRUCT_PREFIXES) or ty.strip_ns(t.name) in C_STRUCT_FIELDS
                              or ty.strip_ns(t.name) in ('__jmp_buf_tag', 'jpeg_decompress_struct')):
                # a C library's struct is an object of the runtime: its size is only passed to the library (the size
                # checks of jpeg_CreateDecompress and png_set_longjmp_fn) or clears a fresh one (memset(&ogg_file, 0,
                # sizeof(ogg_file)), which is a no-op on it)
                return 0, 1
            if c is None:
                raise Unsupported(f'sizeof {t.name}')
            size, align = 0, 1
            packed = any(x.get('kind') == 'MaxFieldAlignmentAttr' for x in kids(c.node))
            pack = PACK.get(c.node.get('name'), 1) if packed else None
            if any(m.kind == 'method' and m.node.get('virtual') for m in c.members) or \
                    any(self.layout(ty.parse(b['type']))[0] and False for b in c.node.get('bases', ())):
                size, align = 8, 8
            for b in c.node.get('bases', ()):
                bs, ba = self.layout(ty.parse(b['type']))
                size = (size + ba - 1) // ba * ba + bs
                align = max(align, ba)
            for m in c.members:
                if m.kind != 'field':
                    continue
                fs, fa = self.layout(ty.parse(m.node['type']))
                if pack:
                    fa = min(fa, pack)
                size = (size + fa - 1) // fa * fa + fs
                align = max(align, fa)
            size = (size + align - 1) // align * align
            return max(size, 1), align
        if t.kind == 'arr':
            s, a = self.layout(t.to)
            return s * (t.n or 0), a
        if t.kind == 'ref':
            return 8, 8
        s = ty.size_of(t)
        return s, s

    def struct_layout(self, t):
        """a plain struct of numbers and one-dimensional arrays of numbers (no bases, no virtual methods): its fields
        [(name, byte offset, kind, count)] (count 0 for a single number) and its size; None for other types"""
        t = t.strip()
        if t.kind != 'rec':
            return None
        c = self.prog.class_of_type(t)
        if c is None or any(m.kind == 'method' and m.node.get('virtual') for m in c.members):
            return None
        packed = any(x.get('kind') == 'MaxFieldAlignmentAttr' for x in kids(c.node))
        pack = PACK.get(c.node.get('name'), 1) if packed else None
        out, at = [], 0
        # a base class of plain data comes first (C4BMP256Info : C4BMPInfo); its fields are the object's own
        for b in c.node.get('bases', ()):
            if b.get('isVirtual'):
                return None
            sub = self.struct_layout(ty.parse(b['type']))
            if sub is None:
                return None
            bs, ba = self.layout(ty.parse(b['type']))
            at = (at + ba - 1) // ba * ba
            out += [(n, at + o, k, cnt) for n, o, k, cnt in sub[0]]
            at += bs
        for m in c.members:
            if m.kind != 'field':
                continue
            ft = ty.parse(m.node['type']).strip()
            count = 0
            el = ft
            if ft.kind == 'arr':
                el, count = ft.to.strip(), ft.n or 0
                if count == 0:
                    return None
            if el.kind == 'rec':
                # a struct of plain data in it (C4BMPInfo's BITMAPFILEHEADER Head, C4BMP256Info's RGBQUAD Colors[256]):
                # its fields under its name ("Head.bfType", "Colors.3.rgbBlue")
                sub = self.struct_layout(el)
                if sub is None:
                    return None
                fs, fa = self.layout(ft)
                if pack:
                    fa = min(fa, pack)
                at = (at + fa - 1) // fa * fa
                es = sub[1]
                for i in range(max(1, count)):
                    pre = f'{m.name}.{i}.' if count else f'{m.name}.'
                    out += [(pre + n, at + i * es + o, k, cnt) for n, o, k, cnt in sub[0]]
                at += fs
                continue
            if el.kind == 'bool':
                kind = 'u8'
            elif el.kind == 'int' and el.bits <= 32:
                kind = ('i' if el.signed else 'u') + str(el.bits)
            elif el.kind == 'float':
                kind = 'f' + str(el.bits)
            else:
                return None
            fs, fa = self.layout(ft)
            if pack:
                fa = min(fa, pack)
            at = (at + fa - 1) // fa * fa
            out.append((m.name, at, kind, count))
            at += fs
        if not out:
            return None
        return out, self.layout(t)[0]

    def struct_fields(self, t):
        """a plain struct of numbers (no bases, no virtual methods) as its fields: [(name, byte offset, kind)], kind as
        rt $reinterp names it (u8, i32, f32, ...); None for other types"""
        t = t.strip()
        if t.kind != 'rec':
            return None
        c = self.prog.class_of_type(t)
        if c is None or c.node.get('bases') or any(m.kind == 'method' and m.node.get('virtual') for m in c.members):
            return None
        packed = any(x.get('kind') == 'MaxFieldAlignmentAttr' for x in kids(c.node))
        pack = PACK.get(c.node.get('name'), 1) if packed else None
        out, at = [], 0
        for m in c.members:
            if m.kind != 'field':
                continue
            ft = ty.parse(m.node['type']).strip()
            if ft.kind == 'bool':
                kind = 'u8'
            elif ft.kind == 'int' and ft.bits <= 32:
                kind = ('i' if ft.signed else 'u') + str(ft.bits)
            elif ft.kind == 'float':
                kind = 'f' + str(ft.bits)
            else:
                return None
            fs, fa = self.layout(ft)
            if pack:
                fa = min(fa, pack)
            at = (at + fa - 1) // fa * fa
            out.append((m.name, at, kind))
            at += fs
        return out

    def pack_size(self, n):
        """sizeof...(Pack): the pack's length in the function's or the class's template arguments"""
        for owner in (self.fe.node if self.fe else None, self.cls.node if self.cls else None):
            if owner is None:
                continue
            for c in kids(owner):
                if c.get('kind') == 'TemplateArgument':
                    inner = c.get('inner')
                    if c.get('isPack') or (inner is not None and inner and all(x.get('kind') == 'TemplateArgument' for x in inner)):
                        return len(inner or [])
        return 0

    # ---- expressions

    def ex(self, n, want=True):
        k = n['kind']
        m = getattr(self, 'x_' + k, None)
        if m is None:
            raise Unsupported(f'expression {k}')
        if not want and k in ('BinaryOperator', 'CompoundAssignOperator', 'UnaryOperator', 'ExprWithCleanups',
                              'CXXOperatorCallExpr'):
            return m(n, False)
        return m(n)

    def src_type(self, n):
        t = self.T(n)
        if t.big:
            s = n
            while s['kind'] in ('ImplicitCastExpr', 'ParenExpr', 'ArraySubscriptExpr'):
                if s['kind'] == 'ArraySubscriptExpr' or s.get('castKind') in (None, 'LValueToRValue', 'ArrayToPointerDecay', 'NoOp'):
                    s = kids(s)[0]
                else:
                    break
            if s['kind'] == 'DeclRefExpr' and s['referencedDecl'].get('name') in NARROW64:
                return ty.T('int', 32, True, text='int (narrow long)')
            if s['kind'] == 'UnaryOperator' and s['opcode'] in '-+' and not self.src_type(kids(s)[0]).big:
                return ty.T('int', 32, True, text='int (narrow long)')
        return t

    def folded(self, n):
        v = self.const(n)
        if v is None:
            return None
        t = self.T(n)
        if t.kind == 'bool':
            return E('true' if v else 'false')
        if t.kind == 'int' and t.bits <= 64:
            return E(lit_int(v, t.big), P_UNARY if v < 0 else P_ATOM)
        return None

    def x_IntegerLiteral(self, n):
        return self.folded(n)

    def x_CharacterLiteral(self, n):
        return self.folded(n)

    def x_CXXBoolLiteralExpr(self, n):
        return E('true' if n['value'] else 'false')

    def x_CXXNullPtrLiteralExpr(self, n):
        return E('null')

    def x_GNUNullExpr(self, n):
        return E('null')

    def x_FloatingLiteral(self, n):
        v = float(n['value'])
        t = self.T(n)
        s = repr(v)
        if s.endswith('.0'):
            s = s[:-2]
        if s == 'inf':
            s = 'Infinity'
        if t.bits == 32 and not is_f32(v):
            return E(f'Math.fround({s})', P_CALL)
        return E(s, P_UNARY if v < 0 else P_ATOM)

    def x_UserDefinedLiteral(self, n):
        """"text"s (std::string_literals, C4MarkupTag::OpeningTag): a std::string of the literal"""
        lits = []
        stack = list(kids(n))
        while stack:
            x = stack.pop(0)
            if x.get('kind') == 'StringLiteral':
                lits.append(x)
            stack.extend(kids(x))
        if not lits:
            raise Unsupported('user-defined literal')
        return E(f'{self.rt("StdString", "rt/std")}.of({self.x_StringLiteral(lits[0])})', P_CALL)

    def x_StringLiteral(self, n):
        b = c_string(n['value'])
        try:
            s = b.decode('utf-8')
            return E(f'{self.ptr("S")}({json.dumps(s, ensure_ascii=False)})', P_CALL)
        except UnicodeDecodeError:
            return E(f'{self.ptr("SB")}([{", ".join(str(x) for x in b)}])', P_CALL)

    def x_PredefinedExpr(self, n):
        name = self.fe.node.get('name', '') if self.fe else ''
        return E(f'{self.ptr("S")}({json.dumps(name)})', P_CALL)

    def x_ParenExpr(self, n):
        f = self.folded(n)
        if f is not None:
            return f
        return self.ex(kids(n)[0])

    def x_ConstantExpr(self, n):
        f = self.folded(n)
        if f is not None:
            return f
        return self.ex(kids(n)[0])

    def x_SubstNonTypeTemplateParmExpr(self, n):
        f = self.folded(n)
        if f is not None:
            return f
        return self.ex([c for c in kids(n) if c.get('kind', '').endswith('Expr') or c.get('kind', '').endswith('Literal')][-1])

    def x_ExprWithCleanups(self, n, want=True):
        return self.ex(kids(n)[0], want)

    def x_MaterializeTemporaryExpr(self, n):
        return self.ex(kids(n)[0])

    def x_CXXBindTemporaryExpr(self, n):
        return self.ex(kids(n)[0])

    def x_CXXDefaultInitExpr(self, n):
        return self.ex(kids(n)[0])

    def x_CXXDefaultArgExpr(self, n):
        return self.ex(kids(n)[0])

    def x_ImplicitCastExpr(self, n):
        return self.cast(n)

    def x_CStyleCastExpr(self, n):
        return self.cast(n)

    def x_CXXStaticCastExpr(self, n):
        return self.cast(n)

    def x_CXXFunctionalCastExpr(self, n):
        return self.cast(n)

    def x_CXXConstCastExpr(self, n):
        return self.cast(n)

    def x_CXXReinterpretCastExpr(self, n):
        return self.cast(n)

    def x_CXXDynamicCastExpr(self, n):
        t = self.T(n)
        sub = self.ex(kids(n)[0])
        target = t.strip().to if t.strip().kind == 'ptr' else t.strip()
        c = self.class_of(target)
        return E(f'{self.rt("$dyncast", "rt/std")}({sub}, {self.cref(c)})', P_CALL)

    def cast(self, n):
        f = self.folded(n)
        if f is not None:
            return f
        ck = n.get('castKind')
        if not kids(n):
            # T() written as a cast of nothing: the value-initialized T
            return E(self.tr.zero_of(self.mod, self.T(n)))
        sub = kids(n)[0]
        if ck == 'ArrayToPointerDecay':
            if is_va_list(sub.get('type')):
                return self.ex(sub)
            # an array as a pointer to its first element
            st = self.T(sub).strip()
            if st.kind == 'arr' and st.to.strip().kind == 'rec':
                # arrays of objects: the first object (objects in arrays know their array and index)
                return E(f'{self.ptr("$oat")}({self.ex(sub)}, 0)', P_CALL)
            if strip(sub).get('kind') == 'StringLiteral':
                return self.ex(strip(sub))
            return E(f'{self.ptr("P")}({self.ex(sub)}, 0)', P_CALL)
        if ck in CASTS_SAME:
            if ck == 'NoOp' and sub['kind'] == 'InitListExpr':
                if not kids(sub):
                    return E(self.tr.zero_of(self.mod, self.T(n)))
                return self.ex(kids(sub)[0]) if len(kids(sub)) == 1 else self.ex(sub)
            if ck == 'LValueToRValue':
                return self.ex(sub)
            if ck == 'UserDefinedConversion':
                return self.ex(sub)
            return self.ex(sub)
        if ck in CASTS_NUM:
            return self.conv(self.ex(sub), self.src_type(sub), self.T(n))
        if ck in ('NullToPointer', 'NullToMemberPointer'):
            return E('null')
        if ck in ('ReinterpretMemberPointer', 'BaseToDerivedMemberPointer', 'DerivedToBaseMemberPointer'):
            # a pointer to a data member is the field's name whatever its type (C4MapCreatorS2.cpp's attribute table:
            # reinterpret_cast<char C4MCOverlay::*>(&C4MCOverlay::RX), and MemberAdapter::As<U> back)
            return self.ex(sub)
        if ck == 'BitCast':
            # pointer to pointer: char * <-> unsigned char * views; class pointers stay the objects
            st, dt = self.T(sub).strip(), self.T(n).strip()
            e = self.ex(sub)
            if st.kind == 'ptr' and dt.kind == 'ptr' and st.to.strip().kind == 'int' and dt.to.strip().kind == 'int' \
                    and st.to.strip().bits == 8 and dt.to.strip().bits == 8 and st.to.strip().signed != dt.to.strip().signed:
                return E(f'{self.ptr("$view8")}({e}, {"true" if dt.to.strip().signed else "false"})', P_CALL)
            if st.kind == 'ptr' and dt.kind == 'ptr' and st.to.strip().kind == 'void' and \
                    dt.to.strip().kind in ('int', 'float') and not dt.to.strip().n64:
                # (const T *) a void * that points into memory (getBufPtr<T>: StdCompilerBinRead reads a uint8_t, an
                # int32_t from the buffer's bytes): those bytes as T; a void * that holds anything else stays itself
                d = dt.to.strip()
                kind = (('i' if d.signed else 'u') if d.kind == 'int' else 'f') + str(d.bits)
                return E(f'{self.ptr("$reinterpVoid")}({e}, {json.dumps(kind)})', P_CALL)
            if st.kind == 'ptr' and dt.kind == 'ptr' and st.to.strip().kind in ('int', 'float') and \
                    dt.to.strip().kind in ('int', 'float') and not dt.to.strip().n64 and \
                    (st.to.strip().kind, st.to.strip().bits) != (dt.to.strip().kind, dt.to.strip().bits):
                # (const float *) bytes: the bytes read as that type (StdMeshLoaderBinary's vertex data)
                d = dt.to.strip()
                kind = (('i' if d.signed else 'u') if d.kind == 'int' else 'f') + str(d.bits)
                return E(f'{self.ptr("$reinterp")}({e}, {json.dumps(kind)})', P_CALL)
            if st.kind == 'ptr' and dt.kind == 'ptr' and st.to.strip().kind == 'rec' and \
                    (dt.to.strip().kind == 'void' or (dt.to.strip().kind == 'int' and dt.to.strip().bits == 8)):
                sl = self.struct_layout(st.to)
                if sl:
                    # (void *) &s, (BYTE *) &s of a plain struct: its bytes (C4Group's header for MemScramble and the
                    # file, C4Record's chunk heads)
                    return E(f'{self.ptr("$bytesView")}({e}, {json.dumps([list(f) for f in sl[0]])}, {sl[1]})', P_CALL)
            if st.kind == 'ptr' and dt.kind == 'ptr' and st.to.strip().kind in ('void', 'int') and \
                    dt.to.strip().kind == 'rec':
                fields = self.struct_fields(dt.to)
                if fields:
                    # (const C4RecordChunkHead *) bytes: an object whose fields are those bytes (getBufPtr<T>)
                    return E(f'{self.ptr("$structAt")}({e}, {json.dumps([list(f) for f in fields])})', P_CALL)
            return e
        if ck == 'IntegralToPointer' and self.T(sub).name == 'intptr':
            return self.ex(sub)
        if ck == 'PointerToIntegral' and self.T(n).name == 'intptr':
            return self.ex(sub)
        if ck == 'IntegralToPointer':
            v = self.const(sub)
            if v == 0:
                return E('null')
            pt = self.T(n).strip()
            if pt.kind == 'ptr' and pt.to.strip().kind != 'rec':
                # an offset into an OpenGL buffer written as a pointer (reinterpret_cast<const uint8_t *>(offsetof(
                # C4BltVertex, ftx)), glVertexAttribPointer, glDrawElements): a Ptr without an array, its offset the
                # number (rt/gl.ts pointerOffset)
                return E(f'{self.ptr("P")}(null, {v if v is not None else self.ex(sub)})', P_CALL)
            if v is not None:
                # a magic pointer value ((C4Effect *) -1): an object of its own for each number
                return E(f'{self.rt("$iptr", "rt/std")}({v})', P_CALL)
            raise Unsupported('integer to pointer')
        if ck == 'PointerToIntegral':
            # an address as a number (hashing): a number the runtime gives each object, in creation order
            r = E(f'{self.rt("$addr", "rt/std")}({self.ex(sub)})', P_CALL)
            dt = self.T(n).strip()
            return self.conv(r, ty.T('int', 32, False), dt) if dt.kind == 'int' else r
        raise Unsupported(f'cast {ck}')

    # -- names

    def x_DeclRefExpr(self, n):
        d = n['referencedDecl']
        if d.get('kind') == 'EnumConstantDecl':
            v = self.prog.enum_value(self.tu, d['id'])
            if v is None:
                # a default argument inherited from a base class is taken from another translation unit
                for tu in self.prog.tus:
                    v = self.prog.enum_value(tu, d['id'])
                    if v is not None:
                        break
            if v is None:
                # a constant of a C library's enum (SDL_TRUE, KMOD_LCTRL): tools/libenums.h
                v = LIB_ENUM_VALUES.get(d.get('name'))
            if v is None:
                raise Unsupported(f'enum constant {d.get("name")}')
            t = self.T(n)
            return E(f'{lit_int(v, t.big)} /*{d.get("name")}*/', P_UNARY if v < 0 else P_ATOM) if True else None
        if d['id'] in self.locals:
            loc = self.locals[d['id']]
            if loc.mode == 'box':
                return E(f'{loc.name}[0]', P_MEMBER)
            if loc.mode == 'ref':
                return E(f'{loc.name}.a[{loc.name}.o]', P_MEMBER)
            return E(loc.name)
        e = self.prog.ref(self.tu, d['id'])
        if e is None:
            if d.get('kind') in ('FunctionDecl',) and d.get('name'):
                return E(self.tr.libc(self.mod, d['name']))
            if d.get('kind') == 'VarDecl' and d.get('name') in ('stderr', 'stdout', 'stdin', 'errno'):
                return E(self.mod.need('c$' + d['name'], 'rt/libc'))
            if d.get('kind') == 'VarDecl' and d.get('name') in ('optind', 'optarg', 'opterr', 'optopt'):
                # getopt's globals (C4Application::ParseCommandLine): rt/libc's $getopt
                return E(f'{self.mod.need("$getopt", "rt/libc")}.{d["name"]}', P_MEMBER)
            if d.get('kind') == 'VarDecl' and d.get('name') in ('ECMAScript', 'icase', 'nosubs', 'optimize', 'match_default',
                                                                'format_first_only', 'format_default', 'match_any'):
                return E(f'{self.rt("$rx", "rt/std")}.{d["name"]}', P_MEMBER)
            if d.get('name') == 'npos':
                return E('-1', P_UNARY)
            raise Unsupported(f'unknown declaration {d.get("kind")} {d.get("name")}')
        e.reached = True
        if e.kind == 'svar':
            return E(f'{self.cref(e.cls)}.{e.name}', P_MEMBER)
        if e.kind == 'method':
            if e.node.get('storageClass') == 'static':
                return E(f'{self.cref(e.cls)}.{e.name}', P_MEMBER)
            return E(f'this.{e.name}.bind(this)', P_CALL)
        if e.kind == 'var':
            t = ty.parse(e.node['type'])
            if t.kind == 'ref' and self.by_ptr(t):
                return E(f'$.{e.name}.a[$.{e.name}.o]', P_MEMBER)
        return E(self.eref(e), P_MEMBER)

    def x_CXXThisExpr(self, n):
        return E('this')

    def x_MemberExpr(self, n):
        mid = n['referencedMemberDecl']
        e = self.prog.ref(self.tu, mid)
        base = kids(n)[0]
        if e is None:
            node = self.tu.nodes.get(mid)
            if node is not None and node.get('kind') == 'IndirectFieldDecl':
                # a member of an anonymous union or struct: reached through it
                bt = self.T(base).strip()
                if bt.kind == 'ptr':
                    bt = bt.to.strip()
                c = self.prog.class_of_type(bt)
                path = self.tr.indirect(c, node['name']) if c is not None else None
                if path is None:
                    raise Unsupported(f'indirect member {node["name"]}')
                return E(f'{self.ex(base).at(P_CALL)}.{path}', P_MEMBER)
            bt = self.T(base).strip()
            if bt.kind == 'ptr':
                bt = bt.to.strip()
            if bt.kind == 'rec' and self.prog.class_of_type(bt) is None and n.get('name'):
                # a member of a library class (std::pair's first and second): the runtime's same name
                return E(f'{self.ex(base).at(P_CALL)}.{n["name"]}', P_MEMBER)
            raise Unsupported(f'unknown member {n.get("name")}')
        e.reached = True
        if e.kind == 'svar' or (e.kind == 'method' and e.node.get('storageClass') == 'static'):
            return E(f'{self.cref(e.cls)}.{e.name}', P_MEMBER)
        b = self.ex(base)
        if e.kind == 'field':
            ft = ty.parse(e.node['type'])
            if ft.kind == 'ref' and self.by_ptr(ft):
                return E(f'{b.at(P_CALL)}.{e.name}.a[{b.at(P_CALL)}.{e.name}.o]', P_MEMBER)
        return E(f'{b.at(P_CALL)}.{e.name}', P_MEMBER)

    # -- pointers

    def deref(self, p, k=None):
        """*p (k: the index p[k]) for a Ptr expression p"""
        if p.simple:
            idx = f'{p.s}.o' if k is None else f'{p.s}.o + {k.at(P_ADD + 1)}'
            return E(f'{p.s}.a[{idx}]', P_MEMBER)
        if k is None:
            return E(f'{self.ptr("$rd")}({p})', P_CALL)
        return E(f'{self.ptr("$rd")}({p}, {k})', P_CALL)

    def addr(self, n):
        """the pointer to an lvalue: a Ptr, or the object for a class lvalue"""
        t = self.T(n)
        k = n['kind']
        if k == 'UnaryOperator' and n.get('opcode') in ('++', '--') and not n.get('isPostfix'):
            # &--p (CStdFont::DrawText: Markup.Read(&--szText)): the variable, after the decrement
            return E(f'({self.ex(n).at(P_ASSIGN)}, {self.addr(kids(n)[0]).at(P_ASSIGN)})', P_ATOM)
        if k == 'BinaryOperator' and n.get('opcode') in ('.*', '->*') and \
                not member_fn_type(kids(n)[1]):
            # &(obj->*field), the lvalue of a compound assignment through a pointer to a data member
            # (C4ParticleValueProvider::FloatifyParameterValue: this->*value /= denominator): the field's slot
            a, b = kids(n)
            return E(f'{self.ptr("P")}({self.rt("$memberOf", "rt/std")}({self.ex(a)}, {self.ex(b)}), '
                     f'{self.rt("$memberKey", "rt/std")}({self.ex(b)}))', P_CALL)
        if k in ('BinaryOperator', 'CompoundAssignOperator'):
            return E('null', P_ATOM)
        if k == 'CXXOperatorCallExpr' and t.strip().kind == 'rec' and self.prog.class_of_type(t) is None and \
                (ty.strip_ns(t.strip().name or '') in C_STRUCT_FIELDS or
                 ty.strip_ns(t.strip().name or '').startswith(C_STRUCT_PREFIXES)) and len(kids(n)) == 3:
            # &fds[0] of a std::vector of a C library's structs (StdScheduler::DoScheduleProcs: poll(&fds[0], ...)):
            # a pointer into the vector, so that the library reaches the elements after it
            _, obj, ix = kids(n)
            return E(f'{self.ptr("P")}({self.ex(obj)}, {self.index(ix)})', P_CALL)
        if k == 'ConditionalOperator':
            # &(c ? a : b): the address of the lvalue the condition picks
            c, a, b = kids(n)
            return E(f'({self.ex(c).at(P_COND + 1)} ? {self.addr(a).at(P_ASSIGN)} : {self.addr(b).at(P_ASSIGN)})', P_ATOM)
        if is_smart(t) and k == 'MemberExpr' and self.prog.ref(self.tu, n['referencedMemberDecl']) is not None and \
                self.prog.ref(self.tu, n['referencedMemberDecl']).kind == 'field':
            # &obj.unique_ptr_field: the slot (a reference to it is assigned through)
            f = self.prog.ref(self.tu, n['referencedMemberDecl'])
            f.reached = True
            return E(f'{self.ptr("P")}({self.ex(kids(n)[0])}, {json.dumps(f.name)})', P_CALL)
        if t.strip().kind == 'rec' and k == 'ArraySubscriptExpr':
            # &arr[i] of objects: the element, or past the end a marker that knows its place
            a, i = kids(n)
            if a['kind'] == 'ImplicitCastExpr' and a.get('castKind') == 'ArrayToPointerDecay':
                return E(f'{self.ptr("$oat")}({self.ex(kids(a)[0])}, {self.index(i)})', P_CALL)
            return E(f'{self.ptr("$oadd")}({self.ex(a)}, {self.index(i)})', P_CALL)
        if k == 'DeclRefExpr' and is_smart(t) and n['referencedDecl']['id'] in self.locals and \
                self.locals[n['referencedDecl']['id']].mode == 'box':
            # &smart_ptr (C4Landscape::Init passes &sfcMap to C4MapScriptHost::InitializeMap, which assigns it)
            return E(f'{self.ptr("P")}({self.locals[n["referencedDecl"]["id"]].name}, 0)', P_CALL)
        if k == 'DeclRefExpr' and n['referencedDecl'].get('kind') == 'FieldDecl':
            # &C4MCOverlay::RX, a pointer to a data member of a class type (int_bool): the field's name
            e = self.prog.ref(self.tu, n['referencedDecl']['id'])
            if e is not None and e.kind == 'field':
                e.reached = True
                return E(json.dumps(e.name))
        if t.strip().kind == 'rec' and k not in ('MaterializeTemporaryExpr',):
            return self.ex(n)
        if k in ('ParenExpr',) or (k in ('ImplicitCastExpr', 'CXXConstCastExpr', 'CXXStaticCastExpr', 'CStyleCastExpr') and n.get('castKind') == 'NoOp'):
            return self.addr(kids(n)[0])
        if k == 'DeclRefExpr':
            d = n['referencedDecl']
            if d['id'] in self.locals:
                loc = self.locals[d['id']]
                if loc.mode == 'box':
                    return E(f'{self.ptr("P")}({loc.name}, 0)', P_CALL)
                if loc.mode == 'ref':
                    return E(loc.name)
                st = self.T(n).strip()
                if st.kind == 'arr':
                    return E(f'{self.ptr("P")}({loc.name}, 0)', P_CALL)
                raise Unsupported(f'address of local {loc.name} not boxed')
            e = self.prog.ref(self.tu, d['id'])
            if e is None and d.get('kind') == 'IndirectFieldDecl':
                # &C4ParticleValueProvider::speedFactor, a member of an anonymous union: a pointer to a data member
                # is the path to it ($u1.speedFactor)
                owner = self.tu.up(self.tu.nodes.get(d['id']) or {})
                c = self.prog.of_node.get((self.tu.name, owner['id'])) if owner else None
                path = self.tr.indirect(c, d['name']) if c is not None else None
                if path is None:
                    raise Unsupported(f'address of indirect member {d.get("name")}')
                return E(json.dumps(path))
            if e is None and d.get('kind') == 'FunctionDecl' and d.get('name'):
                # &isspace: a function of the C library (std::all_of(first, last, &isspace) in C4TextureMap::LoadMap)
                return E(self.tr.libc(self.mod, d['name']))
            if e is None:
                raise Unsupported(f'address of unknown {d.get("name")}')
            e.reached = True
            if e.kind in ('func',):
                return E(self.eref(e))
            if e.kind == 'method' and e.node.get('storageClass') == 'static':
                return E(f'{self.cref(e.cls)}.{e.name}', P_MEMBER)
            if e.kind == 'method':
                # a pointer to a member function: called as pm(obj, args)
                return E(f'((o, ...a) => o.{e.name}(...a))', P_ATOM)
            if e.kind == 'var':
                vt = ty.parse(e.node['type'])
                if vt.kind == 'ref' and self.by_ptr(vt):
                    return E(f'$.{e.name}', P_MEMBER)
                return E(f'{self.ptr("P")}($, {json.dumps(e.name)})', P_CALL)
            if e.kind == 'svar':
                return E(f'{self.ptr("P")}({self.cref(e.cls)}, {json.dumps(e.name)})', P_CALL)
            if e.kind == 'field':
                # a pointer to a data member (&C4ID::v, C4ID's safe bool): the field's name, never null
                return E(json.dumps(e.name))
            return E('null', P_ATOM)
        if k == 'MemberExpr':
            e = self.prog.ref(self.tu, n['referencedMemberDecl'])
            if e is None:
                if n.get('name') and kids(n) and not n.get('isArrow'):
                    # a field of a library class: &pair.second (C4ScenarioParameters::CompileFunc writes its map's
                    # values through mkNamingAdapt(Parameter.second, ...))
                    return E(f'{self.ptr("P")}({self.ex(kids(n)[0])}, {json.dumps(n["name"])})', P_CALL)
                return E('null', P_ATOM)
            if e.kind == 'svar':
                return E(f'{self.ptr("P")}({self.cref(e.cls)}, {json.dumps(e.name)})', P_CALL)
            b = self.ex(kids(n)[0])
            ft = ty.parse(e.node['type'])
            if ft.kind == 'ref' and self.by_ptr(ft):
                return E(f'{b.at(P_CALL)}.{e.name}', P_MEMBER)
            here = f'{ty.strip_ns(self.fe.cls.key)}::{self.fe.node.get("name")}' if self.fe is not None and \
                self.fe.cls is not None else None
            run = FIELD_ARRAYS.get(here, {}).get(e.node.get('name'))
            if run:
                # the first of fields that the C++ uses as an array (config.FIELD_ARRAYS)
                return E(f'{self.ptr("$fields")}({b}, {json.dumps(list(run))})', P_CALL)
            return E(f'{self.ptr("P")}({b}, {json.dumps(e.name)})', P_CALL)
        if k == 'ArraySubscriptExpr':
            a, i = kids(n)
            ix = self.index(i)
            ab = self.T(a)
            if strip(a).get('kind') != 'ArraySubscriptExpr' and a['kind'] == 'ImplicitCastExpr' and a.get('castKind') == 'ArrayToPointerDecay':
                row = self.row_of_field(kids(a)[0])
                if row is not None:
                    # &obj.m[i][j] of a field float m[3][4]: a pointer into row i that knows its object and field, so
                    # that a reader past the row's end (glUniformMatrix4x3fv of &bones[0].m[0][0], C4DrawMeshGL.cpp)
                    # goes on with the next rows and, for a struct of only that array, the next objects (rt $rowp)
                    obj, name, ri = row
                    return E(f'{self.ptr("$rowp")}({obj}, {json.dumps(name)}, {ri}, {ix})', P_CALL)
                return E(f'{self.ptr("P")}({self.ex(kids(a)[0])}, {ix})', P_CALL)
            p = self.ex(a)
            return E(f'{self.ptr("$padd")}({p}, {ix})', P_CALL)
        if k == 'UnaryOperator' and n['opcode'] == '*':
            return self.ex(kids(n)[0])
        if k in ('CallExpr', 'CXXMemberCallExpr', 'CXXOperatorCallExpr'):
            return self.call_any(n, as_ptr=True)
        if k == 'MaterializeTemporaryExpr':
            if t.strip().kind == 'rec':
                return self.ex(kids(n)[0])
            return E(f'{self.ptr("$tmp")}({self.ex(kids(n)[0])})', P_CALL)
        if k == 'ConditionalOperator':
            c, a, b = kids(n)
            return E(f'{self.ex(c).at(P_COND + 1)} ? {self.addr(a).at(P_ASSIGN)} : {self.addr(b).at(P_ASSIGN)}', P_COND)
        if k == 'StringLiteral':
            return self.ex(n)
        if k in ('ImplicitCastExpr', 'CStyleCastExpr', 'CXXStaticCastExpr', 'CXXReinterpretCastExpr') and \
                n.get('castKind') in ('LValueBitCast', 'BitCast', 'UncheckedDerivedToBase', 'DerivedToBase'):
            return self.addr(kids(n)[0])
        return E('null', P_ATOM)

    def row_of_field(self, n):
        """obj.m[i] of a field that is an array of arrays of numbers: (obj, field name, i), else None"""
        n = strip(n)
        if n.get('kind') != 'ArraySubscriptExpr':
            return None
        b, i = kids(n)
        if b.get('kind') != 'ImplicitCastExpr' or b.get('castKind') != 'ArrayToPointerDecay':
            return None
        me = strip(kids(b)[0])
        if me.get('kind') != 'MemberExpr' or not kids(me):
            return None
        e = self.prog.ref(self.tu, me['referencedMemberDecl'])
        if e is None or e.kind != 'field':
            return None
        ft = ty.parse(e.node['type']).strip()
        if ft.kind != 'arr' or ft.to is None or ft.to.strip().kind != 'arr' or ft.to.strip().to is None or \
                ft.to.strip().to.strip().kind not in ('int', 'float'):
            return None
        e.reached = True
        return self.ex(kids(me)[0]), e.name, self.index(i)

    def index(self, i):
        it = self.T(i)
        ix = self.ex(i)
        if it.big:
            ix = E(f'Number({ix})', P_CALL)
        if it.strip().kind == 'bool':
            # a[b] with a bool b: clang writes no conversion, C++ indexes with 0 or 1 (C4MapScriptAlgoBorder:
            # ymove[inside != !dir][!inside]); a JavaScript array indexed by true is undefined
            ix = E(f'({ix.at(P_COND + 1)} ? 1 : 0)', P_ATOM)
        return ix

    def x_ArraySubscriptExpr(self, n):
        a, i = kids(n)
        ix = self.index(i)
        if a['kind'] == 'ImplicitCastExpr' and a.get('castKind') == 'ArrayToPointerDecay':
            arr = self.ex(kids(a)[0])
            return E(f'{arr.at(P_CALL)}[{ix}]', P_MEMBER)
        at = self.T(a).strip()
        if at.kind == 'ptr' and at.to.strip().kind == 'rec':
            # objects in an array know their array and index ($a, $i)
            if ix.s == '0':
                return self.ex(a)
            return E(f'{self.ptr("$oidx")}({self.ex(a)}, {ix})', P_CALL)
        return self.deref(self.ex(a), ix)

    def x_UnaryOperator(self, n, want=True):
        f = self.folded(n)
        if f is not None:
            return f
        op = n['opcode']
        sub = kids(n)[0]
        t = self.T(n)
        if op == '*':
            st = self.T(sub).strip()
            if st.kind == 'ptr' and st.to.strip().kind in ('rec', 'func') and not is_smart(st.to):
                return self.ex(sub)
            if st.kind == 'func':
                return self.ex(sub)
            return self.deref(self.ex(sub))
        if op == '&':
            ss = strip(sub)
            m = None
            if ss.get('kind') == 'DeclRefExpr' and ss['referencedDecl'].get('kind') == 'CXXMethodDecl':
                m = self.prog.ref(self.tu, ss['referencedDecl']['id'])
            if m is not None and m.kind == 'method' and m.node.get('storageClass') != 'static':
                # a pointer to a member function (&C4FullScreen::ShowAbortDlg): the method's name, called as
                # obj[name](...) (C++'s ->* and .* dispatch virtual methods as JavaScript's [] does); a static
                # method's address is a function pointer (addr)
                m.reached = True
                return E(json.dumps(m.name))
            return self.addr(sub)
        if op == '!':
            s = self.T(sub)
            x = self.ex(sub)
            if s.strip().kind == 'bool':
                if x.p == P_EQ and x.s.count(' !== ') == 1 and '(' not in x.s and '?' not in x.s:
                    return E(x.s.replace(' !== ', ' === '), P_EQ)
                if x.p == P_EQ and x.s.count(' != ') == 1 and '(' not in x.s and '?' not in x.s:
                    return E(x.s.replace(' != ', ' == '), P_EQ)
                return E('!' + x.at(P_UNARY), P_UNARY)
            return E('!' + self.conv(x, s, ty.T('bool')).at(P_UNARY), P_UNARY)
        if op in ('-', '+', '~'):
            x = self.ex(sub)
            if op == '+':
                return x
            if t.big and op == '-' and not self.src_type(n).big:
                return E(f'-{x.at(P_UNARY)} | 0', P_BOR)
            if t.kind == 'float':
                return E('-' + x.at(P_UNARY), P_UNARY)
            if t.n64:
                if op == '~':
                    return E(f'{self.rt("$not64n")}({x}, {"true" if t.signed else "false"})', P_CALL)
                return E(f'-{x.at(P_UNARY)}', P_UNARY) if t.signed else E(f'{self.rt("$u64n")}(-{x.at(P_UNARY)})', P_CALL)
            r = E(op + x.at(P_UNARY), P_UNARY)
            if op == '-' and not t.big and t.bits == 32 and t.signed:
                return E(f'{r.at(P_BOR + 1)} | 0', P_BOR)
            if op == '~' and t.kind == 'int' and t.bits == 32 and t.signed:
                return r
            return self.wrap(r, t)
        if op in ('++', '--'):
            return self.incdec(n, sub, op, want)
        if op in ('__extension__',):
            return self.ex(sub)
        raise Unsupported(f'unary {op}')

    def incdec(self, n, sub, op, want):
        t = self.T(sub).strip()
        lv = self.ex(sub)
        if t.kind == 'ptr':
            if self.objptr(t):
                upd = E(f'{self.ptr("$oadd")}({lv}, {"1" if op == "++" else "-1"})', P_CALL)
            else:
                upd = E(f'{lv.at(P_CALL)}.add({"1" if op == "++" else "-1"})', P_CALL)
        elif t.kind == 'rec':
            raise Unsupported('++ on a class value')
        else:
            one = '1n' if t.big else '1'
            upd = self.wrap(E(f'{lv.at(P_ADD)} {op[0]} {one}', P_ADD), t)
            if t.kind == 'float':
                upd = E(f'{lv.at(P_ADD)} {op[0]} 1', P_ADD) if t.bits == 64 else upd
        if not want:
            return self.assign_to(sub, lv, upd)
        if not n.get('isPostfix'):
            a = self.assign_to(sub, lv, upd)
            return E(f'({a})', P_ATOM)
        # postfix with its value used: the old value through a temporary
        if not lv.simple and not (re.fullmatch(r'[\w$]+(\.[\w$]+|\[[^\[\]]+\])*', lv.s)
                                  and not re.search(r'[()=]|\+\+|--', lv.s)):
            raise Unsupported(f'postfix ++/-- on a complex lvalue: {lv.s} [{lv.p}]')
        tmp = self.temp()
        return E(f'({tmp} = {lv}, {lv} = {upd.at(P_ASSIGN)}, {tmp})', P_ATOM)

    def assign_to(self, lhs_node, lv, val):
        """lv = val, where lv may be a $rd(...) read"""
        node = strip(lhs_node)
        if node.get('kind') == 'ConditionalOperator':
            # C++ allows (cond ? a : b) = value; JavaScript does not. Assign in the chosen
            # branch, evaluating the value once.
            c, x, y = kids(node)
            ex, ey = self.ex(x), self.ex(y)
            cx = self.ex(c)
            ax = self.assign_to(x, ex, E('$v')).s
            ay = self.assign_to(y, ey, E('$v')).s
            return E(f'(($v) => {cx} ? ({ax}) : ({ay}))({val})', P_CALL)
        if lv.s.startswith('$rd(') or (lv.p == P_CALL and lv.s.startswith(self.ptr('$rd') + '(')):
            inner = lv.s[lv.s.index('(') + 1:-1]
            if ', ' in inner and not inner.endswith(')'):
                p, k = inner.rsplit(', ', 1)
            else:
                p, k = inner, '0'
            return E(f'{self.ptr("$wr")}({p}, {k}, {val})', P_CALL)
        return E(f'{lv.s} = {val.at(P_ASSIGN)}', P_ASSIGN)

    def arith(self, op, a, b, t, at, bt):
        if t.kind == 'float':
            r = E(f'{a.at(BINPREC[op])} {op} {b.at(BINPREC[op] + 1)}', BINPREC[op])
            return self.wrap(r, t)
        if t.kind != 'int' or t.bits > 64:
            raise Unsupported(f'arithmetic on {t.text}')
        if t.n64:
            # 64-bit numbers (sizes, counts): exact below 2^53
            if bt.big:
                b = E(f'Number({b})', P_CALL)
            if op in ('+', '-', '*'):
                return E(f'{a.at(BINPREC[op])} {op} {b.at(BINPREC[op] + 1)}', BINPREC[op])
            if op == '/':
                return E(f'Math.trunc({a.at(P_MUL)} / {b.at(P_MUL + 1)})', P_CALL)
            if op == '%':
                return E(f'{a.at(P_MUL)} % {b.at(P_MUL + 1)}', P_MUL)
            f = {'<<': '$shl64n', '>>': '$shr64n', '&': '$and64n', '|': '$or64n', '^': '$xor64n'}[op]
            return E(f'{self.rt(f)}({a}, {b})', P_CALL)
        if t.big:
            if op in ('<<', '>>') and not bt.big:
                b = E(f'{b.s}n', P_ATOM) if re.fullmatch(r'\d+', b.s) else E(f'BigInt({b})', P_CALL)
            r = E(f'{a.at(BINPREC[op])} {op} {b.at(BINPREC[op] + 1)}', BINPREC[op])
            if op in ('+', '-', '*', '<<') and not (op != '<<' and self.small(a, at) and self.small(b, bt)):
                return self.wrap(r, t)
            return r
        if bt.big and op in ('<<', '>>'):
            b = E(f'Number({b})', P_CALL)
        if op == '*':
            r = E(f'Math.imul({a}, {b})', P_CALL)
            return r if t.signed and t.bits == 32 else self.narrow(r, t)
        if op == '/':
            r = E(f'{a.at(P_MUL)} / {b.at(P_MUL + 1)}', P_MUL)
            return self.narrow(r, t) if t.bits == 32 else E(f'Math.trunc({r})', P_CALL)
        if op == '%':
            return E(f'{a.at(P_MUL)} % {b.at(P_MUL + 1)}', P_MUL)
        if op == '>>':
            jop = '>>' if t.signed else '>>>'
            return E(f'{a.at(P_SHIFT)} {jop} {b.at(P_SHIFT + 1)}', P_SHIFT)
        r = E(f'{a.at(BINPREC[op])} {op} {b.at(BINPREC[op] + 1)}', BINPREC[op])
        if op in ('&', '|', '^') and t.signed and t.bits == 32:
            return r
        return self.narrow(r, t)

    def small(self, e, t):
        if not t.big:
            return True
        s = e.s
        if s.startswith('BigInt(') and s.endswith(')') and s.count('(') == 1 + s[7:-1].count('('):
            return True
        return re.fullmatch(r'-?\d{1,9}n', s) is not None

    def x_BinaryOperator(self, n, want=True):
        f = self.folded(n)
        if f is not None:
            return f
        op = n['opcode']
        a, b = kids(n)
        t = self.T(n)
        at, bt = self.T(a).strip(), self.T(b).strip()
        if op in ('.*', '->*') and not member_fn_type(b):
            # obj->*field with a pointer to a data member (its name, or the path through an anonymous union
            # "$u1.speedFactor"): the field
            return E(f'{self.rt("$memberOf", "rt/std")}({self.ex(a)}, {self.ex(b)})[{self.rt("$memberKey", "rt/std")}('
                     f'{self.ex(b)})]', P_MEMBER)
        if op == '=':
            if t.strip().kind == 'rec':
                return E(f'{self.ex(a).at(P_CALL)}.$assign({self.ex(b)})', P_CALL)
            return self.assign_to(a, self.ex(a), self.ex(b))
        if op == ',':
            return E(f'{self.ex(a, False).at(P_COMMA)}, {self.ex(b, want).at(P_COMMA + 1)}', P_COMMA)
        if op in ('&&', '||'):
            return E(f'{self.ex(a).at(BINPREC[op])} {op} {self.ex(b).at(BINPREC[op] + 1)}', BINPREC[op])
        if op in ('==', '!=', '<', '>', '<=', '>='):
            if at.kind in ('ptr', 'null', 'func') or bt.kind in ('ptr', 'null', 'func'):
                return self.ptr_cmp(op, a, b, at, bt)
            jop = {'==': '===', '!=': '!=='}.get(op, op)
            return E(f'{self.ex(a).at(BINPREC[jop])} {jop} {self.ex(b).at(BINPREC[jop] + 1)}', BINPREC[jop])
        if at.kind == 'ptr' or bt.kind == 'ptr':
            return self.ptr_arith(op, a, b, at, bt)
        return self.arith(op, self.ex(a), self.ex(b), t, at, bt)

    def ptr_cmp(self, op, a, b, at, bt):
        ea, eb = self.ex(a), self.ex(b)
        objlike = lambda t: t.kind != 'ptr' or t.to.strip().kind in ('rec', 'func', 'void')
        if op in ('==', '!='):
            if eb.s == 'null' or ea.s == 'null' or (objlike(at) and objlike(bt)):
                jop = '==' if (eb.s == 'null' or ea.s == 'null') else '==='
                if op == '!=':
                    jop = '!' + jop[1:]
                return E(f'{ea.at(P_EQ + 1)} {jop} {eb.at(P_EQ + 1)}', P_EQ)
            r = E(f'{self.ptr("$peq")}({ea}, {eb})', P_CALL)
            return r if op == '==' else E('!' + r.at(P_UNARY), P_UNARY)
        if objlike(at):
            if at.kind == 'ptr' and at.to.strip().kind == 'rec':
                # objects in an array by their places; null before all of them
                return E(f'{self.ptr("$oi")}({ea}) {op} {self.ptr("$oi")}({eb})', P_REL)
            raise Unsupported('ordering pointers')
        return E(f'{ea.at(P_CALL)}.o {op} {eb.at(P_CALL)}.o', P_REL)

    def objptr(self, t):
        return t.kind == 'ptr' and t.to.strip().kind == 'rec'

    def ptr_arith(self, op, a, b, at, bt):
        if op == '-' and at.kind == 'ptr' and bt.kind == 'ptr':
            if self.objptr(at):
                return E(f'{self.ex(a).at(P_CALL)}.$i - {self.ex(b).at(P_CALL)}.$i', P_ADD)
            return E(f'{self.ex(a).at(P_CALL)}.o - {self.ex(b).at(P_CALL)}.o', P_ADD)
        p, i = (a, b) if at.kind == 'ptr' else (b, a)
        pt = at if at.kind == 'ptr' else bt
        ix = self.index(i)
        if op == '-':
            ix = E(f'-{ix.at(P_UNARY)}', P_UNARY)
        elif op != '+':
            raise Unsupported(f'pointer {op}')
        if self.objptr(pt):
            return E(f'{self.ptr("$oadd")}({self.ex(p)}, {ix})', P_CALL)
        return E(f'{self.ptr("$padd")}({self.ex(p)}, {ix})', P_CALL)

    def x_CompoundAssignOperator(self, n, want=True):
        op = n['opcode'][:-1]
        a, b = kids(n)
        inner = strip(a)
        if inner.get('kind') in ('CompoundAssignOperator', 'BinaryOperator') and inner.get('opcode', '').endswith('=') \
                and inner.get('opcode') not in ('==', '!=', '<=', '>='):
            # (x += 3) %= 4: the inner assignment, then this one on its left side (C++: the result is x itself)
            first = self.ex(inner)
            second = self.x_CompoundAssignOperator(dict(n, inner=[kids(inner)[0], b]))
            return E(f'({first.at(P_ASSIGN)}, {second.at(P_ASSIGN)})', P_ATOM)
        lt = self.T(a).strip()
        lhs = self.ex(a)
        rhs = self.ex(b)
        bt = self.T(b).strip()
        if lt.kind == 'ptr':
            ix = self.index(b)
            if op == '-':
                ix = E(f'-{ix.at(P_UNARY)}', P_UNARY)
            if self.objptr(lt):
                return self.assign_to(a, lhs, E(f'{self.ptr("$oadd")}({lhs}, {ix})', P_CALL))
            return self.assign_to(a, lhs, E(f'{lhs.at(P_CALL)}.add({ix})', P_CALL))
        ct = ty.parse(n['computeLHSType'])
        if not lhs.simple and not lhs.s.startswith(self.ptr('$rd')):
            # an lvalue with side effects or calls: through a pointer to it
            p = self.addr(a)
            tmp = self.temp()
            val = self.arith(op, self.conv(E(f'{tmp}.a[{tmp}.o]', P_MEMBER), lt, ct), rhs, ct, ct, bt)
            val = self.conv(val, ct, lt)
            return E(f'({tmp} = {p}, {tmp}.a[{tmp}.o] = {val.at(P_ASSIGN)})', P_ATOM)
        if ct.kind == lt.kind and ct.bits == lt.bits and ct.signed == lt.signed:
            if lt.kind == 'int' and not lt.big and lt.bits == 32 and lt.signed and op in ('>>', '<<', '&', '|', '^') and not bt.big and lhs.simple:
                return E(f'{lhs.s} {op}= {rhs.at(P_ASSIGN)}', P_ASSIGN)
            if lt.kind == 'float' and lt.bits == 64 and lhs.simple:
                return E(f'{lhs.s} {op}= {rhs.at(P_ASSIGN)}', P_ASSIGN)
        val = self.arith(op, self.conv(lhs, lt, ct), rhs, ct, ct, bt)
        val = self.conv(val, ct, lt)
        return self.assign_to(a, lhs, val)

    def x_ConditionalOperator(self, n):
        c, a, b = kids(n)
        return E(f'{self.ex(c).at(P_COND + 1)} ? {self.ex(a).at(P_ASSIGN)} : {self.ex(b).at(P_ASSIGN)}', P_COND)

    def x_BinaryConditionalOperator(self, n):
        raise Unsupported('?:')

    def x_OpaqueValueExpr(self, n):
        return self.ex(kids(n)[0])

    # -- calls

    def arg(self, a, pt):
        if a['kind'] == 'CXXDefaultArgExpr':
            return None
        if pt is not None and self.by_ptr(pt):
            return self.addr(a).at(P_ASSIGN)
        return self.ex(a).at(P_ASSIGN)

    def args(self, n, params, skip=0, scope=None):
        """the arguments of a call, matched to the callee's parameters (scope: the callee's class, where the
        names of its parameters' types are looked up)"""
        if scope is not None:
            self.prog.scopes.append(scope)
            try:
                return self.args(n, params, skip)
            finally:
                self.prog.scopes.pop()
        ks = n
        out = []
        for i, a in enumerate(ks):
            pt = params[i] if params is not None and i < len(params) else None
            if a['kind'] == 'CXXDefaultArgExpr':
                # a default argument: left out at the end, written out when a later one is given
                if all(x['kind'] == 'CXXDefaultArgExpr' for x in ks[i:]):
                    break
                out.append(self.ex(kids(a)[0]).at(P_ASSIGN) if kids(a) else 'undefined')
                continue
            out.append(self.arg(a, pt))
        return ', '.join(out)

    def params_of(self, e):
        if e is None:
            return None
        return [ty.parse(p['type']) for p in kids(e.node) if p.get('kind') == 'ParmVarDecl']

    def callee_entity(self, c):
        while c['kind'] in ('ImplicitCastExpr', 'ParenExpr', 'CXXBindTemporaryExpr', 'MaterializeTemporaryExpr'):
            c = kids(c)[0]
        if c['kind'] == 'DeclRefExpr':
            d = c['referencedDecl']
            e = self.prog.ref(self.tu, d['id'])
            return e, None, {'name': d.get('name'), 'kind': d.get('kind'), 'id': d['id'], 'node': c}
        if c['kind'] == 'MemberExpr':
            e = self.prog.ref(self.tu, c['referencedMemberDecl'])
            return e, kids(c)[0], {'name': c.get('name'), 'arrow': c.get('isArrow'), 'node': c}
        if c['kind'] == 'UnresolvedLookupExpr':
            return None, None, {'name': c.get('name')}
        return None, None, {'callee': c}

    def ret_by_ptr(self, e):
        """does the function return a reference that the TypeScript returns as a Ptr?"""
        s = ty.qual_of(e.node['type'])
        r = ret_of(s)
        if r is None:
            return False
        t = ty.parse_str(r)
        return t.kind == 'ref' and self.by_ptr(ty.T('ref', to=t.to, text=r))

    def waits(self):
        """does the function being written wait in a modal loop (a generator, config.SUSPEND), outside its lambdas"""
        return self.tr.is_colored(self.fe) and not self.lambda_depth

    def coro_call(self, n, e):
        """a call of a function that may wait in a modal loop (config.SUSPEND, rt/coro.ts): a waiting function waits
        for it (yield*); any other starts it as a coroutine of its own ($spawn), which the page resumes"""
        if not self.tr.colored:
            return e
        c = kids(n)[0] if kids(n) else {}
        b = strip(c)
        while c.get('kind') in ('ImplicitCastExpr', 'ParenExpr', 'MaterializeTemporaryExpr', 'CXXBindTemporaryExpr') and kids(c):
            c = kids(c)[0]
        color = None
        if b.get('kind') == 'BinaryOperator' and b.get('opcode') in ('.*', '->*'):
            # (obj->*pFunc)(...): a callback (C4GUI::CallbackButton, C4KeyCB) may name a method that waits
            ft = kids(b)[1].get('type', {}) if len(kids(b)) > 1 else {}
            color = self.tr.pointer_color(ty.qual_of(ft) if isinstance(ft, (dict, str)) else '')
        elif c.get('kind') == 'DeclRefExpr':
            color = self.tr.call_color(self.prog.ref(self.tu, c['referencedDecl']['id']))
        elif c.get('kind') == 'MemberExpr':
            color = self.tr.call_color(self.prog.ref(self.tu, c['referencedMemberDecl']))
        if color is None:
            return e
        if self.waits():
            if color == 'gen':
                return E(f'(yield* {e})', P_ATOM)
            return E(f'(yield* {self.mod.need("$co", "rt/coro")}({e}))', P_ATOM)
        return E(f'{self.mod.need("$spawn", "rt/coro")}({e})', P_CALL)

    def call_any(self, n, as_ptr=False):
        """a call; a call returning a reference to a scalar returns a Ptr: dereferenced unless as_ptr"""
        k = n['kind']
        r = getattr(self, 'c_' + k)(n)
        if isinstance(r, tuple):
            e, byptr = r
        else:
            e, byptr = r, False
        e = self.coro_call(n, e)
        susp = SUSPEND.get(self.tr.qname(self.fe)) if self.fe is not None and SUSPEND else None
        if susp and self.waits() and isinstance(e, E):
            cn = kids(n)[0] if kids(n) else {}
            if strip(cn).get('kind') == 'MemberExpr' and strip(cn).get('name') == susp:
                # the loop's wait for the next event (config.SUSPEND): back to the page until its next frame
                e = E(f'(yield, {e})', P_ATOM)
        if byptr and not as_ptr:
            return self.deref(e)
        if as_ptr and not byptr:
            if self.T(n).strip().kind == 'rec':
                return e
            if getattr(e, 'elem', None):
                # &v[i] of a library container of numbers: a pointer into its array
                return E(f'{self.ptr("P")}({e.elem[0]}, {e.elem[1]})', P_CALL)
            return E(f'{self.ptr("$tmp")}({e})', P_CALL)
        return e

    def x_CallExpr(self, n):
        return self.call_any(n)

    def x_CXXMemberCallExpr(self, n):
        return self.call_any(n)

    def x_CXXOperatorCallExpr(self, n, want=True):
        return self.call_any(n)

    def c_CallExpr(self, n):
        c, *args = kids(n)
        e, obj, d = self.callee_entity(c)
        if e is None:
            if 'callee' in d:
                # a call through a function pointer or a callable object: reference parameters as the
                # function's type has them (StdArrayAdapt's map: StdPtrAdapt<T> (&)(T *&))
                f = self.ex(d['callee'])
                return E(f'{f.at(P_CALL)}({self.args(args, fn_params(d["callee"].get("type")))})', P_CALL)
            if d.get('kind') in ('VarDecl', 'ParmVarDecl') and d.get('id') in self.locals:
                return E(f'{self.ex(d["node"]).at(P_CALL)}({self.args(args, None)})', P_CALL)
            return self.tr.std.call(self, n, d.get('name'), args)
        if e.kind in ('var', 'field', 'svar'):
            # a variable that holds a function (StdArrayAdapt's map, a reference to StdPtrAdapt<T> (&)(T *&))
            f = self.ex(c)
            return E(f'{f.at(P_CALL)}({self.args(args, fn_params(strip_casts(c).get("type")))})', P_CALL)
        return self.call(e, obj, args), self.ret_by_ptr(e)

    def call(self, e, obj, args, objE=None):
        e.reached = True
        a = self.args(args, self.params_of(e), scope=e.cls if e.cls is not None else e)
        if e.native and e.cls is None:
            return E(f'{self.eref(e)}({a})', P_CALL)
        if e.kind == 'method':
            if e.node.get('storageClass') == 'static':
                return E(f'{self.cref(e.cls)}.{e.name}({a})', P_CALL)
            if objE is None:
                objE = E('this') if obj is None else self.ex(obj)
            return self.method_call(e, objE, a, obj)
        return E(f'{self.eref(e)}({a})', P_CALL)

    def method_call(self, e, objE, a, obj_node=None, qualified=False):
        """a call of a method; non-virtual methods that a subclass hides are called statically"""
        if self.tr.static_call(e) or qualified:
            cn = self.cref(e.cls)
            return E(f'{cn}.prototype.{e.name}.call({objE}{", " + a if a else ""})', P_CALL)
        return E(f'{objE.at(P_CALL)}.{e.name}({a})', P_CALL)

    def c_CXXMemberCallExpr(self, n):
        c, *args = kids(n)
        e, obj, d = self.callee_entity(c)
        if e is None:
            tqual = ty.qual_of(self.T(c).text) if isinstance(self.T(c).text, str) else ''
            if 'std::function' in tqual and obj is not None:
                return E(f'{self.ex(obj)}({self.args(args, None)})', P_CALL)
            if obj is None and c['kind'] in ('ParenExpr',):
                b = strip(c)
                if b.get('kind') == 'BinaryOperator' and b.get('opcode') in ('.*', '->*'):
                    # (obj.*pFunc)(args): the method named by pFunc (a pointer to a member function is its name)
                    o, f = kids(b)
                    return E(f'{self.ex(o).at(P_CALL)}[{self.ex(f)}]({self.args(args, fn_params(f.get("type")))})', P_CALL)
                raise Unsupported('member function pointer call')
            return self.tr.std.member_call(self, n, d, obj, args)
        if e.node['kind'] == 'CXXConversionDecl' and e.node.get('isImplicit'):
            return self.ex(obj)
        qualified = d.get('node') is not None and self.qualified(d['node'])
        if self.in_ctor_or_dtor and obj is not None and strip(obj).get('kind') == 'CXXThisExpr':
            # a call on this in a constructor or destructor goes to the class's own method, not to an override of a
            # class derived from it, which is not constructed yet (or no more): C4GUI::Window's constructor calls
            # UpdateOwnPos, which C4PlayerInfoListBox::PlayerListItem overrides with one that needs its icons
            qualified = True
        e.reached = True
        if e.kind == 'method' and e.node.get('storageClass') != 'static':
            a = self.args(args, self.params_of(e), scope=e.cls)
            return self.method_call(e, self.ex(obj), a, obj, qualified), self.ret_by_ptr(e)
        return self.call(e, obj, args), self.ret_by_ptr(e)

    def qualified(self, member_node):
        """a call Base::f() written with its class: no virtual dispatch"""
        return bool(member_node.get('_qualified'))

    def c_CXXOperatorCallExpr(self, n):
        c, *args = kids(n)
        e, _, d = self.callee_entity(c)
        if args and 'std::function' in (ty.qual_of(self.T(args[0]).text) if isinstance(self.T(args[0]).text, str) else ''):
            if d.get('name') == 'operator=' and len(args) >= 2:
                return E(f'{self.ex(args[0])} = {self.ex(args[1])}', P_ASSIGN)
            if d.get('name') == 'operator()':
                return E(f'{self.ex(args[0])}({self.args(args[1:], None)})', P_CALL)
        if e is None:
            lt = self.T(args[0]).strip() if args else None
            if lt is not None and lt.kind == 'rec' and '(lambda' in (lt.name or '') and d.get('name') == 'operator()':
                # a lambda is a JavaScript function; its reference parameters take pointers as the function's do
                op = self.tu.nodes.get(d.get('id')) or {}
                ps = [ty.parse(p['type']) for p in kids(op) if p.get('kind') == 'ParmVarDecl']
                return E(f'{self.ex(args[0]).at(P_CALL)}({self.args(args[1:], ps)})', P_CALL)
            return self.tr.std.operator(self, n, d.get('name') or '', args)
        e.reached = True
        if e.kind == 'method' and e.node.get('storageClass') != 'static':
            obj = self.ex(args[0])
            if e.node['name'] == 'operator=' and (e.node.get('isImplicit') or (
                    self.tr.is_copy_assign(e, e.cls) and '&&' not in ty.qual_of(e.node['type']))):
                if strip(args[0]).get('kind') in ('UnaryOperator',) and strip(args[0]).get('opcode') == '*' and \
                        strip(kids(strip(args[0]))[0]).get('kind') == 'CXXThisExpr':
                    # *this = cpy in a base class's method (C4Facet::Set, called by C4FacetSurface::Set): the base
                    # class's assignment, not the one of the object's own class
                    return E(f'{self.cref(e.cls)}.prototype.$assign.call({obj}, {self.ex(args[1])})', P_CALL)
                return E(f'{obj.at(P_CALL)}.$assign({self.ex(args[1])})', P_CALL)
            a = self.args(args[1:], self.params_of(e), scope=e.cls)
            return self.method_call(e, obj, a), self.ret_by_ptr(e)
        return self.call(e, None, args), self.ret_by_ptr(e)

    # -- objects

    def function_of(self, a):
        """a std::function made of a: a lambda or function as it is; an object with operator() (C4Command::MoveTo hands
        ObjectAddWaypoint(cObj) to C4PathFinder::Find) as a function that calls it (rt $fn)"""
        at = self.T(a).strip()
        if at.kind == 'rec' and not (at.name or '').startswith('(lambda') and tmpl_name(at) not in ('function', 'lambda'):
            try:
                functor = self.prog.class_of_type(at)
            except ValueError:
                functor = None
            if functor is not None:
                return E(f'{self.rt("$fn", "rt/std")}({self.ex(a)})', P_CALL)
        return self.ex(a)

    def construct(self, n, rec_t, args):
        st = rec_t.strip()
        q = ty.qual_of(st.text) if isinstance(st.text, str) else ''
        if 'std::function' in q or tmpl_name(st) == 'function':
            if not args:
                return E('null', P_ATOM)
            return self.function_of(args[0])
        if st.name in ('stat', 'tm', 'z_stream_s'):
            return E('{}', P_ATOM)
        if (st.name or '').startswith('std::array') or q.startswith('std::array'):
            return E(self.tr.std_array(self.mod, st), P_CALL)
        c = self.prog.class_of_type(st)
        if c is None:
            return self.tr.std.construct(self, n, st, args)
        cname = self.cref(c)
        c.reached = True
        ctor = self.find_ctor(c, n['ctorType'])
        if ctor is not None and self.prog.is_copy_ctor(ctor) and args:
            if ctor.node.get('isImplicit') or ctor.node.get('explicitlyDefaulted'):
                return self.copy(args[0])
            src = args[0]
            if strip(src).get('valueCategory') == 'prvalue' and ty.qual_of(ctor.node['type']).find('&&') >= 0:
                return self.ex(src)
            if ty.qual_of(ctor.node['type']).find('&&') >= 0:
                return self.copy(src)       # a move: a copy (the source is not used again)
            return E(f'new {cname}().$copy({self.ex(src)})', P_CALL)
        if ctor is None or (ctor.node.get('isImplicit') and not ctor.has_body()) or \
                (ctor.node.get('explicitlyDefaulted') and not args):
            if args and ctor is not None and self.prog.is_copy_ctor(ctor):
                return self.copy(args[0])
            return E(self.tr.new_default(self.mod, c), P_CALL)
        ctor.reached = True
        return E(f'new {cname}().{ctor.name}({self.args(args, self.params_of(ctor), scope=c)})', P_CALL)

    def copy(self, src):
        s = src
        while s['kind'] in ('ImplicitCastExpr', 'ParenExpr') and s.get('castKind') in (None, 'NoOp', 'UncheckedDerivedToBase', 'DerivedToBase'):
            s = kids(s)[0]
        if s['kind'] == 'MaterializeTemporaryExpr':
            inner = kids(s)[0]
            if inner.get('valueCategory') == 'prvalue':
                return self.ex(inner)
        if src.get('valueCategory') == 'prvalue':
            return self.ex(src)
        return E(f'{self.ex(src).at(P_CALL)}.$clone()', P_CALL)

    def find_ctor(self, c, ctor_type):
        want = norm_sig(re.sub(r'\s+noexcept.*$', '', ty.qual_of(ctor_type)))
        for m in c.members:
            if m.node['kind'] == 'CXXConstructorDecl':
                have = norm_sig(re.sub(r'\s+noexcept.*$', '', ty.qual_of(m.node['type'])))
                if have == want:
                    return m
        return None

    def x_CXXConstructExpr(self, n):
        args = kids(n)
        if n.get('elidable') and len(args) == 1:
            return self.ex(args[0])
        return self.construct(n, self.T(n), args)

    def x_CXXTemporaryObjectExpr(self, n):
        return self.construct(n, self.T(n), kids(n))

    def x_CXXScalarValueInitExpr(self, n):
        return E(zero(self.T(n)))

    def x_ImplicitValueInitExpr(self, n):
        t = self.T(n).strip()
        if t.kind == 'rec':
            if t.name.startswith('std::array'):
                return E(self.tr.std_array(self.mod, t), P_CALL)
            return E(self.tr.new_default(self.mod, self.class_of(t)), P_CALL)
        return E(self.tr.zero_of(self.mod, t))

    def x_CXXNewExpr(self, n):
        ks = kids(n)
        if n.get('isPlacement'):
            init = [k for k in ks if k['kind'] in ('CXXConstructExpr', 'CXXTemporaryObjectExpr', 'ParenListExpr', 'InitListExpr')]
            place = [k for k in ks if k not in init]
            p = place[0] if place else None
            while p is not None and p['kind'] in ('ImplicitCastExpr', 'ParenExpr', 'CStyleCastExpr', 'CXXStaticCastExpr'):
                p = kids(p)[0]
            if p is not None and init:
                tgt = self.ex(p)
                return E(f'{tgt.at(P_CALL)}.$assign({self.ex(init[0])})', P_CALL)
            raise Unsupported('placement new')
        t = self.T(n).strip().to.strip()
        if n.get('isArray'):
            size = [k for k in ks if k['kind'] not in ('CXXConstructExpr', 'InitListExpr', 'ImplicitValueInitExpr')]
            sz = self.index(size[0]) if size else E('0')
            if t.kind == 'rec':
                c = self.class_of(t)
                return E(f'{self.ptr("$oat")}({self.ptr("$oarr")}({sz}, () => {self.tr.new_default(self.mod, c)}), 0)', P_CALL)
            return E(f'{self.ptr("P")}({self.tr.array_of(self.mod, t, sz.s)}, 0)', P_CALL)
        if t.kind == 'rec':
            init = [k for k in ks if k['kind'] in ('CXXConstructExpr', 'CXXTemporaryObjectExpr', 'InitListExpr', 'ParenListExpr', 'ImplicitValueInitExpr')]
            if init:
                return self.ex(init[0])
            return E(self.tr.new_default(self.mod, self.class_of(t)), P_CALL)
        init = [k for k in ks if 'kind' in k]
        v = self.ex(init[0]) if init else E(self.tr.zero_of(self.mod, t))
        return E(f'{self.ptr("P")}([{v}], 0)', P_CALL)

    def x_CXXDeleteExpr(self, n):
        return E(f'{self.rt("$delete", "rt/std")}({self.ex(kids(n)[0])})', P_CALL)

    def x_CXXThrowExpr(self, n):
        if not kids(n):
            if not self.catch_var:
                raise Unsupported('rethrow outside catch')
            return E(f'{self.rt("$throw", "rt/std")}({self.catch_var})', P_CALL)
        return E(f'{self.rt("$throw", "rt/std")}({self.ex(kids(n)[0])})', P_CALL)

    catch_var = None

    def x_UnaryExprOrTypeTraitExpr(self, n):
        f = self.folded(n)
        if f is None:
            raise Unsupported('sizeof')
        return f

    def x_SizeOfPackExpr(self, n):
        v = self.pack_size(n)
        return E(str(v))

    def x_InitListExpr(self, n):
        t = self.T(n).strip()
        if t.kind == 'arr':
            return E(self.tr.array_init(self, t, n), P_CALL)
        if t.kind == 'rec' and t.name.startswith('std::array'):
            # an aggregate of one C array (_M_elems): {} or {a, b, ...} initializes that array
            if len(kids(n)) == 1 and self.T(kids(n)[0]).strip().kind == 'arr':
                return self.ex(kids(n)[0])
            if not kids(n):
                return E(self.tr.std_array(self.mod, t), P_CALL)
            return E('[' + ', '.join(self.ex(x).at(P_ASSIGN) for x in kids(n)) + ']', P_ATOM)
        if t.kind == 'rec' and self.prog.class_of_type(t) is None and ty.strip_ns(t.name) in C_STRUCT_FIELDS:
            # a C library's struct (getopt's struct option): an object with its fields (config.C_STRUCT_FIELDS)
            names = C_STRUCT_FIELDS[ty.strip_ns(t.name)]
            return E('{ ' + ', '.join(f'{nm}: {self.ex(v).at(P_ASSIGN)}' for nm, v in zip(names, kids(n))) + ' }', P_ATOM)
        if t.kind == 'rec' and self.prog.class_of_type(t) is None and self.local_record(t) is not None:
            # an unnamed struct declared in the function (C4SoundModifierList::Init's test_effects): an object with
            # its fields
            names = [f['name'] for f in kids(self.local_record(t)) if f.get('kind') == 'FieldDecl']
            return E('{ ' + ', '.join(f'{nm}: {self.ex(v).at(P_ASSIGN)}' for nm, v in zip(names, kids(n))) + ' }', P_ATOM)
        if t.kind == 'rec':
            c = self.class_of(t)
            fields = [m for m in c.members if m.kind == 'field']
            vals = kids(n)
            out = [f'const $o = {self.tr.new_default(self.mod, c)};']
            parts = []
            for f, v in zip(fields, vals):
                parts.append(f'$o.{f.name} = {self.ex(v).at(P_ASSIGN)}')
            return E(f'((($o) => ({", ".join(parts + ["$o"])}))({self.tr.new_default(self.mod, c)}))', P_ATOM) \
                if parts else E(self.tr.new_default(self.mod, c), P_CALL)
        if len(kids(n)) == 1:
            return self.ex(kids(n)[0])
        if not kids(n):
            return E(self.tr.zero_of(self.mod, t))
        raise Unsupported('initializer list')

    def local_record(self, t):
        """the unnamed struct a type names that the function being translated declares (unnamed struct at f:line:col)"""
        m = re.search(r'\(unnamed (?:struct|union) at [^)]*:(\d+):\d+\)', t.name or '')
        if not m or self.fe is None:
            return None
        stack = list(kids(self.fe.node))
        while stack:
            x = stack.pop()
            if x.get('kind') in ('CXXRecordDecl', 'RecordDecl') and not x.get('name') and \
                    (x.get('loc') or {}).get('line') == int(m.group(1)):
                return x
            stack.extend(kids(x))
        return None

    def x_ParenListExpr(self, n):
        if len(kids(n)) == 1:
            return self.ex(kids(n)[0])
        raise Unsupported('paren list')

    def x_LambdaExpr(self, n):
        rec, body = kids(n)[0], kids(n)[-1]
        op = [m for m in kids(rec) if m.get('kind') == 'CXXMethodDecl' and m.get('name') == 'operator()']
        if not op:
            # a generic lambda ([wCode](const auto &p) { ... }, C4KeyCodeEx::KeyCode2String): its operator() is a
            # template; the instantiation has the parameters' types and its own body
            for t in kids(rec):
                if t.get('kind') == 'FunctionTemplateDecl':
                    for m in kids(t):
                        if m.get('kind') == 'CXXMethodDecl' and m.get('name') == 'operator()' and \
                                any(c.get('kind') == 'CompoundStmt' for c in kids(m)) and not any(
                                    p.get('kind') == 'ParmVarDecl' and re.search(r'\bauto\b|type-parameter',
                                                                                 ty.qual_of(p.get('type', '')))
                                    for p in kids(m)):
                            op = [m]
                            body = [c for c in kids(m) if c.get('kind') == 'CompoundStmt'][0]
                            break
                if op:
                    break
        if not op:
            raise Unsupported('lambda')
        ps = []
        for p in kids(op[0]):
            if p.get('kind') == 'ParmVarDecl':
                ps.append(self.local_name(p, 'ref' if self.by_ptr(ty.parse(p['type'])) else 'val'))
        self.lambda_depth += 1
        try:
            lines = self.body(body, 1)
        finally:
            self.lambda_depth -= 1
        return E(f'(({", ".join(ps)}) => {{\n' + '\n'.join(lines) + '\n})', P_ATOM)

    def x_VAArgExpr(self, n):
        ap = self.ex(kids(n)[0])
        return E(f'{ap.at(P_CALL)}.a[{ap.at(P_CALL)}.i++]', P_MEMBER)

    def x_CXXStdInitializerListExpr(self, n):
        return self.ex(kids(n)[0])

    def x_CXXPseudoDestructorExpr(self, n):
        return E('(() => {})', P_ATOM)

    def x_CXXTypeidExpr(self, n):
        # typeid of a class is the class (of an object: its dynamic class, for polymorphic types as in C++),
        # of another type its name
        if 'typeArg' in n:
            t = ty.parse(n['typeArg']).strip()
            c = self.prog.class_of_type(t) if t.kind == 'rec' else None
            if c is not None:
                return E(self.cref(c))
            return E(json.dumps(ty.qual_of(n['typeArg'])), P_ATOM)
        x = kids(n)[0]
        t = self.T(x).strip()
        if t.kind == 'rec' and self.prog.class_of_type(t) is not None:
            return E(f'{self.ex(x).at(P_CALL)}.constructor', P_MEMBER)
        return E(json.dumps(ty.qual_of(x['type'])), P_ATOM)

    def x_ArrayInitLoopExpr(self, n):
        raise Unsupported('array copy')

    # ---- statements

    @staticmethod
    def gotos_in(n, label_id):
        if not isinstance(n, dict):
            return False
        if n.get('kind') == 'GotoStmt' and n.get('targetLabelDeclId') == label_id:
            return True
        return any(FuncEmitter.gotos_in(k, label_id) for k in n.get('inner', []) if k)

    def forward_goto(self, ks):
        """a label that forward gotos in the statements before it jump to: (first statement with such a goto, index of
        the label). Those statements become a labeled block, and the gotos break out of it."""
        for j, s in enumerate(ks):
            if s.get('kind') != 'LabelStmt':
                continue
            for i in range(j):
                if self.gotos_in(ks[i], s.get('declId')):
                    if any(k.get('kind') == 'DeclStmt' for k in ks[i:j]):
                        raise Unsupported('forward goto over a declaration')
                    return i, j
        return None

    def body(self, n, ind):
        self.scope_names.append(set())
        try:
            return self.block_body(n, ind)
        finally:
            self.scope_names.pop()

    def block_body(self, n, ind):
        out = []
        ks = kids(n)
        fg = self.forward_goto(ks)
        if fg is not None:
            i, j = fg
            label = ks[j]
            pad = '  ' * ind
            self.goto_labels[label['declId']] = f'$L_{label["name"]}'
            head = dict(n, inner=ks[:i])
            block = dict(n, inner=ks[i:j])
            rest = dict(n, inner=kids(label) + ks[j + 1:])
            return self.body(head, ind) + [pad + f'$L_{label["name"]}: {{'] + self.body(block, ind + 1) + [pad + '}'] + \
                self.body(rest, ind)
        for i, s in enumerate(ks):
            out.extend(self.st(s, ind))
            raii = self.raii_local(s)
            if raii:
                # a local whose destructor matters (config.RAII): the rest of the block, then the destructor
                rest = dict(n)
                rest['inner'] = ks[i + 1:]
                pad = '  ' * ind
                out.append(pad + 'try {')
                out.extend(self.body(rest, ind + 1))
                out.append(pad + f'}} finally {{ {raii} && {raii}.$dtor(); }}')
                break
        return out

    def raii_local(self, s):
        if s.get('kind') != 'DeclStmt':
            return None
        for d in kids(s):
            if d.get('kind') == 'VarDecl' and d['id'] in self.locals:
                t = ty.parse(d['type'])
                if t.kind == 'rec':
                    c = self.prog.class_of_type(t)
                    if c is None and is_smart(t):
                        # a std::unique_ptr of such a class (auto popper = pDraw->scriptUniform.Push(...)): deleting it
                        # runs the destructor
                        from .stdmap import tmpl, targ_str
                        _, targs = tmpl(t)
                        if targs:
                            try:
                                c = self.prog.class_of_type(ty.parse_str(targ_str(targs[0])).strip())
                            except ValueError:
                                c = None
                    if c is not None and any(c.key.endswith(k) for k in RAII):
                        loc = self.locals[d['id']]
                        if loc.mode == 'ref':
                            return None
                        return f'{loc.name}[0]' if loc.mode == 'box' else loc.name
        return None

    def st(self, n, ind):
        k = n.get('kind')
        pad = '  ' * ind
        if k is None:
            return []
        if k == 'CompoundStmt':
            return [pad + '{'] + self.body(n, ind + 1) + [pad + '}']
        if k == 'NullStmt':
            return [pad + ';']
        if k == 'DeclStmt':
            out = []
            for d in kids(n):
                out.extend(self.decl(d, ind))
            return out
        if k == 'ReturnStmt':
            if not kids(n):
                return [pad + ('return this;' if self.in_ctor else 'return;')]
            return [pad + f'return {self.ret_value(kids(n)[0])};']
        if k == 'IfStmt':
            c = kids(n)
            if n.get('hasInit') or n.get('hasVar'):
                # if (T x = ...) / if (init; cond): the declaration in a block of its own
                pre = []
                i = 0
                if n.get('hasInit'):
                    pre += self.st(c[0], ind + 1)
                    i += 1
                if n.get('hasVar'):
                    pre += self.st(c[i], ind + 1)
                    i += 1
                rest = dict(n)
                rest.pop('hasInit', None)
                rest.pop('hasVar', None)
                rest['inner'] = c[i:]
                return [pad + '{'] + pre + self.st(rest, ind + 1) + [pad + '}']
            cond, then = c[0], c[1]
            els = c[2] if len(c) > 2 else None
            out = [pad + f'if ({self.ex(cond)}) {{']
            out += self.block_tail(then, ind)
            if els is not None:
                if els['kind'] == 'IfStmt':
                    sub = self.st(els, ind)
                    out[-1] += ' else ' + sub[0].lstrip()
                    out += sub[1:]
                else:
                    out[-1] += ' else {'
                    out += self.block_tail(els, ind)
            return out
        if k == 'ForStmt':
            init, var, cond, inc, body = n['inner']
            init = init or None
            parts = [x.strip().rstrip(';') for x in self.st(init, 0)] if init and init.get('kind') else []
            if len(parts) > 1 and all(p.startswith('let ') for p in parts):
                i = 'let ' + ', '.join(p[4:] for p in parts)     # int i = 0, j = 0
            elif len(parts) > 1 and init.get('kind') != 'DeclStmt':
                i = ', '.join(parts)
            elif len(parts) > 1:
                # for (int32_t iLastW = 0, w, h; ...) with w and h boxed (their addresses are taken): the declarations
                # before the loop, in a block of their own (they end with the loop, as in C++)
                c = self.ex(cond).s if cond and cond.get('kind') else ''
                s = self.ex(inc, False).s if inc and inc.get('kind') else ''
                return [pad + '{'] + [pad + '  ' + p + ';' for p in parts] + \
                    [pad + f'  for (; {c}; {s}) {{'] + self.block_tail(body, ind + 1) + [pad + '}']
            else:
                i = parts[0] if parts else ''
            c = self.ex(cond).s if cond and cond.get('kind') else ''
            s = self.ex(inc, False).s if inc and inc.get('kind') else ''
            if i.count('\n'):
                raise Unsupported('for initializer')
            return [pad + f'for ({i}; {c}; {s}) {{'] + self.block_tail(body, ind)
        if k == 'WhileStmt':
            if n.get('hasVar'):
                # while (T x = ...) body: the declaration and the test at the top of each round
                c = kids(n)
                decl, cond, body = c[-3], c[-2], c[-1]
                out = [pad + 'while (true) {'] + self.st(decl, ind + 1)
                out.append(pad + f'  if (!({self.ex(cond)})) break;')
                return out + self.block_tail(body, ind)
            cond, body = kids(n)[-2:]
            return [pad + f'while ({self.ex(cond)}) {{'] + self.block_tail(body, ind)
        if k == 'DoStmt':
            body, cond = kids(n)
            return [pad + 'do {'] + self.block_tail(body, ind)[:-1] + [pad + f'}} while ({self.ex(cond)});']
        if k == 'BreakStmt':
            return [pad + 'break;']
        if k == 'ContinueStmt':
            return [pad + 'continue;']
        if k == 'SwitchStmt':
            if n.get('hasInit') or n.get('hasVar'):
                c = kids(n)
                pre = [x for s in c[:-2] for x in self.st(s, ind + 1)]
                rest = dict(n)
                rest.pop('hasInit', None)
                rest.pop('hasVar', None)
                rest['inner'] = c[-2:]
                return [pad + '{'] + pre + self.st(rest, ind + 1) + [pad + '}']
            cond, body = kids(n)[-2:]
            out = [pad + f'switch ({self.ex(cond)}) {{']
            for s in (kids(body) if body['kind'] == 'CompoundStmt' else [body]):
                out.extend(self.case(s, ind + 1))
            return out + [pad + '}']
        if k in ('CaseStmt', 'DefaultStmt'):
            return self.case(n, ind)
        if k == 'CXXTryStmt':
            return self.try_(n, ind)
        if k == 'CXXForRangeStmt':
            return self.for_range(n, ind)
        if k == 'LabelStmt':
            raise Unsupported('label')
        if k == 'GotoStmt':
            if n.get('targetLabelDeclId') in self.goto_labels:
                return [pad + f'break {self.goto_labels[n["targetLabelDeclId"]]};']
            raise Unsupported('goto')
        if k == 'AttributedStmt':
            return self.st(kids(n)[-1], ind)
        return [pad + self.ex(n, False).s + ';']

    def try_(self, n, ind):
        pad = '  ' * ind
        body, *catches = kids(n)
        out = [pad + 'try {'] + self.block_tail(body, ind)
        ev = f'$e{ind}'
        out[-1] += f' catch ({ev}) {{'
        first = True
        old = self.catch_var
        self.catch_var = ev
        for c in catches:
            vd = [x for x in kids(c) if x.get('kind') == 'VarDecl']
            blk = kids(c)[-1]
            if not vd:
                cond = None
            else:
                t = ty.parse(vd[0]['type']).strip()
                if t.kind == 'ptr':
                    t = t.to.strip()
                cls = self.prog.class_of_type(t) if t.kind == 'rec' else None
                if cls is not None:
                    cond = f'{ev} instanceof {self.cref(cls)}'
                elif t.kind == 'rec' and t.name and 'regex_error' in t.name:
                    # the runtime's regular expressions throw JavaScript's errors for a bad pattern
                    cond = f'{ev} instanceof Error || ({ev} && {ev}.$stdexception)'
                elif t.kind == 'rec' and t.name and ('exception' in t.name or t.name.endswith('_error') or
                                                     ty.strip_ns(t.name) in ('invalid_argument', 'out_of_range', 'bad_alloc')):
                    # a library exception: thrown by translated code (StdException) or the runtime, never a
                    # JavaScript error (those are bugs of the port and must not be taken for the game's errors); of
                    # its class or one derived from it (rt $isException)
                    cond = f'{self.rt("$isException", "rt/std")}({ev}, {json.dumps(ty.strip_ns(t.name).split("<")[0])})'
                else:
                    raise Unsupported(f'catch of {t.text}')
            head = ('if' if first else '} else if') + f' ({cond}) {{' if cond else ('{' if first else '} else {')
            out.append(pad + '  ' + head)
            if vd and vd[0].get('name'):
                nm = self.local_name(vd[0])
                out.append(pad + f'    const {nm} = {ev};')
            out += self.body(blk, ind + 2)
            first = False
            if cond is None:
                out.append(pad + '  }')
                break
        else:
            out.append(pad + '  } else {')
            out.append(pad + f'    throw {ev};')
            out.append(pad + '  }')
        self.catch_var = old
        out.append(pad + '}')
        return out

    def for_range(self, n, ind):
        pad = '  ' * ind
        ks = n['inner']
        decls = [kids(k)[0] for k in ks if k and k.get('kind') == 'DeclStmt']
        range_decl, loopvar = decls[0], decls[-1]
        body = ks[-1]
        rinit = kids(range_decl)[0]
        rt = self.T(rinit).strip()
        # clang expands a range-for into range, begin, end, condition, increment, loop
        # variable and body. For a class with its own iterator, translate that expansion
        # directly: the iterator protocol is C++ (operator++, operator*, operator!=), not
        # JavaScript's next().
        c = self.prog.class_of_type(rt)
        if c is not None and len(decls) == 4:
            begin_decl, end_decl = decls[1], decls[2]
            def loop_name(d):
                # clang's implicit __range/__begin/__end names repeat between loops in one block;
                # the emitter's temps are declared once in the function preamble
                if d.get('isImplicit'):
                    nm = self.temp()
                    self.locals[d['id']] = Local(nm, 'val')
                    return nm, True
                return self.local_name(d), False
            rname, ri = loop_name(range_decl)
            bname, bi = loop_name(begin_decl)
            ename, ei = loop_name(end_decl)
            boxed = loopvar['id'] in self.boxed and not loopvar.get('isImplicit')
            if boxed:
                # the loop variable's address is taken (C4GameObjects::CrossCheck: C4AulParSet(ball) forwards it)
                lname, li = self.local_name(loopvar, 'box'), False
            else:
                lname, li = loop_name(loopvar)
            cond, inc = ks[4], ks[5]
            lval = self.ex(kids(loopvar)[0]).s
            out = [pad + (f'{rname} = ' if ri else f'let {rname} = ') + f'{self.ex(rinit)};',
                   pad + (f'{bname} = ' if bi else f'let {bname} = ') + f'{self.ex(kids(begin_decl)[0])};',
                   pad + (f'{ename} = ' if ei else f'const {ename} = ') + f'{self.ex(kids(end_decl)[0])};',
                   pad + f'for (; {self.ex(cond)}; {self.ex(inc)}) {{',
                   pad + (f'  {lname} = ' if li else f'  const {lname} = ') + (f'[{lval}];' if boxed else f'{lval};')]
            try:
                ic = self.prog.class_of_type(ty.parse(begin_decl['type']).strip())
            except ValueError:
                ic = None
            if ic is not None and any(ic.key.endswith(k) for k in RAII_ITERATORS):
                # iterators that unregister from their container when destroyed (config.RAII_ITERATORS): after the
                # loop, however it is left
                inner = ['  ' + ln for ln in out[3:] + self.block_tail(body, ind)]
                return out[:3] + [pad + 'try {'] + inner + [pad + f'}} finally {{ {bname}.$dtor(); {ename}.$dtor(); }}']
            return out + self.block_tail(body, ind)
        rexpr = self.ex(rinit)
        lt = ty.parse(loopvar['type'])
        if lt.kind == 'ref' and lt.to.strip().kind == 'rec' and lt.to.strip().name in ('value_type', 'reference'):
            # for (auto &x : std::array<std::unique_ptr<T>, N>): clang prints the container's typedef (value_type &);
            # the element type is the container's first template argument
            from .stdmap import tmpl, targ_str
            _, targs = tmpl(rt)
            if targs:
                lt = ty.parse_str(targ_str(targs[0]) + ' &')
        if lt.kind == 'ref' and (self.by_ptr(lt) or self.smart_ref(lt)):
            # for (T &x : container) over numbers: by index
            idx = f'$i{ind}'
            arr = self.temp()
            nm = self.local_name(loopvar, 'ref')
            return [pad + f'{arr} = {self.tr.std.iterable(self, rexpr, rt)};',
                    pad + f'for (let {idx} = 0; {idx} < {arr}.length; {idx}++) {{',
                    pad + f'  const {nm} = {self.ptr("P")}({arr}, {idx});'] + self.block_tail(body, ind)
        if loopvar['id'] in self.boxed:
            nm = self.local_name(loopvar, 'box')
            return [pad + f'for (const $x{ind} of {self.tr.std.iterable(self, rexpr, rt)}) {{',
                    pad + f'  const {nm} = [$x{ind}];'] + self.block_tail(body, ind)
        nm = self.local_name(loopvar)
        if lt.kind == 'rec' and self.prog.class_of_type(lt) is not None and self.mutates(body, loopvar['id']):
            # for (auto x : container) of class values, and the body changes x: x is a copy (C4PlayerControlAssignment::
            # ResolveRefs adds a shift state to the copies of a referenced combo's keys, not to the referenced combo)
            return [pad + f'for (const $x{ind} of {self.tr.std.iterable(self, rexpr, rt)}) {{',
                    pad + f'  const {nm} = $x{ind}.$clone();'] + self.block_tail(body, ind)
        return [pad + f'for (const {nm} of {self.tr.std.iterable(self, rexpr, rt)}) {{'] + self.block_tail(body, ind)

    def mutates(self, body, var_id):
        """does the body assign to (a member of) the local var_id, or call a non-const method on it"""
        def base(x):
            while True:
                x = strip_casts(x)
                k = x.get('kind')
                if k in ('MemberExpr', 'ArraySubscriptExpr', 'ImplicitCastExpr', 'ParenExpr', 'MaterializeTemporaryExpr') and kids(x):
                    x = kids(x)[0]
                    continue
                return x
        def is_var(x):
            b = base(x)
            return b.get('kind') == 'DeclRefExpr' and b.get('referencedDecl', {}).get('id') == var_id
        stack = [body]
        while stack:
            x = stack.pop()
            k = x.get('kind')
            if k in ('CompoundAssignOperator',) or (k == 'BinaryOperator' and x.get('opcode') == '='):
                if kids(x) and is_var(kids(x)[0]):
                    return True
            elif k == 'UnaryOperator' and x.get('opcode') in ('++', '--') and kids(x) and is_var(kids(x)[0]):
                return True
            elif k == 'CXXOperatorCallExpr' and kids(x) and len(kids(x)) > 1:
                op = strip_casts(kids(x)[0])
                nm = (op.get('referencedDecl') or {}).get('name', '')
                if nm.startswith('operator') and nm[8:].strip() in ('=', '+=', '-=', '*=', '/=', '|=', '&=', '^=', '++', '--') \
                        and is_var(kids(x)[1]):
                    return True
            elif k == 'CXXMemberCallExpr' and kids(x):
                c = kids(x)[0]
                if c.get('kind') == 'MemberExpr' and kids(c) and is_var(kids(c)[0]):
                    m = self.prog.ref(self.tu, c.get('referencedMemberDecl'))
                    if m is not None and not ty.qual_of(m.node.get('type', {})).rstrip().endswith('const'):
                        return True
            stack.extend(kids(x))
        return False

    def case(self, n, ind):
        pad = '  ' * ind
        if n['kind'] == 'CaseStmt':
            c = kids(n)
            v = self.ex(c[0])
            return [pad + f'case {v}:'] + self.st_or_case(c[-1], ind)
        if n['kind'] == 'DefaultStmt':
            return [pad + 'default:'] + self.st_or_case(kids(n)[-1], ind)
        return self.st(n, ind + 1)

    def st_or_case(self, n, ind):
        if n['kind'] in ('CaseStmt', 'DefaultStmt'):
            return self.case(n, ind)
        if n['kind'] == 'IfStmt' and len(kids(n)) == 2 and kids(n)[1].get('kind') in ('CaseStmt', 'DefaultStmt') \
                and not n.get('hasInit') and not n.get('hasVar'):
            # case X: if (c) case Y: ...; break;  -- X jumps over Y's statements unless c (followed by a break)
            pad = '  ' * (ind + 1)
            return [pad + f'if (!({self.ex(kids(n)[0])})) break;'] + self.case(kids(n)[1], ind)
        return self.st(n, ind + 1)

    def block_tail(self, n, ind):
        pad = '  ' * ind
        if n['kind'] == 'CompoundStmt':
            return self.body(n, ind + 1) + [pad + '}']
        return self.st(n, ind + 1) + [pad + '}']

    def ret_value(self, e):
        x = e
        while x['kind'] in ('ExprWithCleanups',):
            x = kids(x)[0]
        if self.fe is not None and self.ret_by_ptr(self.fe):
            return self.addr(x).s
        if x['kind'] == 'CXXConstructExpr' and len(kids(x)) == 1:
            a = kids(x)[0]
            while a['kind'] in ('ImplicitCastExpr', 'ParenExpr') and a.get('castKind') in (None, 'NoOp', 'LValueToRValue'):
                a = kids(a)[0]
            if a['kind'] == 'DeclRefExpr' and a['referencedDecl'].get('kind') == 'VarDecl' and \
                    a['referencedDecl']['id'] in self.locals:
                node = self.tu.nodes.get(a['referencedDecl']['id'])
                loc = self.locals[a['referencedDecl']['id']]
                if node is not None and ty.parse(node['type']).kind == 'rec' and node.get('storageClass') != 'static' and loc.mode == 'val':
                    return loc.name
        return self.ex(e).s

    def decl(self, d, ind):
        pad = '  ' * ind
        k = d['kind']
        if k in ('TypedefDecl', 'TypeAliasDecl', 'CXXRecordDecl', 'UsingDecl', 'UsingDirectiveDecl', 'StaticAssertDecl',
                 'EnumDecl', 'UsingShadowDecl', 'FunctionDecl', 'NamespaceAliasDecl'):
            return []
        if k != 'VarDecl':
            raise Unsupported(f'declaration {k}')
        if d.get('storageClass') == 'static':
            return self.tr.static_local(self, d, ind)
        t = ty.parse(d['type'])
        init = [c for c in kids(d) if 'kind' in c and not c['kind'].endswith('Attr')]
        if is_va_list(d.get('type')):
            name = self.local_name(d)
            return [pad + f'let {name} = null;']
        if d['id'] in self.boxed:
            name = self.local_name(d, 'box')
            v = self.ex(init[0]).at(P_ASSIGN) if init else self.tr.zero_of(self.mod, t)
            st = t.strip()
            if d['id'] in self.byte_boxed and st.kind in ('int', 'float') and not st.n64:
                arr = BOX_TYPED[(st.bits, st.signed)] if st.kind == 'int' else ('Float32Array' if st.bits == 32 else 'Float64Array')
                return [pad + f'const {name} = {arr}.of({v});']
            return [pad + f'const {name} = [{v}];']
        kw = 'const' if d.get('constexpr') else 'let'
        if t.kind == 'ref':
            if self.by_ptr(t) or self.smart_ref(t):
                name = self.local_name(d, 'ref')
                return [pad + f'const {name} = {self.addr(init[0])};']
            name = self.local_name(d)
            return [pad + f'const {name} = {self.ex(init[0]).at(P_ASSIGN)};']
        name = self.local_name(d)
        if t.kind == 'rec':
            if not init:
                c = self.prog.class_of_type(t)
                if c is None:
                    return [pad + f'{kw} {name} = {self.tr.std.default(self, t)};']
                return [pad + f'{kw} {name} = {self.tr.new_default(self.mod, c)};']
            v = self.ex(init[0])
            if init[0].get('valueCategory') == 'lvalue' and strip(init[0]).get('kind') not in ('CXXConstructExpr',):
                v = E(f'{v.at(P_CALL)}.$clone()', P_CALL)
            return [pad + f'{kw} {name} = {v.at(P_ASSIGN)};']
        if t.kind == 'arr':
            if init:
                return [pad + f'const {name} = {self.tr.array_init(self, t, init[0])};']
            return [pad + f'const {name} = {self.tr.array_of(self.mod, t.to.strip(), str(t.n))};']
        if not init:
            return [pad + f'let {name} = {self.tr.zero_of(self.mod, t)};']
        if kw == 'const':
            self.consts.append(name)
        return [pad + f'{kw} {name} = {self.ex(init[0]).at(P_ASSIGN)};']


def fn_params(tyobj):
    """the parameter types of a function type, a pointer or a reference to one (R (&)(A, B)), or None"""
    t = ty.qual_of(tyobj) if tyobj else ''
    if not t or not t.rstrip().endswith(')'):
        return None
    depth, start = 0, None
    for i in range(len(t) - 1, -1, -1):
        if t[i] == ')':
            depth += 1
        elif t[i] == '(':
            depth -= 1
            if depth == 0:
                start = i
                break
    if start is None:
        return None
    inner = t[start + 1:-1].strip()
    if not inner or inner == 'void':
        return []
    out, depth, cur = [], 0, ''
    for ch in inner:
        if ch in '<(':
            depth += 1
        elif ch in '>)':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    try:
        return [ty.parse_str(x.strip()) for x in out]
    except Exception:
        return None


def is_va_list(t):
    if not isinstance(t, dict):
        return False
    q = (t.get('qualType') or '') + ' ' + (t.get('desugaredQualType') or '')
    return 'va_list' in q or '__va_list_tag' in q


def ret_of(s):
    """the return type of a printed function type"""
    if s.startswith('auto ') and '->' in s:
        return s[s.rfind('->') + 2:].strip()
    depth = 0
    for i, c in enumerate(s):
        if c == '<':
            depth += 1
        elif c == '>':
            depth -= 1
        elif c == '(' and depth == 0:
            if s[i:i + 3] in ('(*)', '(&)'):
                continue
            return s[:i].strip()
    return None


def norm_sig(s):
    s = ty.strip_ns(s)
    s = re.sub(r'\b(struct|class) ', '', s)
    for k, v in ty.TYPEDEFS.items():
        if re.search(r'\b' + re.escape(k) + r'\b', s) and re.fullmatch(r'[\w ]+', v):
            s = re.sub(r'\b' + re.escape(k) + r'\b', v, s)
    return re.sub(r'\s+', ' ', s).strip()


def zero(t):
    t = t.strip()
    if t.kind == 'bool':
        return 'false'
    if t.big:
        return '0n'
    if t.kind in ('int', 'float'):
        return '0'
    if t.kind in ('ptr', 'func', 'null'):
        return 'null'
    raise Unsupported(f'zero of {t.text}')


def fit(v, t):
    m = 1 << t.bits
    v &= m - 1
    if t.signed and v >= m >> 1:
        v -= m
    return v
