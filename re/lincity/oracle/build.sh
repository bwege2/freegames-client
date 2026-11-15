#!/usr/bin/env bash
# Builds the test oracle: xlincity 1.13.1 itself (all of its C sources, unchanged, with -DLC_X11 as
# its Makefile builds them) linked against fakex.c instead of libX11 and with dump.c, which writes the
# program's screen and state when the session asks. fakex.c is a small Xlib that plays a session
# (keys, buttons, pointer moves at given times) on a virtual clock; see the comment at its top.
# Needs re/lincity/fetch.sh first, gcc, the X11 headers (libX11-devel), libpng and zlib.
# Result: re/lincity/oracle/lincity-oracle
set -euo pipefail
cd "$(dirname "$0")"
S="$(cd ../orig/lincity-1.13.1 && pwd)"
mkdir -p build
cat > build/config.h <<EOF
#define DEFAULT_LIBDIR "$S"
#define HAVE_DIRENT_H 1
#define HAVE_GETTIMEOFDAY 1
#define HAVE_MKDIR 1
#define HAVE_STDLIB_H 1
#define HAVE_STRING_H 1
#define HAVE_STRINGS_H 1
#define HAVE_SYS_STAT_H 1
#define HAVE_SYS_TYPES_H 1
#define HAVE_UNISTD_H 1
#define HAVE_LIMITS_H 1
#define HAVE_GZIP 1
#define HAVE_POPEN 1
#define HAVE_SYS_TIME_H 1
#define TIME_WITH_SYS_TIME 1
#define STDC_HEADERS 1
#define PACKAGE "lincity"
#define VERSION "1.13.1"
#define PACKAGE_VERSION "1.13.1"
#define SIZEOF_CHAR 1
#define SIZEOF_SHORT 2
#define SIZEOF_INT 4
#define SIZEOF_LONG 8
EOF
srcs=()
for f in ldsvgui splash lchelp main mouse mps screen pixmap cliglobs geometry pbar module_buttons dialbox lcx11 \
         lclib power ldsvguts engine transport market simulate shrtypes lintypes readpng timer fileutil shrglobs stats; do
  srcs+=("$S/$f.c")
done
srcs+=("$S"/modules/*.c fakex.c dump.c)
# -include string.h: readpng.c calls strtok without declaring it, which truncates the pointer on 64 bits.
# gettimeofday, time and select are the virtual clock's (fakex.c); malloc zeroes (fakex.c).
gcc -O1 -g -fcommon -std=gnu89 -w -include string.h -DHAVE_CONFIG_H -DLC_X11=1 \
    -Ibuild -I"$S" -I"$S/modules" -I"$S/intl" -o lincity-oracle "${srcs[@]}" \
    -Wl,--wrap=gettimeofday -Wl,--wrap=time -Wl,--wrap=select -Wl,--wrap=malloc -lpng -lz -lm
echo "built $(pwd)/lincity-oracle"
