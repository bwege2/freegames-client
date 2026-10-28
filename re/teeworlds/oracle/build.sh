#!/usr/bin/env bash
# Builds the Teeworlds 0.7.5 test oracles from the original release source (run re/teeworlds/fetch.sh
# first) and writes the goldens the ports replay (re/teeworlds/golden/):
#
#   bin/tw-server-oracle  the original dedicated server, unchanged (src/engine/server, src/engine/shared,
#                         src/game/server, src/game/*.cpp, src/base, the bundled zlib and md5), linked with
#                         hook.cpp (ld --wrap: a virtual clock, an in-memory UDP network, recorded secure
#                         random bytes, the rand() stream of the server alone) and with scripted clients
#                         (client.cpp) that speak the original protocol through the original engine classes
#                         (CNetClient, CMsgPacker, CSnapshotDelta, CSnapshotStorage, CNetObjHandler).
#                         oracle_main.cpp is the original main() of server.cpp, so the hook can read the tick.
#   bin/tw-core-oracle    the original game core (src/game/gamecore.cpp, collision.cpp, layers.cpp) on an
#                         official map loaded by the original map loader, driven by seeded random input.
#
#   build.sh               build, run every scenario and core run, write the goldens
#   build.sh build         only build
#   build.sh run NAME...   build and run server scenarios (scenarios/NAME.scn) into out/NAME/
#   build.sh golden NAME... build, run server scenarios and store their goldens
#   build.sh core          build and write the core goldens only
#
# The toolchain is pinned (the nixpkgs of the Netrek and XPilot oracles): clang 21.1.8 (C++ leaves the
# order of a call's argument evaluation to the compiler; clang goes left to right, as Java and TypeScript
# do), glibc 2.44 (its libm's atan2f/powf/sinf/cosf and rand() are part of what the goldens hold).
# -O1 -ffp-contract=off -fno-fast-math on the default x86-64 target (no FMA): every float operation
# rounds as the source says. The generated sources (src/generated) are made by the release's own
# datasrc/compile.py and scripts/cmd5.py, as its bam.lua does.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../orig/teeworlds-0.7.5-src 2>/dev/null && pwd) || { echo "run re/teeworlds/fetch.sh first" >&2; exit 1; }
golden=$(cd .. && pwd)/golden

nixpkgs=${TEEWORLDS_NIXPKGS:-github:NixOS/nixpkgs/d3b13ad75cc492690728f9307e443dec9ef9a20e}
nixpath() {
  nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#$1" --no-link --print-out-paths --offline 2>/dev/null \
    || nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#$1" --no-link --print-out-paths
}
if [[ -z ${CXX:-} ]]; then
  for p in $(nixpath clang); do [[ -x "$p/bin/clang++" ]] && clangbin=$p/bin; done
  [[ -n "${clangbin:-}" ]] || { echo "no clang from nix" >&2; exit 1; }
  export PATH="$clangbin:$PATH"
  CXX=clang++ CC=clang
fi
CC=${CC:-clang}
PY=${PYTHON:-python3}

bin=$here/bin
obj=$bin/obj
gen=$bin/gen/generated

build() {
  mkdir -p "$obj" "$gen"
  echo "using $(command -v "$CXX") ($("$CXX" -dumpversion))"
  # the generated sources, as bam.lua makes them (run in the source root: compile.py opens datasrc/content.py)
  (cd "$src" && for a in network_header:protocol.h network_source:protocol.cpp server_content_header:server_data.h \
       server_content_source:server_data.cpp; do "$PY" -E -s datasrc/compile.py "${a%%:*}" > "$gen/${a#*:}.tmp"; mv "$gen/${a#*:}.tmp" "$gen/${a#*:}"; done
   "$PY" -E -s -W ignore::SyntaxWarning scripts/cmd5.py src/engine/shared/protocol.h src/game/tuning.h src/game/gamecore.cpp "$gen/protocol.h" > "$gen/nethash.cpp")
  "$PY" -I "$here/gen_msgdump.py" "$src" > "$gen/msgdump.cpp"

  local common=(-O1 -g -ffp-contract=off -fno-fast-math -DCONF_RELEASE -w -fno-exceptions -pthread
                -I"$src/src" -I"$bin/gen" -I"$src/src/engine/external/zlib" -I"$src/src/engine/external/pnglite"
                -I"$src/src/engine/external/wavpack")
  local objs=() jobs=0
  compile() { # compile <out.o> <src> [flags]
    local o=$1 s=$2; shift 2
    if [[ ! -f "$o" || "$s" -nt "$o" || "$here/build.sh" -nt "$o" ]]; then
      case "$s" in
        *.c) "$CC" "${common[@]}" "$@" -c "$s" -o "$o" ;;
        *) "$CXX" -std=gnu++11 "${common[@]}" "$@" -c "$s" -o "$o" ;;
      esac
    fi
  }
  local files=()
  files+=("$src"/src/base/*.c "$src"/src/engine/shared/*.cpp "$src"/src/engine/server/*.cpp "$src"/src/game/*.cpp)
  files+=($(find "$src/src/game/server" -name '*.cpp' | sort))
  files+=("$src"/src/engine/external/zlib/*.c "$src"/src/engine/external/md5/*.c)
  files+=("$gen/protocol.cpp" "$gen/server_data.cpp")
  for s in "${files[@]}"; do
    local name=${s#$src/src/}; name=${name#$bin/gen/}; name=${name//\//_}; name=${name%.*}.o
    local extra=()
    [[ $s == */engine/server/server.cpp ]] && extra=(-Dmain=tw_server_unused_main)
    compile "$obj/$name" "$s" "${extra[@]}" &
    objs+=("$obj/$name")
    jobs=$((jobs+1)); if (( jobs >= 12 )); then wait -n; jobs=$((jobs-1)); fi
  done
  for s in hook.cpp client.cpp oracle_main.cpp core.cpp; do compile "$obj/oracle_${s%.cpp}.o" "$here/$s" & done
  compile "$obj/oracle_msgdump.o" "$gen/msgdump.cpp" &
  wait
  local wraps=-Wl,--wrap=time_get,--wrap=net_udp_create,--wrap=net_udp_send,--wrap=net_udp_recv,--wrap=net_udp_close,--wrap=net_socket_read_wait,--wrap=secure_random_init,--wrap=secure_random_fill,--wrap=rand,--wrap=srand
  "$CXX" -pthread -o "$bin/tw-server-oracle" "${objs[@]}" "$obj/oracle_hook.o" "$obj/oracle_client.o" "$obj/oracle_oracle_main.o" "$obj/oracle_msgdump.o" $wraps
  # the core oracle: the same objects without the server's game (only the shared game core and the map loader)
  local core=()
  for o in "${objs[@]}"; do [[ $o == */game_server_* || $o == */engine_server_* ]] || core+=("$o"); done
  "$CXX" -pthread -o "$bin/tw-core-oracle" "${core[@]}" "$obj/oracle_core.o" -Wl,--wrap=atan2f,--wrap=powf
}

