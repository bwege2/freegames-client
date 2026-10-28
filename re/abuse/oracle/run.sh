#!/usr/bin/env bash
# Runs the oracle (build.sh) on one session:
#   run.sh <session.txt> <trace out> [seed] [-- extra abuse arguments]
# The session's first lines may set up the save directory (~/.abuse), as a player's machine
# would have it, before the program starts:
#   # home gamma <n>      gamma.lsp with (setq darkest_gray <n>), as the first-run dialog writes it
#   # home file <name> <path>   copy <path> (relative to the session) to ~/.abuse/<name>
#   # args <arguments>    command line arguments
# Without "home gamma" the program starts with the first-run gamma dialog.
# The save directory starts empty but for abuserc, the file Abuse 0.8 writes on its first run
# (createRCFile in src/sdlport/setup.cpp), and the light table cache (light.tbl, which the
# program writes there; it is the same table either way and only saves time).
# The time zone is UTC (the save screens show the save's local time).
# ABUSE_FRAMES=<dir> also dumps every frame (hook.cpp). Prints the run's exit status.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
session=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
trace=$(cd "$(dirname "$2")" && pwd)/$(basename "$2")
seed=${3:-1}
work=$(cd "$here/../work" && pwd)
home=$(mktemp -d "${TMPDIR:-/tmp}/abuse-home.XXXXXX")
trap 'rm -rf "$home"' EXIT
mkdir -p "$home/.abuse"
cat > "$home/.abuse/abuserc" <<EOF
; Abuse-SDL Configuration file

; Startup fullscreen
fullscreen=0

; Use DoubleBuffering
doublebuf=0

; Use OpenGL
gl=0

; Location of the datafiles
datadir=$work/data/

; Use mono audio only
mono=0

; Grab the mouse to the window
grabmouse=0

; Set the scale factor
scale=2

; Use anti-aliasing (with gl=1 only)
antialias=1

; Disable the SDL parachute in the case of a crash
nosdlparachute=0

; Key mappings
left=LEFT
right=RIGHT
up=UP
down=DOWN
fire=SPACE
weapprev=CTRL_R
weapnext=INSERT
EOF
args=()
while IFS= read -r line; do
  case $line in
    "# home gamma "*) printf '(setq darkest_gray %s)\n' "${line#\# home gamma }" > "$home/.abuse/gamma.lsp" ;;
    "# home file "*) set -- ${line#\# home file }; cp "$(dirname "$session")/$2" "$home/.abuse/$1" ;;
    "# args "*) read -r -a more <<< "${line#\# args }"; args+=("${more[@]}") ;;
  esac
done < "$session"
[[ -f $work/light.tbl ]] && cp "$work/light.tbl" "$home/.abuse/light.tbl"
cd "$work/data"
status=0
TZ=UTC HOME=$home SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy ABUSE_SEED=$seed ABUSE_SESSION=$session \
  ABUSE_TRACE=$trace \
  "$here/abuse-oracle" -scale 1 "${args[@]}" > "$home/out.txt" 2>&1 || status=$?
[[ -f $work/light.tbl || ! -f $home/.abuse/light.tbl ]] || cp "$home/.abuse/light.tbl" "$work/light.tbl"
echo "exit $status"
