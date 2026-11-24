"""The program: clang's trees of all translation units, merged into entities (classes, functions, globals)
that the emitter writes as TypeScript. One declaration seen in several units is one entity: functions,
methods and globals by their mangled name, classes by their qualified name and template arguments."""
import json
import os
import re

from . import types as ty
from .config import MODULES, NAMES, NATIVE, SKIP, OPAQUE, LIB_ENUM_TYPES, LIB_TYPEDEFS

FUNCS = ('FunctionDecl', 'CXXMethodDecl', 'CXXConstructorDecl', 'CXXConversionDecl', 'CXXDestructorDecl')
RECORDS = ('CXXRecordDecl', 'ClassTemplateSpecializationDecl', 'RecordDecl')

OPS = {
    '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '%': 'mod', '+=': 'addAssign', '-=': 'subAssign',
    '*=': 'mulAssign', '/=': 'divAssign', '%=': 'modAssign', '==': 'eq', '!=': 'ne', '<': 'lt', '>': 'gt',
    '<=': 'le', '>=': 'ge', '!': 'not', '=': 'assign', '()': 'call', '[]': 'index', '<<': 'shl', '>>': 'shr',
    '&': 'and', '|': 'or', '^': 'xor', '~': 'compl', '&&': 'land', '||': 'lor', '++': 'inc', '--': 'dec',
    '<<=': 'shlAssign', '>>=': 'shrAssign', '&=': 'andAssign', '|=': 'orAssign', '^=': 'xorAssign', '->': 'arrow',
}


class TU:
    def __init__(self, path):
        self.name = os.path.basename(path)[:-5]
        with open(path) as f:
            self.root = json.load(f)
        self.nodes = {}
        self.parent = {}
        stack = [(self.root, None)]
        while stack:
            n, p = stack.pop()
            if 'id' in n:
                old = self.nodes.get(n['id'])
                # a declaration is listed again (templates list their specializations): keep the full one
                if old is None or len(n.get('inner', ())) > len(old.get('inner', ())) or n.get('completeDefinition'):
                    self.nodes[n['id']] = n
                    self.parent[n['id']] = p
            for c in n.get('inner', ()):
                stack.append((c, n))

    def up(self, n):
        return self.parent.get(n.get('id'))


class Entity:
    """kind: class, func, method, var, field, svar (static member)"""

    def __init__(self, kind, key, node, tu):
        self.kind, self.key = kind, key
        self.inst = [(tu, node)]      # every unit's copy of it
        self.cls = None               # owning class (methods, fields, static members)
        self.members = []             # classes: member entities in source order
        self.name = None              # TypeScript name
        self.module = None
        self.file = None
        self.native = False
        self.reached = False
        self.clash = False
        self.internal = False

    def best(self):
        """the instance with a body (functions) or a complete definition (classes)"""
        for tu, n in self.inst:
            if any(c.get('kind') == 'CompoundStmt' for c in n.get('inner', ())):
                return tu, n
        for tu, n in self.inst:
            if n.get('completeDefinition'):
                return tu, n
        if self.kind in ('svar', 'var'):
            # a static array declared in its class without its size (static const char *UniformNames[];) and defined
            # with it (const char *C4LandscapeRenderGL::UniformNames[C4LRU_Count+1];): the definition
            for tu, n in self.inst:
                if n.get('inner') and any(c.get('kind', '').endswith('Expr') or c.get('kind') == 'InitListExpr' for c in n['inner']):
                    return tu, n
            for tu, n in self.inst:
                q = ty.qual_of(n.get('type', '')).rstrip()
                if not q.endswith('[]'):
                    return tu, n
        return self.inst[0]

    @property
    def node(self):
        return self.best()[1]

    @property
    def tu(self):
        return self.best()[0]

    def has_body(self):
        return any(c.get('kind') == 'CompoundStmt' for c in self.node.get('inner', ()))

    def __repr__(self):
        return f'<{self.kind} {self.key}>'


