#!/usr/bin/env bash
# Downloads the reference version of NetHack, 3.6.7 (NetHack General Public License), into
# re/nethack/orig/ and unpacks it to re/nethack/orig/NetHack-3.6.7/. The tarball is the release from
# nethack.org (5,577,415 bytes); its sha-256 is the one the download page lists
# (https://www.nethack.org/v367/download-src.html).
# Nothing of the package is run: re/nethack/oracle/build.sh compiles the sources with its own flags.
# Needs curl, tar with gzip and sha256sum.
set -euo pipefail
cd "$(dirname "$0")"
url=https://www.nethack.org/download/3.6.7/nethack-367-src.tgz
tarball=nethack-367-src.tgz
want=98cf67df6debf9668a61745aa84c09bcab362e5d33f5b944ec5155d44d2aacb2
mkdir -p orig
[[ -f orig/$tarball ]] || curl -fsSL -o "orig/$tarball" "$url"
echo "$want  orig/$tarball" | sha256sum -c -
rm -rf orig/NetHack-3.6.7
tar -xzf "orig/$tarball" -C orig
ls orig/NetHack-3.6.7
