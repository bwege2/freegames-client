#!/usr/bin/env bash
# Builds the Abuse 0.8 test oracle from the original sources (run re/abuse/fetch.sh first) into
# re/abuse/oracle/abuse-oracle, and its data directory re/abuse/work/data (the free data of the
# tarball, as `make install` of a --disable-nonfree build installs it).
#
# The program is the release's: every file of src/Makefile.am and of the libraries in src/lisp,
# src/imlib, src/sdlport and src/net, compiled with the release's flags (-DNO_CHECK) and a
# config.h with what configure finds on Linux, for SDL 1.2 (sdl12-compat) and SDL_mixer 1.2. Two
# things differ, both outside the game:
#   - src/sdlport/sound.cpp is replaced by sound_rec.cpp: the sound layer records every sound
#     and music call into the trace instead of playing it (the oracle has no sound files);
#   - hook.cpp is linked in with `ld --wrap` for the clock, the input and the screen (see there).
# Everything is compiled with clang: C++ leaves the order in which a call's arguments are evaluated
# to the compiler; clang evaluates them left to right, as the port's TypeScript does.
# Needs nix (for clang, sdl12-compat and SDL_mixer), or those on PATH with CXX/SDL_CFLAGS/SDL_LIBS set.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
orig=$(cd ../orig/abuse-0.8 && pwd)
work=$here/../work
mkdir -p "$work"
work=$(cd "$work" && pwd)

