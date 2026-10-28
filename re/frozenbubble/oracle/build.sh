#!/usr/bin/env bash
# Builds the Frozen Bubble 2.2.0 test oracle into re/frozenbubble/work/ (gitignored): the original
# Perl game on the libraries it was written for, made deterministic by the shim (shim.c).
#
#   1. fetch-deps.sh: pinned sources (see there)
#   2. SDL 1.2.15 (C blitters: --disable-assembly; dummy video/audio only), SDL_image 1.2.12
#      (PNG via nix libpng, GIF built in), SDL_mixer 1.2.12 (no decoders: the shim fakes Mix_*),
#      SDL_Pango 0.1.2 + Debian's patches (the Frozen-Bubble API patch among them), all into
#      work/prefix
#   3. SDL_Perl 2.1.2 (SDL_perl.so and SDL/SFont.so, xsubpp + gcc by hand: its Build.PL needs
#      Module::Build and probes the system), Locale::gettext 1.07, c_stuff (fb_c_stuff.so) into
#      work/perl
#   4. work/fb/: frozen-bubble, frozen-bubble-editor and c_stuff/lib/*.pm copied from the orig
#      tree, patched with patches/game-*.patch, and fb_config.pm ($FPATH = the orig tree)
#   5. fonts: work/fonts/fonts.conf sees only DejaVu Sans (4 faces)
#   6. work/libfbshim.so (shim.c) and work/pango-metrics (pango-metrics.c)
# Every step is redone when its inputs are newer than its stamp (work/stamps/). Needs nix.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
. "$here/env.sh"
bash "$here/fetch-deps.sh" >/dev/null
deps=$fb_orig/deps
[ -f "$fb_src/frozen-bubble" ] || { echo "run re/frozenbubble/fetch.sh first" >&2; exit 1; }

build=$fb_work/build
stamps=$fb_work/stamps
mkdir -p "$build" "$stamps" "$fb_prefix" "$fb_work/perl"
jobs=$(nproc 2>/dev/null || echo 4)

# old C under gcc 16: the C dialect of its time, and the former warnings that are errors now
OLDC="-O2 -std=gnu89 -fcommon -Wno-error=implicit-function-declaration -Wno-error=implicit-int \
 -Wno-error=incompatible-pointer-types -Wno-error=int-conversion -Wno-error=return-mismatch"
PERLC="-O2 -std=gnu11 -fcommon -Wno-error=implicit-function-declaration -Wno-error=implicit-int \
 -Wno-error=incompatible-pointer-types -Wno-error=int-conversion -Wno-error=return-mismatch"

# stale <step> <inputs...>: true when the step's stamp is missing or older than an input
stale() {
  local s=$stamps/$1; shift
  [ -f "$s" ] || return 0
  local f
  for f in "$@"; do
    [ -n "$(find "$f" -newer "$s" -print -quit 2>/dev/null)" ] && return 0
  done
  return 1
}
done_() { touch "$stamps/$1"; }
unpack() { # tarball dir-name
  rm -rf "${build:?}/$2"
  tar -xf "$1" -C "$build"
}
apply() { # dir patch...
  local d=$1 p; shift
  for p in "$@"; do patch -s -d "$d" -p1 < "$p"; done
}

# ---------------------------------------------------------------- SDL 1.2.15
if stale sdl "$deps/SDL-1.2.15.tar.gz" "$here"/patches/sdl-*.patch; then
  echo "== SDL 1.2.15"
  unpack "$deps/SDL-1.2.15.tar.gz" SDL-1.2.15
  shopt -s nullglob; apply "$build/SDL-1.2.15" "$here"/patches/sdl-*.patch; shopt -u nullglob
  (cd "$build/SDL-1.2.15" && CFLAGS="$OLDC" ./configure --prefix="$fb_prefix" \
     --disable-static --enable-shared --disable-assembly \
     --disable-video-x11 --disable-video-dga --disable-video-fbcon --disable-video-directfb \
     --disable-video-ps2gs --disable-video-ps3 --disable-video-svga --disable-video-vgl \
     --disable-video-wscons --disable-video-xbios --disable-video-gem --disable-video-ggi \
     --disable-video-aalib --disable-video-caca --disable-video-qtopia --disable-video-picogui \
     --disable-video-opengl --disable-osmesa-shared --enable-video-dummy \
     --disable-oss --disable-alsa --disable-esd --disable-pulseaudio --disable-arts --disable-nas \
     --disable-diskaudio --enable-dummyaudio --disable-joystick --disable-cdrom \
     --disable-input-events --disable-input-tslib --disable-rpath >/dev/null
   make -j"$jobs" >/dev/null && make install >/dev/null)
  done_ sdl
fi

