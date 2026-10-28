"""The whole program as the translator sees it: every C file's declarations (work/ext/*.pickle, from
extract.py), the records and their layouts (work/layout/*.txt), which functions and globals exist
where, and which functions must be async (they wait for a key, directly or through calls)."""
import os
import pickle
import re

from . import ctypes_ as ct

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, '..', '..', 'work')

# what the browser cannot do synchronously: read a key, wait; qsort may call async comparators
ASYNC_ROOTS = {'getchar', 'getc', 'fgetc', 'usleep', 'sleep', 'qsort'}


class Func:
    def __init__(self, name, tu, node, static):
        self.name, self.tu, self.node, self.static = name, tu, node, static
        self.calls = set()        # names of functions called directly
        self.icalls = []          # indirect call sites: ('field', rec, field) | ('sig', sigkey)
        self.is_async = False


class Var:
    def __init__(self, name, tu, node, static):
        self.name, self.tu, self.node, self.static = name, tu, node, static
        self.addr_taken = False


class Layout:
    def __init__(self, size, align, fields):
        self.size, self.align, self.fields = size, align, fields  # fields: name -> (offset, bitlo, bithi)


LAYOUT_HEAD = re.compile(r'^\s*0 \| (struct|union) (.*)$')
LAYOUT_FIELD = re.compile(r'^\s*(\d+)(?::(\d+)-(\d+))? \|(\s+)(.*)$')
LAYOUT_SIZE = re.compile(r'^\s*\| \[sizeof=(\d+), (?:dsize=\d+, )?align=(\d+)')


def parse_layouts(path, into_named, into_anon):
    with open(path) as fh:
        lines = fh.read().split('\n')
    i = 0
    while i < len(lines):
        if lines[i].startswith('*** Dumping AST Record Layout'):
            m = LAYOUT_HEAD.match(lines[i + 1])
            i += 2
            if not m:
                continue
            tag, name = m.group(1), m.group(2)
            fields = {}
            size = align = None
            while i < len(lines) and lines[i].strip():
                f = LAYOUT_FIELD.match(lines[i])
                s = LAYOUT_SIZE.match(lines[i])
                if s:
                    size, align = int(s.group(1)), int(s.group(2))
                elif f:
                    indent = len(f.group(4))
                    if indent == 3:  # a direct field
                        decl = f.group(5)
                        fname = decl.split()[-1]
                        lo = int(f.group(2)) if f.group(2) else None
                        hi = int(f.group(3)) if f.group(3) else None
                        fields[fname] = (int(f.group(1)), lo, hi)
                i += 1
            lay = Layout(size, align, fields)
            am = re.search(r'\(unnamed at (.*):(\d+):(\d+)\)$', name)
            if am:
                into_anon[(os.path.basename(am.group(1)), int(am.group(2)), int(am.group(3)))] = lay
            else:
                into_named[name] = lay
        else:
            i += 1


