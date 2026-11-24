"""libenums.py < clang-ast.json > libenums.json

The enums of the C libraries (libenums.h): every enum constant with its value, and every enum type by its name and
the names of its typedefs (SDL's enums are typedefs of unnamed enums: SDL_Scancode, SDL_bool) with its
representation, as cpp2ts/program.py's add_enum gives the original's own enums. Read one top-level declaration at a
time, like prune.py."""
import json
import sys


def const_of(k):
    stack = list(k.get('inner', ()))
    while stack:
        n = stack.pop(0)
        if n.get('kind') == 'ConstantExpr' and 'value' in n:
            return int(n['value'])
        stack[:0] = n.get('inner', ())
    return None


values, types, enum_rep = {}, {}, {}
# the libraries' typedefs of numbers (GLuint, ALint, Uint32, FT_Int, ...): name -> the builtin type
typedefs = {}
# only the libraries' own names: the system headers they include also define Window, Display, Atom (X11, through
# SDL_syswm.h) and the like, which are names of the original's classes
TYPEDEF_PREFIXES = ('GL', 'AL', 'Uint', 'Sint', 'SDL_', 'FT_', 'png_', 'JSAMPLE', 'JDIMENSION', 'JOCTET', 'JCOEF', 'boolean',
                    'ogg_')
# the libraries' pointer typedefs the translated code indexes (C4Surface::ReadJPEG: buffer[0] + i * components)
POINTER_TYPEDEFS = {'JSAMPROW', 'JSAMPARRAY', 'JSAMPIMAGE'}
SCALARS = {'bool', 'char', 'signed char', 'unsigned char', 'short', 'unsigned short', 'int', 'unsigned int', 'long',
           'unsigned long', 'long long', 'unsigned long long', 'float', 'double'}


def enum(c):
    vals, v = [], -1
    for k in c.get('inner', ()):
        if k.get('kind') != 'EnumConstantDecl':
            continue
        x = const_of(k)
        v = x if x is not None else v + 1
        values[k['name']] = v
        vals.append(v)
    fixed = c.get('fixedUnderlyingType')
    if fixed:
        q = fixed.get('desugaredQualType') or fixed.get('qualType')
        rep = [8 if 'char' in q else 16 if 'short' in q else 64 if 'long' in q else 32, not q.startswith('unsigned')]
    else:
        rep = [32, bool(any(x < 0 for x in vals) or all(x < 2 ** 31 for x in vals))]
    enum_rep[c['id']] = rep
    if c.get('name'):
        types[c['name']] = rep


def find_decl(n):
    """the EnumDecl a typedef's type names (TypedefDecl > ElaboratedType > EnumType {decl})"""
    stack = list(n.get('inner', ()))
    while stack:
        x = stack.pop(0)
        if x.get('kind') == 'EnumType' and 'decl' in x:
            return x['decl'].get('id')
        stack[:0] = x.get('inner', ())
    return None


def visit(c):
    k = c.get('kind')
    if k in ('LinkageSpecDecl', 'NamespaceDecl'):
        for x in c.get('inner', ()):
            visit(x)
    elif k == 'EnumDecl':
        enum(c)
    elif k == 'TypedefDecl':
        d = find_decl(c)
        if d in enum_rep:
            types[c['name']] = enum_rep[d]
        t = c.get('type') or {}
        q = (t.get('desugaredQualType') or t.get('qualType') or '').strip()
        if q in SCALARS and c['name'].startswith(TYPEDEF_PREFIXES):
            typedefs[c['name']] = q
        elif c['name'] in POINTER_TYPEDEFS:
            # libjpeg's rows: JSAMPROW is JSAMPLE *, JSAMPARRAY JSAMPROW * (buffer[0] of a JSAMPARRAY is a row)
            typedefs[c['name']] = (t.get('qualType') or '').strip()


lines = sys.stdin.buffer
for line in lines:
    if line == b'  "inner": [\n':
        break
cur = None
for line in lines:
    if cur is None:
        if line == b'    {\n':
            cur = [line]
        elif line == b'  ]\n':
            break
    elif line in (b'    }\n', b'    },\n'):
        cur.append(b'    }\n')
        visit(json.loads(b''.join(cur)))
        cur = None
    else:
        cur.append(line)
json.dump({'values': values, 'types': types, 'typedefs': typedefs}, sys.stdout, indent=0, sort_keys=True)
