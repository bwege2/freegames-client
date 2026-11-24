"""prune.py SRC < clang-ast.json > pruned.json

Keeps of clang's JSON syntax tree only the declarations written in the original's own source (SRC/src/,
SRC/thirdparty/pcg/) and namespaces that hold such declarations; drops those of the C++ library.
Clang names a location's file only where it changes from the location printed before, so the file of
every node is followed through the whole tree in print order; each kept declaration gets it as "_file"
(relative to SRC)."""
import json
import re
import sys

SRC = sys.argv[1].rstrip('/') + '/'
OWN = ('src/', 'thirdparty/pcg/', 'thirdparty/blake2/')
last = [None]


def see(loc):
    if not loc:
        return
    for k in ('spellingLoc', 'expansionLoc'):
        if k in loc:
            see(loc[k])
    if 'file' in loc:
        last[0] = loc['file']


TEXT = {}


def text(f):
    if f not in TEXT:
        try:
            TEXT[f] = open(f, 'rb').read()
        except OSError:
            TEXT[f] = b''
    return TEXT[f]


def macro_args(t, at):
    """the arguments of the macro call or parenthesis at t[at] == '(': (args, end) or None"""
    depth, args, start = 0, [], at + 1
    for i in range(at, len(t)):
        ch = t[i:i + 1]
        if ch in (b'(', b'[', b'{'):
            depth += 1
        elif ch in (b')', b']', b'}'):
            depth -= 1
            if depth == 0:
                args.append(t[start:i].strip())
                return args, i + 1
        elif ch == b',' and depth == 1:
            args.append(t[start:i].strip())
            start = i + 1
    return None


def offsetof_of(t, off):
    """offsetof(Type, member) written at t[off], directly or in a function-like macro of the same file
    (C4DrawMeshGL.cpp: #define VERTEX_OFFSET(field) reinterpret_cast<...>(offsetof(StdMeshVertex, field))):
    [Type, member] or None"""
    m = re.match(rb'([A-Za-z_]\w*)\s*\(', t[off:off + 200])
    if not m:
        return None
    name = m.group(1)
    got = macro_args(t, off + m.end() - 1)
    if not got:
        return None
    args = got[0]
    if name == b'offsetof':
        return [a.decode() for a in args] if len(args) == 2 else None
    defs = [d for d in re.finditer(rb'#\s*define\s+' + re.escape(name) + rb'\(([^)]*)\)([^\n]*)', t[:off])]
    if not defs:
        return None
    params = [p.strip() for p in defs[-1].group(1).split(b',')]
    body = defs[-1].group(2)
    k = body.find(b'offsetof')
    if k < 0 or len(params) != len(args):
        return None
    inner = macro_args(body, body.index(b'(', k))
    if not inner or len(inner[0]) != 2:
        return None
    sub = dict(zip(params, args))
    return [sub.get(a, a).decode() for a in inner[0]]


def walk(node):
    """follows the file through node and its children (in print order); returns node's own file"""
    see(node.get('loc'))
    mine = last[0]
    r = node.get('range')
    if r:
        see(r.get('begin'))
        fb = last[0]
        if node.get('kind') == 'OffsetOfExpr' and fb:
            # clang's JSON does not name offsetof's type and member: the source does, where the macro is called
            e = (r.get('begin') or {}).get('expansionLoc') or r.get('begin') or {}
            if 'offset' in e:
                o = offsetof_of(text(fb), e['offset'])
                if o:
                    node['_offsetof'] = o
        see(r.get('end'))
        if node.get('kind') == 'MemberExpr' and fb == last[0] and fb:
            # Base::f() written with its class: no virtual dispatch (clang's JSON does not say so).
            # The range ends at the member's name; what precedes it is the object or the class.
            b, e = r.get('begin') or {}, r.get('end') or {}
            if 'offset' in b and 'offset' in e and 'spellingLoc' not in b and 'spellingLoc' not in e:
                t = text(fb)[b['offset']:e['offset']]
                if t.rstrip().endswith(b'::'):
                    node['_qualified'] = True
    for c in node.get('inner', ()):
        walk(c)
    return mine


def rel(f):
    if f and f.startswith(SRC):
        return f[len(SRC):]
    return None


def prune(node):
    """keeps the children of a TranslationUnitDecl/NamespaceDecl that belong to the original"""
    out = []
    for c in node.get('inner', ()):
        f = rel(walk_file(c))
        if c.get('kind') == 'NamespaceDecl' or c.get('kind') == 'LinkageSpecDecl':
            kept = prune(c)
            if kept['inner']:
                out.append(kept)
            continue
        if f and f.startswith(OWN):
            c['_file'] = f
            out.append(c)
    node = dict(node)
    node['inner'] = out
    return node


def walk_file(node):
    # the file of node: followed through node (and all its children, so that `last` stays right)
    see(node.get('loc'))
    mine = last[0]
    r = node.get('range')
    if r:
        see(r.get('begin'))
        see(r.get('end'))
    if node.get('kind') not in ('NamespaceDecl', 'LinkageSpecDecl'):
        for c in node.get('inner', ()):
            walk(c)
    return mine


def stream(lines):
    """the translation unit read one top-level declaration at a time, so that memory holds one of them, not the
    whole tree (a unit of the game is 1.4 GB of JSON, many times that as Python objects). Clang prints the tree
    indented by two spaces per level and never a line break inside a string, so the unit's children are the
    lines from one '    {' to the next '    }'."""
    head = []
    for line in lines:
        if line == b'  "inner": [\n':
            break
        head.append(line)
    else:
        sys.exit('prune.py: no declarations in the tree')
    root = json.loads(b''.join(head).rstrip().rstrip(b',') + b'}')
    out, cur = [], None
    for line in lines:
        if cur is None:
            if line == b'    {\n':
                cur = [line]
            elif line == b'  ]\n':
                break
            else:
                sys.exit(f'prune.py: unexpected line {line[:80]!r}')
        else:
            if line in (b'    }\n', b'    },\n'):
                cur.append(b'    }\n')
                one = {'inner': [json.loads(b''.join(cur))]}
                cur = None
                out += prune(one)['inner']
            else:
                cur.append(line)
    root['inner'] = out
    return root


json.dump(stream(sys.stdin.buffer), sys.stdout, separators=(',', ':'))
