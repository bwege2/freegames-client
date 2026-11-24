#!/usr/bin/env bash
# The original's debug record of a scenario, the oracle of the simulation (milestone 1, re/openclonk/NOTES.md).
#   1. the original's headless server (build-headless.sh) plays the scenario and records it (--record);
#   2. it replays that record and writes every debug-record chunk (C4Playback::Check with DebugRecWrite:
#      {int32 type, int32 size, bytes}) to work/dbgrec/<name>.rec;
#   3. work/dbgrec/<name>.seed gets the record's RandomSeed, work/dbgrec/<name>.ocs is the record (packed), which the
#      port replays, work/dbgrec/<name>.recname its name in Records.ocf.
# The server runs with its own HOME (work/dbgrec/home), so nothing is written to the user's ~/.clonk.
# Without players the round is over when the scenario's goal sees nobody (Acid Drilling: frame 35), but the server
# goes on running it until it is stopped. Neither run ends by itself: `timeout` stops each after <seconds> with SIGINT,
# which the original takes as Application.Quit, between two frames. A replay does not end with its record either:
# C4Playback::ExecuteControl reaches the record's last chunk (RCT_End) and sets Finished, but the next frame returns
# at `currChunk == chunks.end()` before it would call Finish, so the game runs on without control. The debug record
# therefore ends with the last whole frame before the stop, and the port is compared for that many frames.
#   debugrec.sh <scenario in planet/, e.g. Missions.ocf/AcidDrilling.ocs> [name] [seconds]
#   debugrec.sh --replay <record: a scenario group or folder with CtrlRec.ocb> <name> [seconds]
#     only step 2 for a given record (one the port wrote, test/input.test.ts); work/dbgrec/<name>.replay.log is the
#     original's log of it, with its desync messages ("Network: Synchronization loss!", "Playback error: ...")
set -euo pipefail
cd "$(dirname "$0")"
given=
if [[ ${1:-} == --replay ]]; then
  given=$(realpath "$2"); shift
fi
scen=$1
name=${2:-$(basename "$scen" .ocs)}
secs=${3:-30}
server=$(cd ../work/headless 2>/dev/null && pwd)/openclonk-server
[[ -x $server ]] || { echo "run re/openclonk/oracle/build-headless.sh first" >&2; exit 1; }
planet=$(cd ../orig/openclonk/planet && pwd)
# the server finds the content through <its folder>/planet (C4Reloc::Init)
ln -sfn "$planet" "$(dirname "$server")/planet"
out=$(mkdir -p ../work/dbgrec && cd ../work/dbgrec && pwd)
home=$out/home
rm -rf "$home" && mkdir -p "$home/.clonk/openclonk"
printf '[General]\nLanguage="US - English"\nLanguageEx="US"\n[Sound]\nSound=0\nMusic=0\n' > "$home/.clonk/openclonk/config"
# the headless server opens a scenario in its console mode, which stops at the end of its standard input
run() { (sleep $((secs + 5)) | HOME=$home timeout -s INT "$secs" "$server" --language=US "$@" > "$out/$name.log.$$" 2>&1) || true; }
if [[ -n $given ]]; then
  # the record goes where the original keeps its records, under the name it has
  mkdir -p "$home/.clonk/openclonk/Records.ocf"
  rec=$home/.clonk/openclonk/Records.ocf/$(basename "$given")
  cp -a "$given" "$rec"
else
  run --record "$planet/$scen"
  # the record: a scenario group (packed when the game ends normally) with the control (CtrlRec.ocb)
  rec=$(ls -d "$home/.clonk/openclonk/Records.ocf/"*.ocs 2>/dev/null | head -1)
  [[ -e $rec ]] || { cat "$out/$name.log.$$" >&2; echo "no record written" >&2; exit 1; }
  cat "$out/$name.log.$$" > "$out/$name.record.log"
fi
run --debugrecwrite="$out/$name.rec" "$rec"
cat "$out/$name.log.$$" > "$out/$name.replay.log"
rm -f "$out/$name.log."*
basename "$rec" > "$out/$name.recname"
# the record itself: the port replays it (test/debugrec.test.ts), as the original did for the debug record
if [[ -z $given ]]; then
  rm -rf "$out/$name.ocs"
  [[ -f $rec ]] && cp "$rec" "$out/$name.ocs"
fi
# the seed the port must use: [Game] RandomSeed of the record's Scenario.txt (a copy, exploded when packed)
x=$out/$name.record.ocs
rm -rf "$x" && cp -a "$rec" "$x"
[[ -d $x ]] || "$(dirname "$server")/../build/c4group" "$x" -x >/dev/null 2>&1
sed -n 's/^RandomSeed=//p' "$x/Scenario.txt" | tr -d '\r' > "$out/$name.seed"
rm -rf "$x"
echo "$out/$name.rec: $(stat -c %s "$out/$name.rec") bytes, seed $(cat "$out/$name.seed")"
