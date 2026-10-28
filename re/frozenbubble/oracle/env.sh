# Sourced by build.sh and run.sh: the toolchain and libraries from nixpkgs (gcc, perl 5.42, pango,
# glib, freetype, fontconfig, libpng, zlib, DejaVu fonts), and the directories of the oracle.
# Writes work/env.cache so that run.sh does not ask nix every time.
fb_oracle=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fb_orig=$(cd "$fb_oracle/../orig" && pwd)
fb_src=$fb_orig/frozen-bubble-2.2.0
mkdir -p "$fb_oracle/../work"
fb_work=$(cd "$fb_oracle/../work" && pwd)
fb_prefix=$fb_work/prefix

if [ ! -f "$fb_work/env.cache" ] || [ "$fb_oracle/env.sh" -nt "$fb_work/env.cache" ]; then
  _paths=$(nix --extra-experimental-features 'nix-command flakes' build --no-link --print-out-paths \
    'nixpkgs#gcc' 'nixpkgs#perl' 'nixpkgs#gnumake' 'nixpkgs#pkg-config' 'nixpkgs#gnupatch' \
    'nixpkgs#pango^dev,out' 'nixpkgs#glib^dev,out' 'nixpkgs#freetype^dev,out' \
    'nixpkgs#fontconfig^dev,out,lib' 'nixpkgs#harfbuzz^dev,out' 'nixpkgs#cairo^dev,out' \
    'nixpkgs#fribidi^dev,out' 'nixpkgs#libffi^dev,out' 'nixpkgs#pcre2^dev,out' \
    'nixpkgs#libpng^dev,out' 'nixpkgs#zlib^dev,out' 'nixpkgs#dejavu_fonts' 'nixpkgs#gettext' 'nixpkgs#libxcrypt')
  {
    _bin= _pc= _lib=
    for p in $_paths; do
      case $p in *-man|*-doc|*-info) continue;; esac
      [ -d "$p/bin" ] && _bin=$_bin:$p/bin
      [ -d "$p/lib/pkgconfig" ] && _pc=$_pc:$p/lib/pkgconfig
      [ -d "$p/share/pkgconfig" ] && _pc=$_pc:$p/share/pkgconfig
      [ -d "$p/lib" ] && _lib=$_lib:$p/lib
      [ -d "$p/share/fonts/truetype" ] && [ -f "$p/share/fonts/truetype/DejaVuSans.ttf" ] && echo "fb_dejavu=$p/share/fonts/truetype"
      [ -f "$p/include/crypt.h" ] && echo "fb_xcrypt=$p/include"
      case $p in *-perl-5*) [ -x "$p/bin/perl" ] && echo "fb_perl=$p/bin/perl";; esac
    done
    echo "fb_nixbin=${_bin#:}"
    echo "fb_nixpc=${_pc#:}"
    echo "fb_nixlib=${_lib#:}"
  } > "$fb_work/env.cache"
fi
# shellcheck disable=SC1091
. "$fb_work/env.cache"
export PATH="$fb_prefix/bin:$fb_nixbin:/usr/bin:/bin"
export PKG_CONFIG_PATH="$fb_prefix/lib/pkgconfig:$fb_nixpc"
export FONTCONFIG_FILE=$fb_work/fonts/fonts.conf
