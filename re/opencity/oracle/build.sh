#!/usr/bin/env bash
# Builds the OpenCity 0.0.6.5stable test oracle (run re/opencity/fetch.sh first) into
# re/opencity/oracle/opencity-oracle.
#
# The oracle is the release's own game logic, compiled unchanged from re/opencity/orig/: the map
# generator (src/mapgen), the height map (map.cpp), the building layer, the structures, the five
# micro simulators and MainSim, the property manager and its .conf parser, the path finder, the
# vehicles and the movement manager, the GUI controls (their state only) and the City class itself
# (city.cpp: tools, days, bills, save and load). Release flags: -std=c++98 -DNDEBUG.
#
# Left out, replaced by stub.cpp: the SDL calls (no window, no threads: SDL_CreateThread does not start
# the simulator thread, the harness runs MainSim's loop body itself on a virtual clock), the renderer,
# the textures, the audio device and the networking. GL calls go to libglvnd without a context (they do
# nothing). harness.cpp reads a script on stdin and prints the city's state; see its top comment.
#
# Needs nix (for g++, SDL 1.2 headers and the GL headers), or set CXX/SDL_CFLAGS/GL_CFLAGS/GL_LIBS.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../orig/opencity-0.0.6.5stable/src && pwd)

if [[ -z ${SDL_CFLAGS:-} ]] && command -v nix >/dev/null; then
  nixb() { nix --extra-experimental-features 'nix-command flakes' build "$@" --no-link --print-out-paths; }
  for p in $(nixb nixpkgs#gcc nixpkgs#sdl12-compat 'nixpkgs#libGL^dev' 'nixpkgs#libGLU^dev' nixpkgs#libGL); do
    [[ -x "$p/bin/g++" ]] && export PATH="$p/bin:$PATH"
    [[ -f "$p/include/SDL/SDL.h" ]] && SDL_CFLAGS="-I$p/include/SDL"
    [[ -f "$p/include/GL/gl.h" ]] && GL_CFLAGS="${GL_CFLAGS:-} -I$p/include"
    [[ -f "$p/include/GL/glu.h" ]] && GL_CFLAGS="${GL_CFLAGS:-} -I$p/include"
    [[ -f "$p/lib/libGL.so" ]] && GL_LIBS="-L$p/lib -lGL -Wl,-rpath,$p/lib"
  done
fi
CXX=${CXX:-g++}

# the include paths of src/Makefile.am; the map generator has its own (src/mapgen/Makefile.am)
inc=(-I"$here/stubinc" -I"$src" -I"$src/binreloc" -I"$src/enum" -I"$src/framework" -I"$src/mas" -I"$src/mapgen"
     -I"$src/model" -I"$src/networking" -I"$src/pngfuncs" -I"$src/simulator" -I"$src/structure" -I"$src/tinyxml"
     -I"$src/tinyxpath" -I"$src/triangulation")
mapgeninc=(-I"$here/stubinc" -I"$src/mapgen" -I"$src/mapgen/filter" -I"$src/mapgen/generator" -I"$src")
base=(-std=gnu++98 -DNDEBUG -w $SDL_CFLAGS ${GL_CFLAGS:-})
flags=("${base[@]}" "${inc[@]}")

files=(
  globalvar.cpp city.cpp map.cpp layer.cpp buildinglayer.cpp conf.cpp propertymanager.cpp pathfinder.cpp
  destination.cpp vehicle.cpp movement.cpp movementmanager.cpp audiomanager.cpp
  mas/agent.cpp mas/agentdemonstrator.cpp mas/agentpolice.cpp mas/agentrobber.cpp mas/any.cpp mas/environment.cpp
  mas/kernel.cpp mas/message.cpp
  guimain.cpp guibutton.cpp guicontainer.cpp guilabel.cpp guibar.cpp ui.cpp persistence.cpp
  structure/structure.cpp structure/rcistructure.cpp structure/wegstructure.cpp structure/pathstructure.cpp
  structure/treestructure.cpp
  simulator/simulator.cpp simulator/mainsim.cpp simulator/residentialsim.cpp simulator/commercialsim.cpp
  simulator/industrialsim.cpp simulator/electricitysim.cpp simulator/trafficsim.cpp
  mapgen/mapmaker.cpp mapgen/map.cpp mapgen/generator/generator.cpp mapgen/generator/diamon.cpp
  mapgen/generator/heightMap.cpp
  mapgen/filter/filter.cpp mapgen/filter/normalize.cpp mapgen/filter/flattern.cpp mapgen/filter/gaussblur.cpp
  mapgen/filter/contextualizer.cpp mapgen/filter/context.cpp mapgen/filter/contextOnlyPositive.cpp
  mapgen/filter/cutter.cpp mapgen/filter/choper.cpp mapgen/filter/shaper.cpp mapgen/filter/shape.cpp
  mapgen/filter/shapeBubble.cpp mapgen/filter/shapeTopRound.cpp mapgen/filter/shapeVolcano.cpp
)
mkdir -p build
objs=()
for f in "${files[@]}"; do
  o="build/$(echo "$f" | tr / _).o"
  if [[ $f == mapgen/* ]]; then fl=("${base[@]}" "${mapgeninc[@]}"); else fl=("${flags[@]}"); fi
  [[ "$o" -nt "$src/$f" && "$o" -nt build.sh ]] || "$CXX" "${fl[@]}" -c "$src/$f" -o "$o"
  objs+=("$o")
done
"$CXX" "${flags[@]}" -c stub.cpp -o build/stub.o
"$CXX" "${flags[@]}" -fno-access-control -c harness.cpp -o build/harness.o
"$CXX" -o opencity-oracle build/harness.o build/stub.o "${objs[@]}" ${GL_LIBS:-} -lm
echo "built $here/opencity-oracle"
