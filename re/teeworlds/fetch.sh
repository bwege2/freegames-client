#!/usr/bin/env bash
# Reference version of Teeworlds: the last official release, 0.7.5 (2020-06-27), its release source tarball
# from github.com/teeworlds/teeworlds (tag 0.7.5), with the data (datasrc/) and the official maps it ships:
#   teeworlds-0.7.5-src.tar.gz, 8,935,505 bytes, sha256
#     fcde2223398e027434ec96315103e9861fc458161b49b15908dc56b8e7a8ecd9
# Unpacks into orig/teeworlds-0.7.5-src (gitignored). Nothing of it is committed.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p orig
url=https://github.com/teeworlds/teeworlds/releases/download/0.7.5/teeworlds-0.7.5-src.tar.gz
want=fcde2223398e027434ec96315103e9861fc458161b49b15908dc56b8e7a8ecd9
size=8935505
f=orig/teeworlds-0.7.5-src.tar.gz
if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
  curl -fsSL -o "$f.part" "$url"
  mv "$f.part" "$f"
fi
echo "$want  $f" | sha256sum -c -
test "$(stat -c %s "$f" 2>/dev/null || stat -f %z "$f")" = "$size"
rm -rf orig/teeworlds-0.7.5-src
tar -xzf "$f" -C orig
for p in license.txt datasrc/network.py datasrc/content.py datasrc/maps/ctf1.map src/game/gamecore.cpp \
         src/game/server/gamecontext.cpp src/engine/server/server.cpp src/engine/shared/snapshot.cpp; do
  test -f "orig/teeworlds-0.7.5-src/$p" || { echo "missing $p" >&2; exit 1; }
done
echo "unpacked into $(pwd)/orig/teeworlds-0.7.5-src"
