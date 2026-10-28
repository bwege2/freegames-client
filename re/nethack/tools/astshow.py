"""Shows a function's clang syntax tree compactly: python3 -I astshow.py <ast.json> <function>"""
import json
import sys


def show(n, depth=0):
    kind = n.get('kind')
    extra = []
    for k in ('name', 'opcode', 'castKind', 'value', 'valueCategory', 'isArrow', 'isPostfix', 'storageClass'):
        if k in n:
            extra.append(f'{k}={n[k]!r}')
    if 'type' in n:
        t = n['type']
        extra.append('T=' + t.get('qualType', '') + ('|' + t['desugaredQualType'] if 'desugaredQualType' in t else ''))
    if 'referencedDecl' in n:
        extra.append('ref=' + n['referencedDecl'].get('name', '?') + ':' + n['referencedDecl'].get('kind', ''))
    if 'argType' in n:
        extra.append('argType=' + n['argType'].get('qualType', ''))
    print('  ' * depth + kind + ' ' + ' '.join(extra))
    for c in n.get('inner', []):
        show(c, depth + 1)


def main():
    ast = json.load(open(sys.argv[1]))
    for d in ast['inner']:
        if d.get('name') == sys.argv[2] and d.get('kind') in ('FunctionDecl', 'RecordDecl', 'VarDecl', 'TypedefDecl') and 'inner' in d:
            show(d)


main()
