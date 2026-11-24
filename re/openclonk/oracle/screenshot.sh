#!/usr/bin/env bash
# The original's picture of a record at a frame, the oracle of drawing (milestone 2, re/openclonk/NOTES.md).
# The full game (build-full.sh: SDL2, OpenGL 3.2 core, OpenAL) replays the record fullscreen on a virtual X display
# (Xvfb) with Mesa's software OpenGL (llvmpipe); gdb stops it in C4GraphicsSystem::FinishDrawing once Game.FrameCounter
# has reached <frame>, lets that call finish (the frame drawn and the buffers swapped: C4FullScreen::Execute only
# requests the update, which C4FullScreen::PerformUpdate draws) and the X screen is saved as PNG.
# A record fixes scenario, seed, players and control, so the port replays the same game (test/screenshot.test.ts).
# The game runs with its own HOME (work/shot/home), so nothing is written to the user's ~/.clonk.
#   screenshot.sh <record: a packed scenario group with CtrlRec.ocb> <frame> <out.png> [WIDTHxHEIGHT]
set -euo pipefail
rec=$(realpath "$1")
frame=$2
out=$(realpath -m "$3")
cd "$(dirname "$0")"
size=${4:-1024x768}
game=$(cd ../work/full 2>/dev/null && pwd)/openclonk
[[ -x $game ]] || { echo "run re/openclonk/oracle/build-full.sh first" >&2; exit 1; }
planet=$(cd ../orig/openclonk/planet && pwd)
# the game finds the content through <its folder>/planet (C4Reloc::Init)
ln -sfn "$planet" "$(dirname "$game")/planet"
work=$(mkdir -p ../work/shot && cd ../work/shot && pwd)
home=$work/home
rm -rf "$home" && mkdir -p "$home/.clonk/openclonk/Records.ocf"
# the defaults, without sound (the virtual display has no audio device), and a window of the screen's size: without a
# window manager SDL cannot make a window fullscreen (SDL_WINDOW_FULLSCREEN_DESKTOP needs one), the window stays 1x1
# while the game draws for the desktop's mode; in a window of the same size the game draws the same picture
w=${size%x*} h=${size#*x}
printf '[General]\nLanguage="US - English"\nLanguageEx="US"\n[Graphics]\nWindowed=1\nResolutionX=%s\nResolutionY=%s\nWindowX=%s\nWindowY=%s\n[Sound]\nSound=0\nMusic=0\n' $w $h $w $h > "$home/.clonk/openclonk/config"
cp -a "$rec" "$home/.clonk/openclonk/Records.ocf/"
rm -f "$out"
recname=$home/.clonk/openclonk/Records.ocf/$(basename "$rec")
cat > "$work/gdb.cmd" <<EOF
set pagination off
set confirm off
set breakpoint pending on
handle SIGPIPE nostop noprint
break C4GraphicsSystem::FinishDrawing if ::Game.FrameCounter >= $frame
run
finish
shell xwd -root -silent | convert xwd:- png24:$out
kill
quit
EOF
nix-shell --extra-experimental-features 'nix-command flakes' -I nixpkgs=flake:nixpkgs \
  -p xvfb-run xorg.xorgserver xorg.xwd imagemagick gdb mesa --run "
    mesa=\$(dirname \$(dirname \$(command -v glxinfo 2>/dev/null || echo /x/bin/x)))
    for d in \$(echo \$NIX_LDFLAGS | tr ' ' '\n' | sed -n 's/^-L//p'); do [ -e \$d/libGLX_mesa.so.0 ] && mesa_lib=\$d; done
    export LD_LIBRARY_PATH=\$mesa_lib __GLX_VENDOR_LIBRARY_NAME=mesa LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe
    # the X server's GLX finds Mesa's DRI drivers here (nix's Xvfb looks in /run/opengl-driver otherwise and offers no GLX)
    export LIBGL_DRIVERS_PATH=\$mesa_lib/dri
    export HOME='$home'
    # the virtual display, not the desktop's Wayland compositor (SDL prefers Wayland when WAYLAND_DISPLAY is set);
    # no audio device (OpenAL Soft's null output)
    unset WAYLAND_DISPLAY; export SDL_VIDEODRIVER=x11 ALSOFT_DRIVERS=null
    xvfb-run -a -s '+extension GLX -screen 0 ${size}x24' gdb -batch -x '$work/gdb.cmd' --args '$game' --fullscreen --language=US '$recname'
  " > "$work/gdb.log" 2>&1 || true
[[ -s $out ]] || { tail -30 "$work/gdb.log" >&2; echo "no screenshot" >&2; exit 1; }
echo "$out: frame $frame of $(basename "$rec")"
