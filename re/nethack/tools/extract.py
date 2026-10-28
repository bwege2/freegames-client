"""Pass 1 of the translator: reads clang's JSON syntax trees (work/ast/*.json, tools/ast.sh) and keeps
what the translation needs, in work/ext/<file>.pickle:
  - 'decls': the top-level declarations written in the C file itself (functions, variables), whole;
  - 'records': every struct/union definition the file sees (headers included, also those inside
    functions), by the name clang's type strings use ("struct obj", "struct (unnamed struct at
    attrib.c:701:11)");
  - 'typedefs': name -> the type it stands for;
  - 'enums': the enum constants (name -> value);
  - 'protos': every function declaration seen (name -> type).
Clang prints a location's file and line only when they differ from the location printed before, so
both are followed through the whole tree in print order; every node gets '_file', '_line', '_col'
(of its own location, the expansion of a macro)."""
import json
import os
import pickle
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, '..', 'work')


class Tracker:
    def __init__(self):
        self.file = None
        self.line = None

    def bare(self, loc):
        if 'file' in loc:
            self.file = loc['file']
        if 'line' in loc:
            self.line = loc['line']
        return self.file, self.line, loc.get('col')

    def loc(self, loc):
        """follows a location; returns (file, line, col) of the expansion"""
        if 'spellingLoc' in loc or 'expansionLoc' in loc:
            r = None
            if 'spellingLoc' in loc:
                self.bare(loc['spellingLoc'])
            if 'expansionLoc' in loc:
                r = self.bare(loc['expansionLoc'])
            return r
        if loc:
            return self.bare(loc)
        return (self.file, self.line, None)

    def visit(self, n, on_node):
        if isinstance(n, dict):
            if 'kind' in n:
                pos = self.loc(n['loc']) if 'loc' in n else (self.file, self.line, None)
                n['_file'], n['_line'], n['_col'] = pos
            for k, v in list(n.items()):
                if k == 'loc' or k == 'includedFrom':
                    continue
                if k == 'range':
                    for e in ('begin', 'end'):
                        if e in v:
                            loc = v[e]
                            if 'kind' in n and 'expansionLoc' in loc:
                                # written by a macro: where the macro's name is (expansion) and where
                                # the text is (spelling: in the macro's body, or an argument's text)
                                sp = loc.get('spellingLoc', {})
                                sfile = self.bare(sp)[0] if sp else self.file
                                x = loc['expansionLoc']
                                self.bare(x)
                                n['_r' + e[0]] = (self.file, x.get('offset'), x.get('tokLen'),
                                                  bool(x.get('isMacroArgExpansion') or sp.get('isMacroArgExpansion')),
                                                  sfile, sp.get('offset'), sp.get('tokLen'))
                            else:
                                self.loc(loc)
                                if 'kind' in n and loc.get('offset') is not None:
                                    n['_r' + e[0]] = (self.file, loc.get('offset'), loc.get('tokLen'), False,
                                                      self.file, loc.get('offset'), loc.get('tokLen'))
                    continue
                if isinstance(v, (dict, list)):
                    self.visit(v, on_node)
            if 'kind' in n:
                on_node(n)
                if "array_filler" in n:
                    # clang prints an initializer list's filler and then its elements in one list
                    af = n.pop("array_filler")
                    n["_filler"] = af[0]
                    n["inner"] = af[1:] + n.get("inner", [])
                n.pop("loc", None)
                n.pop("range", None)
        elif isinstance(n, list):
            for v in n:
                self.visit(v, on_node)


def record_name(d):
    tag = d.get('tagUsed', 'struct')
    if d.get('name'):
        return f'{tag} {d["name"]}'
    word = 'unnamed' if tag == 'struct' or True else 'anonymous'
    return f'{tag} (unnamed {tag} at {d["_file"]}:{d["_line"]}:{d["_col"]})'


def extract(name):
    path = os.path.join(WORK, 'ast', name + '.json')
    with open(path) as fh:
        ast = json.load(fh)
    tr = Tracker()
    out = {'decls': [], 'records': {}, 'typedefs': {}, 'enums': {}, 'protos': {}, 'file': None}

    by_id = {}

    def find_record_ref(n):
        """the id of the RecordDecl a typedef's type refers to (directly), or None"""
        if isinstance(n, dict):
            d = n.get('decl') or n.get('ownedTagDecl')
            if isinstance(d, dict) and d.get('kind') == 'RecordDecl':
                return d['id']
            if n.get('kind') in ('PointerType', 'ConstantArrayType', 'FunctionProtoType', 'FunctionNoProtoType'):
                return None
            for c in n.get('inner', []):
                r = find_record_ref(c)
                if r:
                    return r
        return None

    def on_node(n):
        k = n.get('kind')
        if k == 'RecordDecl' and n.get('completeDefinition'):
            out['records'][record_name(n)] = n
            by_id[n['id']] = record_name(n)
        elif k == 'TypedefDecl' and 'type' in n:
            t = n['type']
            s = t.get('desugaredQualType') or t['qualType']
            if s == n['name']:
                # typedef struct { ... } name; clang calls the struct by the typedef's name
                rid = find_record_ref(n)
                s = ('@record', rid)
            out['typedefs'][n['name']] = s
        elif k == 'EnumDecl':
            v = -1
            for c in n.get('inner', []):
                if c.get('kind') != 'EnumConstantDecl':
                    continue
                ce = [x for x in c.get('inner', []) if x.get('kind') == 'ConstantExpr' and 'value' in x]
                v = int(ce[0]['value']) if ce else v + 1
                out['enums'][c['name']] = v

    main = None
    for d in ast.get('inner', []):
        tr.visit(d, on_node)
        f = d.get('_file')
        kind = d.get('kind')
        if main is None and f and f.endswith('.c') and not f.startswith('/'):
            main = f
        if kind == 'FunctionDecl':
            out['protos'].setdefault(d['name'], d['type']['qualType'])
        is_def = (kind == 'VarDecl' and (d.get('storageClass') != 'extern' or d.get('init'))) or (kind == 'FunctionDecl' and any(c.get('kind') == 'CompoundStmt' for c in d.get('inner', [])))
        if f is not None and kind in ('FunctionDecl', 'VarDecl') and (f == main or (is_def and not f.startswith(('/nix/', '/usr/')))):
            out['decls'].append(d)
    out['file'] = main
    for tname, s in list(out["typedefs"].items()):
        if isinstance(s, tuple):
            key = by_id.get(s[1])
            if key is None:
                del out["typedefs"][tname]
            else:
                # the record keeps the typedef's name: the type strings use it
                out["records"][tname] = out["records"].pop(key)
                out["records"][tname]["_typedef_name"] = tname
                out["typedefs"][tname] = ("@record", tname)
    os.makedirs(os.path.join(WORK, 'ext'), exist_ok=True)
    with open(os.path.join(WORK, 'ext', name + '.pickle'), 'wb') as fh:
        pickle.dump(out, fh, protocol=pickle.HIGHEST_PROTOCOL)
    return out


def main():
    names = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(os.path.join(WORK, 'ast')) if f.endswith('.json'))
    for n in names:
        o = extract(n)
        print(n, o['file'], len(o['decls']), 'decls', file=sys.stderr)


if __name__ == '__main__':
    main()
