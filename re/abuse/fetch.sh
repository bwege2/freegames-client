#!/usr/bin/env bash
# Downloads the reference version of Abuse: Sam Hocevar's abuse-0.8.tar.gz (2011-05-09, NEWS; the last
# maintained SDL release; 6,053,500 bytes) from abuse.zoy.org, and unpacks it into
# re/abuse/orig/abuse-0.8/ WITHOUT its non-free data:
#   data/sfx/        sound effects and voices, (c) 1995 Bobby Prince
#   data/music/      music, (c) 1995 Bobby Prince
#   *.wav in data/addon/ (aliens, claudio, leon, twist): the add-ons' sounds
# Upstream calls exactly these "non-free" (the tarball's COPYING and PACKAGERS; `configure
# --disable-nonfree`); NOTES.md, "Licenses". They are never unpacked, converted or committed: what
# remains is the free tree, the same data as the official --disable-nonfree build installs.
# Needs curl, tar with gzip and sha256sum.
set -euo pipefail
cd "$(dirname "$0")"
url=http://abuse.zoy.org/raw-attachment/wiki/download/abuse-0.8.tar.gz
tarball=abuse-0.8.tar.gz
want=0104db5fd2695c9518583783f7aaa7e5c0355e27c5a803840a05aef97f9d3488
size=6053500
mkdir -p orig
if [ ! -f "orig/$tarball" ] || ! echo "$want  orig/$tarball" | sha256sum -c --status -; then
  curl -fsSL -o "orig/$tarball.part" "$url"
  mv "orig/$tarball.part" "orig/$tarball"
fi
echo "$want  orig/$tarball" | sha256sum -c -
test "$(stat -c %s "orig/$tarball" 2>/dev/null || stat -f %z "orig/$tarball")" = "$size"
rm -rf orig/abuse-0.8
tar -xzf "orig/$tarball" -C orig \
  --exclude='abuse-0.8/data/sfx' --exclude='abuse-0.8/data/music' --exclude='abuse-0.8/data/addon/*.wav' \
  --exclude='abuse-0.8/data/addon/*/*.wav' --exclude='abuse-0.8/data/addon/*/*/*.wav'
if find orig/abuse-0.8 -name '*.wav' -o -name '*.hmi' | grep -q .; then
  echo "non-free files were unpacked" >&2; exit 1
fi
test -f orig/abuse-0.8/data/abuse.lsp
echo "unpacked the free tree into $(pwd)/orig/abuse-0.8"
