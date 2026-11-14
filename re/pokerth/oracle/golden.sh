#!/usr/bin/env bash
# Writes the transcripts of the original engine that the port's tests compare against
# (web/games/pokerth/test/golden/*.txt.gz), with re/pokerth/oracle/pokerth-oracle (build.sh first).
# Each line of GAMES is one local game: SEED PLAYERS STARTCASH SMALLBLIND EVERYHANDS MAXHANDS [MANUALBLINDS...];
# the test reads the arguments back from the file name list in web/games/pokerth/test/golden/games.txt.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../../../web/games/pokerth/test/golden"
oracle="$here/pokerth-oracle"
test -x "$oracle" || { echo "run build.sh first" >&2; exit 1; }
mkdir -p "$out"
GAMES=(
  "42 10 5000 10 8 400"
  "7 2 1000 20 4 400"
  "9 6 3000 50 3 400 100 200 400"
  "11 10 10000 10 20 1000"
  "123 3 2000 10 5 400"
  "5 4 1500 25 2 400"
  "1001 10 5000 10 8 400"
  "1002 10 5000 10 8 400"
  "1003 9 5000 10 8 400"
  "1004 8 3000 20 6 400"
  "1005 7 5000 10 8 400"
  "1006 5 2500 10 4 400"
  "2001 2 5000 10 8 400"
  "2002 2 3000 50 2 400"
  "2003 3 1000 10 1 400"
  "3001 10 1000 50 1 400"
)
: > "$out/games.txt"
for g in "${GAMES[@]}"; do
  name="game-$(echo "$g" | tr ' ' '-')"
  # shellcheck disable=SC2086
  "$oracle" game $g | gzip -9n > "$out/$name.txt.gz"
  echo "$g" >> "$out/games.txt"
done
"$oracle" rank 1 4000 | gzip -9n > "$out/rank-1-4000.txt.gz"
# 300000 more hands: only the SHA-256 of the transcript
echo "2 300000 $("$oracle" rank 2 300000 | sha256sum | cut -d" " -f1)" > "$out/rank-hashes.txt"
ls -l "$out"
