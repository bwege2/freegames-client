# Oracle build: a dedicated OpenTTD 15.3 with selectable world-generation stages

The tests compare the port against a savegame made by the real OpenTTD 15.3
code. One map at a time is not enough to localise a difference: a town or a
tree changes terrain, so the landscape comparison would drown in unrelated
tiles. This patch adds `OTTD_ORACLE_STAGES`, an environment variable that
selects which of the post-landscape generators run:

| `OTTD_ORACLE_STAGES` | generators |
| --- | --- |
| unset | everything (the normal game) |
| `landscape` | nothing; the bare generated landscape, rivers included |
| `landscape,towns` | towns only |
| `landscape,industries` | industries only |
| `landscape,objects` | objects only |
| `landscape,trees` | trees only |

`CreateRivers` is part of `GenerateLandscape`, so rivers always run when the
requested `amount_of_rivers` is not zero. The stage names are substrings:
`towns`, `industries`, `objects`, `trees`.

Prebuilt release binaries are not used for fixtures because they cannot select
stages. `stages.patch` is the only change; it does not alter any generator.

## Building it

Use the pinned source archive (`re/openttd/fetch.sh` downloads it, SHA-256
`5ea21eea7d59c78a42071924ac18c6bc0116088f2e96b14cfee9369175973be7`) and a
C++20 compiler. With the nix toolchain used for the current fixtures:

```sh
work=/tmp/opencode/ottd-oracle
rm -rf "$work"
mkdir -p "$work"
tar -xJf re/openttd/orig/openttd-15.3-source.tar.xz -C "$work"
cd "$work/openttd-15.3"
patch -p1 < /path/to/freegames/re/openttd/oracle/stages.patch
cmake -S . -B build -DOPTION_DEDICATED=ON -DCMAKE_BUILD_TYPE=Release -DOPTION_USE_ASSERTS=OFF
cmake --build build -j"$(nproc)"
```

If zlib/libLZMA are not found the savegame is uncompressed (`OTTN`), which is
what `re/openttd/tools/save.mjs` reads; the fixture command below also asks for
`savegame_format = none`.

## Generating a fixture

`re/openttd/tools/oracle.mjs` drives the dedicated binary: it waits for the
startup map, sends `newgame <seed>`, waits for that generation, saves and
quits. Point it at the stage-selecting binary:

```sh
OTTD_ORACLE_STAGES=landscape node re/openttd/tools/oracle.mjs \
  --binary /tmp/opencode/ottd-oracle/openttd-15.3/build/openttd \
  --stages landscape --seed 12345 --rivers 2 \
  --out /tmp/opencode/fixtures/rivers-temperate-12345.sav
node re/openttd/tools/fixture.mjs /tmp/opencode/fixtures/rivers-temperate-12345.sav \
  web/games/openttd/test/fixtures/rivers-temperate-12345.json \
  --seed 12345 --rivers 2 --landscape temperate --stages landscape
```

The oracle config sets `extra_tree_placement = 3` (no growth, no spread): a
savegame is taken a few game ticks after the map is generated, and without
this the game may plant a tree after world generation and change a
neighbouring water tile's non-flooding bit. The fixtures must contain exactly
the generated map, not a map that has been ticking.

`oracle.mjs` writes `<out>.log` when `OTTD_ORACLE_TRACE` is set; that trace
support is only in the local development copy of the source, not in this
patch, and the fixtures do not depend on it.
