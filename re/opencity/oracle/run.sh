#!/usr/bin/env bash
# Runs every oracle script (re/opencity/oracle/scripts/*.txt) through the original's game logic
# (opencity-oracle, build.sh) and writes the transcripts the port's test compares with:
# web/games/opencity/test/oracle/<name>.out. Save files the scripts write go to the same folder.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
data=$(cd ../orig/opencity-0.0.6.5stable && pwd)
out=$(cd ../../../web/games/opencity/test && pwd)/oracle
mkdir -p "$out"
[[ -x opencity-oracle ]] || bash build.sh
for s in scripts/*.txt; do
  name=$(basename "$s" .txt)
  (cd "$out" && "$here/opencity-oracle" "$data/" < "$here/$s" | grep -v "^<INFO>" > "$out/$name.out")
  echo "$name: $(wc -l < "$out/$name.out") lines"
done
