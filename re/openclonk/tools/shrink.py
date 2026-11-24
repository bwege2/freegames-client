"""shrink.py AST.json ...   (in the unit list's order; ast.sh runs it)

Every unit's tree repeats the headers it includes: the inline functions of a header have their body in
every unit. The translator needs each body once, so this keeps a function's body only in the first tree
that has it (functions are the same everywhere by their mangled name) and leaves the declaration in the
others, so that the trees' references still find it. It also drops what the translator does not read:
source ranges, and of a location all but offset and line. Running it again gives the same trees."""
import json
import sys

FUNCS = ('FunctionDecl', 'CXXMethodDecl', 'CXXConstructorDecl', 'CXXDestructorDecl', 'CXXConversionDecl')
seen = set()


def loc(n):
    lo = n.get('loc')
    if not lo:
        return
    out = {}
    for k in ('offset', 'line'):
        if k in lo:
            out[k] = lo[k]
    e = lo.get('expansionLoc')
    if e:
        out['expansionLoc'] = {k: e[k] for k in ('offset', 'line') if k in e}
    n['loc'] = out


def walk(n):
    n.pop('range', None)
    k = n.get('kind', '')
    if k.endswith('Decl'):
        loc(n)
    else:
        n.pop('loc', None)
    inner = n.get('inner')
    if not inner:
        return
    if k in FUNCS and n.get('mangledName'):
        if any(c.get('kind') == 'CompoundStmt' for c in inner):
            if n['mangledName'] in seen:
                n['inner'] = inner = [c for c in inner if c.get('kind') != 'CompoundStmt']
            else:
                seen.add(n['mangledName'])
    for c in inner:
        walk(c)


for path in sys.argv[1:]:
    with open(path) as f:
        tree = json.load(f)
    walk(tree)
    with open(path, 'w') as f:
        json.dump(tree, f, separators=(',', ':'))
