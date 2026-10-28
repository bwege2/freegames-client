#!/usr/bin/env bash
# Dumps clang's syntax tree (JSON) of every C file of the game, as the oracle compiles it
# (re/nethack/oracle/build.sh, run it first: it writes the generated headers and vis_tab.c), into
# re/nethack/work/ast/<file>.json, and the layouts of its structs and unions (offsets and sizes as clang
# lays them out for x86-64) into re/nethack/work/layout/<file>.txt. The translator (c2ts/) reads them.
#   ast.sh [file.c ...]     only these (names as in the list below, e.g. hack.c)
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
if command -v nix >/dev/null; then
  paths=$(nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang --no-link --print-out-paths --offline 2>/dev/null \
    || nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang --no-link --print-out-paths)
  for p in $paths; do [[ -x "$p/bin/clang" ]] && export PATH="$p/bin:$PATH"; done
fi
work=$(cd ../work && pwd)
mkdir -p "$work/ast"
cd "$work/src"
srcs=(*.c ../win/tty/getline.c ../win/tty/termcap.c ../win/tty/topl.c ../win/tty/wintty.c
      ../sys/share/ioctl.c ../sys/share/unixtty.c ../sys/unix/unixmain.c ../sys/unix/unixunix.c
      ../sys/unix/unixres.c ../sys/share/posixregex.c)
if (($#)); then
  want=" $* "
  sel=()
  for f in "${srcs[@]}"; do [[ $want == *" $(basename "$f") "* ]] && sel+=("$f"); done
  srcs=("${sel[@]}")
fi
# __NO_CTYPE: glibc's isalpha() & co. as calls, not as lookups in its locale tables
flags=(-I"$here/../oracle/stub" -I"$work/include" -std=gnu99 -w -DNOTPARMDECL -DDLB -DSYSCF '-DSYSCF_FILE="sysconf"'
       -DSECURE -DTIMED_DELAY '-DHACKDIR="."' -DDUMPLOG -DCONFIG_ERROR_SECURE=FALSE -D__NO_CTYPE)
mkdir -p "$work/layout"
n=0
for f in "${srcs[@]}"; do
  b=$(basename "$f" .c)
  { clang "${flags[@]}" -Xclang -ast-dump=json -fsyntax-only "$f" > "$work/ast/$b.json"
    clang "${flags[@]}" -Xclang -fdump-record-layouts-complete -fsyntax-only "$f" > "$work/layout/$b.txt"; } &
  n=$((n + 1))
  if ((n % 8 == 0)); then wait; fi
done
wait
echo "dumped ${#srcs[@]} files into $work/ast/"