# ---------------------------------------------------------------- SDL_image 1.2.12
if stale sdl_image "$stamps/sdl" "$deps/SDL_image-1.2.12.tar.gz"; then
  echo "== SDL_image 1.2.12"
  unpack "$deps/SDL_image-1.2.12.tar.gz" SDL_image-1.2.12
  (cd "$build/SDL_image-1.2.12" && CFLAGS="$OLDC" CPPFLAGS="$(pkg-config --cflags libpng zlib)" \
     LDFLAGS="$(pkg-config --libs-only-L libpng zlib)" ./configure --prefix="$fb_prefix" \
     --with-sdl-prefix="$fb_prefix" --disable-static --enable-shared --disable-sdltest \
     --enable-png --disable-png-shared --enable-gif --enable-bmp --disable-jpg --disable-tif \
     --disable-webp --disable-lbm --disable-pcx --disable-pnm --disable-tga --disable-xcf \
     --disable-xpm --disable-xv --disable-imageio >/dev/null
   make -j"$jobs" >/dev/null && make install >/dev/null)
  done_ sdl_image
fi

# ---------------------------------------------------------------- SDL_mixer 1.2.12 (link only)
if stale sdl_mixer "$stamps/sdl" "$deps/SDL_mixer-1.2.12.tar.gz"; then
  echo "== SDL_mixer 1.2.12"
  unpack "$deps/SDL_mixer-1.2.12.tar.gz" SDL_mixer-1.2.12
  (cd "$build/SDL_mixer-1.2.12" && CFLAGS="$OLDC" ./configure --prefix="$fb_prefix" \
     --with-sdl-prefix="$fb_prefix" --disable-static --enable-shared --disable-sdltest \
     --disable-music-cmd --disable-music-mod --disable-music-midi --disable-music-ogg \
     --disable-music-flac --disable-music-mp3 --disable-smpegtest >/dev/null
   make -j"$jobs" >/dev/null && make install >/dev/null)
  done_ sdl_mixer
fi

# ---------------------------------------------------------------- SDL_Pango 0.1.2
if stale sdl_pango "$stamps/sdl" "$deps/sdlpango_0.1.2.orig.tar.gz" "$deps/sdlpango_0.1.2-8.debian.tar.xz" \
     "$here"/patches/sdlpango-*.patch; then
  echo "== SDL_Pango 0.1.2"
  unpack "$deps/sdlpango_0.1.2.orig.tar.gz" SDL_Pango-0.1.2
  rm -rf "$build/debian" && tar -xf "$deps/sdlpango_0.1.2-8.debian.tar.xz" -C "$build"
  # Debian's series: fix-explicit-SDLPango_CopyFTBitmapToSurface api_additions
  # matrix_declarations sans-serif fillrect_crash blit_overflow
  while read -r p; do
    [ -n "$p" ] && patch -s -d "$build/SDL_Pango-0.1.2" -p1 < "$build/debian/patches/$p"
  done < "$build/debian/patches/series"
  shopt -s nullglob; apply "$build/SDL_Pango-0.1.2" "$here"/patches/sdlpango-*.patch; shopt -u nullglob
  (cd "$build/SDL_Pango-0.1.2" && CFLAGS="$OLDC" ./configure --prefix="$fb_prefix" \
     --with-sdl-prefix="$fb_prefix" --disable-static --enable-shared --disable-sdltest \
     --build=x86_64-pc-linux-gnu >/dev/null
   make -j"$jobs" >/dev/null && make install >/dev/null)
  done_ sdl_pango
fi

# ---------------------------------------------------------------- Perl XS helpers
perl_lib=$fb_work/perl
privlib=$("$fb_perl" -MConfig -e 'print $Config{privlibexp}')
perlcore=$("$fb_perl" -MConfig -e 'print "$Config{archlibexp}/CORE"')
perlccflags=$("$fb_perl" -MConfig -e 'print $Config{ccflags}' | sed 's|-I/no-such-path/include||')
rpaths() { # -L flags -> the same as -Wl,-rpath flags
  local f out=
  for f in "$@"; do case $f in -L*) out="$out -Wl,-rpath,${f#-L}";; esac; done
  echo "$out"
}
# xs <xs file> <so path relative to perl_lib> <typemap...> -- <cflags and libs...>
xs() {
  local xsf=$1 so=$2; shift 2
  local tms=() c=${xsf%.xs}.c
  while [ "$1" != -- ]; do tms+=(-typemap "$1"); shift; done; shift
  "$fb_perl" "$privlib/ExtUtils/xsubpp" -typemap "$privlib/ExtUtils/typemap" "${tms[@]}" "$xsf" > "$c"
  mkdir -p "$(dirname "$perl_lib/$so")"
  # shellcheck disable=SC2086
  gcc -shared -fPIC $PERLC $perlccflags -I"$perlcore" -I"$fb_xcrypt" \
    -I"$(dirname "$xsf")" "$c" -o "$perl_lib/$so" "$@" $(rpaths "$@")
}
sdl_cflags=$(sdl-config --cflags)
sdl_libs="-L$fb_prefix/lib -lSDL -lpthread"

