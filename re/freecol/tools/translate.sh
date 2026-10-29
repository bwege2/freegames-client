#!/usr/bin/env bash
# Translates FreeCol 1.2.0's Java (re/freecol/orig, fetch.sh), MigLayout and, as far as they reach it, the
# JDK's own desktop classes (Swing, AWT, Metal; tools/jdk-sources.txt, from the JDK's src.zip) to
# TypeScript with j2ts:
#   tools/translate.sh            -> web/games/freecol/src/gen/ (committed), work/j2ts-report.txt
# Needs the JDK 21 the translation was made with (JAVA_HOME): Eclipse Temurin 21.0.12.1+1, whose
# lib/src.zip has the sha256 below.
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
repo=$(cd "$here/../.." && pwd)
src=$here/orig/src/freecol/src
test -d "$src/net/sf/freecol" || { echo "run re/freecol/fetch.sh first" >&2; exit 1; }
test -n "${JAVA_HOME:-}" || { echo "set JAVA_HOME to the JDK of the translation (Temurin 21.0.12.1+1)" >&2; exit 1; }
java=$JAVA_HOME/bin/java
javac=$JAVA_HOME/bin/javac
echo "2fb0fb7eef6330656944cdd42a3ba36ea819deab00acf958468feb002bdf11e2  $JAVA_HOME/lib/src.zip" | sha256sum -c --quiet - \
  || { echo "need the JDK of the translation (Temurin 21.0.12.1+1): its lib/src.zip differs" >&2; exit 1; }
jdk=$here/work/jdk-src
rm -rf "$jdk"
mkdir -p "$jdk"
(cd "$jdk" && unzip -q "$JAVA_HOME/lib/src.zip" $(cat "$here/tools/jdk-sources.txt"))
exports=()
for p in api code tree util comp main; do exports+=(--add-exports "jdk.compiler/com.sun.tools.javac.$p=ALL-UNNAMED"); done
cls=$here/work/j2ts-classes
rm -rf "$cls"
mkdir -p "$cls"
"$javac" -nowarn -d "$cls" "${exports[@]}" "$here"/tools/j2ts/*.java
cp=$(ls "$here"/orig/bin/freecol/jars/*.jar | grep -v miglayout | tr '\n' ':')
out=$repo/web/games/freecol/src/gen
rm -rf "$out"
mkdir -p "$out"
"$java" -Xss32m -Xmx6g "${exports[@]}" -cp "$cls" Main --src "$src,$here/orig/mig/core,$here/orig/mig/swing" \
  --patch "java.desktop=$jdk/java.desktop" --cp "$cp" --out "$out" --jre ../jre \
  --emit "net.sf.freecol,net.miginfocom,java.awt,javax.swing,java.beans,sun.awt,sun.swing,sun.font,sun.java2d,com.sun.java.swing,javax.accessibility" \
  --exclude "net.sf.freecol.metaserver,net.sf.freecol.common.metaserver,net.sf.freecol.server.networking.Server,net.sf.freecol.tools,net.sf.freecol.client.gui.video" \
  --partial "java.,javax.,sun." --roots "$here/tools/jdk-roots.txt" \
  --reach-report "$here/work/j2ts-reach.txt" --report "$here/work/j2ts-report.txt"
# the runtime oracle's probe (test/jre.test.ts): the same Java, run on the JVM and translated
probe=$repo/web/games/freecol/test/gen
rm -rf "$probe"
mkdir -p "$probe"
"$java" -Xss16m "${exports[@]}" -cp "$cls" Main --src "$here/oracle/probe" --out "$probe" --jre ../../src/jre --emit freegames.probe
