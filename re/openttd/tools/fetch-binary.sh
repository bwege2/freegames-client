#!/usr/bin/env bash
# The pinned OpenTTD 15.3 Linux binary, used only as the test oracle
# (re/openttd/tools/oracle.mjs). It is not part of the port and is never
# committed: it lands in the gitignored orig/.
#
#   openttd-15.3-linux-generic-amd64.tar.xz  23,046,700 bytes
#   sha256 f49eb25d61b00f8f4d332fee02b530ad75552d1efb8f2bb01e7ca5e6540fe059
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p orig
f=orig/openttd-15.3-linux-generic-amd64.tar.xz
want=f49eb25d61b00f8f4d332fee02b530ad75552d1efb8f2bb01e7ca5e6540fe059
if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
  curl -fsSL --retry 10 --retry-delay 3 --retry-all-errors -C - \
    -o "$f" "https://cdn.openttd.org/openttd-releases/15.3/openttd-15.3-linux-generic-amd64.tar.xz"
fi
echo "$want  $f" | sha256sum -c -
rm -rf orig/openttd-15.3-linux-generic-amd64
tar -xJf "$f" -C orig
test -x orig/openttd-15.3-linux-generic-amd64/openttd
echo "oracle binary: $(pwd)/orig/openttd-15.3-linux-generic-amd64/openttd"
