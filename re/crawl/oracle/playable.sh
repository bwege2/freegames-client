#!/usr/bin/env bash
# Writes the playable species, jobs and combinations of the original (its -playable-json) next to this
# script; the data extractor and the character-creation menus use it.
set -euo pipefail
cd "$(dirname "$0")"
here=$(pwd)
src=$(cd ../orig/crawl-git/crawl-ref/source && pwd)
if [[ ! -x $src/crawl ]]; then
    echo "build the oracle first: re/crawl/oracle/build.sh" >&2
    exit 1
fi
mkdir -p run
cd run
ln -sfn "$src/crawl" crawl
ln -sfn "$src/dat" dat
ln -sfn "$src/scripts" scripts
./crawl -playable-json > "$here/playable.json"
