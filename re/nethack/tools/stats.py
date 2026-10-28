"""Statistics over the extracted syntax trees: which C constructs the translator must handle."""
import collections
import os
import pickle

HERE = os.path.dirname(os.path.abspath(__file__))
EXT = os.path.join(HERE, '..', 'work', 'ext')

kinds = collections.Counter()
casts = collections.Counter()
ops = collections.Counter()
defined = set()
called = collections.Counter()
gotos = collections.Counter()
unary_trait = collections.Counter()
builtins = collections.Counter()
records = {}


def walk(n, fn):
    if not isinstance(n, dict):
        return
    k = n.get('kind')
    kinds[k] += 1
    if k in ('ImplicitCastExpr', 'CStyleCastExpr'):
        casts[(k[0], n.get('castKind'))] += 1
    if k in ('BinaryOperator', 'UnaryOperator', 'CompoundAssignOperator'):
        ops[n.get('opcode')] += 1
    if k == 'DeclRefExpr' and n.get('referencedDecl', {}).get('kind') == 'FunctionDecl':
        called[n['referencedDecl']['name']] += 1
    if k == 'GotoStmt':
        gotos[fn] += 1
    if k == 'UnaryExprOrTypeTraitExpr':
        unary_trait[n.get('name')] += 1
    for c in n.get('inner', []):
        walk(c, fn)


for f in sorted(os.listdir(EXT)):
    with open(os.path.join(EXT, f), 'rb') as fh:
        o = pickle.load(fh)
    records.update(o['records'])
    for d in o['decls']:
        if d['kind'] == 'FunctionDecl' and 'inner' in d and any(c.get('kind') == 'CompoundStmt' for c in d['inner']):
            defined.add(d['name'])
        walk(d, f[:-7] + ':' + d.get('name', ''))

print('kinds:', sorted(kinds.items(), key=lambda x: -x[1]))
print('casts:', sorted(casts.items(), key=lambda x: -x[1]))
print('ops:', sorted(ops.items(), key=lambda x: -x[1]))
print('traits:', unary_trait)
print('external:', sorted((n, c) for n, c in called.items() if n not in defined))
print('functions with goto:', len(gotos), sum(gotos.values()))
print('unions:', [k for k in records if k[0] == 'union'])
print('defined functions:', len(defined))
