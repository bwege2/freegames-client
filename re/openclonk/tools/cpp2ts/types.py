"""C++ types as clang prints them, classified for the translation (see CONVENTIONS.md)."""
import re

# builtin scalar types: name -> (kind, bits, signed)
BUILTIN = {
    'bool': ('bool', 1, False),
    'char': ('int', 8, True), 'signed char': ('int', 8, True), 'unsigned char': ('int', 8, False),
    'short': ('int', 16, True), 'unsigned short': ('int', 16, False),
    'int': ('int', 32, True), 'unsigned int': ('int', 32, False),
    'long': ('int', 64, True), 'unsigned long': ('int', 64, False),
    'long long': ('int', 64, True), 'unsigned long long': ('int', 64, False),
    'char16_t': ('int', 16, False), 'char32_t': ('int', 32, False), 'wchar_t': ('int', 32, True),
    'float': ('float', 32, True), 'double': ('float', 64, True),
    'void': ('void', 0, False),
}


# enum names (as clang prints them, namespaces dropped) -> (bits, signed); the program fills it
ENUMS = {}
# the short names of the program's classes (a class named like an enum elsewhere wins over it)
CLASS_NAMES = set()


class T:
    """kind: int, bool, float, void, rec, ptr, ref, arr, func, dep, null; enums are int with name set"""
    __slots__ = ('kind', 'bits', 'signed', 'name', 'to', 'n', 'text')

    def __init__(self, kind, bits=0, signed=False, name=None, to=None, n=None, text=''):
        self.kind, self.bits, self.signed, self.name, self.to, self.n, self.text = kind, bits, signed, name, to, n, text

    @property
    def big(self):
        """a 64-bit integer that is a bigint in TypeScript (int64_t, uint64_t, long long)"""
        return self.kind == 'int' and self.bits == 64 and self.name != 'n64'

    @property
    def n64(self):
        """a 64-bit integer kept as a number (long, size_t: sizes, counts, script integers; below 2^53)"""
        return self.kind == 'int' and self.bits == 64 and self.name == 'n64'

    @property
    def obj(self):
        """a class value or a pointer to one: a JavaScript object (or null)"""
        t = self.strip()
        return t.kind == 'rec' or (t.kind == 'ptr' and t.to.strip().kind == 'rec')

    @property
    def cptr(self):
        """a pointer that is a Ptr (to numbers, pointers, ...): not to a class, not a function"""
        t = self.strip()
        return t.kind == 'ptr' and t.to.strip().kind not in ('rec', 'func', 'void')

    @property
    def num(self):
        return self.kind in ('int', 'float') and not self.big

    def strip(self):
        """the type a reference refers to"""
        return self.to if self.kind == 'ref' else self

    def abbr(self):
        """short name for overload suffixes"""
        t = self.strip()
        if t.kind == 'int':
            return ('i' if t.signed else 'u') + str(t.bits)
        if t.kind == 'bool':
            return 'b'
        if t.kind == 'float':
            return 'f' + str(t.bits)
        if t.kind == 'ptr':
            return 'p' + t.to.abbr()
        if t.kind == 'rec':
            if t.name.startswith('(lambda'):
                return 'lambda'
            return re.sub(r'\W+', '_', strip_ns(t.name).split('<')[0])
        return 'x'

    def __repr__(self):
        return f'T({self.kind},{self.bits},{self.signed},{self.name},{self.to})'


def strip_ns(s):
    s = re.sub(r'\b[A-Za-z_]\w*::', '', s)
    return re.sub(r'(^|(?<=[\s<,(*&]))::', '', s)


def qual_of(tyobj):
    """the printed type of a JSON type object, desugared where clang gives that"""
    if isinstance(tyobj, str):
        return tyobj
    return tyobj.get('desugaredQualType') or tyobj.get('qualType')


INTPTR = ('intptr_t',)


def parse(tyobj):
    if isinstance(tyobj, dict):
        q = re.sub(r'^(const |volatile )+', '', tyobj.get('qualType', '')).strip()
        if q in INTPTR:
            # an integer that holds pointers too (the bytecode's operands): a number or the object
            return T('int', 32, True, name='intptr', text=q)
        if re.search(r'\bintptr_t\b', q):
            # pointers to and arrays of them (C4ValueArray::Sort's intptr_t *pPos holds object pointers)
            return parse_str(q)
        t = parse_str(qual_of(tyobj))
        if t.kind == 'int' and t.bits == 64 and re.search(BIG_SUGAR, q):
            t.name = None       # written as int64_t, uint64_t, long long: a bigint
        return t
    s = qual_of(tyobj)
    return parse_str(s)


