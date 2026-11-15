#!/usr/bin/env bash
# Downloads the reference version of Lincity, classic Lincity 1.13.1 (2004, GPL), into re/lincity/orig/
# and unpacks it to re/lincity/orig/lincity-1.13.1/. The tarball is Debian's lincity_1.13.1.orig.tar.gz
# (1,064,236 bytes; the SourceForge release lincity-1.13.1.tar.gz); its sha-256 is recorded below.
# Nothing of the package is installed or run from here: re/lincity/oracle/build.sh compiles the sources for
# the tests, re/lincity/tools/pack.py takes the data files the port uses.
# Needs curl, tar with gzip and sha256sum.
set -euo pipefail
cd "$(dirname "$0")"
url=http://deb.debian.org/debian/pool/main/l/lincity/lincity_1.13.1.orig.tar.gz
tarball=lincity_1.13.1.orig.tar.gz
want=7b4cbd11ffd4cbed79a0aadb25f2b1c34e25a8201182fbb259ce2f450fe5015d
mkdir -p orig
[[ -f orig/$tarball ]] || curl -fsSL -o "orig/$tarball" "$url"
echo "$want  orig/$tarball" | sha256sum -c -
rm -rf orig/lincity-1.13.1
tar -xzf "orig/$tarball" -C orig
for p in COPYING COPYRIGHT colour.pal opening/icons.png opening/iconlist.txt opening/open.tga.gz \
         opening/good_times.scn help/opening.hlp messages/fire.mes icons/track-button.csi simulate.c; do
  test -f "orig/lincity-1.13.1/$p" || { echo "missing $p" >&2; exit 1; }
done
echo "unpacked into $(pwd)/orig/lincity-1.13.1"
