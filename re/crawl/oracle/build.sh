#!/usr/bin/env bash
# Builds the console oracle of Dungeon Crawl Stone Soup 0.34.1 with GCC, in re/crawl/orig/crawl-git/.
# The tarball of fetch.sh has no contrib submodules, so this clones the tag; the clone is not committed.
# It needs git, make, gcc/g++ (14 or newer), ncurses headers, and Python 3 with PyYAML.
#   NIX_GCC=/nix/store/...-gcc-wrapper/bin ./build.sh   picks a compiler wrapper
# The ncurses prefix is made from the store paths when NCURSES_PREFIX is not set.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p orig
if [[ ! -d orig/crawl-git ]]; then
    git clone --depth 1 --branch 0.34.1 --recurse-submodules --shallow-submodules \
        https://github.com/crawl/crawl.git orig/crawl-git
fi
cd orig/crawl-git/crawl-ref/source
export PATH="${NIX_GCC:-/usr/bin}:$PATH"
prefix="${NCURSES_PREFIX:-}"
if [[ -z "$prefix" ]]; then
    inc=$(ls -d /nix/store/*-ncurses-*-dev/include 2>/dev/null | head -1 || true)
    lib=$(ls -d /nix/store/*-ncurses-*/lib 2>/dev/null | grep -v -- '-dev' | head -1 || true)
    if [[ -n "$inc" && -n "$lib" ]]; then
        prefix=$(mktemp -d)
        ln -sfn "$inc" "$prefix/include"
        ln -sfn "$lib" "$prefix/lib"
    fi
fi
make_args=(TILES= BUILD_LUA=YesPlease BUILD_SQLITE=YesPlease BUILD_ZLIB=YesPlease BUILD_PCRE=YesPlease
           NO_PKGCONFIG=YesPlease NO_TRY_LLD=YesPlease NO_TRY_GOLD=YesPlease)
[[ -n "$prefix" ]] && make_args+=("NC_PREFIX=$prefix")
make -j"$(nproc)" "${make_args[@]}" crawl
./crawl -builddb
