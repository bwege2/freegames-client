#!/usr/bin/env bash
# Prints the nix store paths of the render oracle's tools and libraries (pinned nixpkgs, as oracle/build.sh).
#   nixpaths.sh <attr>...
set -euo pipefail
nixpkgs=${TEEWORLDS_NIXPKGS:-github:NixOS/nixpkgs/d3b13ad75cc492690728f9307e443dec9ef9a20e}
for a in "$@"; do
  nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#$a" --no-link --print-out-paths --offline 2>/dev/null \
    || nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#$a" --no-link --print-out-paths
done
