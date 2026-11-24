#!/usr/bin/env bash
# Dumps clang's syntax tree (JSON) of the engine's source files that the translator reads, each compiled with
# its own flags from the original's headless build (re/openclonk/oracle/build-headless.sh:
# compile_commands.json, config.h), into re/openclonk/work/ast/<file>.json, keeping only the declarations of
# the original's own source (prune.py drops the C++ library's).
# The game's files come from the game's build (oracle/build-full.sh: work/full) into work/ast; with --aul, the
# standalone script engine (units-aul.txt) from the headless build (oracle/build-headless.sh) into work/ast-aul.
#   ast.sh [--aul] [file.cpp ...]     only these (paths below the source root, as in units.txt)
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../orig/openclonk && pwd)
variant=full list=units.txt astdir=ast
if [[ ${1:-} == --aul ]]; then variant=headless list=units-aul.txt astdir=ast-aul; shift; fi
if [[ ${1:-} == --sim ]]; then variant=headless list=units-sim.txt astdir=ast-sim; shift; fi
build=$(cd ../work/$variant 2>/dev/null && pwd) || true
[[ -f ${build:-}/compile_commands.json ]] || { echo "run re/openclonk/oracle/build-$variant.sh first" >&2; exit 1; }
mkdir -p ../work/$astdir
ast=$(cd ../work/$astdir && pwd)
mapfile -t units < <(python3 -I units.py $([[ $list == units-aul.txt ]] && echo --aul) $([[ $list == units-sim.txt ]] && echo --sim))
(($#)) && units=("$@")
# one shell script per unit with its compile command (clang++ ... -fsyntax-only -ast-dump=json)
python3 -I - "$build/compile_commands.json" "$src" "$ast" "$here" "${units[@]}" > "$ast/jobs.sh" <<'PY'
import json, shlex, sys
db, src, ast, here, units = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5:]
cmds = {}
for c in json.load(open(db)):
    # a file both the game and the headless server compile: the game's flags (openclonk.dir, without USE_CONSOLE)
    if c['file'] not in cmds or 'CMakeFiles/openclonk.dir/' in c['command']:
        cmds[c['file']] = c
# files the original build compiles in another variant: the portable one, with that one's flags
# (blake2: the reference implementation instead of the SSE one; the same results)
ALIAS = {'thirdparty/blake2/ref/blake2b-ref.c': 'thirdparty/blake2/sse/blake2b.c'}
for u in units:
    f = src + '/' + u
    c = cmds.get(f)
    if c is None and u in ALIAS:
        c = dict(cmds[src + '/' + ALIAS[u]])
        c['command'] = c['command'].replace(src + '/' + ALIAS[u], f)
    if c is None:
        sys.exit(f'no compile command for {u}')
    args = shlex.split(c['command'])
    out, skip = [args[0]], False
    for a in args[1:]:
        if skip:
            skip = False
            continue
        if a == '-o':
            skip = True
            continue
        if a in ('-c', f) or a.startswith('-W') or a.startswith('-O') or a == '-g':
            continue
        out.append(a)
    name = u.replace('/', '_').rsplit('.', 1)[0]
    print(f'cd {shlex.quote(c["directory"])} && {shlex.join(out)} -w -fsyntax-only -Xclang -ast-dump=json {shlex.quote(f)} '
          f'| python3 -I {shlex.quote(here)}/prune.py {shlex.quote(src)} > {shlex.quote(ast)}/{name}.json')
    if u == 'src/platform/C4AppSDL.cpp':
        # the C libraries' enums (libenums.h) with the flags of the SDL platform layer, for the translator
        lib = [a for a in out if a != f]
        print(f'cd {shlex.quote(c["directory"])} && {shlex.join(lib)} -w -fsyntax-only -Xclang -ast-dump=json '
              f'-x c++ {shlex.quote(here)}/libenums.h | python3 -I {shlex.quote(here)}/libenums.py > {shlex.quote(ast)}/../libenums.json')
PY
run() {
  if command -v nix-shell >/dev/null; then
    nix-shell --extra-experimental-features 'nix-command flakes' -I nixpkgs=flake:nixpkgs -p clang zlib libpng libjpeg curl readline freetype SDL2 libepoxy libGL openal freealut libogg libvorbis --run "$*"
  else
    bash -c "$*"
  fi
}
run "xargs -P ${AST_JOBS:-8} -d '\n' -I{} bash -c '{}' < '$ast/jobs.sh'"
# every inline function's body once (shrink.py), in the unit list's order
mapfile -t all < <(python3 -I units.py $([[ $list == units-aul.txt ]] && echo --aul) $([[ $list == units-sim.txt ]] && echo --sim) | sed 's|/|_|g; s|\.[^.]*$|.json|')
python3 -I shrink.py "${all[@]/#/$ast/}"
echo "$(ls "$ast"/*.json | wc -l) syntax trees in $ast"
