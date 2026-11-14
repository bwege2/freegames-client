#!/usr/bin/env bash
# Builds the test oracle re/pokerth/oracle/pokerth-oracle from PokerTH 1.1.2's engine sources
# (re/pokerth/fetch.sh first). The original files are copied into work/oracle-src unchanged; the headers the
# engine includes for the GUI, the hand log, the config file and the player data are replaced by the small
# shims in shim/ (they only declare what the engine calls), and tools.cpp by a deterministic random stream.
# Needs g++ and the Boost headers: on PATH/CPATH, or taken from nix (nixpkgs#gcc, nixpkgs#boost.dev).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
orig="$here/../orig/pokerth-1.1.2/src"
work="$here/../work/oracle-src"
test -d "$orig" || { echo "run re/pokerth/fetch.sh first" >&2; exit 1; }
rm -rf "$work"
mkdir -p "$work"
cp "$orig"/engine/*.h "$orig"/engine/{game,handinterface,boardinterface,berointerface,playerinterface,enginefactory}.cpp "$orig"/game_defs.h "$orig"/gamedata.h "$work/"
for f in localhand localboard localbero localberopreflop localberoflop localberoturn localberoriver localberopostriver \
         localplayer cardsvalue arraydata localenginefactory localexception; do
  cp "$orig/engine/local_engine/$f.cpp" "$orig/engine/local_engine/$f.h" "$work/"
done
cp "$orig"/engine/local_engine/tools.h "$orig"/engine/local_engine/engine_msg.h "$orig"/core/pokerthexception.h "$orig"/core/common/pokerthexception.cpp "$work/"
mkdir -p "$work/third_party"
cp -r "$orig/third_party/boost" "$work/third_party/"
# the shims replace the original headers of the same name
rm -f "$work/log.h"
CXX=${CXX:-g++}
BOOST_INC=${BOOST_INC:-}
if ! command -v "$CXX" >/dev/null || [ -z "$BOOST_INC" ] && ! echo '#include <boost/shared_ptr.hpp>' | "$CXX" -x c++ -fsyntax-only - 2>/dev/null; then
  nixf='--extra-experimental-features nix-command --extra-experimental-features flakes'
  gcc=$(nix $nixf build --no-link --print-out-paths nixpkgs#gcc | grep -v -- -man$)
  BOOST_INC=$(nix $nixf build --no-link --print-out-paths nixpkgs#boost.dev)/include
  CXX="$gcc/bin/g++"
fi
inc=(-I"$here/shim" -I"$work")
[ -n "$BOOST_INC" ] && inc+=(-isystem "$BOOST_INC")
"$CXX" -std=c++17 -O1 -w "${inc[@]}" -o "$here/pokerth-oracle" \
  "$here/main.cpp" "$here/tools.cpp" "$work"/{game,handinterface,boardinterface,berointerface,playerinterface,enginefactory}.cpp \
  "$work"/{localhand,localboard,localbero,localberopreflop,localberoflop,localberoturn,localberoriver,localberopostriver,localplayer,cardsvalue,arraydata,localenginefactory,localexception,pokerthexception}.cpp
echo "built $here/pokerth-oracle"
