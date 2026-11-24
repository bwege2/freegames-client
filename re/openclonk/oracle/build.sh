#!/usr/bin/env bash
# Builds the OpenClonk test oracle from the original sources (run re/openclonk/fetch.sh first).
#
# 1. The original's own build (CMake, C4GROUP_TOOL_ONLY: no graphics, sound or network libraries) into
#    re/openclonk/work/build: libmisc (C4Group, StdBuf, StdCompiler, C4Random, the platform file code)
#    and the c4group tool, unchanged. It also writes config.h and compile_commands.json, which the
#    translator's syntax trees use (tools/ast.sh), so the port is translated from the code the oracle runs.
# 2. oracle/harness.cpp, linked with libmisc and src/lib/C4Real.cpp compiled with the same flags:
#    reads commands on stdin and prints what C4Fixed and the random generators return
#    (re/openclonk/oracle/openclonk-oracle; see harness.cpp).
#
# Everything is compiled with clang (nix's when nix is there, else the one on PATH), with cmake, make and
# zlib from nix as well.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../orig/openclonk && pwd)
if command -v nix >/dev/null; then
  paths=$(nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang nixpkgs#cmake nixpkgs#gnumake \
    nixpkgs#zlib.dev nixpkgs#zlib --no-link --print-out-paths --offline 2>/dev/null \
    || nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang nixpkgs#cmake nixpkgs#gnumake \
    nixpkgs#zlib.dev nixpkgs#zlib --no-link --print-out-paths)
  for p in $paths; do
    [[ -d "$p/bin" ]] && export PATH="$p/bin:$PATH"
    [[ -f "$p/include/zlib.h" ]] && zinc=$p/include
    [[ -f "$p/lib/libz.so" ]] && zlib=$p/lib/libz.so
  done
fi
zopts=()
if [[ -n ${zinc:-} && -n ${zlib:-} ]]; then
  zopts=(-DZLIB_INCLUDE_DIR="$zinc" -DZLIB_LIBRARY="$zlib")
  export CPATH=$zinc${CPATH:+:$CPATH}
fi
ar=$(command -v llvm-ar || command -v ar)
mkdir -p ../work/build
build=$(cd ../work/build && pwd)
cmake -S "$src" -B "$build" -DC4GROUP_TOOL_ONLY=ON -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ \
  -DCMAKE_AR="$ar" -DCMAKE_C_COMPILER_AR="$ar" -DCMAKE_CXX_COMPILER_AR="$ar" "${zopts[@]}" >"$build/cmake.log" 2>&1 \
  || { tail -40 "$build/cmake.log"; exit 1; }
make -C "$build" -j"$(nproc)" c4group >"$build/make.log" 2>&1 || { tail -40 "$build/make.log"; exit 1; }
# the flags CMake gives libmisc's C++ files (config.h, include paths, defines)
flags=$(python3 -I - "$build/compile_commands.json" <<'PY'
import json, shlex, sys
for c in json.load(open(sys.argv[1])):
    if c['file'].endswith('src/lib/C4Random.cpp'):
        args = shlex.split(c['command'])[1:]
        out, skip = [], False
        for a in args:
            if skip: skip = False; continue
            if a in ('-o', '-c'): skip = a == '-o'; continue
            if a.endswith('C4Random.cpp'): continue
            out.append(a)
        print(shlex.join(out))
        break
PY
)
eval "set -- $flags"
clang++ "$@" -w -o "$here/openclonk-oracle" "$here/harness.cpp" "$src/src/lib/C4Real.cpp" \
  "$build/liblibmisc.a" ${zlib:+-L"${zlib%/*}" -Wl,-rpath,"${zlib%/*}"} -lz -lpthread
echo "built $here/openclonk-oracle and $build/c4group"
