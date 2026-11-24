#!/usr/bin/env bash
# Builds the original engine headless (CMake HEADLESS_ONLY: openclonk-server, the c4script interpreter) into
# re/openclonk/work/headless, with clang and the libraries from nix (nix-shell sets up their paths).
# This is the oracle of the script engine and the simulation; its compile_commands.json gives the flags the
# translator's syntax trees use (tools/ast.sh).
set -euo pipefail
cd "$(dirname "$0")"
src=$(cd ../orig/openclonk && pwd)
mkdir -p ../work/headless
build=$(cd ../work/headless && pwd)
run() {
  if command -v nix-shell >/dev/null; then
    nix-shell --extra-experimental-features 'nix-command flakes' -I nixpkgs=flake:nixpkgs -p clang cmake gnumake pkg-config zlib libpng libjpeg curl readline \
      --run "$*"
  else
    bash -c "$*"
  fi
}
run "cmake -S '$src' -B '$build' -DHEADLESS_ONLY=ON -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ >'$build/cmake.log' 2>&1 \
  || { tail -40 '$build/cmake.log'; exit 1; }
  make -C '$build' -j$(nproc) c4script openclonk-server >'$build/make.log' 2>&1 || { grep -m20 error '$build/make.log'; tail -20 '$build/make.log'; exit 1; }"
echo "built $build/c4script and $build/openclonk-server"
