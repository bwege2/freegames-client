"""The translator: python3 -I -m c2ts [--out DIR] [file ...]   (run from re/nethack/tools)

Reads work/ext/*.pickle (extract.py) and work/layout/*.txt (ast.sh), writes one TypeScript module per C
file into DIR (default web/games/nethack/src/), plus structs.ts, globals.ts and init.ts."""
import os
import re
import sys

from . import ctypes_ as ct
from .analyze import analyze
from .emit import Emitter, jsname
from .program import Program
from .records import structs_module

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))

# functions written by hand in src/rt/ (they need 64-bit integers or the browser):
# (C file, function) -> async?
NATIVE = {
    ('rnd', 'RND'): False, ('rnd', 'init_isaac64'): False, ('rnd', 'rn2_on_display_rng'): False,
    ('rnd', 'whichrng'): False,
    ('isaac64', '*'): False,
    ('unixmain', 'sys_random_seed'): False,
}

# C files not translated at all
SKIP = {'isaac64'}


def main():
    args = sys.argv[1:]
    out = os.path.join(ROOT, 'web', 'games', 'nethack', 'src')
    if args[:1] == ['--out']:
        out = args[1]
        args = args[2:]
    prog = Program()
    for (tu, name) in NATIVE:
        if name == '*':
            for (t2, n2), f in list(prog.static_funcs.items()):
                if t2 == tu:
                    prog.excluded.add((t2, n2))
            for n2, f in list(prog.funcs.items()):
                if f.tu == tu:
                    prog.excluded.add(n2)
        else:
            prog.excluded.add(name)
            prog.excluded.add((tu, name))
    # excluded functions are the runtime's: references go there
    for key in list(prog.excluded):
        if isinstance(key, tuple):
            prog.static_funcs.pop(key, None)
        else:
            prog.funcs.pop(key, None)
    nasync, nfuncs = analyze(prog)
    print(f'{nfuncs} functions, {nasync} async', file=sys.stderr)
    tus = args or sorted(t for t in prog.tus if t not in SKIP)
    structs = set()
    all_errors = []
    globals_by_tu = {}
    consts_by_tu = {}
    texts = {}
    for tu in tus:
        em = Emitter(prog, tu)
        text, errors = em.module()
        consts_by_tu[tu] = em.consts
        texts[tu] = text
        structs |= {k for k in prog.records if prog.class_name(ct.Rec(prog.records[k].get('tagUsed', 'struct'), k)) in em.structs}
        for name, e in errors:
            all_errors.append((tu, name, e))
        globals_by_tu[tu] = text
    # the names of constants (macros, enum constants): consts.ts has those with one value everywhere, a
    # module defines the others itself
    values = {}
    for c in consts_by_tu.values():
        for k, vs in c.items():
            values.setdefault(k, set()).update(vs)
    shared = {k: next(iter(vs)) for k, vs in values.items() if len(vs) == 1} if not args else {}
    for tu, text in texts.items():
        c = consts_by_tu[tu]
        imp = sorted(k for k in c if k in shared)
        local = sorted(k for k in c if k not in shared)
        lines = []
        if imp:
            lines.append(f"import {{ {', '.join(imp)} }} from './consts.ts';")
        for k in local:
            vs = sorted(c[k])
            if len(vs) == 1:
                lines.append(f'const {k} = {vs[0]};')
            else:
                raise SystemExit(f'{tu}: {k} has the values {vs}')
        text = text.replace('//@@CONSTS@@', '\n'.join(lines))
        with open(os.path.join(out, tu + '.ts'), 'w') as fh:
            fh.write(text)
    if not args:
        lines = ['// The named constants of NetHack 3.6.7 that the translated modules use: its macros (config.h, the',
                 '// headers, the generated onames.h and pm.h) and enum constants, with their values. Written by',
                 '// re/nethack/tools/c2ts (do not edit); a name with other values in some file is defined there.']
        for k in sorted(shared):
            lines.append(f'export const {k} = {shared[k]};')
        with open(os.path.join(out, 'consts.ts'), 'w') as fh:
            fh.write('\n'.join(lines) + '\n')
        with open(os.path.join(out, 'structs.ts'), 'w') as fh:
            fh.write(structs_module(prog, structs))
        # globals.ts: every global variable with external linkage
        names = sorted(jsname(n) for n in prog.globals)
        lines = ['// The global variables of NetHack 3.6.7 (those with external linkage), as properties of G.',
                 '// Written by re/nethack/tools/c2ts (do not edit). Each C file\'s module sets its own in $init().',
                 '/* eslint-disable */',
                 'export const G: any = {']
        for n in names:
            v = prog.globals[n.rstrip('_')] if n.rstrip('_') in prog.globals else None
            lines.append(f'  {n}: undefined,')
        lines.append('};')
        with open(os.path.join(out, 'globals.ts'), 'w') as fh:
            fh.write('\n'.join(lines) + '\n')
        # init.ts: the modules' $init() in an order where a global's initializer finds the globals it uses
        defined_in = {jsname(n): v.tu for n, v in prog.globals.items()}
        deps = {}
        for tu, text in globals_by_tu.items():
            m = re.search(r'export function \$init\(\): void \{\n(.*?)\n\}', text, re.S)
            body = m.group(1) if m else ''
            used = set()
            for line in body.split('\n'):
                rhs = line.split('=', 1)[1] if '=' in line else ''
                for g in re.findall(r'\bG\.([A-Za-z_$][\w$]*)', rhs):
                    if defined_in.get(g) and defined_in[g] != tu:
                        used.add(defined_in[g])
            deps[tu] = used
        order = []
        state = {}

        def visit(t):
            if state.get(t) == 2:
                return
            if state.get(t) == 1:
                raise SystemExit(f'initialization cycle at {t}')
            state[t] = 1
            for d in sorted(deps.get(t, ())):
                visit(d)
            state[t] = 2
            order.append(t)
        for t in sorted(deps):
            visit(t)
        lines = ['// @ts-nocheck', '// Sets every global and static variable to its initial value, as a new process starts.',
                 '// Written by re/nethack/tools/c2ts (do not edit).']
        for t in order:
            lines.append(f"import {{ $init as init_{t} }} from './{t}.ts';")
        lines.append('')
        lines.append('export function initGlobals(): void {')
        for t in order:
            lines.append(f'  init_{t}();')
        lines.append('}')
        with open(os.path.join(out, 'init.ts'), 'w') as fh:
            fh.write('\n'.join(lines) + '\n')
    for tu, name, e in all_errors:
        print(f'{tu}: {name}: {e}', file=sys.stderr)
    print(f'{len(all_errors)} errors', file=sys.stderr)


main()
