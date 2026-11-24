"""The C++ standard library and the C library, as the translated code uses them (CONVENTIONS.md):
calls of functions the trees do not contain (pruned with the library) are mapped here to the runtime
(web/games/openclonk/src/rt/std.ts, libc.ts) or to JavaScript.

  std::vector, std::list, std::deque     a JavaScript array; iterators are rt Iter objects (c, i)
  std::map, std::set                      rt StdMap, StdSet (ordered by the comparator)
  std::unordered_map, std::unordered_set  rt HashMap, HashSet (JavaScript Map/Set: insertion order)
  std::string                             rt StdString (bytes)
  std::unique_ptr, std::shared_ptr        the object itself (or null)
  std::function                           a JavaScript function
  std::pair                               rt StdPair
"""
import json
import re

from . import types as ty
from .emit import E, P_ATOM, P_CALL, P_MEMBER, P_ASSIGN, P_EQ, P_ADD, P_MUL, P_COND, P_UNARY, Unsupported, kids, strip, strip_casts
from .config import C_STRUCT_PREFIXES, C_STRUCT_FIELDS, C_STRUCT_DEFAULTS, PROFILE

SEQ = ('vector', 'list', 'deque', 'array', 'forward_list', 'basic_string_view')
ORDERED = ('map', 'set', 'multimap', 'multiset')
HASHED = ('unordered_map', 'unordered_set', 'unordered_multimap', 'unordered_multiset')
SMART = ('unique_ptr', 'shared_ptr', 'weak_ptr', '__shared_ptr_access', '__shared_ptr')
ITERS = ('__normal_iterator', '_List_iterator', '_List_const_iterator', '_Rb_tree_iterator', '_Rb_tree_const_iterator',
         '_Node_iterator', '_Node_const_iterator', '_Deque_iterator', 'reverse_iterator', 'move_iterator')


def tmpl(t):
    """the template name and arguments of a library class type: ('vector', ['int'])"""
    t = t.strip()
    if t.kind == 'ptr':
        t = t.to.strip()
    if t.kind != 'rec':
        return None, []
    tree = ty.tparse(t.name)
    if isinstance(tree, str):
        return tree, []
    return tree[0], tree[1]


def chrono_tick(t):
    """the nanoseconds of one tick of a std::chrono::duration type (duration<long, ratio<1, 1000>>: 1000000)"""
    _, targs = tmpl(t.strip())
    if len(targs) < 2:
        return 1
    m = re.findall(r'-?\d+', targ_str(targs[1]))
    num, den = (int(m[0]), int(m[1])) if len(m) >= 2 else (1, 1)
    return 10 ** 9 * num // den


def targ_str(a):
    if isinstance(a, str):
        return a
    return a[0] + '<' + ', '.join(targ_str(x) for x in a[1]) + '>'


def norm_targs(targs):
    return [re.sub(r'\s+', '', targ_str(a)).replace('std::', '') for a in targs]


