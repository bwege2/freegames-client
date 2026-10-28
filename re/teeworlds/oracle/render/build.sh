#!/usr/bin/env bash
# Builds the original Teeworlds 0.7.5 client (teeworlds) and dedicated server (teeworlds_srv) natively from
# the release source (run re/teeworlds/fetch.sh first), for the rendering oracle (run.sh): the release's own
# CMakeLists.txt, Release build, the bundled wavpack/pnglite/md5/json-parser; SDL2, FreeType, OpenGL (Mesa,
# software rendering with llvmpipe under Xvfb), X11 and zlib from the pinned nixpkgs of oracle/build.sh.
# Nothing of the game is changed. Output: bin/teeworlds, bin/teeworlds_srv, bin/data (the release's data
# directory as its install makes it: datasrc).
#   build.sh
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../../orig/teeworlds-0.7.5-src 2>/dev/null && pwd) || { echo "run re/teeworlds/fetch.sh first" >&2; exit 1; }

paths=$(./nixpaths.sh cmake clang pkg-config SDL2.dev SDL2 freetype.dev freetype libglvnd.dev libglvnd mesa \
  xorg.libX11.dev xorg.libX11 xorg.xorgproto zlib.dev zlib python3)
prefix=""
for p in $paths; do
  [[ -x "$p/bin/cmake" ]] && export PATH="$p/bin:$PATH"
  [[ -x "$p/bin/clang++" ]] && export PATH="$p/bin:$PATH"
  [[ -x "$p/bin/pkg-config" ]] && export PATH="$p/bin:$PATH"
  [[ -x "$p/bin/python3" ]] && export PATH="$p/bin:$PATH"
  prefix="$prefix;$p"
  [[ -d "$p/lib/pkgconfig" ]] && PKG_CONFIG_PATH="${PKG_CONFIG_PATH:+$PKG_CONFIG_PATH:}$p/lib/pkgconfig"
  [[ -d "$p/share/pkgconfig" ]] && PKG_CONFIG_PATH="${PKG_CONFIG_PATH:+$PKG_CONFIG_PATH:}$p/share/pkgconfig"
done
export PKG_CONFIG_PATH
rpath=$(for p in $paths; do [[ -d "$p/lib" ]] && printf '%s:' "$p/lib"; done)

mkdir -p build bin
cmake -S "$src" -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ \
  -DCMAKE_PREFIX_PATH="${prefix#;}" -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DPREFER_BUNDLED_LIBS=ON -DDEV=ON -DCLIENT=ON \
  -DCMAKE_EXE_LINKER_FLAGS="-Wl,-rpath,$rpath" -DCMAKE_BUILD_RPATH="$rpath" >build/cmake.log 2>&1 \
  || { tail -40 build/cmake.log; exit 1; }
cmake --build build --target teeworlds teeworlds_srv -j"$(nproc)" >build/make.log 2>&1 || { tail -40 build/make.log; exit 1; }
cp build/teeworlds build/teeworlds_srv bin/
rm -rf bin/data
cp -r build/data bin/data 2>/dev/null || cp -r "$src/datasrc" bin/data
echo "built: $here/bin/teeworlds, $here/bin/teeworlds_srv, $here/bin/data"
