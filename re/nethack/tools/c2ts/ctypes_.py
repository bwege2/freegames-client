"""C types as clang prints them ("const struct obj *", "char [80]", "int (*)(int, char *)"), parsed
into a small type model, with what the TypeScript port makes of each (see CONVENTIONS.md)."""
import re

INTS = {
    # name: (bits, signed)
    'char': (8, True), 'signed char': (8, True), 'unsigned char': (8, False),
    'short': (16, True), 'unsigned short': (16, False),
    'int': (32, True), 'unsigned int': (32, False),
    'long': (64, True), 'unsigned long': (64, False),
    'long long': (64, True), 'unsigned long long': (64, False),
    '_Bool': (8, False),
}


class T:
    kind = '?'

    def __repr__(self):
        return self.c()


class Void(T):
    kind = 'void'

    def c(self):
        return 'void'


class Int(T):
    kind = 'int'

    def __init__(self, name):
        self.name = name
        self.bits, self.signed = INTS[name]
        self.bool = name == '_Bool'

    def c(self):
        return self.name


class Float(T):
    kind = 'float'

    def __init__(self, name):
        self.name = name

    def c(self):
        return self.name


class Enum(T):
    """an enum: an int"""
    kind = 'int'

    def __init__(self, name):
        self.name = name
        self.bits, self.signed, self.bool = 32, True, False

    def c(self):
        return 'enum ' + self.name


class Rec(T):
    kind = 'rec'

    def __init__(self, tag, name):
        self.tag, self.name = tag, name

    def c(self):
        return f'{self.tag} {self.name}'


class Ptr(T):
    kind = 'ptr'

    def __init__(self, to):
        self.to = to

    def c(self):
        return self.to.c() + ' *'


class Arr(T):
    kind = 'arr'

    def __init__(self, of, n):
        self.of, self.n = of, n

    def c(self):
        return f'{self.of.c()} [{self.n if self.n is not None else ""}]'


class Func(T):
    kind = 'func'

    def __init__(self, ret, params, variadic, proto=True):
        self.ret, self.params, self.variadic, self.proto = ret, params, variadic, proto

    def c(self):
        return f'{self.ret.c()} ({", ".join(p.c() for p in self.params)}{", ..." if self.variadic else ""})'


class VaList(T):
    kind = 'valist'

    def c(self):
        return 'va_list'


class Opaque(T):
    """FILE and the like: objects of the runtime"""
    kind = 'opaque'

    def __init__(self, name):
        self.name = name

    def c(self):
        return self.name


TOKEN = re.compile(r'\s*((?:\w+::)*\((?:unnamed|anonymous)(?: (?:struct|union|enum))? at [^)]*\)|[A-Za-z_][A-Za-z_0-9]*|\d+|\.\.\.|[*()\[\],])')


def anon_key(name):
    """one spelling for an anonymous record: (unnamed at FILE:LINE:COL)"""
    name = re.sub(r'^(\w+::)+', '', name)
    if name.startswith('('):
        return re.sub(r'^\((?:unnamed|anonymous)(?: (?:struct|union|enum))? at ', '(unnamed at ', name)
    return name