if [[ -z ${SDL_CFLAGS:-} ]] && command -v nix >/dev/null; then
  nixb() { nix --extra-experimental-features 'nix-command flakes' build "$@" --no-link --print-out-paths; }
  paths=$(nixb nixpkgs#clang nixpkgs#sdl12-compat 'nixpkgs#SDL_mixer^*')
  for p in $paths; do
    [[ -x "$p/bin/clang++" ]] && export PATH="$p/bin:$PATH"
    [[ -f "$p/include/SDL/SDL.h" ]] && sdl=$p
    [[ -f "$p/include/SDL/SDL_mixer.h" ]] && mixdev=$p
    [[ -f "$p/lib/libSDL_mixer.so" ]] && mixlib=$p
  done
  SDL_CFLAGS="-I$sdl/include/SDL -I$sdl/include -I$mixdev/include -D_GNU_SOURCE=1 -D_REENTRANT"
  SDL_LIBS="-L$sdl/lib -lSDL -L$mixlib/lib -lSDL_mixer -Wl,-rpath,$sdl/lib -Wl,-rpath,$mixlib/lib"
fi
CXX=${CXX:-clang++}
echo "using $(command -v "$CXX") ($("$CXX" -dumpversion))"

rm -rf "$work/src" "$work/obj"
cp -r "$orig/src" "$work/src"
cp sound_rec.cpp "$work/src/sdlport/sound.cpp"
cp hook.cpp "$work/src/oracle_hook.cpp"
cat > "$work/src/config.h" <<'EOF'
/* config.h as configure writes it for Abuse 0.8 on Linux */
#define HAVE_ATEXIT 1
#define HAVE_DIRENT_H 1
#define HAVE_FCNTL_H 1
#define HAVE_GETTIMEOFDAY 1
#define HAVE_INTTYPES_H 1
#define HAVE_MALLOC_H 1
#define HAVE_MEMORY_H 1
#define HAVE_NETINET_IN_H 1
#define HAVE_ON_EXIT 1
#define HAVE_SDL_SDL_MIXER_H 1
#define HAVE_STDINT_H 1
#define HAVE_STDLIB_H 1
#define HAVE_STRINGS_H 1
#define HAVE_STRING_H 1
#define HAVE_STRSTR 1
#define HAVE_SYS_IOCTL_H 1
#define HAVE_SYS_STAT_H 1
#define HAVE_SYS_TIME_H 1
#define HAVE_SYS_TYPES_H 1
#define HAVE_UNISTD_H 1
#define PACKAGE "abuse"
#define PACKAGE_BUGREPORT "sam@hocevar.net"
#define PACKAGE_NAME "abuse"
#define PACKAGE_STRING "abuse 0.8"
#define PACKAGE_TARNAME "abuse"
#define PACKAGE_URL ""
#define PACKAGE_VERSION "0.8"
#define STDC_HEADERS 1
#define VERSION "0.8"
EOF

# the files of src/Makefile.am (abuse_SOURCES) and of the four libraries
main=(lol/matrix.cpp lol/timer.cpp specache.cpp netcfg.cpp innet.cpp chat.cpp endgame.cpp loadgame.cpp
  profile.cpp cop.cpp statbar.cpp compiled.cpp ant.cpp sensor.cpp demo.cpp lcache.cpp nfclient.cpp
  clisp.cpp gui.cpp transp.cpp collide.cpp property.cpp cache.cpp particle.cpp objects.cpp extend.cpp
  console.cpp ability.cpp items.cpp dev.cpp chars.cpp level.cpp smallfnt.cpp automap.cpp help.cpp
  intsect.cpp loader2.cpp seq.cpp points.cpp fnt6x13.cpp morpher.cpp menu.cpp director.cpp view.cpp
  configuration.cpp game.cpp light.cpp devsel.cpp crc.cpp gamma.cpp ui/volumewindow.cpp)
lisp=(lisp/lisp.cpp lisp/lisp_opt.cpp lisp/lisp_gc.cpp lisp/trig.cpp)
imlib=(imlib/filter.cpp imlib/image.cpp imlib/transimage.cpp imlib/linked.cpp imlib/input.cpp
  imlib/palette.cpp imlib/include.cpp imlib/fonts.cpp imlib/specs.cpp imlib/supmorph.cpp
  imlib/pcxread.cpp imlib/jrand.cpp imlib/keys.cpp imlib/dprint.cpp imlib/status.cpp imlib/pmenu.cpp
  imlib/scroller.cpp imlib/filesel.cpp imlib/tools.cpp imlib/guistat.cpp imlib/sprite.cpp
  imlib/jwindow.cpp imlib/video.cpp)
sdlport=(sdlport/video.cpp sdlport/mouse.cpp sdlport/event.cpp sdlport/sound.cpp sdlport/timing.cpp
  sdlport/jdir.cpp sdlport/joystick.cpp sdlport/setup.cpp sdlport/hmi.cpp)
net=(net/gserver.cpp net/gclient.cpp net/fileman.cpp net/sock.cpp net/tcpip.cpp)

# the data directory the release installs (data/Makefile.am), without the non-free files
# (fetch.sh never unpacks them); assetdir is passed as -DASSETDIR like configure does
data=$work/data
rm -rf "$data"
cp -r "$orig/data" "$data"
rm -f "$data"/Makefile.am "$data"/Makefile.in
# Silent stand-ins for the non-free sound files, so that the sound layer can be on (the original
# checks that every sound effect it registers is a RIFF file and exits otherwise): a WAV header
# with no samples under each name data/Makefile.am lists. Nothing of the originals is in them.
python3 -I - "$orig/data/Makefile.am" "$data" <<'PY'
import re, struct, sys, os
names = sorted(set(re.findall(r'(\S+\.(?:wav|hmi))', open(sys.argv[1]).read())))
hdr = b'RIFF' + struct.pack('<I', 36) + b'WAVEfmt ' + struct.pack('<IHHIIHH', 16, 1, 1, 11025, 11025, 1, 8) + b'data' + struct.pack('<I', 0)
for n in names:
    p = os.path.join(sys.argv[2], n)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(hdr if n.endswith('.wav') else b'')
print(f'{len(names)} silent stand-ins for the sound files')
PY

OPT=${OPT:--O2}
flags=($OPT -g -std=gnu++98 -DHAVE_CONFIG_H -DNO_CHECK "-DASSETDIR=\"$data/\"" -I"$work/src" -I"$work/src/lisp"
       -I"$work/src/imlib" -I"$work/src/net" $SDL_CFLAGS -w -fno-strict-aliasing -fno-delete-null-pointer-checks)
mkdir -p "$work/obj"
cd "$work/src"
objs=()
n=0
for f in "${main[@]}" "${lisp[@]}" "${imlib[@]}" "${sdlport[@]}" "${net[@]}" oracle_hook.cpp; do
  o=$work/obj/${f//\//_}.o
  objs+=("$o")
  "$CXX" "${flags[@]}" -c "$f" -o "$o" &
  n=$((n + 1))
  if ((n % 12 == 0)); then wait; fi
done
wait
wraps=()
for s in gettimeofday time usleep SDL_Delay SDL_GetTicks SDL_PollEvent SDL_GetMouseState SDL_GetModState \
         SDL_WM_GrabInput _Z18update_window_donev; do
  wraps+=("-Wl,--wrap=$s")
done
"$CXX" -o "$here/abuse-oracle" "${objs[@]}" "${wraps[@]}" $SDL_LIBS -lm
echo "built $here/abuse-oracle (data: $data)"
