#!/usr/bin/env bash
# Writes the goldens of the port's tests: every session of sessions/*.txt run through the oracle
# (drive.py) into web/games/nethack/test/golden/<session>.json.gz.
#   goldens.sh [session ...]      only these
# The sessions made by the bot (sessions/bots.json) are made again with
#   python3 -I bot.py --all sessions/bots.json sessions [name ...]
# (the oracle must be built: build.sh).
set -euo pipefail
cd "$(dirname "$0")"
out=../../../web/games/nethack/test/golden
mkdir -p "$out"
if (($#)); then names=("$@"); else names=(); for f in sessions/*.txt; do names+=("$(basename "$f" .txt)"); done; fi
for n in "${names[@]}"; do
  python3 -I drive.py "sessions/$n.txt" "$out/$n.json.gz"
done