# 64-bit integers written so are bigints; long, unsigned long, size_t and the like are numbers
BIG_SUGAR = r'\b(u?int64_t|long long|__int64|u?int_fast64_t|u?int_least64_t|uintmax_t|intmax_t)\b'


def parse_str(s):
    s0 = s
    s = s.strip()
    s = re.sub(r'^(const |volatile )+', '', s)
    s = re.sub(r'(\s*\bconst|\s*\bvolatile)+$', '', s)
    s = s.strip()
    if s.endswith('&&'):
        return T('ref', to=parse_str(s[:-2]), text=s0)
    if s.endswith('&'):
        return T('ref', to=parse_str(s[:-1]), text=s0)
    m = re.match(r'^(.*?)\s*&\s*(\[\d+\](\[\d+\])*)$', s)
    if m:
        # clang prints a reference to an array declared with auto (auto &v = s.intVec) as "int &[4]"
        return T('ref', to=parse_str(m.group(1) + ' ' + m.group(2)), text=s0)
    m = re.match(r'^(.*?)\s*\(([&*]+)\)\s*(\[\d*\](\[\d*\])*)$', s)
    if m:
        # char (&)[100], int (*)[4]: a reference or pointer to an array
        arr = parse_str(m.group(1) + ' ' + m.group(3))
        return T('ref' if m.group(2) == '&' else 'ptr', to=arr, text=s0)
    if s.startswith('std::function<') or s.startswith('function<'):
        # std::function<bool (int, int)>: a callable the runtime represents as a JavaScript function
        return T('rec', name=s, text=s0)
    top = _outside_templates(s)     # a function pointer as a template argument does not make a function type
    if '(*)' in top or '(&)' in top or ('(' in top and not top.endswith('*') and '(lambda' not in top
                                         and 'unnamed ' not in top and '(anonymous' not in top):
        return T('func', text=s0)
    if s.endswith('*'):
        return T('ptr', to=parse_str(s[:-1]), text=s0)
    m = re.match(r'^(.*?)\s*\[(\d*)\]$', s)
    if m:
        inner = re.match(r'^(.*?)\s*\[(\d*)\]((?:\[\d*\])*)$', s)
        return T('arr', to=parse_str(inner.group(1) + inner.group(3)), n=int(inner.group(2)) if inner.group(2) else None, text=s0)
    if s.startswith('enum (unnamed') or s.startswith('(unnamed enum') or '::(unnamed enum at ' in s:
        # a local unnamed enum (C4LangStringTable::PopulateStringTable: enum { PSTS_Key, PSTS_Val } state), or one of a
        # class (C4MusicFileOgg's enum { num_buffers = 4, buffer_size = 160*1024 })
        return T('int', 32, False, text=s0)
    s = re.sub(r'^(struct|class|union|enum) ', '', s)
    # a type of an anonymous namespace (C4MapCreatorS2.cpp's enum C4MCValueType) by its name
    s = s.replace('(anonymous namespace)::', '')
    if s in INTPTR:
        return T('int', 32, True, name='intptr', text=s0)
    if s in TYPEDEFS:
        t = parse_str(TYPEDEFS[s])
        if t.kind == 'int' and t.bits == 64 and re.search(BIG_SUGAR, s):
            t.name = None
        return t
    if s in ('std::nullptr_t', 'nullptr_t', 'decltype(nullptr)'):
        return T('null', text=s0)
    if s == '__int128' or s == 'unsigned __int128':
        return T('int', 128, s == '__int128', text=s0)
    q = s[2:] if s.startswith('::') else s
    e = ENUMS.get(q)
    if e is not None and not ('::' not in q and q in CLASS_NAMES):
        return T('int', e[0], e[1], name=strip_ns(s), text=s0)
    if s in BUILTIN:
        k, b, sg = BUILTIN[s]
        if k == 'int' and b == 64 and 'long long' not in s:
            return T(k, b, sg, name='n64', text=s0)
        return T(k, b, sg, text=s0)
    if s.startswith('typename ') or s.startswith('<') or 'type-parameter' in s:
        return T('dep', text=s0)
    td = class_typedef(s)
    if td is not None:
        return parse_str(td)
    return T('rec', name=s, text=s0)


# typedefs of library containers inside classes: 'Class::Name' and 'Name' (unless two classes differ) -> the type
CLASS_TYPEDEFS = {}
_CLASS_TYPEDEF_CLASH = set()


def add_class_typedef(qualified, name, q):
    CLASS_TYPEDEFS[qualified] = q
    if name in _CLASS_TYPEDEF_CLASH:
        return
    if CLASS_TYPEDEFS.get(name, q) != q:
        _CLASS_TYPEDEF_CLASH.add(name)
        del CLASS_TYPEDEFS[name]
        return
    CLASS_TYPEDEFS[name] = q