class Std:
    def __init__(self, tr):
        self.tr = tr

    def convert_elem(self, fe, src, dst, v):
        """a value of type src converted to type dst (a class with a converting constructor)"""
        if norm_targs([src]) == norm_targs([dst]):
            return v
        dt, st = ty.parse_str(dst).strip(), ty.parse_str(src).strip()
        if dt.kind == 'rec' and tmpl(dt)[0] == 'basic_string' and st.kind in ('ptr', 'arr'):
            # const char * -> std::string (a map<std::string, ...> filled from string literals)
            return f'{self.rt(fe, "StdString")}.of({v})'
        c = fe.prog.class_of_type(ty.parse_str(dst))
        if c is None:
            return v
        want = re.sub(r'\s+', '', src).replace('std::', '')
        for m in c.members:
            if m.node['kind'] != 'CXXConstructorDecl':
                continue
            ps = [k for k in kids(m.node) if k.get('kind') == 'ParmVarDecl']
            if len(ps) != 1:
                continue
            pt = ps[0]['type']
            pt = pt.get('desugaredQualType', pt['qualType'])
            if re.sub(r'\s+|const|&|std::', '', pt) == re.sub(r'const|&', '', want):
                m.reached = True
                return f'new {fe.cref(c)}().{m.name}({v})'
        raise Unsupported(f'pair element conversion {src} -> {dst}')

    def rt(self, fe, name):
        return fe.mod.need(name, 'rt/std')

    # ---- types

    def default(self, fe, t):
        """a default-constructed library object of type t"""
        name, args = tmpl(t)
        if name in SEQ:
            if name == 'array':
                return self.tr.array_of(fe.mod, ty.parse_str(targ_str(args[0])), targ_str(args[1]))
            return '[]'
        if name in ORDERED:
            cmp_i = 2 if 'map' in name else 1
            cmp = ''
            if len(args) > cmp_i and not (isinstance(args[cmp_i], tuple) and args[cmp_i][0] == 'less'):
                ct = ty.parse_str(targ_str(args[cmp_i]))
                c = self.tr.prog.class_of_type(ct)
                if c is not None:
                    op = [m for m in c.members if m.kind == 'method' and m.node.get('name') == 'operator()']
                    if op:
                        op[0].reached = True
                        cmp = f'(a, b) => {self.tr.new_default(fe.mod, c)}.{op[0].name}(a, b)'
            elif args:
                # std::less<Key>: a key class with its own operator< (C4ID in the definition table)
                ct = ty.parse_str(targ_str(args[0]))
                c = self.tr.prog.class_of_type(ct)
                while c is not None:
                    # the key's operator<, or its base class's (StdCopyStrBuf: StdStrBuf::operator<)
                    op = [m for m in c.members if m.kind == 'method' and m.node.get('name') == 'operator<']
                    if op:
                        op[0].reached = True
                        cmp = f'(a, b) => a.{op[0].name}(b)'
                        break
                    bs = self.tr.prog.bases_of(c)
                    c = bs[0] if bs else None
            if name == 'multimap':
                # equal keys side by side (C4KeyboardInput::KeysByCode: every binding of one key code)
                return f'new {self.rt(fe, "StdMultiMap")}({cmp})'
            return f'new {self.rt(fe, "StdMap" if "map" in name else "StdSet")}({cmp})'
        if name == 'bitset':
            return f'new {self.rt(fe, "Bitset")}({targ_str(args[0])})'
        if name in HASHED:
            if PROFILE.game and name == 'unordered_set' and args and targ_str(args[0]).replace(' ', '') == 'C4Value*':
                # C4PropList::RefSet in the game: held weakly, as the port does not run the C++ locals' C4Value
                # destructors (rt WeakRefSet). Not in the headless simulation of the tests: a WeakRef keeps its value
                # alive until the running task ends, and a test's replay is one task
                return f'new {self.rt(fe, "WeakRefSet")}()'
            return f'new {self.rt(fe, "HashMap" if "map" in name else "HashSet")}()'
        if name in ('basic_string',):
            return f'new {self.rt(fe, "StdString")}()'
        if name in ('stack', 'queue', 'priority_queue'):
            return '[]'
        if name in SMART or name in ('function', 'lambda'):
            return 'null'
        if name == 'pair':
            return f'new {self.rt(fe, "StdPair")}({self.tr.zero_of(fe.mod, ty.parse_str(targ_str(args[0])))}, ' \
                   f'{self.tr.zero_of(fe.mod, ty.parse_str(targ_str(args[1])))})'
        if name == 'WeakRefSet':
            return f'new {self.rt(fe, "WeakRefSet")}()'
        if name in ITERS or name in ('integer_sequence', 'index_sequence', 'nullopt_t', 'in_place_t'):
            return 'null'
        if name in ('atomic',):
            return self.tr.zero_of(fe.mod, ty.parse_str(targ_str(args[0])))
        if name in C_STRUCT_DEFAULTS:
            return C_STRUCT_DEFAULTS[name]
        if name.startswith(C_STRUCT_PREFIXES):
            # a struct of a C library (SDL_Event, SDL_DisplayMode, FT_Matrix): an object whose members the library's
            # runtime module (rt/sdl.ts, rt/freetype.ts) fills
            return '{}'
        if name in ('time_point', 'duration'):
            # std::chrono: a number of nanoseconds (rt $chronoNow)
            return '0'
        if name == 'locale':
            # std::locale("C"): the port's streams always read numbers as the C locale does
            return 'null'
        if name in ('basic_stringstream', 'basic_istringstream'):
            return f'new {self.rt(fe, "IStringStream")}(\'\')'
        if name == 'regex_token_iterator':
            return f'new {self.rt(fe, "RegexTokenIterator")}()'
        raise Unsupported(f'library type {t.strip().text}')

    def iterable(self, fe, e, t):
        """a range-for's range as a JavaScript iterable"""
        name, _ = tmpl(t)
        st = t.strip()
        if st.kind == 'arr':
            return e.s
        if name in SEQ or name in ORDERED or name in HASHED or name in ('initializer_list', 'WeakRefSet', 'match_results'):
            return e.s
        c = self.tr.prog.class_of_type(st)
        if c is not None:
            return f'{e.at(P_CALL)}'   # a class of the engine with begin()/end(): made iterable by the runtime
        raise Unsupported(f'range over {st.text}')

    def construct(self, fe, n, t, args):
        args = [a for a in args if a['kind'] != 'CXXDefaultArgExpr']
        st = t.strip()
        if st.kind == 'rec' and (st.name or '').startswith('(lambda'):
            return fe.ex(args[0]) if args else E('null')
        name, targs = tmpl(t)
        if name in ('stack', 'queue'):
            return E('[]') if not args else E(f'{fe.ex(args[0]).at(P_CALL)}.slice()', P_CALL)
        if name == 'initializer_list':
            # a copy of an initializer list (a parameter taken by value, DeveloperList's in C4StartupAboutDlg.cpp): its array,
            # which nobody changes
            return fe.ex(args[0]) if args else E('[]')
        if name in SMART:
            if not args:
                return E('null')
            return fe.ex(args[0])
        if name == 'function':
            return fe.function_of(args[0]) if args else E('null')
        if name in SEQ or name in ORDERED or name in HASHED or name == 'basic_string' or name == 'pair':
            if not args:
                return E(self.default(fe, t), P_CALL)
            if len(args) == 1 and strip(args[0]).get('kind') not in ('CXXStdInitializerListExpr',):
                at = fe.T(args[0]).strip()
                an, _ = tmpl(at)
                if name == 'pair' and an == 'pair' and norm_targs(tmpl(at)[1]) != norm_targs(targs):
                    # a converting pair(pair<U1, U2>&&): convert each element
                    convs = [self.convert_elem(fe, targ_str(s), targ_str(d), f'$p.{f}')
                             for s, d, f in zip(tmpl(at)[1], targs, ('first', 'second'))]
                    return E(f'(($p) => new {self.rt(fe, "StdPair")}({convs[0]}, {convs[1]}))({fe.ex(args[0])})', P_CALL)
                if an == name or (name == 'basic_string' and an == 'basic_string'):
                    return self.copy(fe, fe.ex(args[0]), name)
                if name == 'basic_string':
                    return E(f'{self.rt(fe, "StdString")}.of({fe.ex(args[0])})', P_CALL)
            if name == 'pair':
                vals = []
                for a, ta in zip(args, targs):
                    v = fe.ex(a).s
                    tt = ty.parse_str(targ_str(ta)) if not isinstance(ta, str) or ta else None
                    if tt is not None and tt.strip().kind == 'rec' and 'basic_string' in (tt.strip().name or '') \
                            and fe.T(a).strip().kind in ('ptr', 'arr'):
                        v = f'{self.rt(fe, "StdString")}.of({v})'
                    vals.append(v)
                return E(f'new {self.rt(fe, "StdPair")}({", ".join(vals)})', P_CALL)
            if name == 'basic_string':
                return E(f'{self.rt(fe, "StdString")}.of({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)})', P_CALL)
            if name in SEQ and len(args) >= 1:
                lst = strip(args[0])
                if lst.get('kind') == 'CXXStdInitializerListExpr':
                    return fe.ex(lst)
                # vector(n[, value])
                el = ty.parse_str(targ_str(targs[0]))
                v = fe.ex(args[1]) if len(args) > 1 and args[1]['kind'] != 'CXXDefaultArgExpr' else None
                make = f'() => {v}' if v is not None else f'() => {self.tr.zero_of(fe.mod, el)}'
                return E(f'{self.rt(fe, "$filled")}({fe.index(args[0])}, {make})', P_CALL)
        if name in ITERS:
            if args and strip(args[0]).get('valueCategory') == 'lvalue':
                # a copy of an iterator variable (std::set<unsigned>::iterator iter = NextVAOID; --iter;): the copy moves
                # alone
                return E(f'{self.rt(fe, "$itcopy")}({fe.ex(args[0])})', P_CALL)
            return fe.ex(args[0]) if args else E('null')
        if name in ('integer_sequence', 'index_sequence', 'nullopt_t', 'in_place_t'):
            return E('null')
        if name == 'basic_istringstream':
            return E(f'new {self.rt(fe, "IStringStream")}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)})', P_CALL)
        if name == 'basic_regex':
            return E(f'new {self.rt(fe, "Regex")}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)})', P_CALL)
        if name == 'match_results':
            return E(f'new {self.rt(fe, "RegexMatch")}()', P_CALL)
        if (name in ORDERED or name in HASHED) and args and strip(args[0]).get('kind') == 'CXXStdInitializerListExpr':
            return E(f'{self.rt(fe, "$fill_list")}({self.default(fe, t)}, {fe.ex(strip(args[0]))})', P_CALL)
        if name in ORDERED and len(args) >= 2 and tmpl(fe.T(args[0]))[0] in ITERS:
            # set(first, last[, comp])
            base = self.default(fe, t)
            return E(f'{self.rt(fe, "$fill_from")}({base}, {fe.ex(args[0])}, {fe.ex(args[1])})', P_CALL)
        if name in ORDERED and len(args) == 1:
            # a comparator object
            c = fe.prog.class_of_type(fe.T(args[0]))
            if c is not None:
                op = [m for m in c.members if m.kind == 'method' and m.node.get('name') == 'operator()']
                if op:
                    op[0].reached = True
                    return E(f'((c) => new {self.rt(fe, "StdMap" if "map" in name else "StdSet")}'
                             f'((a, b) => c.{op[0].name}(a, b)))({fe.ex(args[0])})', P_CALL)
        if name in ('exception', 'runtime_error', 'logic_error', 'out_of_range', 'invalid_argument', 'length_error',
                    'domain_error', 'range_error', 'overflow_error', 'bad_alloc', 'regex_error'):
            a = fe.ex(args[0]).at(P_ASSIGN) if args else 'null'
            return E(f'new {self.rt(fe, "StdException")}({a}, {json.dumps(name)})', P_CALL)
        if name == 'bitset':
            return E(self.default(fe, t), P_CALL)
        if name in C_STRUCT_DEFAULTS and not args:
            return E(C_STRUCT_DEFAULTS[name], P_ATOM)
        if name.startswith(C_STRUCT_PREFIXES) and not args:
            # a C library's struct (SDL_DisplayMode mode; jpeg_decompress_struct cinfo;): an object its functions fill
            return E('{}', P_ATOM)
        if (name.startswith(C_STRUCT_PREFIXES) or name in C_STRUCT_FIELDS) and len(args) == 1:
            # a copy of one (ov_open_callbacks takes its ov_callbacks by value): its members
            return E(f'({{ ...{fe.ex(args[0]).at(P_ASSIGN)} }})', P_ATOM)
        if name in ('time_point', 'duration'):
            return fe.ex(args[0]) if args else E('0')
        if name == 'locale':
            return E('null')
        if name in ('basic_stringstream', 'basic_istringstream') and not args:
            return E(f'new {self.rt(fe, "IStringStream")}(\'\')', P_CALL)
        if name == 'uniform_real_distribution':
            # std::uniform_real_distribution<float>(a, b) as libstdc++ draws from it (C4ParticleValueProvider::Random)
            el = ty.parse_str(targ_str(targs[0])) if targs else ty.T('float', 64, True)
            return E(f'new {self.rt(fe, "UniformRealDistribution")}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)}, '
                     f'{el.bits})', P_CALL)
        if name == 'tuple' and len(args) == 1 and tmpl(fe.T(args[0]))[0] == 'tuple':
            # a tuple from another (return std::make_tuple("", 0) as std::tuple<std::string, int>): each element converted
            src = tmpl(fe.T(args[0]))[1]
            convs = [self.convert_elem(fe, targ_str(s), targ_str(d), f'$t[{i}]') for i, (s, d) in enumerate(zip(src, targs))]
            return E(f'(($t) => {self.rt(fe, "$tuple")}({", ".join(convs)}))({fe.ex(args[0])})', P_CALL)
        if name == 'regex_token_iterator':
            # std::sregex_token_iterator(first, last, regex, submatch); no arguments: the end
            return E(f'new {self.rt(fe, "RegexTokenIterator")}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)})', P_CALL)
        raise Unsupported(f'constructing {t.strip().text}')

    def copy(self, fe, e, name):
        if name in SEQ:
            return E(f'{e.at(P_CALL)}.slice()', P_CALL)
        return E(f'{e.at(P_CALL)}.$clone()', P_CALL)

    # ---- calls

    def call(self, fe, n, name, args):
        """a call of a function that is not in the trees: the C and C++ libraries"""
        try:
            return self.call_(fe, n, name, args)
        except IndexError:
            raise Unsupported(f'call of {name} with {len(args)} arguments')

    def call_(self, fe, n, name, args):
        a = lambda i: fe.ex(args[i])
        if name in ('move', 'forward', 'addressof', 'as_const'):
            if name == 'addressof':
                return fe.addr(args[0])
            return fe.ex(args[0])
        if name in ('min', 'max', 'lowest', 'epsilon', 'infinity') and not args:
            # std::numeric_limits<T>::max() and the like: constants of the call's type
            t = fe.T(n).strip()
            if t.kind == 'int':
                lo = -(1 << (t.bits - 1)) if t.signed else 0
                hi = (1 << (t.bits - 1)) - 1 if t.signed else (1 << t.bits) - 1
                v = hi if name == 'max' else lo
                from .emit import lit_int
                return E(lit_int(v, t.big), P_UNARY if v < 0 else P_ATOM)
            if t.kind == 'float':
                big = '3.4028234663852886e+38' if t.bits == 32 else '1.7976931348623157e+308'
                tiny = '1.1754943508222875e-38' if t.bits == 32 else '2.2250738585072014e-308'
                eps = '1.1920928955078125e-7' if t.bits == 32 else '2.220446049250313e-16'
                return E({'max': big, 'min': tiny, 'lowest': '-' + big, 'epsilon': eps, 'infinity': 'Infinity'}[name], P_UNARY)
        if name in ('min', 'max'):
            f = '$min' if name == 'min' else '$max'
            if len(args) == 1:
                return E(f'{self.rt(fe, f + "_list")}({a(0)})', P_CALL)
            lt = self.less_of(fe, fe.T(args[0]).strip())
            if lt is not None:
                # std::min/max of class values (C4Real): by the class's operator<
                return E(f'{self.rt(fe, f + "By")}({a(0)}, {a(1)}, {lt})', P_CALL)
            return E(f'{self.rt(fe, f)}({a(0)}, {a(1)})', P_CALL)
        if name is None:
            raise Unsupported('call of an unknown function')
        if name == 'swap':
            x, y = fe.ex(args[0]), fe.ex(args[1])
            return E(f'[{x}, {y}] = [{y}, {x}]', P_ASSIGN)
        if name in ('make_unique', 'make_shared'):
            t = fe.T(n).strip()
            _, targs = tmpl(t)
            cls_t = ty.parse_str(targ_str(targs[0]))
            if cls_t.kind == 'arr' or targ_str(targs[0]).endswith('[]'):
                el = ty.parse_str(targ_str(targs[0])[:-2].strip())
                return E(f'{fe.ptr("P")}({self.tr.array_of(fe.mod, el, fe.index(args[0]).s)}, 0)', P_CALL)
            return self.tr.construct_from_args(fe, cls_t, args)
        if name in ('sort', 'stable_sort'):
            return self.range_call(fe, name, args)
        if name == 'remove' and len(args) == 1:
            # the C library's remove(path) (StdFile.cpp EraseFile), not the algorithm std::remove(first, last, value)
            return E(f'{self.tr.libc(fe.mod, "remove")}({fe.args(args, None)})', P_CALL)
        if name in ('inserter', 'back_inserter'):
            # an output iterator that inserts into a container (std::set_difference, std::copy)
            return E(f'{self.rt(fe, "std_" + name)}({fe.ex(args[0])})', P_CALL)
        if name == 'now':
            # std::chrono::steady_clock::now()
            return E(f'{self.rt(fe, "$chronoNow")}()', P_CALL)
        if name == 'duration_cast':
            # std::chrono::duration_cast<D>(d): d truncated to D's ticks (in nanoseconds, as every duration here)
            return E(f'{self.rt(fe, "$durationCast")}({a(0)}, {chrono_tick(fe.T(n))})', P_CALL)
        if name in ('find', 'count') and len(args) == 3:
            # std::find of a class value: by its operator== (StdMeshMaterialProgram::AddParameterNames looks for a
            # StdCopyStrBuf by its text)
            eq = self.eq_of(fe, fe.T(args[2]).strip())
            if eq is None:
                eq = self.eq_elem(fe, args[0], fe.T(args[2]).strip())
            if eq is not None:
                return E(f'{self.rt(fe, "std_" + name)}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args)}, {eq})', P_CALL)
        if name in ('find', 'find_if', 'find_if_not', 'count', 'count_if', 'remove', 'remove_if', 'fill', 'uninitialized_fill', 'reverse', 'unique',
                    'replace', 'transform', 'set_difference',
                    'lower_bound', 'upper_bound', 'any_of', 'all_of', 'none_of', 'for_each', 'copy', 'max_element',
                    'min_element', 'distance', 'advance', 'next', 'prev', 'begin', 'end', 'equal', 'accumulate'):
            return self.range_call(fe, name, args)
        if name == 'abs' or name == 'labs' or name == 'llabs':
            t = fe.T(n).strip()
            if t.big:
                return E(f'{self.rt(fe, "$abs64")}({a(0)})', P_CALL)
            return E(f'Math.abs({a(0)}) | 0', 1)
        if name == 'get' and args:
            # std::get<i>(tuple): clang names the element in the function's type (__tuple_element_t<0UL, tuple<...>>)
            callee = strip_casts(kids(n)[0]) if kids(n) else {}
            m = re.search(r'__tuple_element_t<(\d+)UL', ty.qual_of(callee.get('type', '')))
            if m:
                return E(f'{a(0).at(P_CALL)}[{m.group(1)}]', P_MEMBER)
        if name == 'get' and n.get('_tuple'):
            raise Unsupported('std::get')
        if name == '__builtin_va_start':
            return fe.assign_to(args[0], fe.ex(args[0]), E('{ a: $va, i: 0 }', P_ATOM))
        if name == '__builtin_va_end':
            return E('void 0', P_UNARY)
        if name == '__builtin_va_copy':
            return fe.assign_to(args[0], fe.ex(args[0]), E(f'{{ a: {a(1)}.a, i: {a(1)}.i }}', P_ATOM))
        if name == 'make_tuple':
            return E(f'{self.rt(fe, "$tuple")}({fe.args(args, None)})', P_CALL)
        if name == 'make_pair':
            # std::make_pair copies its arguments (C4LangStringTable::PopulateStringTable clears key and value after):
            # a class value is copied, a pointer (or a shared_ptr) still points to the same object
            vals = []
            for x in args[:2]:
                v = fe.ex(x)
                xt = fe.T(x).strip()
                if xt.kind == 'rec' and tmpl(xt)[0] not in SMART and tmpl(xt)[0] not in ('function', 'lambda') and \
                        strip(x).get('valueCategory') != 'prvalue':
                    v = E(f'{self.rt(fe, "$copy")}({v})', P_CALL)
                vals.append(v.at(P_ASSIGN))
            return E(f'new {self.rt(fe, "StdPair")}({vals[0]}, {vals[1]})', P_CALL)
        if name in ('regex_search', 'regex_match', 'regex_replace'):
            return E(f'{self.rt(fe, "$" + name)}({fe.args(args, None)})', P_CALL)
        if name in ('stoul', 'stoi', 'stol'):
            # std::stoul(str, &pos, base): rt $stoul (throws std::invalid_argument and std::out_of_range as libstdc++)
            r = E(f'{self.rt(fe, "$stoul")}({fe.args(args, None)})', P_CALL)
            return r if name == 'stoul' else E(f'({r} | 0)', P_ATOM)
        if name in ('to_string',):
            return E(f'{self.rt(fe, "StdString")}.ofText(String({a(0)}))', P_CALL)
        if name in ('isnan', 'isinf', 'isfinite', 'signbit'):
            return E(f'{fe.mod.need("$" + name, "rt/libc")}({a(0)})', P_CALL)
        f = self.tr.libc(fe.mod, name)
        r = E(f'{f}({fe.args(args, None)})', P_CALL)
        t = fe.T(n).strip()
        if t.kind == 'float' and t.bits == 32 and not name.endswith('f'):
            # std::sqrt(float) and the like: the float overload, a float result
            return E(f'Math.fround({r})', P_CALL)
        return r

    def eq_of(self, fe, t):
        """(a, b) => a == b for a class type with an operator== taking its own class (or a base class's), or None"""
        if t.kind != 'rec':
            return None
        c = self.tr.prog.class_of_type(t)
        while c is not None:
            for m in c.members:
                ps = [k for k in kids(m.node) if k.get('kind') == 'ParmVarDecl'] if m.kind == 'method' else []
                if m.node.get('name') == 'operator==' and len(ps) == 1 and \
                        self.tr.prog.class_of_type(ty.parse(ps[0]['type']).strip()) is c:
                    m.reached = True
                    return f'(x, y) => x.{m.name}(y)'
            bs = self.tr.prog.bases_of(c)
            c = bs[0] if bs else None
        return None

    def eq_elem(self, fe, first, vt):
        """(x, v) => x == v for a range of class values and a value of another type, by the element class's operator==
        for that type (StdMeshMaterialProgram::GetParameterIndex: std::find over StdCopyStrBufs for a const char *,
        StdStrBuf::operator==(const char *)), or None"""
        if vt.kind not in ('ptr', 'int', 'float', 'bool'):
            return None
        q = ty.qual_of(first.get('type', ''))
        m = re.search(r'__normal_iterator<(?:const )?([\w:]+) \*', q) or re.search(r'vector<([\w:]+)>::(?:const_)?iterator', q)
        if not m:
            return None
        try:
            c = self.tr.prog.class_of_type(ty.parse_str(m.group(1)).strip())
        except ValueError:
            return None
        while c is not None:
            for mm in c.members:
                ps = [k for k in kids(mm.node) if k.get('kind') == 'ParmVarDecl'] if mm.kind == 'method' else []
                if mm.node.get('name') == 'operator==' and len(ps) == 1:
                    pt = ty.parse(ps[0]['type']).strip()
                    if pt.kind == vt.kind and (pt.kind != 'ptr' or pt.to.strip().kind == vt.to.strip().kind):
                        mm.reached = True
                        return f'(x, y) => x.{mm.name}(y)'
            bs = self.tr.prog.bases_of(c)
            c = bs[0] if bs else None
        return None

    def less_of(self, fe, t):
        """(a, b) => a < b for a class type with an operator< (its own or a base class's), or None"""
        if t.kind != 'rec':
            return None
        c = self.tr.prog.class_of_type(t)
        while c is not None:
            op = []
            for m in c.members:
                ps = [k for k in kids(m.node) if k.get('kind') == 'ParmVarDecl'] if m.kind == 'method' else []
                if m.node.get('name') == 'operator<' and len(ps) == 1 and \
                        self.tr.prog.class_of_type(ty.parse(ps[0]['type']).strip()) is c:
                    op.append(m)
            if op:
                op[0].reached = True
                return f'(x, y) => x.{op[0].name}(y)'
            bs = self.tr.prog.bases_of(c)
            c = bs[0] if bs else None
        return None

    def range_call(self, fe, name, args):
        parts = []
        for x in args:
            if x['kind'] == 'CXXDefaultArgExpr':
                break
            parts.append(fe.ex(x).at(P_ASSIGN))
        return E(f'{self.rt(fe, "std_" + name)}({", ".join(parts)})', P_CALL)

    def member_call(self, fe, n, d, obj, args):
        """obj.method(args) for a library class"""
        if obj is None:
            raise Unsupported(f'call of unknown {d.get("name")}')
        t = fe.T(obj).strip()
        if d.get('arrow') and t.kind == 'ptr':
            t = t.to.strip()
        name, targs = tmpl(t)
        m = d.get('name')
        so = strip(obj)
        if so.get('kind') == 'CXXOperatorCallExpr' and kids(so) and len(kids(so)) >= 2 and \
                tmpl(fe.T(kids(so)[1]))[0] == 'regex_token_iterator':
            # it->compare(...), it->length(), it->str() of a regex token iterator: the token (rt TokenMatch)
            o = fe.ex(obj)
            return E(f'{o.at(P_CALL)}.{m}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args if x["kind"] != "CXXDefaultArgExpr")})', P_CALL)
        if name in ('element_type', 'value_type', 'type'):
            # a container reached through a library typedef (shared_ptr<vector<T>>::element_type): a vector
            name = 'vector'
            targs = targs or ['int']
        o = fe.ex(obj)
        a = [fe.ex(x).at(P_ASSIGN) for x in args if x['kind'] != 'CXXDefaultArgExpr']
        A = ', '.join(a)
        if name in SEQ:
            if m == 'size' or m == 'length':
                return E(f'{o.at(P_CALL)}.length', P_MEMBER)
            if m == 'empty':
                return E(f'{o.at(P_CALL)}.length === 0', P_EQ)
            if m in ('push_back', 'emplace_back') or m == 'push_front' or m == 'emplace_front':
                el = ty.parse_str(targ_str(targs[0]))
                argt = fe.T(args[0]).strip() if args else None
                if m.startswith('emplace') and (len(args) != 1 or tmpl(argt)[0] is None and el.strip().kind == 'rec'
                                                and fe.prog.class_of_type(argt) is not fe.prog.class_of_type(el)
                                                or el.strip().kind == 'rec' and fe.prog.class_of_type(el) is not None
                                                and argt.kind == 'ptr'):
                    # emplace_back(args) constructs the element from them (Textures.emplace_back(surface.release()): a
                    # Tex from a C4Surface *)
                    v = self.tr.construct_from_args(fe, el, args).s
                else:
                    v = self.value_of(fe, args[0], el)
                if el.strip().kind == 'rec' and tmpl(el.strip())[0] == 'basic_string' and fe.T(args[0]).strip().kind in ('ptr', 'arr'):
                    # a std::string made of a C string (SourceFiles.emplace_back(szSource), C4Shader::LoadSlices)
                    v = f'{self.rt(fe, "StdString")}.of({v})'
                if el.strip().kind == 'rec' and fe.prog.class_of_type(el) is not None:
                    # objects in a vector know their place ($a, $i), for pointers into it
                    f = '$vpush' if 'back' in m else '$vunshift'
                    return E(f'{self.rt(fe, f)}({o}, {v})', P_CALL)
                js = 'push' if 'back' in m else 'unshift'
                return E(f'{o.at(P_CALL)}.{js}({v})', P_CALL)
            if m == 'pop_back':
                return E(f'{o.at(P_CALL)}.pop()', P_CALL)
            if m == 'pop_front':
                return E(f'{o.at(P_CALL)}.shift()', P_CALL)
            if m == 'back':
                return E(f'{o.at(P_CALL)}[{o.at(P_CALL)}.length - 1]', P_MEMBER)
            if m == 'front':
                return E(f'{o.at(P_CALL)}[0]', P_MEMBER)
            if m == 'clear':
                return E(f'{o.at(P_CALL)}.length = 0', P_ASSIGN)
            if m == 'reserve':
                # the capacity the vector keeps (C4ParticleChunk::ReserveSpace loops until it is large enough)
                return E(f'{self.rt(fe, "$reserve")}({o}, {a[0]})', P_CALL)
            if m == 'capacity':
                return E(f'{self.rt(fe, "$capacity")}({o})', P_CALL)
            if m == 'shrink_to_fit':
                return E('void 0', P_UNARY)
            if m == 'resize':
                el = ty.parse_str(targ_str(targs[0]))
                v = a[1] if len(a) > 1 else self.tr.zero_of(fe.mod, el)
                return E(f'{self.rt(fe, "resize")}({o}, {a[0]}, () => {v})', P_CALL)
            if m == 'at':
                return E(f'{o.at(P_CALL)}[{a[0]}]', P_MEMBER)
            if m in ('begin', 'cbegin', 'end', 'cend', 'rbegin', 'rend'):
                return E(f'{self.rt(fe, "$" + m.lstrip("c"))}({o})', P_CALL)
            if m == 'insert' and targs:
                el = ty.parse_str(targ_str(targs[0]))
                real = [x for x in args if x['kind'] != 'CXXDefaultArgExpr']
                if el.strip().kind == 'rec' and fe.prog.class_of_type(el) is not None:
                    if len(real) == 3 and tmpl(fe.T(real[1]).strip())[0] in ITERS:
                        # insert(pos, first, last) of class values: copies (C4PlayerControlAssignment::ResolveRefs inserts
                        # a referenced combo's keys and then adds shift states to its own)
                        return E(f'{self.rt(fe, "seq_insert")}({o}, {fe.ex(real[0])}, {fe.ex(real[1])}, {fe.ex(real[2])}, '
                                 f'(x) => x.$clone())', P_CALL)
                    if len(real) == 2:
                        return E(f'{self.rt(fe, "seq_insert")}({o}, {fe.ex(real[0])}, {self.value_of(fe, real[1], el)})', P_CALL)
            if m in ('erase', 'insert', 'emplace', 'remove', 'remove_if', 'sort', 'unique', 'reverse', 'assign', 'swap',
                     'splice', 'data', 'max_size'):
                return E(f'{self.rt(fe, "seq_" + m)}({o}{", " + A if A else ""})', P_CALL)
        if name in ORDERED or name in HASHED or name == 'WeakRefSet':
            if m in ('begin', 'cbegin', 'end', 'cend', 'rbegin', 'rend'):
                return E(f'{o.at(P_CALL)}.{m.lstrip("c")}()', P_CALL)
            if m == 'emplace' and 'map' in name and len(args) == 2:
                return E(f'{o.at(P_CALL)}.insert({A})', P_CALL)
            if m == 'insert' and 'map' in name and len(args) == 1:
                return E(f'{o.at(P_CALL)}.insertPair({A})', P_CALL)
            return E(f'{o.at(P_CALL)}.{m}({A})', P_CALL)
        if name == 'basic_string':
            if m == 'at':
                # an lvalue (out.at(i) = '\n' in CStdFont::BreakMessage)
                return E(f'{o.at(P_CALL)}.d[{fe.index(args[0])}]', P_MEMBER)
            return E(f'{o.at(P_CALL)}.{m}({A})', P_CALL)
        if name in ('bitset', 'match_results', 'sub_match', 'basic_regex'):
            return E(f'{o.at(P_CALL)}.{m}({A})', P_CALL)
        if name in ('stack', 'queue'):
            if m == 'emplace' and not [x for x in args if x['kind'] != 'CXXDefaultArgExpr']:
                # emplace(): a value-initialized element (C4ScriptUniform::Push)
                el = ty.parse_str(targ_str(targs[0]))
                return E(f'{o.at(P_CALL)}.push({self.tr.zero_of(fe.mod, el)})', P_CALL)
            if m == 'push' or m == 'emplace':
                el = ty.parse_str(targ_str(targs[0]))
                if m == 'emplace' and el.strip().kind == 'rec' and fe.prog.class_of_type(el) is not None and \
                        (len(args) != 1 or fe.prog.class_of_type(fe.T(args[0])) is not fe.prog.class_of_type(el)):
                    v = self.tr.construct_from_args(fe, el, args).s
                else:
                    v = self.value_of(fe, args[0], el)
                return E(f'{o.at(P_CALL)}.push({v})', P_CALL)
            if m == 'pop':
                return E(f'{o.at(P_CALL)}.{"pop" if name == "stack" else "shift"}()', P_CALL)
            if m == 'top' or m == 'back':
                return E(f'{o.at(P_CALL)}[{o.at(P_CALL)}.length - 1]', P_MEMBER)
            if m == 'front':
                return E(f'{o.at(P_CALL)}[0]', P_MEMBER)
            if m == 'empty':
                return E(f'{o.at(P_CALL)}.length === 0', P_EQ)
            if m == 'size':
                return E(f'{o.at(P_CALL)}.length', P_MEMBER)
        if name == '_Bit_reference':
            # std::vector<bool> is a JavaScript array of booleans; the proxy is the element
            if m == 'operator bool':
                return E(f'!!{o.at(P_UNARY)}', P_UNARY)
            if m == 'operator=':
                return E(f'{o.s} = {a[0]}', P_ASSIGN)
        if name == 'function':
            # std::function is a JavaScript function; its explicit bool conversion tests for empty
            if m == 'operator bool':
                return E(f'{o.at(P_CALL)} != null', P_EQ)
            if m == 'operator()':
                return E(f'{o.at(P_CALL)}({A})', P_CALL)
            if m == 'operator=':
                return E(f'{o.s} = {a[0]}', P_ASSIGN)
        if name in SMART:
            if m == 'get':
                return o
            if m == 'operator bool':
                return E(f'{o.at(P_EQ + 1)} != null', P_EQ)
            if m == 'reset':
                return fe.assign_to(obj, o, E(a[0] if a else 'null'))
            if m == 'release':
                tmp = fe.temp()
                return E(f'({tmp} = {o}, {o} = null, {tmp})', P_ATOM)
            if m == 'swap':
                x = fe.ex(args[0])
                return E(f'[{o}, {x}] = [{x}, {o}]', P_ASSIGN)
        if name == 'pair' and m in ('swap',):
            raise Unsupported('pair.swap')
        if name in ITERS:
            if m == 'base':
                return o
        if name in ('basic_istringstream', 'basic_stringstream', 'basic_istream', 'basic_ostream', 'basic_ios'):
            if m == 'imbue':
                # the C locale (the only one the port's streams know)
                return E('void 0', P_UNARY)
            if m in ('good', 'eof', 'fail', 'peek', 'get', 'put', 'str'):
                return E(f'{o.at(P_CALL)}.{m}({A})', P_CALL)
        if name == 'duration' and m == 'count':
            return E(f'{o.at(P_MUL)} / {chrono_tick(t)}', P_MUL)
        if m == 'what':
            return E(f'{o.at(P_CALL)}.what()', P_CALL)
        raise Unsupported(f'{name}::{m}')

    def value_of(self, fe, arg, el):
        """an argument stored into a container: class values are copied, temporaries taken"""
        if el.strip().kind == 'rec' and fe.prog.class_of_type(el) is not None:
            if strip(arg).get('valueCategory') == 'prvalue' or arg.get('valueCategory') == 'xvalue':
                return fe.ex(arg).at(P_ASSIGN)
            return f'{fe.ex(arg).at(P_CALL)}.$clone()'
        return fe.ex(arg).at(P_ASSIGN)

    def operator(self, fe, n, name, args):
        """an overloaded operator of a library class (or of a type the trees do not have)"""
        op = name[8:].strip() if name.startswith('operator') else name
        t = fe.T(args[0]).strip()
        tn, targs = tmpl(t)
        if tn == 'tuple' and op == '=' and self.callee_name(args[0]) == 'tie':
            # std::tie(a, b) = pair_or_tuple: each element is assigned to its target, in order
            # (C4MapScriptHost::InitializeMap: std::tie(*pmap_fg_surface, *pmap_bg_surface) = map->ReleaseSurfaces())
            targets = [x for x in kids(strip(args[0]))[1:] if x.get('kind') != 'CXXDefaultArgExpr']
            tmp = fe.temp()
            rhs = fe.ex(args[1])
            pair = tmpl(fe.T(args[1]).strip())[0] == 'pair'
            parts = [f'{tmp} = {rhs.at(P_ASSIGN)}']
            for i, x in enumerate(targets):
                v = E(f'{tmp}.{("first", "second")[i]}' if pair else f'{tmp}[{i}]', P_MEMBER)
                parts.append(fe.assign_to(x, fe.ex(x), v).s)
            return E('(' + ', '.join(parts) + ')', P_ATOM)
        o = fe.ex(args[0])
        if tn in SEQ:
            if op == '[]':
                ix = fe.index(args[1])
                return E(f'{o.at(P_CALL)}[{ix}]', P_MEMBER, elem=(o.at(P_CALL), ix.s))
            if op == '=':
                return E(f'{o.s} = {fe.ex(args[1]).at(P_CALL)}.slice()', P_ASSIGN)
            if op in ('==', '!='):
                r = E(f'{self.rt(fe, "seq_equal")}({o}, {fe.ex(args[1])})', P_CALL)
                return r if op == '==' else E('!' + r.at(P_UNARY), P_UNARY)
        if tn in ('stack', 'queue'):
            if op == '=':
                return E(f'{o.s} = {fe.ex(args[1]).at(P_CALL)}.slice()', P_ASSIGN)
            if op in ('==', '!='):
                r = E(f'{self.rt(fe, "seq_equal")}({o}, {fe.ex(args[1])})', P_CALL)
                return r if op == '==' else E('!' + r.at(P_UNARY), P_UNARY)
        if tn in ORDERED or tn in HASHED:
            if op == '[]':
                vt = ty.parse_str(targ_str(targs[1]))
                return E(f'{o.at(P_CALL)}.entry({fe.ex(args[1])}, () => {self.tr.zero_of(fe.mod, vt)}).second', P_MEMBER)
            if op == '=':
                return E(f'{o.s} = {fe.ex(args[1]).at(P_CALL)}.$clone()', P_ASSIGN)
        if tn in SMART:
            if op in ('->', '*'):
                return o
            if op == '[]':
                return E(f'{o.at(P_CALL)}[{fe.index(args[1])}]', P_MEMBER)
            if op == '=':
                r = args[1]
                rs = strip(r)
                if rs.get('kind') == 'CallExpr':
                    pass
                v = fe.ex(r)
                if fe.T(r).strip().kind == 'null':
                    v = E('null')
                src = self.moved_from(r)
                if src is not None:
                    sv = fe.ex(src)
                    return E(f'({o.s} = {sv}, {sv} = null)', P_ATOM)
                return fe.assign_to(args[0], o, v)
            if op in ('==', '!='):
                return E(f'{o.at(P_EQ + 1)} {op}{"=" if fe.ex(args[1]).s != "null" else ""} {fe.ex(args[1]).at(P_EQ + 1)}', P_EQ)
            if op == 'bool':
                return E(f'{o.at(P_EQ + 1)} != null', P_EQ)
        if tn == '_Bit_reference':
            if op == '=':
                return E(f'{o.s} = {fe.ex(args[1]).at(P_ASSIGN)}', P_ASSIGN)
            if op == 'bool':
                return E(f'!!{o.at(P_UNARY)}', P_UNARY)
        if t.kind == 'rec' and '(lambda' in (t.name or '') and op == '()':
            # a lambda is a JavaScript function
            return E(f'{o.at(P_CALL)}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args[1:])})', P_CALL)
        if tn == 'type_info' and op in ('==', '!='):
            # typeid(...) is the class (or the type's name): the same type is the same value
            return E(f'{o.at(P_EQ + 1)} {op}= {fe.ex(args[1]).at(P_EQ + 1)}', P_EQ)
        if tn and (tn.startswith(C_STRUCT_PREFIXES) or tn in C_STRUCT_FIELDS) and op == '=':
            # a C library's struct assigned (nv.it_value = nv.it_interval): a copy of its members
            return fe.assign_to(args[0], o, E(f'({{ ...{fe.ex(args[1]).at(P_ASSIGN)} }})', P_ATOM))
        if tn in ('time_point', 'duration'):
            if op == '-':
                return E(f'{o.at(P_ADD)} - {fe.ex(args[1]).at(P_ADD + 1)}', P_ADD)
            if op == '=':
                return fe.assign_to(args[0], o, fe.ex(args[1]))
        if tn in ('basic_stringstream', 'basic_ostream') and op == '<<':
            # a std::stringstream written to (C4StartupAboutDlg's credits: out << name << " (" << nick << ")\n"): rt IStringStream
            v = fe.T(args[1]).strip()
            if v.kind == 'rec' and 'basic_string' not in (v.name or ''):
                raise Unsupported(f'ostream << {v.text}')
            return E(f'{o.at(P_CALL)}.write({fe.ex(args[1]).at(P_ASSIGN)})', P_CALL)
        if tn in ('basic_istringstream', 'basic_stringstream', 'basic_istream', 'basic_ios'):
            # std::istringstream(s) >> value (StdMeshMaterialParserCtx::AdvanceInt/AdvanceFloat): rt IStringStream
            if op == '>>' and strip_casts(args[1]).get('kind') == 'DeclRefExpr' and \
                    strip_casts(args[1])['referencedDecl'].get('name') == 'ws':
                # >> std::ws: skips white space
                return E(f'{o.at(P_CALL)}.ws()', P_CALL)
            if op == '>>':
                v = fe.T(args[1]).strip()
                if v.kind not in ('int', 'float') or v.big:
                    raise Unsupported(f'istream >> {v.text}')
                kind = ('i' if v.signed else 'u') + str(v.bits) if v.kind == 'int' else 'f' + str(v.bits)
                return E(f'{o.at(P_CALL)}.read({fe.addr(args[1])}, {json.dumps(kind)})', P_CALL)
            if op == '!':
                return E(f'{o.at(P_CALL)}.fail()', P_CALL)
            if op == 'bool':
                return E(f'!{o.at(P_CALL)}.fail()', P_UNARY)
        if tn == 'regex_token_iterator':
            # rt RegexTokenIterator (C4TextureMap::LoadMap: for (auto it = cregex_token_iterator(...); it != end; ++it))
            if op in ('==', '!='):
                r = E(f'{o.at(P_CALL)}.eq({fe.ex(args[1])})', P_CALL)
                return r if op == '==' else E('!' + r.at(P_UNARY), P_UNARY)
            if op == '++':
                return E(f'{o.at(P_CALL)}.inc()', P_CALL)
            if op in ('->', '*'):
                return E(f'{o.at(P_CALL)}.v', P_MEMBER)
        if tn == 'uniform_real_distribution' and op == '()':
            return E(f'{o.at(P_CALL)}.call({fe.ex(args[1])})', P_CALL)
        if tn == 'function' and op == '()':
            return E(f'{o.at(P_CALL)}({", ".join(fe.ex(x).at(P_ASSIGN) for x in args[1:])})', P_CALL)
        if tn == 'function' and op == 'bool':
            return E(f'{o.at(P_CALL)} != null', P_EQ)
        if op == '+' and len(args) == 2 and tmpl(fe.T(args[1]))[0] == 'basic_string' and t.kind in ('ptr', 'arr'):
            # "text" + std::string
            return E(f'{self.rt(fe, "StdString")}.of({o}).plus({fe.ex(args[1])})', P_CALL)
        if tn == 'basic_string':
            if op == '[]':
                ix = fe.index(args[1])
                return E(f'{o.at(P_CALL)}.d[{ix}]', P_MEMBER, elem=(f'{o.at(P_CALL)}.d', ix.s))
            if op in ('=', '+=', '+', '==', '!=', '<', '>', '<=', '>='):
                f = {'=': 'assign', '+=': 'append', '+': 'plus', '==': 'eq', '!=': 'ne', '<': 'lt', '>': 'gt', '<=': 'le', '>=': 'ge'}[op]
                return E(f'{o.at(P_CALL)}.{f}({fe.ex(args[1])})', P_CALL)
        if tn in ('pair', 'bitset') and op == '=':
            return E(f'{o.at(P_CALL)}.$assign({fe.ex(args[1])})', P_CALL)
        if tn == 'pair' and op in ('<', '>'):
            return E(f'{self.rt(fe, "pair_" + ("lt" if op == "<" else "gt"))}({o}, {fe.ex(args[1])})', P_CALL)
        if tn == 'bitset' and op == '[]':
            return E(f'{o.at(P_CALL)}.d[{fe.index(args[1])}]', P_MEMBER)
        if tn == 'match_results' and op == '[]':
            return E(f'{o.at(P_CALL)}.at({fe.index(args[1])})', P_CALL)
        if tn in ('syntax_option_type', 'match_flag_type') or (t.kind == 'int'):
            b = fe.ex(args[1])
            if op in ('|=', '&=', '^='):
                return E(f'{o.s} {op} {b.at(P_ASSIGN)}', P_ASSIGN)
            if op in ('|', '&', '^'):
                return E(f'{o.at(P_UNARY)} {op} {b.at(P_UNARY)}', P_UNARY)
            if op == '~':
                return E(f'~{o.at(P_UNARY)}', P_UNARY)
        if tn in ITERS:
            if op == '*' or op == '->':
                return E(f'{o.at(P_CALL)}.v', P_MEMBER)
            if op == '++':
                if len(args) == 2:
                    return E(f'{o.at(P_CALL)}.postinc()', P_CALL)
                return E(f'{o.at(P_CALL)}.inc()', P_CALL)
            if op == '--':
                if len(args) == 2:
                    return E(f'{o.at(P_CALL)}.postdec()', P_CALL)
                return E(f'{o.at(P_CALL)}.dec()', P_CALL)
            if op in ('==', '!='):
                r = E(f'{o.at(P_CALL)}.eq({fe.ex(args[1])})', P_CALL)
                return r if op == '==' else E('!' + r.at(P_UNARY), P_UNARY)
            if op == '+':
                return E(f'{o.at(P_CALL)}.add({fe.ex(args[1])})', P_CALL)
            if op == '-':
                b = fe.T(args[1]).strip()
                if tmpl(b)[0] in ITERS:
                    return E(f'{o.at(P_CALL)}.i - {fe.ex(args[1]).at(P_CALL)}.i', P_ADD)
                return E(f'{o.at(P_CALL)}.add(-{fe.ex(args[1]).at(P_UNARY)})', P_CALL)
            if op in ('+=', '-='):
                return E(f'{o.at(P_CALL)}.i {op} {fe.ex(args[1])}', P_ASSIGN)
            if op == '=':
                return E(f'{o.s} = {fe.ex(args[1]).at(P_CALL)}.copy()', P_ASSIGN)
            if op in ('<', '>', '<=', '>='):
                return E(f'{o.at(P_CALL)}.i {op} {fe.ex(args[1]).at(P_CALL)}.i', P_EQ)
        raise Unsupported(f'operator{op} of {t.text}')

    @staticmethod
    def callee_name(r):
        """the name of the function a CallExpr calls directly, or None"""
        r = strip(r)
        if r.get('kind') != 'CallExpr' or not kids(r):
            return None
        c = kids(r)[0]
        while c.get('kind') == 'ImplicitCastExpr':
            c = kids(c)[0]
        return c['referencedDecl'].get('name') if c.get('kind') == 'DeclRefExpr' else None

    def moved_from(self, r):
        r = strip(r)
        if r.get('kind') == 'CallExpr':
            c = kids(r)[0]
            while c.get('kind') == 'ImplicitCastExpr':
                c = kids(c)[0]
            if c.get('kind') == 'DeclRefExpr' and c['referencedDecl'].get('name') == 'move':
                return kids(r)[1]
        return None