class Program:
    def __init__(self):
        ext = os.path.join(WORK, 'ext')
        self.tus = {}
        for f in sorted(os.listdir(ext)):
            if f.endswith('.pickle'):
                with open(os.path.join(ext, f), 'rb') as fh:
                    self.tus[f[:-7]] = pickle.load(fh)
        self.typedefs = {}
        self.records = {}
        self.enums = {}
        self.protos = {}
        for tu, o in self.tus.items():
            for k, v in o['typedefs'].items():
                if isinstance(v, tuple):
                    rec = o['records'].get(v[1])
                    tag = rec.get('tagUsed', 'struct') if rec else 'struct'
                    v = f'{tag} {v[1]}'
                self.typedefs.setdefault(k, v)
            for k, v in o['records'].items():
                key = ct.anon_key(k.split(' ', 1)[1] if k.startswith(('struct ', 'union ')) else k)
                v['_tu'] = tu
                self.records.setdefault(key, v)
            self.enums.update(o['enums'])
            self.protos.update(o['protos'])
        # layouts
        self.layout_named, self.layout_anon = {}, {}
        ldir = os.path.join(WORK, 'layout')
        for f in sorted(os.listdir(ldir)):
            parse_layouts(os.path.join(ldir, f), self.layout_named, self.layout_anon)
        # functions and globals
        self.funcs = {}            # global name -> Func
        self.static_funcs = {}     # (tu, name) -> Func
        self.globals = {}          # name -> Var (definitions with external linkage)
        self.static_vars = {}      # (tu, name) -> Var
        for tu, o in self.tus.items():
            for d in o['decls']:
                name = d.get('name')
                static = d.get('storageClass') == 'static'
                if d['kind'] == 'FunctionDecl':
                    if any(c.get('kind') == 'CompoundStmt' for c in d.get('inner', [])):
                        f = Func(name, tu, d, static)
                        if static:
                            self.static_funcs[(tu, name)] = f
                        else:
                            if name in self.funcs:
                                raise SystemExit(f'function {name} defined twice ({self.funcs[name].tu}, {tu})')
                            self.funcs[name] = f
                elif d['kind'] == 'VarDecl':
                    if d.get('storageClass') == 'extern' and not d.get('init'):
                        continue
                    v = Var(name, tu, d, static)
                    if static:
                        self.static_vars[(tu, name)] = v
                    else:
                        old = self.globals.get(name)
                        if old is None or (d.get('init') and not old.node.get('init')):
                            self.globals[name] = v
        self.excluded = set()

    # ---- types ----
    def type(self, node):
        return ct.of(node, self.typedefs)

    def parse(self, s):
        return ct.parse(s, self.typedefs)

    def record(self, rec):
        """the RecordDecl node of a Rec type"""
        r = self.records.get(rec.name)
        if r is None:
            raise KeyError(f'no definition of {rec.c()}')
        return r

    def layout(self, rec):
        r = self.record(rec)
        if r.get('name') and not r.get('_typedef_name'):
            lay = self.layout_named.get(r['name'])
            if lay:
                return lay
        key = (os.path.basename(r['_file']), r['_line'], r['_col'])
        lay = self.layout_anon.get(key) or self.layout_named.get(rec.name)
        if lay is None:
            raise KeyError(f'no layout of {rec.c()} {key}')
        return lay

    def fields(self, rec):
        """[(name, type, bitwidth or None)] of a record"""
        r = self.record(rec)
        out = []
        for c in r.get('inner', []):
            if c.get('kind') == 'FieldDecl':
                width = None
                if c.get('isBitfield'):
                    ce = [x for x in c.get('inner', []) if x.get('kind') == 'ConstantExpr']
                    width = int(ce[0]['value'])
                name = c.get('name')
                if not name:
                    continue  # unnamed padding
                out.append((name, self.type(c), width))
        return out

    def sizeof(self, t):
        if isinstance(t, (ct.Int, ct.Enum)):
            return t.bits // 8
        if isinstance(t, ct.Float):
            return 4 if t.name == 'float' else 8
        if isinstance(t, ct.Ptr):
            return 8
        if isinstance(t, ct.Arr):
            return (t.n or 0) * self.sizeof(t.of)
        if isinstance(t, ct.Rec):
            return self.layout(t).size
        if isinstance(t, ct.VaList):
            return 24
        raise ValueError(f'sizeof {t.c()}')

    def class_name(self, rec):
        name = rec.name
        if name.startswith('('):
            m = re.search(r'at (.*):(\d+):(\d+)\)', name)
            base = os.path.basename(m.group(1)).replace('.', '_')
            return f'anon_{base}_{m.group(2)}'
        return f'{rec.tag}_{name}'

    # ---- lookups ----
    def func(self, tu, name):
        return self.static_funcs.get((tu, name)) or self.funcs.get(name)

    def var(self, tu, name):
        return self.static_vars.get((tu, name)) or self.globals.get(name)