# ---------------------------------------------------------------- SDL_Perl 2.1.2
if stale sdl_perl "$stamps/sdl_image" "$stamps/sdl_mixer" "$deps/SDL_Perl-2.1.2.tar.gz" "$here"/patches/sdlperl-*.patch; then
  echo "== SDL_Perl 2.1.2"
  unpack "$deps/SDL_Perl-2.1.2.tar.gz" SDL_Perl-2.1.2
  d=$build/SDL_Perl-2.1.2
  apply "$d" "$here"/patches/sdlperl-*.patch
  rm -rf "$perl_lib/SDL" "$perl_lib/auto/SDL" "$perl_lib/auto/SDL_perl"
  cp "$d/src/SDL.xs" "$d/src/SDL_perl.xs"
  # as Build.PL configures them when SDL, SDL_image and SDL_mixer are found (no net/ttf/gfx/GL/smpeg)
  # shellcheck disable=SC2086
  xs "$d/src/SDL_perl.xs" auto/SDL_perl/SDL_perl.so "$d/typemap" -- \
    -DHAVE_SDL -DHAVE_SDL_IMAGE -DHAVE_SDL_MIXER -DUSE_THREADS $sdl_cflags $sdl_libs -lSDL_image -lSDL_mixer
  mkdir -p "$d/src/SDL" && cp "$d/src/SFont.xs" "$d/src/SDL/SFont.xs"
  # shellcheck disable=SC2086
  xs "$d/src/SDL/SFont.xs" auto/SDL/SFont/SFont.so "$d/typemap" -- \
    -DHAVE_SDL -DHAVE_SDL_IMAGE -DUSE_THREADS -I"$d/src" $sdl_cflags $sdl_libs -lSDL_image
  cp -r "$d/lib/." "$perl_lib/"
  cat > "$perl_lib/SDL/Config.pm" <<'PM'
package SDL::Config;
# written by build.sh as SDL_Perl's Build.PL would: SDL, SDL_image and SDL_mixer present
my $sdl_config = { 'SDL' => { 'SDL' => 1, 'SDL_image' => 1, 'SDL_mixer' => 1 }, 'SFont' => { 'SDL' => 1, 'SDL_image' => 1 } };
sub has { my ($class, $define) = @_; scalar grep { $$sdl_config{$_}{$define} } keys %$sdl_config; }
1;
PM
  done_ sdl_perl
fi

# ---------------------------------------------------------------- Locale::gettext 1.07
if stale locale_gettext "$deps/Locale-gettext-1.07.tar.gz"; then
  echo "== Locale::gettext 1.07"
  unpack "$deps/Locale-gettext-1.07.tar.gz" Locale-gettext-1.07
  d=$build/Locale-gettext-1.07
  # config.h as its Makefile.PL writes it on glibc
  printf '#define HAVE_DGETTEXT\n#define HAVE_NGETTEXT\n#define HAVE_BIND_TEXTDOMAIN_CODESET\n' > "$d/config.h"
  xs "$d/gettext.xs" auto/Locale/gettext/gettext.so -- -DVERSION='"1.07"' -DXS_VERSION='"1.07"'
  mkdir -p "$perl_lib/Locale" && cp "$d/gettext.pm" "$perl_lib/Locale/gettext.pm"
  done_ locale_gettext
fi

# ---------------------------------------------------------------- c_stuff (fb_c_stuff.so)
if stale c_stuff "$stamps/sdl_pango" "$stamps/sdl_perl" "$fb_src/c_stuff/fb_c_stuff.xs"; then
  echo "== c_stuff"
  rm -rf "$build/c_stuff" && cp -r "$fb_src/c_stuff" "$build/c_stuff"
  d=$build/c_stuff
  # the flags of c_stuff/Makefile.PL: OPTIMIZE -O2 -Wall, sdl-config and SDL_Pango
  # shellcheck disable=SC2086
  xs "$d/fb_c_stuff.xs" auto/fb_c_stuff/fb_c_stuff.so "$d/typemap" -- -DVERSION='"1.0"' -DXS_VERSION='"1.0"' \
    $sdl_cflags $(pkg-config --cflags SDL_Pango) -lm $sdl_libs -lSDL_mixer \
    -L"$fb_prefix/lib" -lSDL_Pango $(pkg-config --libs pangoft2)
  cp "$d/fb_c_stuff.pm" "$perl_lib/"
  done_ c_stuff
