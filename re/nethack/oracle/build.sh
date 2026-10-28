#!/usr/bin/env bash
# Builds the NetHack 3.6.7 test oracle from the original sources (run re/nethack/fetch.sh first).
#
# 1. The build tools of the package, compiled as sys/unix/Makefile.utl does: makedefs, lev_comp,
#    dgn_comp (from the parsers the package ships in sys/share/) and dlb. They make the generated
#    headers (onames.h, pm.h, vis_tab.[ch], date.h) and the data files of the installation (data,
#    rumors, oracles, options, quest.dat, engrave, epitaph, bogusmon, dungeon, *.lev), as
#    sys/unix/Makefile.dat does, and the data library nhdat that holds them, as Makefile.top's dlb
#    target does. date.h and options get the release date (SOURCE_DATE_EPOCH).
# 2. The game: src/*.c, vis_tab.c, the tty interface (win/tty/*.c) and the Unix system files
#    (sys/share/ioctl.c, unixtty.c, posixregex.c, sys/unix/unixmain.c, unixunix.c, unixres.c), with the
#    flags of the Linux hints file (sys/unix/hints/linux) that change the game, tty only (no curses
#    interface) and without compressing save files; linked with stub.c (a fixed termcap entry, a fixed
#    clock and login, the seed, the keys and the recording; see there) instead of ncurses' termcap.
#
# Everything is compiled with clang: C leaves the order in which a call's arguments (and the operands of
# most operators) are evaluated to the compiler; clang evaluates them left to right, as the port's
# TypeScript does (re/nethack/NOTES.md).
#
# Writes re/nethack/work/ (the build tree), re/nethack/work/install/ (HACKDIR: nhdat, license, symbols,
# sysconf, an empty record, logfile, xlogfile and perm, save/) and re/nethack/oracle/nethack-oracle.
# Needs clang (nix's when nix is there, else the one on PATH).
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
if command -v nix >/dev/null; then
  paths=$(nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang --no-link --print-out-paths --offline 2>/dev/null \
    || nix --extra-experimental-features 'nix-command flakes' build nixpkgs#clang --no-link --print-out-paths)
  for p in $paths; do [[ -x "$p/bin/clang" ]] && export PATH="$p/bin:$PATH"; done
fi
CC=${CC:-clang}
echo "using $(command -v "$CC") ($("$CC" -dumpversion))"
orig=$(cd ../orig/NetHack-3.6.7 && pwd)
work=$here/../work
mkdir -p "$work"
work=$(cd "$work" && pwd)
rm -rf "$work/include" "$work/src" "$work/util" "$work/dat" "$work/win" "$work/sys" "$work/obj" "$work/install"
cp -r "$orig/include" "$orig/src" "$orig/util" "$orig/dat" "$orig/win" "$orig/sys" "$work/"
# config.h as for a build without an external compressor (the browser cannot run one): save files are
# written as they are, not compressed by /usr/bin/compress (config.h, "COMPRESS")
python3 -I - "$work/include/config.h" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
old = '#define COMPRESS "/usr/bin/compress" /* Lempel-Ziv compression */\n#define COMPRESS_EXTENSION ".Z"      /* compress\'s extension */\n'
assert old in s, 'config.h: COMPRESS not found'
s = s.replace(old, '/* #define COMPRESS "/usr/bin/compress" */ /* (no compression: the port) */\n/* #define COMPRESS_EXTENSION ".Z" */\n')
open(p, 'w').write(s)
PY
# 2023-02-16 00:00 UTC, the release of 3.6.7 (doc/fixes36.7, the README)
export SOURCE_DATE_EPOCH=1676505600
export TZ=UTC

# the flags of sys/unix/hints/linux that change the game (no compression, no curses interface)
GAMEFLAGS=(-DDLB -DSYSCF '-DSYSCF_FILE="sysconf"' -DSECURE -DTIMED_DELAY '-DHACKDIR="."' -DDUMPLOG -DCONFIG_ERROR_SECURE=FALSE)
# DEBUG=1: without optimisation and named nethack-oracle-debug, for NH_RNGTRACE (stub.c): every frame of
# the callers is there; the order of evaluation is clang's either way
OPT=-O2
out=nethack-oracle
if [[ ${DEBUG:-} == 1 ]]; then OPT="-O0 -g"; out=nethack-oracle-debug; fi
CFLAGS=($OPT -w -std=gnu99 -fno-strict-aliasing -I"$work/include" -DNOTPARMDECL)

# ---- the build tools ----
cd "$work/util"
$CC "${CFLAGS[@]}" "${GAMEFLAGS[@]}" -DREPRODUCIBLE_BUILD -o makedefs makedefs.c ../src/monst.c ../src/objects.c
./makedefs -o
./makedefs -p
./makedefs -z
mv ../util/vis_tab.c ../src/ 2>/dev/null || true
./makedefs -v
cp ../sys/share/lev_yacc.c ../sys/share/lev_lex.c ../sys/share/dgn_yacc.c ../sys/share/dgn_lex.c .
cp ../sys/share/lev_comp.h ../sys/share/dgn_comp.h ../include/
$CC "${CFLAGS[@]}" -o lev_comp lev_yacc.c lev_lex.c lev_main.c panic.c ../src/alloc.c ../src/drawing.c \
  ../src/decl.c ../src/monst.c ../src/objects.c
$CC "${CFLAGS[@]}" -o dgn_comp dgn_yacc.c dgn_lex.c dgn_main.c panic.c ../src/alloc.c
$CC "${CFLAGS[@]}" "${GAMEFLAGS[@]}" -o dlb dlb_main.c ../src/dlb.c ../src/alloc.c panic.c

cd "$work/dat"
../util/makedefs -d
../util/makedefs -r
../util/makedefs -q
../util/makedefs -h
../util/makedefs -s
../util/makedefs -e
../util/dgn_comp dungeon.pdf
for f in bigroom castle endgame gehennom knox medusa mines oracle sokoban tower yendor \
         Arch Barb Caveman Healer Knight Monk Priest Ranger Rogue Samurai Tourist Valkyrie Wizard; do
  ../util/lev_comp "$f.des"
done
# Makefile.top: DATDLB, in its order
LC_ALL=C ../util/dlb cf nhdat help hh cmdhelp keyhelp history opthelp wizhelp dungeon tribute \
  asmodeus.lev baalz.lev bigrm-*.lev castle.lev fakewiz?.lev juiblex.lev knox.lev medusa-?.lev minend-?.lev \
  minefill.lev minetn-?.lev oracle.lev orcus.lev sanctum.lev soko?-?.lev tower?.lev valley.lev wizard?.lev \
  astral.lev air.lev earth.lev fire.lev water.lev \
  ???-goal.lev ???-fil?.lev ???-loca.lev ???-strt.lev \
  bogusmon data engrave epitaph oracles options quest.dat rumors

# ---- the game ----
cd "$work/src"
objs=()
srcs=(*.c ../win/tty/getline.c ../win/tty/termcap.c ../win/tty/topl.c ../win/tty/wintty.c
      ../sys/share/ioctl.c ../sys/share/unixtty.c ../sys/unix/unixmain.c ../sys/unix/unixunix.c
      ../sys/unix/unixres.c ../sys/share/posixregex.c)
mkdir -p "$work/obj"
for f in "${srcs[@]}"; do
  o="$work/obj/$(basename "$f" .c).o"
  $CC -I"$here/stub" "${CFLAGS[@]}" "${GAMEFLAGS[@]}" -c -o "$o" "$f" &
  objs+=("$o")
done
wait
$CC "${CFLAGS[@]}" -c -o "$work/obj/stub.o" "$here/stub.c"
objs+=("$work/obj/stub.o")
wraps=isatty,getchar,getc,fgetc,isaac64_next_uint64,time,fopen,getpid,getuid,geteuid,getgid,getegid,usleep,sleep,getlogin,getpwuid,getpwnam,tcgetattr,tcsetattr
$CC -o "$here/$out" "${objs[@]}" "-Wl,--wrap=${wraps//,/,--wrap=}"

# ---- the installation (HACKDIR) ----
inst=$work/install
mkdir -p "$inst/save"
cd "$work/dat"
cp nhdat license symbols "$inst/"
cp "$work/sys/unix/sysconf" "$inst/sysconf"
: > "$inst/perm"; : > "$inst/record"; : > "$inst/logfile"; : > "$inst/xlogfile"
echo "built $here/$out and $inst/"
