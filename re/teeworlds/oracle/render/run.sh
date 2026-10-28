#!/usr/bin/env bash
# The rendering oracle: the original Teeworlds 0.7.5 client (bin/teeworlds, build.sh) on Xvfb with Mesa's
# software OpenGL (llvmpipe), 1280x720, connected to the original dedicated server (bin/teeworlds_srv) on
# 127.0.0.1, takes screenshots of fixed scenes with its own `screenshot` command (bound to F10, as the
# release's default binds have it; the key is sent to its window with xdotool). The PNGs go to
# re/teeworlds/golden/render/<scene>.png; scene.json says how each scene is made.
#   run.sh [scene...]        scenes: dm1-spectator dm1-spawn ctf1-spawn (default: all)
# Leaves no process running (everything is killed on exit, with timeouts).
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
golden=$(cd ../.. && pwd)/golden/render
mkdir -p "$golden" out
[[ -x bin/teeworlds ]] || { echo "run build.sh first" >&2; exit 1; }

paths=$(./nixpaths.sh xorg.xvfb xdotool mesa libglvnd xorg.xkbcomp xkeyboard_config)
for p in $paths; do
  [[ -d "$p/bin" ]] && export PATH="$p/bin:$PATH"
  [[ -d "$p/lib" ]] && LD_LIBRARY_PATH="${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}$p/lib"
  [[ -f "$p/lib/libGLX_mesa.so.0" ]] && mesa=$p
  [[ -d "$p/share/X11/xkb" ]] && xkb=$p/share/X11/xkb
done
export LD_LIBRARY_PATH
# software rendering, the same on every machine: llvmpipe, no threads in the rasterizer timing paths
export LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe LP_NUM_THREADS=1
export __GLX_VENDOR_LIBRARY_NAME=mesa LIBGL_DRIVERS_PATH="$mesa/lib/dri"
export SDL_AUDIODRIVER=dummy SDL_VIDEODRIVER=x11 TZ=UTC
# only the virtual X server: never the desktop session the script runs in
unset WAYLAND_DISPLAY XDG_SESSION_TYPE DBUS_SESSION_BUS_ADDRESS

pids=()
cleanup() { for p in "${pids[@]}"; do kill "$p" 2>/dev/null || true; done; sleep 0.3; for p in "${pids[@]}"; do kill -9 "$p" 2>/dev/null || true; done; }
trap cleanup EXIT

freeport() { python3 -c 'import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])'; }

# scene: name map gametype tournament(0/1) seconds-after-enter
scene() {
  local name=$1 map=$2 type=$3 tourn=$4 wait=$5
  local dir=$here/out/$name
  rm -rf "$dir"
  mkdir -p "$dir/home/.local/share/teeworlds" "$dir/srv"
  local port; port=$(freeport)
  local disp=$((100 + RANDOM % 800))
  # the server: the release's defaults but for these lines
  ( cd "$dir/srv" && exec timeout 120 "$here/bin/teeworlds_srv" "sv_port $port" "bindaddr 127.0.0.1" "sv_register 0" "sv_map $map" \
      "sv_gametype $type" "sv_warmup 0" "sv_tournament_mode $tourn" "sv_name render" >"$dir/server.log" 2>&1 ) &
  pids+=($!)
  Xvfb ":$disp" -screen 0 1280x720x24 -nolisten tcp -xkbdir "$xkb" >"$dir/xvfb.log" 2>&1 &
  pids+=($!)
  sleep 1
  # the client's settings file (what the menus would save): window, no sound, the name, no first-start dialog
  cat >"$dir/home/.local/share/teeworlds/settings07.cfg" <<EOF
gfx_screen_width 1280
gfx_screen_height 720
gfx_fullscreen 0
gfx_borderless 0
gfx_vsync 0
gfx_fsaa_samples 0
snd_enable 0
cl_show_welcome 0
player_name "tee"
EOF
  ( cd "$dir" && HOME="$dir/home" DISPLAY=":$disp" exec timeout 90 "$here/bin/teeworlds" "connect 127.0.0.1:$port" >"$dir/client.log" 2>&1 ) &
  local cpid=$!
  pids+=($cpid)
  # wait until the client is in the game
  local i
  for i in $(seq 1 300); do
    grep -q "entered the game\|player has entered" "$dir/server.log" 2>/dev/null && break
    sleep 0.1
  done
  grep -q "entered the game\|player has entered" "$dir/server.log" || { echo "$name: the client did not enter (see $dir)" >&2; tail -5 "$dir/client.log" >&2; return 1; }
  sleep "$wait"
  local win=""
  for i in $(seq 1 50); do
    win=$(DISPLAY=":$disp" timeout 5 xdotool search --name "Teeworlds" 2>/dev/null | tail -1 || true)
    [[ -n "$win" ]] && break
    sleep 0.1
  done
  [[ -n "$win" ]] || { echo "$name: no client window" >&2; DISPLAY=":$disp" timeout 5 xdotool search --name "" getwindowname %@ >&2 || true; return 1; }
  DISPLAY=":$disp" timeout 5 xdotool windowfocus "$win" 2>/dev/null || true
  DISPLAY=":$disp" timeout 5 xdotool key --window "$win" F10
  local shot=""
  for i in $(seq 1 100); do
    shot=$(ls "$dir"/home/.local/share/teeworlds/screenshots/*.png 2>/dev/null | head -1 || true)
    [[ -n "$shot" ]] && break
    sleep 0.1
  done
  [[ -n "$shot" ]] || { echo "$name: no screenshot (see $dir)" >&2; return 1; }
  sleep 0.5
  cp "$shot" "$golden/$name.png"
  echo "$name: $golden/$name.png"
  cleanup
  pids=()
}

scenes=("$@")
[[ ${#scenes[@]} -gt 0 ]] || scenes=(dm1-spectator dm1-spawn ctf1-spawn)
for s in "${scenes[@]}"; do
  case $s in
    dm1-spectator) scene dm1-spectator dm1 dm 1 3 ;;
    dm1-spawn) scene dm1-spawn dm1 dm 0 2 ;;
    ctf1-spawn) scene ctf1-spawn ctf1 ctf 0 2 ;;
    *) echo "unknown scene $s" >&2; exit 2 ;;
  esac
done
