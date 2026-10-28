#!/usr/bin/env bash
# Regenerates the Cap'n Proto bindings (the generated files are committed, so building does not need this):
#   protocol/freegames.capnp      -> server/src/main/java/net/slop/freegames/proto/Fg.java
#                                    web/src/sdk/proto/freegames.ts
#   protocol/games/<id>.capnp     -> server/src/main/java/<its $Java.package>/<its $Java.outerClassname>.java
#                                    web/games/<id>/src/proto/<id>.ts
# Needs `capnp` and `capnpc-java` (taken from nix when they are not on PATH) and npx (capnp-es, pinned
# to the version web/package.json uses).
set -euo pipefail
cd "$(dirname "$0")/.."
CAPNP_ES=(-p capnp-es@0.0.16 -p typescript@5.9.3 capnp-es)
if ! command -v capnp >/dev/null || ! command -v capnpc-java >/dev/null; then
  # the local store first: resolving nixpkgs online can hang
  nixpkg() {
    nix --extra-experimental-features 'nix-command flakes' build "nixpkgs#$1" --no-link --print-out-paths --offline 2>/dev/null \
      || nix --extra-experimental-features 'nix-command flakes' build "nixpkgs#$1" --no-link --print-out-paths
  }
  CAPNP=$(nixpkg capnproto)
  CJAVA=$(nixpkg capnproto-java)
  export PATH="$CAPNP/bin:$CJAVA/bin:$PATH"
  JAVA_INC="$CJAVA/include"
else
  JAVA_INC="$(dirname "$(command -v capnpc-java)")/../include"
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# gen <schema> <ts output>: Java into its package directory, TypeScript to the given path
gen() {
  local schema=$1 ts=$2 pkg outer
  pkg=$(sed -n 's/^\$Java\.package("\(.*\)");.*/\1/p' "$schema")
  outer=$(sed -n 's/^\$Java\.outerClassname("\(.*\)");.*/\1/p' "$schema")
  [[ -n "$pkg" && -n "$outer" ]] || { echo "$schema: needs \$Java.package and \$Java.outerClassname" >&2; exit 1; }
  capnp compile -I "$JAVA_INC" -I protocol --src-prefix="$(dirname "$schema")" -ojava:"$TMP" "$schema"
  mkdir -p "server/src/main/java/${pkg//.//}"
  mv "$TMP/$outer.java" "server/src/main/java/${pkg//.//}/$outer.java"
  # capnp-es writes <name>.ts next to the schema it is given (and reads a non-tty stdin)
  cp "$schema" "$TMP/$(basename "$schema")"
  ( cd "$TMP" && npx --yes "${CAPNP_ES[@]}" -I"$JAVA_INC" -I"$OLDPWD/protocol" -ots "$(basename "$schema")" < /dev/null )
  mkdir -p "$(dirname "$ts")"
  mv "$TMP/$(basename "${schema%.capnp}").ts" "$ts"
  echo "generated: server/src/main/java/${pkg//.//}/$outer.java, $ts"
}

gen protocol/freegames.capnp web/src/sdk/proto/freegames.ts
for f in protocol/games/*.capnp; do
  [[ -e "$f" ]] || continue
  id=$(basename "$f" .capnp)
  gen "$f" "web/games/$id/src/proto/$id.ts"
done