def class_typedef(s):
    """a type printed with a class's typedef of a library container (ShaderMap, ShaderMap::iterator): the
    container's type, or None"""
    if s in CLASS_NAMES:
        return None
    if s in CLASS_TYPEDEFS:
        return CLASS_TYPEDEFS[s]
    if '::' in s:
        head, tail = s.rsplit('::', 1)
        if head in CLASS_TYPEDEFS and head.split('::')[-1] not in CLASS_NAMES:
            return CLASS_TYPEDEFS[head] + '::' + tail
    return None


def _outside_templates(s):
    """s without the template argument lists (the text between balanced < and >)"""
    if '<' not in s:
        return s
    out, depth = [], 0
    for i, ch in enumerate(s):
        if ch == '<' and not s[:i].endswith('operator'):
            depth += 1
        elif ch == '>' and depth:
            depth -= 1
        elif not depth:
            out.append(ch)
    return ''.join(out)


def size_of(t):
    """sizeof for the types the translated code asks about (x86-64)"""
    if t.kind in ('int', 'float'):
        return t.bits // 8
    if t.kind == 'bool':
        return 1
    if t.kind == 'ptr':
        return 8
    raise ValueError(f'sizeof {t.text}')


# typedef names -> the types they stand for (the C library's; the program adds its own)
TYPEDEFS = {
    # C4Material.cpp: typedef C4MaterialReaction * C4MaterialReactionPtr; (new[] in CrossMapMaterials)
    'C4MaterialReactionPtr': 'C4MaterialReaction *',
    'int8_t': 'signed char', 'uint8_t': 'unsigned char', 'int16_t': 'short', 'uint16_t': 'unsigned short',
    'int32_t': 'int', 'uint32_t': 'unsigned int', 'int64_t': 'long', 'uint64_t': 'unsigned long',
    'size_t': 'unsigned long', 'ssize_t': 'long', 'ptrdiff_t': 'long', 'intptr_t': 'long', 'uintptr_t': 'unsigned long',
}


# ---- template type names as trees, for matching printed types to class specializations

def tparse(s):
    """'a::b<int, c<d>>' -> ('b', ['int', ('c', ['d'])]); namespaces dropped, true/false as 1/0"""
    s = s.strip().replace('(anonymous namespace)::', '')
    s = re.sub(r'\(lambda at [^()]*\)', 'lambda', s)      # as Program.spec_name names a lambda's class
    s = strip_ns(s)
    s = re.sub(r'^(struct|class|union) ', '', s)
    pos = [0]

    def norm(t):
        t = re.sub(r'\s*([*&])', r'\1', t.strip())
        t = re.sub(r'\s+', ' ', t)
        t = TYPEDEFS.get(t, t)
        return {'true': '1', 'false': '0'}.get(t, t)

    def item():
        start = pos[0]
        while pos[0] < len(s):
            c = s[pos[0]]
            if c == '<':
                name = s[start:pos[0]].strip()
                pos[0] += 1
                args = []
                while True:
                    args.append(item())
                    while pos[0] < len(s) and s[pos[0]] == ' ':
                        pos[0] += 1
                    c = s[pos[0]] if pos[0] < len(s) else '>'
                    pos[0] += 1
                    if c == '>':
                        break
                # what follows the arguments (' &', ' *'): part of this argument
                rest = pos[0]
                while pos[0] < len(s) and s[pos[0]] not in ',>':
                    pos[0] += 1
                suffix = norm(s[rest:pos[0]])
                return (name, args, suffix) if suffix else (name, args)
            if c in ',>':
                break
            pos[0] += 1
        return norm(s[start:pos[0]])

    return item()


def tmatch(printed, full):
    """does a printed type tree match a specialization's full tree (printed ones omit defaulted arguments)?"""
    if isinstance(printed, str) or isinstance(full, str):
        return printed == full
    if printed[0] != full[0] or len(printed[1]) > len(full[1]) or printed[2:] != full[2:]:
        return False
    return all(tmatch(a, b) for a, b in zip(printed[1], full[1]))


def omits_lambda(printed, full):
    """does the printed tree leave out an argument of the full tree that is (or contains) a lambda's class or a
    function type? Neither is ever a default argument, which a printed name may leave out."""
    if isinstance(printed, str) or isinstance(full, str):
        return False
    def text(t):
        return t if isinstance(t, str) else t[0] + '<' + ', '.join(text(x) for x in t[1]) + '>' + ''.join(t[2:])
    for a in full[1][len(printed[1]):]:
        if 'anon_' in text(a) or 'lambda' in text(a) or '(' in text(a):
            return True
    return any(omits_lambda(a, b) for a, b in zip(printed[1], full[1]))