class Parser:
    def __init__(self, s, typedefs):
        self.toks = []
        pos = 0
        s = s.strip()
        while pos < len(s):
            m = TOKEN.match(s, pos)
            if not m:
                raise ValueError(f'cannot parse type {s!r} at {pos}')
            self.toks.append(m.group(1))
            pos = m.end()
            while pos < len(s) and s[pos] == ' ':
                pos += 1
        self.i = 0
        self.typedefs = typedefs

    def peek(self):
        return self.toks[self.i] if self.i < len(self.toks) else None

    def take(self):
        t = self.toks[self.i]
        self.i += 1
        return t

    def specifiers(self):
        words = []
        tag = None
        while True:
            t = self.peek()
            if t in ('const', 'volatile', 'restrict', '__restrict', 'register', 'static', 'extern', 'inline', '__inline'):
                self.take()
                continue
            if t in ('struct', 'union', 'enum'):
                self.take()
                name = self.take()
                tag = (t, name)
                continue
            if t in ('unsigned', 'signed', 'short', 'long', 'int', 'char', 'void', 'double', 'float', '_Bool'):
                words.append(self.take())
                continue
            if t is not None and re.match(r'[A-Za-z_]', t) and not words and tag is None:
                words.append(self.take())
                continue
            break
        if tag:
            if tag[0] == 'enum':
                return Enum(tag[1])
            if tag[1] == '_IO_FILE':
                return Opaque('FILE')
            if tag[1] == '__va_list_tag':
                return VaList()
            return Rec(tag[0], anon_key(tag[1]))
        return self.base(words)

    def base(self, words):
        if not words:
            raise ValueError('no type in ' + ' '.join(self.toks))
        if len(words) == 1 and words[0] not in ('unsigned', 'signed', 'short', 'long', 'int', 'char', 'void', 'double', 'float', '_Bool'):
            name = words[0]
            if name == 'FILE':
                return Opaque('FILE')
            if name == 'va_list' or name == '__gnuc_va_list':
                return VaList()
            if name in self.typedefs:
                return parse(self.typedefs[name], self.typedefs)
            raise ValueError('unknown type name ' + name)
        if words == ['void']:
            return Void()
        if words in (['double'], ['float'], ['long', 'double']):
            return Float(' '.join(words))
        signed = None
        if 'unsigned' in words:
            signed = False
        elif 'signed' in words:
            signed = True
        rest = [w for w in words if w not in ('unsigned', 'signed', 'int')] or ['int']
        if rest == ['int'] or rest == []:
            core = 'int'
        elif rest == ['char']:
            core = 'char'
        elif rest == ['short']:
            core = 'short'
        elif rest == ['long']:
            core = 'long'
        elif rest == ['long', 'long']:
            core = 'long long'
        elif rest == ['_Bool']:
            return Int('_Bool')
        else:
            raise ValueError('bad int ' + ' '.join(words))
        if core == 'char':
            if signed is None:
                return Int('char')
            return Int('signed char' if signed else 'unsigned char')
        if signed is False:
            return Int('unsigned ' + core)
        return Int(core)

    def declarator(self, base):
        """abstract declarator: returns the type built on base"""
        # pointers
        ptrs = 0
        while self.peek() in ('*', 'const', 'volatile', 'restrict', '__restrict'):
            if self.take() == '*':
                ptrs += 1
        inner = None
        if self.peek() == '(' and self._is_nested():
            self.take()
            mark = self.i
            # parse the inner declarator later, on the type built from the suffixes
            depth = 1
            while depth:
                t = self.take()
                if t == '(':
                    depth += 1
                elif t == ')':
                    depth -= 1
            inner = (mark, self.i - 1)
        t = base
        for _ in range(ptrs):
            t = Ptr(t)
        t = self.suffixes(t)
        if inner:
            save, end = self.i, None
            self.i = inner[0]
            toks = self.toks
            sub = Parser.__new__(Parser)
            sub.toks = toks[inner[0]:inner[1]]
            sub.i = 0
            sub.typedefs = self.typedefs
            t = sub.declarator(t)
            self.i = save
        return t

    def _is_nested(self):
        # "(" starts a nested declarator if followed by "*" or "(" or "[" (not a parameter list)
        nxt = self.toks[self.i + 1] if self.i + 1 < len(self.toks) else None
        return nxt in ('*', '(', '[')

    def suffixes(self, base):
        sufs = []
        while self.peek() in ('[', '('):
            if self.take() == '[':
                n = None
                if self.peek() != ']':
                    n = int(self.take())
                assert self.take() == ']'
                sufs.append(('arr', n))
            else:
                params, variadic, proto = [], False, True
                if self.peek() == ')':
                    proto = False
                    self.take()
                else:
                    while True:
                        if self.peek() == '...':
                            self.take()
                            variadic = True
                        else:
                            pt = self.declarator(self.specifiers())
                            params.append(pt)
                        t = self.take()
                        if t == ')':
                            break
                        assert t == ',', t
                    if len(params) == 1 and isinstance(params[0], Void):
                        params = []
                sufs.append(('fn', params, variadic, proto))
        t = base
        for s in reversed(sufs):
            if s[0] == 'arr':
                if isinstance(t, VaList):
                    continue  # va_list is __va_list_tag[1]: one object
                t = Arr(t, s[1])
            else:
                t = Func(t, s[1], s[2], s[3])
        return t


_cache = {}


def drop_attributes(s):
    while '__attribute__' in s:
        i = s.index('__attribute__')
        j = s.index('(', i)
        depth = 0
        k = j
        while True:
            if s[k] == '(':
                depth += 1
            elif s[k] == ')':
                depth -= 1
                if depth == 0:
                    break
            k += 1
        s = s[:i] + s[k + 1:]
    return s


def parse(s, typedefs):
    key = s
    if key in _cache:
        return _cache[key]
    s = drop_attributes(s)
    p = Parser(s, typedefs)
    t = p.declarator(p.specifiers())
    if p.peek() is not None:
        raise ValueError(f'trailing tokens in type {s!r}: {p.toks[p.i:]}')
    _cache[key] = t
    return t


def of(node, typedefs):
    """the type of a clang node (its 'type': desugared if clang gives that)"""
    t = node['type']
    s = t.get('desugaredQualType') or t['qualType']
    return parse(s, typedefs)


def strip_arrays(t):
    while isinstance(t, Arr):
        t = t.of
    return t


def is_int(t):
    return isinstance(t, (Int, Enum))


def is_scalar(t):
    return isinstance(t, (Int, Enum, Float))


def ptr_kind(t):
    """what a pointer of type t is in TypeScript: 'obj' (a struct/union object or null), 'fn' (a function
    or null), 'any' (void *: whatever was cast to it) or 'ptr' (a Ptr: array and index, or null)"""
    assert isinstance(t, Ptr)
    to = t.to
    if isinstance(to, Rec):
        return 'obj'
    if isinstance(to, Func):
        return 'fn'
    if isinstance(to, Void):
        return 'any'
    if isinstance(to, (Opaque, VaList)):
        return 'obj'
    return 'ptr'


TYPED_ARRAYS = {
    (8, True): 'Int8Array', (8, False): 'Uint8Array', (16, True): 'Int16Array', (16, False): 'Uint16Array',
    (32, True): 'Int32Array', (32, False): 'Uint32Array', (64, True): 'Float64Array', (64, False): 'Float64Array',
}


def typed_array(t):
    """the typed array for an array of scalars of type t, or None"""
    if isinstance(t, (Int, Enum)):
        return TYPED_ARRAYS[(t.bits, t.signed)]
    if isinstance(t, Float):
        return 'Float64Array' if t.name != 'float' else 'Float32Array'
    return None
