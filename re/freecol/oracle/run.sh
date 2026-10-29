#!/usr/bin/env bash
# Runs an oracle program on the original FreeCol 1.2.0 release (fetch.sh), in its directory, with its data:
#   oracle/run.sh Oracle SEED TURNS OUT_DIR [rules [script]]   a game played by the original AI (and a
#                                                     scripted human), saved every turn
#   oracle/run.sh RoundTrip OUT_DIR SAVE.fsg...       each save loaded and saved again by the original server
#   oracle/run.sh SpecDump OUT_DIR RULES:DIFFICULTY... a rule set read, prepared and serialized
#   oracle/run.sh JreProbe                            the Java library behaviour the port relies on
#   oracle/run.sh ClientDump OUT_DIR WxH [SCREEN [STEP...]]  the original client's screen: component tree and pixels
#   oracle/run.sh FontProbe OUT_DIR                   Java2D's font metrics of the logical fonts
#   oracle/run.sh FontTable OUT_FILE                  the text metrics table the port lays text out with
# Needs a JDK 21 (JAVA_HOME, or java/javac on PATH); ClientDump and FontProbe need Xvfb (on PATH or XVFB)
# and use the DejaVu fonts of fetch.sh for Java's logical fonts (a fontconfig of their own).
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
bin=$here/orig/bin/freecol
test -f "$bin/FreeCol.jar" || { echo "run re/freecol/fetch.sh first" >&2; exit 1; }
java=${JAVA_HOME:+$JAVA_HOME/bin/}java
javac=${JAVA_HOME:+$JAVA_HOME/bin/}javac
cls=$here/work/oracle-classes
pcls=$here/work/oracle-patch-classes
rm -rf "$here/work/oracle-patch" "$pcls"
mkdir -p "$cls" "$pcls"
# the one change to the original: deterministic AI threads (patch.py, patch/OracleScheduler.java)
python3 -I "$here/oracle/patch.py" "$here/orig/src/freecol/src" "$here/work/oracle-patch" >/dev/null
"$javac" -nowarn -cp "$bin/FreeCol.jar" -d "$pcls" $(find "$here/work/oracle-patch" -name '*.java') 2>&1 | grep -v '^Note:' || true
"$javac" -nowarn -cp "$pcls:$bin/FreeCol.jar" -d "$cls" "$here"/oracle/*.java "$here"/oracle/probe/freegames/probe/*.java 2>&1 | grep -v '^Note:' || true
main=$1
shift
args=()
case "$main" in
Oracle) args=(data "$(realpath -m "$3")" "$1" "$2" "${4:-freecol}" ${5:+"$5"}) ;;
RoundTrip) out=$(realpath -m "$1"); shift; args=(data "$out"); for f in "$@"; do args+=("$(realpath "$f")"); done ;;
SpecDump) out=$(realpath -m "$1"); shift; args=(data "$out" "$@") ;;
JreProbe) main=freegames.probe.JreProbe ;;
ClientDump) args=(data "$(realpath -m "$1")" "${@:2}"); xscreen=$2 ;; # the screen is the window (the page's game area)
FontProbe) args=("$(realpath -m "$1")") ;;
FontTable) args=("$(realpath -m "$1")") ;;
JdkResources) args=("$(realpath -m "$1")"); fontjvm="--add-exports java.desktop/com.sun.swing.internal.plaf.basic.resources=ALL-UNNAMED --add-exports java.desktop/com.sun.swing.internal.plaf.metal.resources=ALL-UNNAMED --add-exports java.desktop/sun.awt.resources=ALL-UNNAMED" ;;
*) echo "unknown oracle program $main" >&2; exit 1 ;;
esac
cd "$bin"
headless=true
fontjvm=${fontjvm:-}
if [ "$main" = ClientDump ] || [ "$main" = FontProbe ] || [ "$main" = FontTable ]; then
  # a display of its own (Xvfb on a free display number) and fonts of its own (DejaVu only)
  headless=false
  # Java's logical fonts from a font configuration file of its own (sun.awt.fontconfig), not the system's
  fcdir=$here/work/fontconfig
  mkdir -p "$fcdir/.local/share" "$fcdir/.config" "$fcdir/.cache" # user.home: FreeCol wants writable XDG directories there
  dv=$here/orig/dejavu/dejavu-fonts-ttf-2.37/ttf
  {
    echo "version=1"
    for logical in dialog sansserif dialoginput serif monospaced; do
      case $logical in
      serif) fam="DejaVu Serif"; it=Italic ;;
      monospaced|dialoginput) fam="DejaVu Sans Mono"; it=Oblique ;;
      *) fam="DejaVu Sans"; it=Oblique ;;
      esac
      echo "$logical.plain.latin-1=$fam"
      echo "$logical.bold.latin-1=$fam Bold"
      echo "$logical.italic.latin-1=$fam $it"
      echo "$logical.bolditalic.latin-1=$fam Bold $it"
    done
    echo "sequence.allfonts=latin-1"
    for f in DejaVuSans DejaVuSans-Bold DejaVuSans-Oblique DejaVuSans-BoldOblique DejaVuSerif DejaVuSerif-Bold \
             DejaVuSerif-Italic DejaVuSerif-BoldItalic DejaVuSansMono DejaVuSansMono-Bold DejaVuSansMono-Oblique \
             DejaVuSansMono-BoldOblique; do
      face=$(echo "$f" | sed 's/DejaVuSansMono/DejaVu Sans Mono/; s/DejaVuSans/DejaVu Sans/; s/DejaVuSerif/DejaVu Serif/; s/-/ /; s/BoldOblique/Bold Oblique/; s/BoldItalic/Bold Italic/')
      echo "filename.$(echo "$face" | tr ' ' _)=$dv/$f.ttf"
    done
    echo "awtfontpath.latin-1=$dv"
  } > "$fcdir/fontconfig.properties"
  fontjvm="-Dsun.awt.fontconfig=$fcdir/fontconfig.properties -Duser.home=$fcdir"
  xvfb=${XVFB:-Xvfb}
  dpy=77
  while [ -e "/tmp/.X$dpy-lock" ] || [ -e "/tmp/.X11-unix/X$dpy" ]; do dpy=$((dpy + 1)); done
  "$xvfb" ":$dpy" -screen 0 ${xscreen:-1920x1200}x24 -nolisten tcp >/dev/null 2>&1 &
  xpid=$!
  trap 'kill $xpid 2>/dev/null || true' EXIT
  for _ in $(seq 50); do [ -e "/tmp/.X11-unix/X$dpy" ] && break; sleep 0.1; done
  export DISPLAY=:$dpy
fi
jail=()
if [ "$main" = ClientDump ]; then
  # the client as the browser sees the machine: one network interface, the loopback one (the new game panel
  # lists the machine's addresses; its host name is localhost), and the player's name "player" (the port's user.name)
  fontjvm="$fontjvm -Duser.name=player"
  if [ -z "${ORACLE_NOJAIL:-}" ] && unshare -rnu true 2>/dev/null; then jail=(unshare -rnu sh -c 'ip link set lo up && hostname localhost && exec "$@"' sh); fi
fi
"${jail[@]}" "$java" ${ORACLE_JVM:--Xmx2g} -Djava.awt.headless=$headless $fontjvm ${ORACLE_LOG:+-Doracle.log=$ORACLE_LOG} -XX:+UnlockExperimentalVMOptions -XX:hashCode=2 --add-opens java.base/java.util=ALL-UNNAMED -cp "$pcls:FreeCol.jar:$cls" "$main" "${args[@]}"
exit $?
