#!/usr/bin/env bash
# Translates the engine's C++ to TypeScript: web/games/openclonk/src/gen/ (written only by this, never edited).
#   1. ../fetch.sh                  the reference source (once)
#   2. ../oracle/build.sh           the original's build: config.h, compile_commands.json (and the oracle)
#   3. ast.sh                       clang's trees of the units (work/ast/)
#   4. translate.py (cpp2ts/)       the TypeScript
# The same source, flags and translator always give the same output.
set -euo pipefail
cd "$(dirname "$0")"
[[ -f ../work/build/compile_commands.json ]] || bash ../oracle/build.sh
bash ast.sh
python3 -I translate.py "$@"