# run_scenario NAME: a fresh run directory (the maps of the release, a storage.cfg with the current
# directory only), the server's console output in out/NAME/server.log, the goldens in out/NAME/
run_scenario() {
  local name=$1 out=$here/out/$1
  rm -rf "$out"; mkdir -p "$out/run/maps"
  cp "$src"/datasrc/maps/*.map "$out/run/maps/"
  printf 'add_path $CURRENTDIR\n' > "$out/run/storage.cfg"
  (cd "$out/run" && HOME="$out/run" TZ=UTC "$bin/tw-server-oracle" "$here/scenarios/$name.scn" "$out" > "$out/server.log" 2>&1) \
    || { echo "scenario $name failed (see $out/server.log)" >&2; tail -20 "$out/server.log" >&2; return 1; }
  echo "$name: $(cat "$out/summary.txt" | head -3 | tr '\n' ' ')"
}

store_golden() { # store_golden NAME
  local name=$1 out=$here/out/$1 g=$golden/$1
  rm -rf "$g"; mkdir -p "$g"
  cp "$out/config.txt" "$out/summary.txt" "$g/"
  gzip -9n < "$out/packets.jsonl" > "$g/packets.jsonl.gz"
  gzip -9n < "$out/snaps.jsonl" > "$g/snaps.jsonl.gz"
}

run_core() {
  local out=$here/out/core
  rm -rf "$out"; mkdir -p "$out/run/maps"
  cp "$src"/datasrc/maps/*.map "$out/run/maps/"
  printf 'add_path $CURRENTDIR\n' > "$out/run/storage.cfg"
  mkdir -p "$golden/core"
  local runs=("dm1 2 3000 1" "dm1 4 3000 2" "dm1 8 2500 3" "dm2 4 3000 4" "ctf1 4 3000 5" "ctf2 8 2500 6" "dm6 2 3000 7")
  for r in "${runs[@]}"; do
    set -- $r
    local n="$1-$2"
    (cd "$out/run" && HOME="$out/run" "$bin/tw-core-oracle" "$1" "$2" "$3" "$4" "$out/$n.jsonl" "$out/libm-$n.jsonl") > "$out/$n.log" 2>&1 \
      || { echo "core $n failed" >&2; tail "$out/$n.log" >&2; return 1; }
    gzip -9n < "$out/$n.jsonl" > "$golden/core/$n.jsonl.gz"
    echo "core $n: $(wc -l < "$out/$n.jsonl") lines"
  done
  sort -u "$out"/libm-*.jsonl | gzip -9n > "$golden/core/libm.jsonl.gz"
}

case ${1:-all} in
  build) build ;;
  run) shift; build; for n in "$@"; do run_scenario "$n"; done ;;
  golden) shift; build; for n in "$@"; do run_scenario "$n"; store_golden "$n"; done ;;
  core) build; run_core ;;
  all) build
       for f in scenarios/*.scn; do n=$(basename "$f" .scn); run_scenario "$n"; store_golden "$n"; done
       run_core
       du -sh "$golden"/* ;;
  *) echo "usage: build.sh [build | run NAME... | golden NAME... | core | all]" >&2; exit 2 ;;
esac
