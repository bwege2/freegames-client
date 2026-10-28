#!/usr/bin/env bash
# Runs the Frozen Bubble 2.2.0 oracle (built by build.sh) on a session and writes its trace.
#
#   run.sh <session.txt> <trace.out> [home-out-dir]
#
# Session format (the port's harness parses the same file):
#   # comment; directives:
#   # time <epoch>                 time() at virtual 0 (default 1278000000)
#   # args <command line args>     for frozen-bubble (or the editor)
#   # program frozen-bubble-editor run the level editor instead of the game
#   # home file <name> <path>      copied to ~/.frozen-bubble/<name> (path relative to the session)
#   <ms> key down <keyname> [<unicode>] | <ms> key up <keyname>
#   <ms> tap <keyname> [<hold ms, 40>] [<unicode>]
#   <ms> mouse move <x> <y> | <ms> mouse down <x> <y> <button> | <ms> mouse up <x> <y> <button>
#   <ms> end
# keyname: SDL 1.2 keysym name without SDLK_, lower case. Unicode defaults to what X11 gives on a
# US layout (printable keys, shifted while a shift key is down; return/backspace/tab/escape/delete).
#
# Environment: ORACLE_FRAMES=<dir> also writes every frame as <dir>/NNNNNN.png;
# ORACLE_PERL_MODULE=<module> loads re/frozenbubble/oracle/<module>.pm first (perl -M);
# the module FBOracle writes the game's state to <trace.out>.state;
# ORACLE_TIMEOUT=<s> wall-clock watchdog (default 900). The game's stdout/stderr go to
# <trace.out>.log. Prints the exit status (also its own).
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: run.sh <session.txt> <trace.out> [home-out-dir]" >&2; exit 64; }
here=$(cd "$(dirname "$0")" && pwd)
. "$here/env.sh"
session=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
sdir=$(dirname "$session")
trace=$2
homeout=${3:-}
[ -f "$fb_work/libfbshim.so" ] || { echo "run build.sh first" >&2; exit 1; }

args=() program=frozen-bubble
# Perl puts heap addresses into hash keys (HASH(0x...)), so the game's hash order depends on the
# heap layout, which depends on every string the process gets: the run directory, the session and
# trace paths and the environment are therefore the same in every run. One run at a time per
# work directory (lock).
exec 9> "$fb_work/run.lock"
flock 9
tmp=$fb_work/run
rm -rf "$tmp"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/home/.frozen-bubble"
cp "$session" "$tmp/session.txt"
if [ -n "${ORACLE_FRAMES:-}" ]; then mkdir -p "$tmp/frames"; fi
while IFS= read -r line; do
  case $line in
    '# args '*) read -r -a args <<< "${line#'# args '}";;
    '# program '*) program=${line#'# program '};;
    '# home file '*)
      rest=${line#'# home file '}
      name=${rest%% *} path=${rest#* }
      cp "$sdir/$path" "$tmp/home/.frozen-bubble/$name";;
  esac
done < "$session"
case $program in frozen-bubble|frozen-bubble-editor) ;; *) echo "unknown program $program" >&2; exit 64;; esac

perlargs=(-I"$fb_work/fb/c_stuff/lib" -I"$fb_work/perl")
if [ -n "${ORACLE_PERL_MODULE:-}" ]; then perlargs+=(-I"$here" -M"$ORACLE_PERL_MODULE"); fi

status=0
(cd "$tmp" && env -i \
  HOME="$tmp/home" XDG_CONFIG_HOME="$fb_work/xdg/config" XDG_CACHE_HOME="$fb_work/xdg/cache" XDG_DATA_HOME="$fb_work/xdg/data" USER=player LOGNAME=player PATH=/usr/bin:/bin TZ=UTC LANG=C LANGUAGE= \
  PERL_HASH_SEED=0 PERL_PERTURB_KEYS=0 PERL_RAND_SEED=1 \
  SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy FONTCONFIG_FILE="$FONTCONFIG_FILE" \
  GLIBC_TUNABLES=glibc.cpu.hwcaps=-AVX2,-FMA,-AVX2_Usable,-FMA_Usable \
  LD_LIBRARY_PATH="$fb_prefix/lib:$fb_nixlib" LD_PRELOAD="$fb_work/libfbshim.so" \
  ORACLE_SESSION="$tmp/session.txt" ORACLE_TRACE="$tmp/trace.out" ORACLE_STATE="$tmp/state.out" ORACLE_FRAMES="$tmp/frames" \
  timeout -k 10 "${ORACLE_TIMEOUT:-900}" setarch "$(uname -m)" -R "$fb_perl" "${perlargs[@]}" "$fb_work/fb/$program" "${args[@]}" \
  > "$trace.log" 2>&1) || status=$?

cp "$tmp/trace.out" "$trace" 2>/dev/null || : > "$trace"
cp "$tmp/state.out" "$trace.state" 2>/dev/null || : > "$trace.state"
if [ -n "${ORACLE_FRAMES:-}" ]; then
  rm -rf "$ORACLE_FRAMES" && mkdir -p "$(dirname "$ORACLE_FRAMES")" && mv "$tmp/frames" "$ORACLE_FRAMES"
fi
if [ -n "$homeout" ]; then
  rm -rf "$homeout" && mkdir -p "$homeout"
  cp -r "$tmp/home/.frozen-bubble/." "$homeout/"
fi
echo "exit status $status"
exit "$status"
