#!/usr/bin/env bash
# Builds the reference TEG 0.13.0 server and robot from re/teg/orig/src (run re/teg/fetch.sh first) into
# re/teg/orig/build/, for the transcripts and the rules oracle. Not part of the port and not committed
# (re/teg/orig/ is ignored).
#
# The original is C++20 with glib (and libxml2 for the server's score file). Any C++20 compiler and the
# development files of glib-2.0 and libxml-2.0 will do; set CXX if the compiler is not on PATH.
set -euo pipefail
base=$(cd "$(dirname "$0")/.." && pwd)
src=$base/orig/src
out=$base/orig/build
[[ -d $src ]] || { echo "run re/teg/fetch.sh first" >&2; exit 1; }
CXX=${CXX:-$(command -v clang++ || command -v g++ || command -v c++)}
[[ -n $CXX ]] || { echo "no C++ compiler (set CXX)" >&2; exit 1; }
mkdir -p "$out"
cd "$src"
flags=(-std=c++20 -O2 -w -DPACKAGE='"teg"' -DVERSION='"0.13.0"' -DENABLE_NLS -DHAVE_LOCALE_H
       -DHAVE_UNISTD_H -DLOCALEDIR="\"$out/locale\"" -I common)
libs=($(pkg-config --cflags --libs glib-2.0 libxml-2.0))
common=(common/common.cpp common/cont.cpp common/country.cpp common/missions.cpp common/scores.cpp
        common/stats.cpp common/tarjeta.cpp common/share.cpp common/net.cpp common/parser.cpp
        common/xml_support.cpp common/execute.cpp)

"$CXX" "${flags[@]}" -I server -o "$out/tegserver" \
    "${common[@]}" server/main.cpp server/play.cpp server/countries.cpp server/fow.cpp server/helper.cpp \
    server/missions.cpp server/options.cpp server/player.cpp server/turno.cpp server/sernet.cpp \
    server/console.cpp server/xmlscores.cpp "${libs[@]}"
"$CXX" "${flags[@]}" -I client -I robot -o "$out/tegrobot" \
    "${common[@]}" client/attack.cpp client/canje.cpp client/ejer2.cpp client/fichas.cpp client/helper.cpp \
    client/inputfd.cpp client/misc.cpp client/outputfd.cpp client/player.cpp client/reagrupe.cpp \
    client/themes.cpp robot/ai.cpp robot/ai_fichas.cpp robot/ai_misc.cpp robot/ai_msg.cpp robot/gui.cpp \
    robot/main.cpp "${libs[@]}"
echo "built $out/tegserver and $out/tegrobot"
