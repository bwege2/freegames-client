#!/usr/bin/env bash
# Builds the original engine as the game (SDL2, OpenGL, OpenAL; no Qt editor) into re/openclonk/work/full,
# with clang and the libraries from nix. Its compile_commands.json gives the flags of the syntax trees the
# browser port is translated from (tools/ast.sh): the game's own configuration, not the headless one.
# The binary is the oracle of rendering and menus (screenshots under Xvfb with Mesa). Audio: OpenAL needs ALUT and Ogg
# Vorbis as well (cmake/FindAudio.cmake), else the build has no sound (AUDIO_TK_NONE) and the sound code is not compiled.
#   build-full.sh [--configure-only]
set -euo pipefail
cd "$(dirname "$0")"
src=$(cd ../orig/openclonk && pwd)
mkdir -p ../work/full
build=$(cd ../work/full && pwd)
target=openclonk
[[ ${1:-} == --configure-only ]] && target=
run() {
  if command -v nix-shell >/dev/null; then
    nix-shell --extra-experimental-features 'nix-command flakes' -I nixpkgs=flake:nixpkgs \
      -p clang cmake gnumake pkg-config zlib libpng libjpeg curl readline freetype SDL2 libepoxy libGL openal freealut libogg libvorbis \
      --run "$*"
  else
    bash -c "$*"
  fi
}
run "cmake -S '$src' -B '$build' -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DCMAKE_DISABLE_FIND_PACKAGE_Qt5=ON -DCMAKE_DISABLE_FIND_PACKAGE_GTK3=ON -DCMAKE_DISABLE_FIND_PACKAGE_Upnp=ON \
  -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ >'$build/cmake.log' 2>&1 \
  || { tail -40 '$build/cmake.log'; exit 1; }
  make -C '$build' C4Version.h >/dev/null 2>&1 || true
  if [ -n '$target' ]; then make -C '$build' -j$(nproc) $target >'$build/make.log' 2>&1 || { grep -m20 error '$build/make.log'; tail -20 '$build/make.log'; exit 1; }; fi"
echo "configured $build${target:+, built $build/openclonk}"
