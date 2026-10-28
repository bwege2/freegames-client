#!/usr/bin/env bash
# The WavPack golden (re/teeworlds/golden/wavpack.json): every sound of the release (datasrc/audio/*.wv)
# decoded by the WavPack 4.40 decoder the release bundles (src/engine/external/wavpack, unchanged) the way
# CSound::LoadWV calls it (wvdump.c), plus three damaged copies (one byte at the middle xored with 0x55: the
# decoder's error paths). Per file: channels, rate, bits, sample count, CRC errors, the first 16 samples
# and the SHA-256 of all 16-bit samples. web/games/teeworlds/test/wavpack.test.ts checks the port against it.
# Toolchain: the clang of the oracles (re/teeworlds/oracle/build.sh), -O1 on x86-64. Run fetch.sh first.
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
src=$(cd ../../orig/teeworlds-0.7.5-src 2>/dev/null && pwd) || { echo "run re/teeworlds/fetch.sh first" >&2; exit 1; }
golden=$(cd ../../golden && pwd)
nixpkgs=${TEEWORLDS_NIXPKGS:-github:NixOS/nixpkgs/d3b13ad75cc492690728f9307e443dec9ef9a20e}
if [[ -z ${CC:-} ]]; then
  for p in $(nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#clang" --no-link --print-out-paths --offline 2>/dev/null \
             || nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#clang" --no-link --print-out-paths); do
    [[ -x "$p/bin/clang" ]] && CC=$p/bin/clang
  done
  [[ -n "${CC:-}" ]] || { echo "no clang from nix" >&2; exit 1; }
fi
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
wv=$src/src/engine/external/wavpack
"$CC" -O1 -w -I"$wv" -o "$work/wvdump" wvdump.c "$wv"/bits.c "$wv"/float.c "$wv"/metadata.c "$wv"/unpack.c "$wv"/words.c "$wv"/wputils.c
files=("$src"/datasrc/audio/*.wv)
mkdir -p "$work/bad" "$work/out"
for f in "${files[@]:0:3}"; do
  b=$work/bad/bad-$(basename "$f")
  python3 -I -c 'import sys
d = bytearray(open(sys.argv[1], "rb").read()); d[len(d) // 2] ^= 0x55; open(sys.argv[2], "wb").write(d)' "$f" "$b"
done
"$work/wvdump" "$work/out" "${files[@]}" "$work"/bad/*.wv > "$work/meta.jsonl"
python3 -I - "$work/meta.jsonl" "$work/out" > "$golden/wavpack.json.tmp" <<'EOF'
import hashlib, json, os, sys
rows = []
for line in open(sys.argv[1]):
    r = json.loads(line)
    p = os.path.join(sys.argv[2], r["name"] + ".s16")
    if os.path.exists(p):
        r["sha256"] = hashlib.sha256(open(p, "rb").read()).hexdigest()
    rows.append(r)
print('{"decoder": "Teeworlds 0.7.5 src/engine/external/wavpack (WavPack 4.40 tiny decoder)",')
print(' "damage": "bad-<name>: byte len/2 xor 0x55",')
print(' "files": [\n  ' + ',\n  '.join(json.dumps(r) for r in rows) + '\n ]}')
EOF
mv "$golden/wavpack.json.tmp" "$golden/wavpack.json"
echo "wrote $golden/wavpack.json (${#files[@]} sounds + 3 damaged)"
