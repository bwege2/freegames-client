#!/usr/bin/env bash
# The original client's component trees of the screens in web/games/freecol/test/oracle/screens.json
# (oracle/run.sh ClientDump under Xvfb), copied to web/games/freecol/test/oracle/SCREEN.tree for
# test/client.test.ts; the pixels stay in re/freecol/work/client/SCREEN.png (e2e.mjs compares them).
# Needs a JDK 21 (JAVA_HOME) and Xvfb (on PATH or XVFB).
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
dst=$here/../../web/games/freecol/test/oracle
size=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["size"])' "$dst/screens.json")
python3 -I -c 'import json,sys
for k, v in json.load(open(sys.argv[1]))["screens"].items(): print("\t".join([k] + v["steps"]))' "$dst/screens.json" |
while IFS=$'\t' read -r -a f; do
  bash "$here/oracle/run.sh" ClientDump "$here/work/client" "$size" "${f[@]}" < /dev/null
  cp "$here/work/client/${f[0]}.tree" "$dst/${f[0]}.tree"
done
