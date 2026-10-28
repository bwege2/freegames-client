#!/usr/bin/env bash
# compare.sh <session.txt>...: runs the oracle (with FBOracle) and the port on each session and shows
# the first differences of both traces (outputs in $FBCMP_OUT, default $TMPDIR/fbcmp). A development
# aid; web/games/frozenbubble/test/oracle.test.ts does the same.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
out=${FBCMP_OUT:-${TMPDIR:-/tmp}/fbcmp}
mkdir -p "$out"
for arg in "$@"; do
  session=$(cd "$(dirname "$arg")" && pwd)/$(basename "$arg")
  name=$(basename "$session" .txt)
  ORACLE_PERL_MODULE=FBOracle bash "$here/run.sh" "$session" "$out/$name.oracle" "$out/$name.oracle.home" > /dev/null
  (cd "$here/../../../web" && node games/frozenbubble/test/run-port.ts "$session" "$out/$name.port")
  for k in "" .state; do
    if cmp -s "$out/$name.oracle$k" "$out/$name.port$k"; then
      echo "$name$k: equal ($(wc -l < "$out/$name.oracle$k") lines)"
    else
      echo "$name$k: DIFFERENT"
      diff "$out/$name.oracle$k" "$out/$name.port$k" | head -"${DIFFLINES:-8}" | cut -c1-400
    fi
  done
done
