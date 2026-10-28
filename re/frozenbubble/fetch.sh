#!/usr/bin/env bash
# Downloads the reference version of Frozen Bubble: 2.2.0 (2008, the last stable release of the
# Perl/SDL_perl game), frozen-bubble-2.2.0.tar.bz2, 20,585,572 bytes. frozen-bubble.org no longer
# serves its /data/ directory (403), so the tarball comes from the Internet Archive's capture of the
# original URL http://www.frozen-bubble.org/data/frozen-bubble-2.2.0.tar.bz2 (the `id_` form returns
# the archived bytes unchanged). It unpacks into orig/frozen-bubble-2.2.0 (gitignored).
# Nothing of it is committed; the port's assets are converted from it by
# re/frozenbubble/tools/assets.sh. Needs curl, tar with bzip2 and sha256sum.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p orig
url='https://web.archive.org/web/2012id_/http://www.frozen-bubble.org/data/frozen-bubble-2.2.0.tar.bz2'
want=dada92322ef3adb75df7a4270b2e76c572c3f8e42006ed3a5aaeefa68fcaa5b7
size=20585572
f=orig/frozen-bubble-2.2.0.tar.bz2
if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
  curl -fsSL --retry 3 -o "$f.part" "$url"
  mv "$f.part" "$f"
fi
echo "$want  $f" | sha256sum -c -
test "$(stat -c %s "$f" 2>/dev/null || stat -f %z "$f")" = "$size"
rm -rf orig/frozen-bubble-2.2.0
tar -xjf "$f" -C orig
for p in COPYING frozen-bubble c_stuff/fb_c_stuff.xs c_stuff/lib/fb_stuff.pm c_stuff/lib/FBLE.pm \
         data/levels server/game.c server/net.c gfx/balls/bubble-1.gif snd/stick.ogg; do
  test -f "orig/frozen-bubble-2.2.0/$p" || { echo "missing $p" >&2; exit 1; }
done
echo "unpacked into $(pwd)/orig/frozen-bubble-2.2.0"
