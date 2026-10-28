#!/usr/bin/env bash
# Downloads the libraries the Frozen Bubble 2.2.0 oracle is built from, pinned by sha256, into
# re/frozenbubble/orig/deps/ (gitignored). Run re/frozenbubble/fetch.sh first for the game itself.
#
#   SDL 1.2.15          the last SDL 1.2 release (2012), the real blitters (not sdl12-compat)
#   SDL_image 1.2.12    the last SDL_image 1.2 release
#   SDL_mixer 1.2.12    only so SDL_perl and c_stuff link; every Mix_* call is replaced by the shim
#   SDL_Pango 0.1.2     Debian's pristine orig tarball (sourceforge's file is gone) and Debian's
#                       patch set 0.1.2-8, which carries the Frozen-Bubble API patch
#                       (api_additions.patch = zarb.org/~gc/t/SDL_Pango-0.1.2-API-adds.patch)
#   SDL_Perl 2.1.2      named in Frozen Bubble's INSTALL as tested; from BackPAN
#   Locale-gettext 1.07 CPAN
set -euo pipefail
cd "$(dirname "$0")"
dst=../orig/deps
mkdir -p "$dst"

get() { # url sha256 [file name]
  local url=$1 sum=$2 name=${3:-${1##*/}} f
  f=$dst/$name
  if [ ! -f "$f" ] || ! echo "$sum  $f" | sha256sum -c --status -; then
    curl -fsSL --retry 3 -o "$f.part" "$url"
    mv "$f.part" "$f"
  fi
  echo "$sum  $f" | sha256sum -c --quiet -
}

get https://www.libsdl.org/release/SDL-1.2.15.tar.gz \
    d6d316a793e5e348155f0dd93b979798933fb98aa1edebcc108829d6474aad00
get https://www.libsdl.org/projects/SDL_image/release/SDL_image-1.2.12.tar.gz \
    0b90722984561004de84847744d566809dbb9daf732a9e503b91a1b5a84e5699
get https://www.libsdl.org/projects/SDL_mixer/release/SDL_mixer-1.2.12.tar.gz \
    1644308279a975799049e4826af2cfc787cad2abb11aa14562e402521f86992a
get https://deb.debian.org/debian/pool/main/s/sdlpango/sdlpango_0.1.2.orig.tar.gz \
    7f75d3b97acf707c696ea126424906204ebfa07660162de925173cdd0257eba4
get https://deb.debian.org/debian/pool/main/s/sdlpango/sdlpango_0.1.2-8.debian.tar.xz \
    0ee1e3bbb9f24e974fd12252c2493b1dd1c03d07418d7ceb8dc64d7dd7d7d92e
get 'https://web.archive.org/web/2010id_/http://zarb.org/~gc/t/SDL_Pango-0.1.2-API-adds.patch' \
    5a989c7acb539fce640323d3995cca8913a4b8869f5c690b78501ec6b5c86d5d SDL_Pango-0.1.2-API-adds.patch
get https://backpan.perl.org/authors/id/D/DG/DGOEHRIG/SDL_Perl-2.1.2.tar.gz \
    b35e5cc8f03dc11779f5cd0483d8ad8e50d7eb9cd0f7e6847d12ea97812a5566
get https://cpan.metacpan.org/authors/id/P/PV/PVANDRY/Locale-gettext-1.07.tar.gz \
    909d47954697e7c04218f972915b787bd1244d75e3bd01620bc167d5bbc49c15
echo "deps in $(cd "$dst" && pwd)"
