#!/usr/bin/env bash
# Downloads the reference version of Dungeon Crawl Stone Soup, 0.34.1 (GPL-2.0-or-later), into
# re/crawl/orig/ and unpacks it to re/crawl/orig/crawl-0.34.1/. The tarball is GitHub's archive of
# https://github.com/crawl/crawl at tag 0.34.1 (the latest stable release, 2026-03-15); its sha-256 is
# recorded below. Nothing of the package is run: re/crawl/oracle/build.sh compiles the console program,
# re/crawl/tools/extract.py reads the game's data files.
# Needs curl, tar with gzip and sha256sum.
set -euo pipefail
cd "$(dirname "$0")"
url=https://github.com/crawl/crawl/archive/refs/tags/0.34.1.tar.gz
tarball=crawl-0.34.1.tar.gz
want=a48c03653d349cdd185c750f0ff828cdf043c695a829278a30d2edb29fb82eee
mkdir -p orig
[[ -f orig/$tarball ]] || curl -fsSL -o "orig/$tarball" "$url"
echo "$want  orig/$tarball" | sha256sum -c -
rm -rf orig/crawl-0.34.1
tar -xzf "orig/$tarball" -C orig
ls orig/crawl-0.34.1