fi

# ---------------------------------------------------------------- the game: work/fb
# The Perl code runs from a copy, patched with patches/game-*.patch (paths as in the orig tree,
# patch -p1 from its root), so that the orig tree stays pristine; the data ($FPATH) is the orig tree.
if stale game "$fb_src/frozen-bubble" "$fb_src/c_stuff/lib" "$here"/patches/game-*.patch \
     "$here/patches"; then
  echo "== game copy"
  g=$fb_work/fb
  rm -rf "$g" && mkdir -p "$g/c_stuff/lib"
  cp "$fb_src/frozen-bubble" "$fb_src/frozen-bubble-editor" "$g/"
  cp "$fb_src"/c_stuff/lib/*.pm "$g/c_stuff/lib/"
  shopt -s nullglob
  for p in "$here"/patches/game-*.patch; do echo "   $(basename "$p")"; patch -s -d "$g" -p1 < "$p"; done
  shopt -u nullglob
  # what the top Makefile's `prepare` target writes
  {
    echo 'package fb_config;'
    echo 'use vars qw(@ISA @EXPORT $FPATH $FLPATH);'
    echo '@ISA = qw(Exporter);'
    echo '@EXPORT = qw($FPATH $FLPATH);'
    echo "\$FPATH = \"$fb_src\";"
    echo "\$FLPATH = \"$fb_work\";"
  } > "$g/c_stuff/lib/fb_config.pm"
  done_ game
fi

# ---------------------------------------------------------------- fonts: only DejaVu Sans
if stale fonts "$here/env.sh"; then
  echo "== fonts"
  f=$fb_work/fonts
  rm -rf "$f" && mkdir -p "$f/ttf" "$f/cache"
  for n in DejaVuSans DejaVuSans-Bold DejaVuSans-Oblique DejaVuSans-BoldOblique; do
    cp "$fb_dejavu/$n.ttf" "$f/ttf/"
  done
  cat > "$f/fonts.conf" <<CONF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<!-- written by re/frozenbubble/oracle/build.sh: DejaVu Sans 2.37 (nixpkgs) only, so that "sans" is
     DejaVu Sans whatever the machine has installed -->
<fontconfig>
  <dir>$f/ttf</dir>
  <cachedir>$f/cache</cachedir>
  <alias><family>sans</family><prefer><family>DejaVu Sans</family></prefer></alias>
  <alias><family>sans-serif</family><prefer><family>DejaVu Sans</family></prefer></alias>
  <match target="font">
    <edit name="antialias" mode="assign"><bool>true</bool></edit>
    <edit name="hinting" mode="assign"><bool>true</bool></edit>
    <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
    <edit name="rgba" mode="assign"><const>none</const></edit>
  </match>
</fontconfig>
CONF
  done_ fonts
fi

# ---------------------------------------------------------------- the shim and the metrics tool
if stale shim "$stamps/sdl" "$stamps/sdl_pango" "$here/shim.c" "$here/pango-metrics.c"; then
  echo "== shim, pango-metrics"
  # keynames.h: every SDLK_ name of SDL 1.2.15, lower case without the prefix
  {
    echo 'static const struct { const char *name; int sym; } keynames[] = {'
    sed -n 's/^[[:space:]]*SDLK_\([A-Za-z0-9_]*\)[[:space:]]*=.*/\1/p' "$fb_prefix/include/SDL/SDL_keysym.h" |
      while read -r k; do echo "  { \"$(echo "$k" | tr 'A-Z' 'a-z')\", SDLK_$k },"; done
    echo '};'
  } > "$fb_work/keynames.h"
  # shellcheck disable=SC2046
  gcc -shared -fPIC -O2 -Wall -o "$fb_work/libfbshim.so" "$here/shim.c" -I"$fb_work" \
    $(sdl-config --cflags) -I"$fb_prefix/include" $(pkg-config --cflags pangoft2) \
    -L"$fb_prefix/lib" -lSDL -lSDL_Pango $(pkg-config --libs pangoft2) -ldl -lpthread \
    -Wl,-rpath,"$fb_prefix/lib"
  # shellcheck disable=SC2046
  gcc -O2 -Wall -o "$fb_work/pango-metrics" "$here/pango-metrics.c" \
    $(sdl-config --cflags) -I"$fb_prefix/include" $(pkg-config --cflags pangoft2) \
    -L"$fb_prefix/lib" -lSDL_Pango -lSDL $(pkg-config --libs pangoft2) -Wl,-rpath,"$fb_prefix/lib"
  done_ shim
fi
echo "oracle built in $fb_work"
