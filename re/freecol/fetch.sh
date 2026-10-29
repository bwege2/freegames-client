#!/usr/bin/env bash
# Reference version of FreeCol: the latest stable release, 1.2.0 (2024-07-04), from the FreeCol team's
# download area on SourceForge (https://sourceforge.net/projects/freecol/files/freecol/freecol-1.2.0/):
#   freecol-1.2.0-src.zip  231,798,930 bytes, sha256
#     15139e4cea5cea72fb009e9658c2395f9d945224d8d235a1401c93030197a9ba
#     (the source and data; identical to the GitHub tag v1.2.0 but for the version string in FreeCol.java)
#   freecol-1.2.0.zip      217,224,848 bytes, sha256
#     554e7a2de9d178366ac6385b2f42cc329148b2a6c61ef401eb6160d4c0f6fa70
#     (the release build: FreeCol.jar, Revision 1690a5f, and its jars/; the oracle runs this)
# The client's layout manager, MigLayout 5.3 (BSD; the release ships its jars), as source from Maven Central:
#   miglayout-core-5.3-sources.jar   103,446 bytes, sha256 fb3f4c1932c4248375861023fb4108e06a067676c932288ca9665e122e99d1f1
#   miglayout-swing-5.3-sources.jar   16,351 bytes, sha256 2f9fc839ac5cf501127d6128bc4f04e6a0adde960628dca1053dbdff29164ce9
# Unpacks into orig/ (gitignored): orig/src/freecol (source), orig/bin/freecol (release), orig/mig (MigLayout).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p orig
get() { # url sha256 size dir
  local url=$1 want=$2 size=$3 dir=$4 f=orig/${1##*/}
  if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
    curl -fsSL -o "$f.part" "$url"
    mv "$f.part" "$f"
  fi
  echo "$want  $f" | sha256sum -c -
  test "$(stat -c %s "$f" 2>/dev/null || stat -f %z "$f")" = "$size"
  rm -rf "orig/$dir"
  mkdir -p "orig/$dir"
  unzip -q "$f" -d "orig/$dir"
}
base=https://downloads.sourceforge.net/project/freecol/freecol/freecol-1.2.0
get "$base/freecol-1.2.0-src.zip" 15139e4cea5cea72fb009e9658c2395f9d945224d8d235a1401c93030197a9ba 231798930 src
get "$base/freecol-1.2.0.zip" 554e7a2de9d178366ac6385b2f42cc329148b2a6c61ef401eb6160d4c0f6fa70 217224848 bin
mvn=https://repo1.maven.org/maven2/com/miglayout
get "$mvn/miglayout-core/5.3/miglayout-core-5.3-sources.jar" fb3f4c1932c4248375861023fb4108e06a067676c932288ca9665e122e99d1f1 103446 mig/core
get "$mvn/miglayout-swing/5.3/miglayout-swing-5.3-sources.jar" 2f9fc839ac5cf501127d6128bc4f04e6a0adde960628dca1053dbdff29164ce9 16351 mig/swing
# The fonts behind Java's logical fonts (Dialog, Serif, Monospaced), as the oracle's client and the port
# use them: DejaVu 2.37 (Bitstream Vera licence), from the DejaVu project's GitHub release.
dv=orig/dejavu-fonts-ttf-2.37.tar.bz2
if [ ! -f "$dv" ] || ! echo "fa9ca4d13871dd122f61258a80d01751d603b4d3ee14095d65453b4e846e17d7  $dv" | sha256sum -c --status -; then
  curl -fsSL -o "$dv.part" https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.tar.bz2
  mv "$dv.part" "$dv"
fi
echo "fa9ca4d13871dd122f61258a80d01751d603b4d3ee14095d65453b4e846e17d7  $dv" | sha256sum -c -
rm -rf orig/dejavu
mkdir -p orig/dejavu
tar xjf "$dv" -C orig/dejavu
for f in src/freecol/src/net/sf/freecol/FreeCol.java src/freecol/data/rules/classic/specification.xml \
         src/freecol/data/base/resources/fonts/ShadowedBlack.ttf bin/freecol/FreeCol.jar \
         mig/core/net/miginfocom/layout/LayoutUtil.java mig/swing/net/miginfocom/swing/MigLayout.java; do
  test -f "orig/$f" || { echo "missing $f" >&2; exit 1; }
done
echo "unpacked into $(pwd)/orig"