def module_of(f):
    if not f:
        return None
    base = re.sub(r'\.(h|hpp|cpp|c)$', '', f)
    for pre, rep in MODULES:
        if base.startswith(pre):
            return rep + base[len(pre):]
    return None


class Program:
    def __init__(self, paths):
        self.tus = [TU(p) for p in paths]
        self.by_key = {}            # key -> Entity
        self.of_node = {}           # (tu name, id) -> Entity
        self.classes = []           # class entities
        self.class_trees = []       # (tree, entity)
        self.enum_vals = {}         # (tu name, EnumConstantDecl id) -> value
        self._cot = {}              # class_of_type cache
        self.anon_types = {}        # the printed type of an unnamed struct -> its class
        self.ctx = None             # the class being translated (for names printed without their outer class)
        self.ctx_ns = []            # the namespace of the function being translated, outside classes
        self.scopes = []            # classes of the functions being called (their parameters' types)
        # the C libraries' enum types (SDL_Scancode, SDL_bool: tools/libenums.h) are integers like the original's enums
        ty.ENUMS.update(LIB_ENUM_TYPES)
        for _k, _v in LIB_TYPEDEFS.items():
            ty.TYPEDEFS.setdefault(_k, _v)
        for tu in self.tus:
            self.collect(tu, tu.root, [], None, None)
        for e in list(self.by_key.values()):
            if e.kind == 'class':
                self.classes.append(e)
                tree = self.class_tree(e)
                self.class_trees.append((tree, e))
                ty.CLASS_NAMES.add(tree if isinstance(tree, str) else tree[0])
        self.name_all()

    # ---- collecting

    def collect(self, tu, n, ns, cls, file):
        anon_n = 0
        anon_f = 0
        last_anon = None
        prev = None
        for c in n.get('inner', ()):
            k = c.get('kind')
            f = c.get('_file', file)
            prev, before = c, prev
            if k == 'FieldDecl' and last_anon is not None:
                txt = ty.qual_of(c.get('type', ''))
                if 'unnamed' in txt or 'anonymous' in txt:
                    self.anon_types[re.sub(r'^(struct|union|class) ', '', txt.replace('const ', ''))] = last_anon
            if k in ('NamespaceDecl', 'LinkageSpecDecl'):
                self.collect(tu, c, ns + ([c['name']] if c.get('name') else []), None, f)
            elif k == 'ClassTemplateDecl':
                # the pattern is dependent: only its specializations are code
                for s in c.get('inner', ()):
                    if s.get('kind') == 'ClassTemplateSpecializationDecl' and s.get('completeDefinition'):
                        self.add_class(tu, s, ns, cls, f)
            elif k in RECORDS:
                if c.get('completeDefinition') and not c.get('isImplicit'):
                    # An out-of-line definition like `struct C4Landscape::P { ... };` is a
                    # top-level record whose parentDeclContextId names the owning class. Without
                    # this, C4Group::P and C4Landscape::P both become the class key "P" and their
                    # fields are merged.
                    outer = cls
                    if outer is None and c.get('parentDeclContextId'):
                        owner = self.of_node.get((tu.name, c['parentDeclContextId']))
                        if owner is not None and owner.kind == 'class':
                            outer = owner
                    if not c.get('name'):
                        # an unnamed struct or union: named by its place among its class's unnamed ones
                        anon_n += 1
                        c = dict(c)
                        c['name'] = f'$anon{anon_n}'
                        last_anon = self.add_class(tu, c, ns, outer, f)
                        tu.nodes[c['id']] = c
                    else:
                        self.add_class(tu, c, ns, outer, f)
            elif k == 'FunctionTemplateDecl':
                for s in c.get('inner', ()):
                    if s.get('kind') in FUNCS and s.get('mangledName'):
                        self.add_func(tu, s, ns, cls, f)
            elif k in FUNCS:
                if c.get('mangledName'):
                    owner = cls
                    if owner is None and k != 'FunctionDecl' and c.get('parentDeclContextId'):
                        # an explicit specialization of a member template, defined outside its class
                        # (template<> bool Ogre::DataStream::Peek<bool>() const): a method of that class
                        o = self.of_node.get((tu.name, c['parentDeclContextId']))
                        if o is not None and o.kind == 'class':
                            owner = o
                            # static as the member template it specializes (declared static in the class)
                            for _, cn in o.inst:
                                for m in cn.get('inner', ()):
                                    ms = [m] + [x for x in m.get('inner', ()) if x.get('kind') in FUNCS] \
                                        if m.get('kind') == 'FunctionTemplateDecl' else [m]
                                    if any(x.get('name') == c.get('name') and x.get('storageClass') == 'static' for x in ms):
                                        c['storageClass'] = 'static'
                    self.add_func(tu, c, ns, owner, f)
            elif k == 'VarDecl':
                if c.get('mangledName'):
                    kind = 'svar' if cls else 'var'
                    key = c['mangledName']
                    internal = not cls and (c.get('storageClass') == 'static' or key.startswith('_ZL'))
                    if internal:
                        key += '@' + str(module_of(f) or tu.name)
                    e = self.entity(kind, key, c, tu, f)
                    e.internal = internal
                    if cls and e.cls is None:
                        e.cls = cls
                        cls.members.append(e)
            elif k == 'TypedefDecl' and last_anon is not None and before is not None and c.get('name') and \
                    any(nd.get('id') == before.get('id') for _, nd in last_anon.inst):
                # typedef union { ... } Prop; (C4ScriptGuiWindowProperty): the unnamed class by the typedef's name
                self.anon_types[c['name']] = last_anon
                if cls is not None:
                    self.anon_types[ty.strip_ns(cls.key) + '::' + c['name']] = last_anon
            elif k in ('TypedefDecl', 'TypeAliasDecl') and not cls and c.get('name') and f and module_of(f):
                tt = c.get('type') or {}
                q = tt.get('desugaredQualType') or tt.get('qualType')
                if q and 'type-parameter' not in q and not q.startswith('typename'):
                    ty.TYPEDEFS.setdefault(c['name'], q)
            elif k in ('TypedefDecl', 'TypeAliasDecl') and cls and c.get('name') and f and module_of(f):
                # a class's typedef of a library container (StdMeshMatManager::ShaderMap): types printed with it
                # are the container's
                tt = c.get('type') or {}
                q = tt.get('desugaredQualType') or tt.get('qualType')
                if q and (q.startswith('std::') or q in ty.BUILTIN) and 'type-parameter' not in q:
                    # (C4Graph's typedef float ValueType too)
                    ty.add_class_typedef(ty.strip_ns(cls.key) + '::' + c['name'], c['name'], q)
            elif k == 'EnumDecl':
                self.add_enum(tu, c, (cls.key if cls else '::'.join(ns)))
            elif k == 'FieldDecl' and cls:
                if not c.get('name'):
                    anon_f += 1
                key = cls.key + '::' + (c.get('name') or f'$anonf{anon_f}')
                e = self.entity('field', key, c, tu, f)
                if e.cls is None:
                    e.cls = cls
                    cls.members.append(e)

    def add_enum(self, tu, c, scope=''):
        vals = []
        v = -1
        for k in c.get('inner', ()):
            if k.get('kind') != 'EnumConstantDecl':
                continue
            x = self.const_of(k)
            v = x if x is not None else v + 1
            self.enum_vals[(tu.name, k['id'])] = v
            vals.append(v)
        name = c.get('name')
        if not name:
            return
        fixed = c.get('fixedUnderlyingType')
        if fixed:
            t = ty.parse(fixed)
            rep = (t.bits, t.signed)
        else:
            neg = any(x < 0 for x in vals)
            rep = (32, True) if neg or all(x < 2 ** 31 for x in vals) else (32, False)
        # by every qualified form of its name: aul::ast::VarDecl::Scope, ast::VarDecl::Scope, ..., Scope
        parts = [p for p in (scope.split('::') if scope else [])] + [name]
        for i in range(len(parts)):
            ty.ENUMS['::'.join(parts[i:])] = rep

    def const_of(self, k):
        stack = list(k.get('inner', ()))
        while stack:
            n = stack.pop(0)
            if n.get('kind') == 'ConstantExpr' and 'value' in n:
                try:
                    return int(n['value'])
                except ValueError:
                    return None
            stack[:0] = n.get('inner', ())
        return None

    def enum_value(self, tu, id_):
        return self.enum_vals.get((tu.name, id_))

    def entity(self, kind, key, node, tu, f):
        e = self.by_key.get(key)
        if e is None:
            e = Entity(kind, key, node, tu)
            e.file = f
            self.by_key[key] = e
        elif not any(n is node for _, n in e.inst):
            e.inst.append((tu, node))
        # a function or variable belongs to the file that defines it (its body, its initial value)
        if f and kind in ('func', 'var') and (any(c.get('kind') == 'CompoundStmt' for c in node.get('inner', ()))
                                             or (kind == 'var' and node.get('storageClass') != 'extern')):
            if not getattr(e, '_defined', False):
                e.file = f
                e._defined = True
        self.of_node[(tu.name, node['id'])] = e
        return e

    def add_class(self, tu, c, ns, outer, f):
        key = '::'.join(ns + [self.spec_name(tu, c)])
        if outer:
            key = outer.key + '::' + self.spec_name(tu, c)
        e = self.entity('class', key, c, tu, f)
        e.ns = ns
        if outer and e.cls is None:
            e.cls = outer
        self.collect(tu, c, ns, e, f)
        return e

    def add_func(self, tu, c, ns, cls, f):
        if c.get('name', '').startswith('__builtin'):
            return
        key = c['mangledName']
        internal = not cls and (c.get('storageClass') == 'static' or key.startswith('_ZL') or 'anonymous' in '::'.join(ns)) \
            and bool(f) and f.endswith(('.cpp', '.c'))
        if internal:
            key += '@' + str(module_of(f) or tu.name)
        e = self.entity('func', key, c, tu, f)
        e.internal = internal
        e.ns = ns
        if cls and e.cls is None:
            e.kind = 'method'
            e.cls = cls
            cls.members.append(e)
        # classes and enums declared inside the function
        for body in c.get('inner', ()):
            if body.get('kind') == 'CompoundStmt':
                self.local_decls(tu, body, ns, f, c.get('name', 'f'))

    def local_decls(self, tu, n, ns, f, fname):
        for x in n.get('inner', ()):
            k = x.get('kind')
            if k in RECORDS and x.get('completeDefinition') and not x.get('isImplicit') and x.get('name'):
                self.add_class(tu, x, ns, None, f)
            elif k == 'EnumDecl':
                self.add_enum(tu, x)
            elif k in ('LambdaExpr',):
                continue
            elif 'inner' in x:
                self.local_decls(tu, x, ns, f, fname)

    def spec_name(self, tu, c):
        """name<args> of a class (specialization), the arguments canonical"""
        args = []
        for a in c.get('inner', ()):
            if a.get('kind') != 'TemplateArgument':
                continue
            inner = a.get('inner', ())
            if inner and all(x.get('kind') == 'TemplateArgument' for x in inner):
                args += [self.targ(tu, x) for x in inner]      # a parameter pack: its arguments
            elif a.get('isPack') or ('type' not in a and 'value' not in a and not inner):
                continue                                         # an empty pack
            else:
                args.append(self.targ(tu, a))
        if c.get('kind') != 'ClassTemplateSpecializationDecl':
            if not c.get('name') and (c.get('definitionData') or {}).get('isLambda'):
                # a lambda's class: every lambda is a JavaScript function, so templates over lambdas are one class
                return 'lambda'
            return c.get('name') or ('anon_' + str((c.get('loc') or {}).get('line', c['id'])))
        return c['name'] + '<' + ', '.join(args) + '>'

    def targ(self, tu, a):
        if 'value' in a:
            return str(a['value'])
        ks = a.get('inner', ())
        if ks:
            s = self.type_node(tu, ks[0])
            if s is not None:
                return s
        return ty.qual_of(a.get('type', ''))

    def type_node(self, tu, n):
        """a type node of the tree as clang prints the canonical type"""
        k = n.get('kind')
        ks = n.get('inner', ())
        if k == 'RecordType' and 'decl' in n:
            d = tu.nodes.get(n['decl']['id'])
            if d is not None:
                s = self.spec_name(tu, d)
                p = tu.up(d)
                if p is not None and p.get('kind') in RECORDS and p.get('name'):
                    # a class inside a class with its outer class: C4KeyCB<C4FileSelDlg::ListItem> and
                    # C4KeyCB<C4StartupPlrSelDlg::ListItem> are two classes
                    s = self.spec_name(tu, p) + '::' + s
                return s
        if k == 'BuiltinType':
            return n['type']['qualType']
        if k in ('PointerType', 'LValueReferenceType', 'RValueReferenceType') and ks:
            s = self.type_node(tu, ks[0])
            if s is not None and '(' in s and not s.endswith((' *', ' &', '&&')) and n.get('type'):
                # a pointer to a function (or a reference to one): as clang prints it, R (*)(A)
                return ty.qual_of(n['type'])
            return None if s is None else s + {'PointerType': ' *', 'LValueReferenceType': ' &',
                                                'RValueReferenceType': ' &&'}[k]
        if k == 'QualType' and ks:
            s = self.type_node(tu, ks[0])
            q = n.get('qualifiers', '')
            return None if s is None else (q + ' ' + s if q else s)
        if k in ('ElaboratedType', 'TypedefType', 'SubstTemplateTypeParmType', 'TemplateSpecializationType',
                 'ParenType', 'DecltypeType', 'UsingType') and ks:
            return self.type_node(tu, ks[-1] if k == 'TemplateSpecializationType' else ks[0])
        if k == 'EnumType':
            # qualified: ChunkBase<Ogre::Mesh::ChunkID> and ChunkBase<Ogre::Skeleton::ChunkID> are two classes
            return ty.qual_of(n.get('type', ''))
        t = n.get('type')
        return ty.qual_of(t) if t else None

    def class_tree(self, e):
        # the last part of the qualified name (outside template arguments)
        depth, last = 0, 0
        k = e.key
        for i, ch in enumerate(k):
            if ch == '<':
                depth += 1
            elif ch == '>':
                depth -= 1
            elif ch == ':' and depth == 0 and k[i:i + 2] == '::':
                last = i + 2
        return ty.tparse(k[last:])

    # ---- lookups

    def ref(self, tu, id_):
        """the entity a node id of unit tu stands for"""
        e = self.of_node.get((tu.name, id_))
        if e is not None:
            return e
        n = tu.nodes.get(id_)
        if n is not None and n.get('mangledName'):
            return self.by_key.get(n['mangledName'])
        return None

    def class_of_type(self, t):
        """the class entity of a record type (T) or None"""
        t = t.strip()
        if t.kind != 'rec':
            return None
        cached = self._cot.get(t.name)
        if cached is not None or t.name in self._cot:
            return cached
        anon = self.anon_types.get(re.sub(r'^(struct|union|class) ', '', t.name))
        if anon is not None:
            return anon
        tree = ty.tparse(t.name)
        if isinstance(tree, tuple) and tree[0] == 'StdIntAdapt' and len(tree[1]) == 1:
            # StdIntAdapt<T, int_t = int32_t>: the one-argument spelling means int_t = int
            tree = ('StdIntAdapt', [tree[1][0], 'int'])
        if isinstance(tree, tuple) and tree[0].split('::')[-1] == 'CallbackButton' and len(tree[1]) == 1:
            # C4GUI::CallbackButton<CallbackDlg, Base = C4GUI::Button>: the one-argument spelling means Base = Button (the
            # trees do not keep the default; C4StartupOptionsDlg uses both CallbackButton<Dlg> and <Dlg, SmallButton>)
            tree = (tree[0], [tree[1][0], 'Button'])
        exact = [e for tr, e in self.class_trees if tr == tree]
        if not exact:
            exact = [(tr, e) for tr, e in self.class_trees if ty.tmatch(tree, tr)]
            if len(exact) > 1:
                # a printed name leaves out defaulted arguments; a lambda's type is never one of them
                plain = [(tr, e) for tr, e in exact if not ty.omits_lambda(tree, tr)]
                exact = plain or exact
            exact = [e for _, e in exact]
        if len(exact) > 1:
            # template arguments of the same name in different namespaces: the one printed with its arguments
            whole = re.sub(r'\s+', '', t.name)
            same = [e for e in exact if re.sub(r'\s+', '', e.key).endswith(whole)]
            if len(same) == 1:
                exact = same
        if len(exact) > 1:
            # classes of the same name in different classes or namespaces: the one the printed name ends with
            printed = re.sub(r'\s+', '', t.name.split('<')[0])
            outer = [e for e in exact if re.sub(r'\s+', '', e.key.split('<')[0]).endswith(printed)]
            if len(outer) == 1:
                exact = outer
            else:
                printed_outer = printed.rsplit('::', 1)[0] if '::' in printed else ''
                outer2 = [e for e in exact if printed_outer and printed_outer in e.key]
                exact = outer2 if len(outer2) == 1 else exact
        if len(exact) > 1:
            # a name printed without its outer class or namespace: looked up from where it is written, the
            # class being translated (or the class of the function called, for its parameters' types), its
            # outer classes, then its namespaces
            for ctx in [self.ctx] + self.scopes[::-1]:
                c = ctx
                while c is not None:
                    if c in exact:
                        return c                # the class's own name
                    inner = [e for e in exact if e.key.startswith(c.key + '::')]
                    if len(inner) == 1:
                        return inner[0]
                    c = c.cls
                ns = list(getattr(ctx, 'ns', None) or []) if ctx is not None else list(self.ctx_ns)
                while ns:
                    inner = [e for e in exact if e.key.startswith('::'.join(ns) + '::')]
                    if len(inner) == 1:
                        return inner[0]
                    ns.pop()
            top = [e for e in exact if e.cls is None]
            if len(top) == 1 and '::' not in t.name:
                return top[0]
            # still several (Vertex: C4Particle::DrawingData's, read in C4ParticleChunk::Draw, and the fog of war's): the
            # one declared in the file of the class being translated
            if self.ctx is not None:
                here = [e for e in exact if e.file and e.file == self.ctx.file]
                if len(here) == 1:
                    return here[0]
                # a template's argument printed without its class (Option in StdSTLContainerAdapt<std::vector<
                # C4ScenarioParameterDef::Option>>): the one the class being translated names
                named = [e for e in exact if re.search(r'\b' + re.escape(e.key) + r'\b', self.ctx.key)]
                if len(named) == 1:
                    return named[0]
            raise ValueError(f'ambiguous class {t.name}: {exact}')
        r = exact[0] if len(exact) == 1 else None
        self._cot[t.name] = r
        return r

    # ---- names

    def name_all(self):
        for e in self.by_key.values():
            e.module = module_of(e.file) if e.cls is None else None
            # 'static' and 'virtual' are written at the declaration only: every instance gets them
            if e.kind == 'method':
                for attr in ('storageClass', 'virtual'):
                    v = next((n.get(attr) for _, n in e.inst if n.get(attr)), None)
                    if v and attr != 'storageClass' or v == 'static':
                        for _, n in e.inst:
                            n[attr] = v
        for e in self.by_key.values():
            if e.kind == 'class':
                e.name = self.class_name(e)
        for e in self.by_key.values():
            if e.kind == 'class' and e.cls is not None:
                # a nested class: Outer$Inner
                o, nm = e.cls, e.name
                while o is not None:
                    nm = self.class_name(o) + '$' + nm
                    o = o.cls
                e.name = nm
        # overload sets: per class hierarchy (an override keeps its base's name), per namespace
        root = {}

        def find(c):
            while root.get(c, c) is not c:
                c = root[c]
            return c
        for c in self.classes:
            for b in self.bases_of(c):
                ra, rb = find(c), find(b)
                if ra is not rb:
                    root[ra] = rb
        groups = {}
        for e in self.by_key.values():
            if e.kind in ('func', 'method'):
                n = e.node
                if n.get('isImplicit') or self.is_copy_ctor(e) or n['kind'] == 'CXXDestructorDecl':
                    continue
                base = self.base_name(n)
                if e.cls is not None:
                    scope = find(e.cls).key if n['kind'] != 'CXXConstructorDecl' else e.cls.key
                else:
                    scope = '::'.join(getattr(e, 'ns', [])) + ('@' + str(e.module) if e.internal else '')
                groups.setdefault((scope, base), []).append(e)
        for (scope, base), es in groups.items():
            sigs = {self.sig(e) for e in es}
            if len(sigs) == 1:
                for e in es:
                    e.name = base
                if len(es) > 1 and es[0].cls is None:
                    # instances of a function template that look alike: numbered in a stable order
                    for i, e in enumerate(sorted(es, key=lambda x: x.key)):
                        if i:
                            e.name = f'{base}${i + 1}'
                elif len(es) > 1:
                    # instances of a member template of one class that look alike (StdMeshMaterialSubLoader::Load
                    # for techniques, passes and texture units): numbered in a stable order; overrides in other
                    # classes keep the name
                    per = {}
                    for e in sorted(es, key=lambda x: x.key):
                        if e.node.get('virtual') or e.node.get('pure'):
                            continue
                        per[e.cls.key] = per.get(e.cls.key, 0) + 1
                        if per[e.cls.key] > 1:
                            e.name = f'{base}${per[e.cls.key]}'
            else:
                consts = {}
                for e in es:
                    consts.setdefault('$'.join(self.param_abbrs(e)), set()).add(self.is_const(e))
                for e in es:
                    p = '$'.join(self.param_abbrs(e)) or 'v'
                    c = '$c' if self.is_const(e) and len(consts.get('$'.join(self.param_abbrs(e)), ())) > 1 else ''
                    e.name = base + '$' + p + c
                if es[0].cls is not None:
                    # two methods of one class named alike (instances of a member template): numbered
                    per = {}
                    for e in sorted(es, key=lambda x: x.key):
                        k = (e.cls.key, e.name)
                        per[k] = per.get(k, 0) + 1
                        if per[k] > 1:
                            e.name = f'{e.name}${per[k]}'
                if es[0].cls is None:
                    seen = {}
                    for e in sorted(es, key=lambda x: x.key):
                        if e.name in seen:
                            seen[e.name] += 1
                            e.name = f'{e.name}${seen[e.name]}'
                        else:
                            seen[e.name] = 1
        for e in self.by_key.values():
            if e.kind in ('var', 'svar', 'field'):
                e.name = e.node.get('name', '')
                if e.kind == 'field' and not e.name:
                    # an unnamed member (an anonymous union or struct): $u1, $u2 in its class
                    unnamed = [m for m in e.cls.members if m.kind == 'field' and not m.node.get('name')]
                    e.name = f'$u{unnamed.index(e) + 1}'
            if e.kind in ('func', 'var') and e.cls is None:
                nm = e.node.get('name')
                if nm in NATIVE or f'{nm}@{e.module}' in NATIVE:
                    e.native = True
                    e.module = 'rt/native'
            if e.name and e.kind in ('func', 'method') and e.name in JS_RESERVED:
                e.name += '_'
        for c in self.classes:
            # a field that hides an inherited field of the same name: keep both (C4IDList::Count
            # and C4IDListChunk::Count), the derived one under a distinct property
            inherited = set()
            for b in self.bases_of(c):
                inherited.update(m.name for m in b.members if m.kind == 'field')
            if not inherited:
                continue
            for m in c.members:
                if m.kind == 'field' and m.name in inherited:
                    m.name = f'{m.name}${re.sub(r"\W+", "_", c.name or c.key)}'

    def class_name(self, e):
        printed = ty.strip_ns(e.key)
        if printed == 'P':
            # unrelated internal P classes (C4Group, C4Landscape, ...) collide with rt/ptr's P
            mod = e.module or module_of(e.file) or e.tu.name
            return 'P_' + mod.replace('/', '_')
        if printed in NAMES:
            return NAMES[printed]
        tree = self.class_tree(e)
        if isinstance(tree, str):
            return tree

        def flat(t):
            if isinstance(t, str):
                try:
                    return ty.parse_str(t).abbr()
                except Exception:
                    return re.sub(r'\W+', '_', t)
            return t[0] + ''.join('$' + flat(a) for a in t[1])
        return flat(tree)

    def is_copy_ctor(self, e):
        n = e.node
        if n['kind'] != 'CXXConstructorDecl':
            return False
        ps = [c for c in n.get('inner', ()) if c.get('kind') == 'ParmVarDecl']
        if len(ps) != 1:
            return False
        t = ty.parse(ps[0]['type'])
        if t.kind != 'ref':
            return False
        old, self.ctx = self.ctx, e.cls
        try:
            c = self.class_of_type(t.to)
        finally:
            self.ctx = old
        return c is e.cls

    def base_name(self, n):
        if n['kind'] == 'CXXConstructorDecl':
            return 'init'
        name = n['name']
        if name.startswith('operator'):
            op = name[8:].strip()
            if n['kind'] == 'CXXConversionDecl':
                return 'op_' + re.sub(r'\W+', '_', op)
            ps = [c for c in n.get('inner', ()) if c.get('kind') == 'ParmVarDecl']
            arity = len(ps) + (1 if n['kind'] == 'CXXMethodDecl' and n.get('storageClass') != 'static' else 0)
            if arity == 1 and op == '-':
                return 'op_neg'
            if arity == 1 and op == '+':
                return 'op_pos'
            if op not in OPS:
                raise ValueError(f'operator {op}')
            return 'op_' + OPS[op]
        return name

    def sig(self, e):
        return '$'.join(self.param_abbrs(e)) + ('$c' if self.is_const(e) else '')

    def is_const(self, e):
        return ty.qual_of(e.node.get('type', '')).rstrip().endswith(' const') or \
            re.search(r'\) const( &&?)?( noexcept.*)?$', ty.qual_of(e.node.get('type', ''))) is not None

    def bases_of(self, c):
        out = []
        for b in c.node.get('bases', ()):
            try:
                be = self.class_of_type(ty.parse(b['type']))
            except ValueError:
                be = None
            if be is not None:
                out.append(be)
        return out

    def param_abbrs(self, e):
        out = []
        for c in e.node.get('inner', ()):
            if c.get('kind') == 'ParmVarDecl':
                t = ty.parse(c['type'])
                pre = ''
                if t.kind == 'ref':
                    txt = ty.qual_of(c['type'])
                    pre = 'm' if txt.endswith('&&') else '' if txt.startswith('const ') else 'r'
                if t.strip().kind == 'rec':
                    try:
                        ce = self.class_of_type(t)
                    except ValueError:
                        ce = None
                    out.append(pre + (ce.name if ce and ce.name else t.abbr()))
                else:
                    out.append(pre + t.abbr())
        return out

    # ---- what is translated

    def roots(self, units):
        out = []
        from .config import UNIT_ONLY
        for e in self.by_key.values():
            if e.cls is None and e.module in units and e.module not in OPAQUE and e.node.get('name') not in SKIP:
                only = UNIT_ONLY.get(e.module)
                if only is not None and e.node.get('name') not in only:
                    continue
                out.append(e)
        return out


JS_RESERVED = {'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
               'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
               'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void',
               'while', 'with', 'yield', 'let', 'static', 'implements', 'interface', 'package', 'private',
               'protected', 'public', 'await', 'arguments', 'eval', 'Number', 'BigInt', 'Math', 'String', 'Object',
               'Array', 'Symbol', 'Error'}
