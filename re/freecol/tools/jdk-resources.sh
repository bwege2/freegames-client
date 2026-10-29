#!/usr/bin/env bash
# The JDK's own resources that the translated Swing and AWT load at run time, into
# web/games/freecol/assets/jdk: the look and feels' strings (oracle JdkResources: properties files) and
# their icons and cursors (from the JDK image, unchanged). GPL-2.0 with the Classpath Exception, as the JDK.
# Needs the JDK of the translation (JAVA_HOME, Temurin 21.0.12.1+1).
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
out=$(cd "$here/../.." && pwd)/web/games/freecol/assets/jdk
test -n "${JAVA_HOME:-}" || { echo "set JAVA_HOME" >&2; exit 1; }
"$here/oracle/run.sh" JdkResources "$out"
tmp=$here/work/jdk-image
rm -rf "$tmp"
"$JAVA_HOME/bin/jimage" extract --dir "$tmp" --include 'regex:/java.desktop/(javax/swing/plaf/(metal|basic)/icons|sun/awt/resources/cursors)/.*' "$JAVA_HOME/lib/modules"
rm -rf "$out/res"
mkdir -p "$out/res"
cp -r "$tmp/java.desktop/." "$out/res/"
find "$out/res" -type f | sed "s|$out/||" | sort
