# Porting conventions (HyperRogue 13.1o → TypeScript), stage 1

Reference source: `re/hyperrogue/orig/hyperrogue-13.1o/` (`re/hyperrogue/fetch.sh`). `hyper.cpp` includes every
.cpp into one translation unit; declarations come from `hyper.h` and from `autohdr.h`, which `makeh` builds out
of the `EX` annotations (`re/hyperrogue/work/oracle/src/autohdr.h` after `re/hyperrogue/oracle/build.sh`).
The port is line for line: same control flow, same order of RNG calls, same names, the original's quirks
included. Findings about the original: `re/hyperrogue/NOTES.md`.

**Stage 1** is the game in the standard geometry (hyperbolic {7,3}, bitruncated as default, pure too): map
structure, all lands of the normal game and their generation, all rules, items, monsters, orbs, Yendor,
save/restart. No graphics, UI, other geometries, translations (later stages).

## Files

| Path | What |
| --- | --- |
| `re/hyperrogue/oracle/` | `build.sh` (builds the original headless + `harness.cpp`, writes the goldens), `scenarios-format.md` |
| `re/hyperrogue/tools/gen-content.py` | writes `src/content.ts` and `src/content-req.ts` from content.cpp/classes.cpp (do not edit those) |
| `re/hyperrogue/tools/gen-api.py` | `modules` → `MODULES.md` (every stage-1 file's `EX` functions/variables and HDR types); `globals` → the first `src/globals.ts` |
| `re/hyperrogue/tools/cross-calls.py` | → `STUBS.md`: what stage-1 files use from later-stage files |
| `src/<file>.ts` | the port of `<file>.cpp`, one module per C++ file (`hyper-main.cpp` → `hyper-main.ts`) |
| `src/hyper.ts` | hyper.h: constants, `Flag`, `among`, `isize`, attack flags, `hookset`, `NotPorted` (+ `gmod`/`gdiv` of util.cpp) |
| `src/cpp.ts` | C++ semantics: `idiv`, `i8/u8/i16/u16`, `itrunc`, `fround`, `cround`, `Ref`, `dynamicval`, `std_sort`, `fmtG` |
| `src/rand.ts` | `mt19937`, `hrngen` and all of game.cpp's random functions, glibc `rand/srand`, `randd` (exact, tested) |
| `src/locations.ts` | locations.cpp: `cell`, `heptagon`, `connection_table`, `walker`/`cellwalker`/`heptspin`, `movei`, `celllister` (done) |
| `src/globals.ts` | `G`: every mutable `EX` variable of the stage-1 files |
| `src/cfile.ts` | C stdio for the system files (P8): files in memory (`cfs.files`, the website backs them with account storage), `printf` (`cfs.stdout`), `getenv` (`cfs.env`), `exit()` throws `c_exit` |
| `src/content.ts`, `src/content-req.ts` | generated: enums, tables, help texts; `isNative`, the REQ switches of landlock.cpp |
| `test/trace.ts`, `test/*.test.ts` | the scenario interpreter (twin of `harness.cpp`) and the tests; `test/scenarios`, `test/golden`; `test/run-scenario.ts` runs one scenario per process, as the oracle does (the globals are never reset between games) |

TypeScript runs through node's type stripping in the tests: no `enum`, no `namespace`, no constructor parameter
properties, imports with `.ts`, `import type` for types. `tsconfig` is strict with `noUnusedLocals/Parameters`
(name an unused parameter `_x`). `npm run build` type-checks everything, so every commit must compile.

## Modules and the order of evaluation

C++ has one translation unit; ES modules import each other in cycles. Cycles are fine for functions (called
later), but a module's **top-level code** may only use bindings of **leaf modules**: `content.ts`, `hyper.ts`,
`cpp.ts`, `rand.ts`, `locations.ts`, `globals.ts` (they import nothing but each other's types/leaves, never a
non-leaf). So: module-level constants and tables may use content/hyper/cpp/rand/locations/G; everything else
(function calls into other modules, hook registration) goes into a function.

* **Hooks** (`addHook(hooks_x, prio, f)` at static-init time in C++): each module exports `register_<file>()`
  (C identifiers: `register_hyper_main`) doing its `addHook`s in source order. P8's `hyper-main.ts` calls all
  register functions **in hyper.cpp's include order** before anything else (equal priorities are bumped in
  registration order, so the order matters). Other static initializers with side effects go there too.
* `locations.ts` reaches createMov/createStep/reverse_directions/whirlwind::jumpDestination/DUALMUL through
  `late` (set by `register_cell`, `register_heptagon`, ...), so it stays a leaf.

## Names

* Functions: C++ name. In a namespace: `ns_name` (`yendor::collected` → `yendor_collected`, nested
  `fieldpattern::x` → `fieldpattern_x`, `ls::any_chaos` → `ls_any_chaos`). `MODULES.md` lists every export.
* **Overloads**: the overload taking `cell*` (or the most used one) keeps the name; others get a suffix for the
  differing parameter type: `_h` heptagon, `_cw` cellwalker, `_hs` heptspin, `_l` eLand, `_i` eItem, `_m`
  eMonster, `_w` eWall, `_s` string, `_n` int (e.g. `emeraldval(c)`, `emeraldval_h(h)`; `reverse_directions(c, d)`,
  `reverse_directions_h(h, d)`). Overloads differing only in arity become one function with optional parameters.
  Note the chosen names in the module header and in `MODULES.md` (edit the table row) when you add one.
* Default arguments (`IS(x)` in EX declarations): TS default parameters.
* Struct/class names, enum constants, macros-as-constants: C++ name.

## Globals

* Every mutable `EX` variable lives in **`G`** (`src/globals.ts`), named as above: `turncount` → `G.turncount`,
  `yendor::on` → `G.yendor_on`, `princess::challenge` → `G.princess_challenge`. Each section of globals.ts is
  headed by its C++ file; **the package owning that file owns the section** and fixes its TODOs (types the
  generator could not derive, initializers). Values only: the singletons with methods are module exports
  (`changes` in pcmove.ts, `hrngen` in rand.ts, `currentmap` stays in G as it is reassigned).
* File-local (non-EX) mutable variables, `static` locals: module-level `let` in their module.
* `const`/`constexpr`/`#define` constants: exported `const` of the owning module (hyper.h's in `hyper.ts`).
* Variables of later-stage files the logic reads (`vid.particles`, `shmup::on`, `racing::on`, `tour::on`,
  `dual::state`, `multi::players`, ...): add them to G in a section `// --- <file>.cpp (stage 1: read by the
  rules) ---` with the value the oracle has (the desktop defaults; `shmup_on = false`, `vid_particles = true`...).

## Types

| C++ | TypeScript |
| --- | --- |
| `int`, `short`, `char`, `unsigned`, enums, `ld`, `double` | `number` (wrap where C++ wraps, see below) |
| `bool` | `boolean`; where C++ uses it as a number: `(b ? 1 : 0)` |
| `flagtype` (64-bit) | `bigint`: `(minf[m].flags & CF_GHOST) !== 0n` |
| `eLand`, `eItem`, `eMonster`, `eWall` | `number` aliases from content.ts; `eItem(i)` is just `i` |
| `cell*`, `heptagon*` | `cell`, `heptagon`; `NULL` is `null!`; test with `!c` |
| `cellwalker`, `heptspin`, `movei` (values) | classes; **copy with `.clone()`** wherever C++ copies (`cellwalker cw2 = cw;`), assign with `.set()`; `cw += d` → `cw.add(d)`, `cw + wstep` → `cw.plusStep()`, `cw += wstep` → `cw.addStep()`, `==` → `.eq()` |
| other structs | classes with a `clone()` where C++ copies them |
| `vector<T>` | `T[]` (`push_back` → `push`, `clear()` → `length = 0`, `erase` → `splice`) |
| `array<int, N>` | `number[]` of length N |
| `map<K, V>` | `Map<K, V>` — **iteration**: std::map iterates in key order, Map in insertion order: iterate `sortedKeys(map)` (numbers ascending; `cell`/`heptagon` by `_id`) wherever the order is observable |
| `set<K>` | `Set<K>`, same rule |
| `string` | `string` (the original's strings are UTF-8 bytes; `isize(s)` of non-ASCII text differs: use a UTF-8 byte count where the code indexes bytes) |
| `T& x` / `T* x` out-params | `Ref<T>` (`{ v }`), or an (object, key) pair as `changes.value_set(G, 'x', v)` does |
| lambdas | arrow functions; `[=]` captures copy: take `const` copies (and `.clone()` walkers) before the arrow |
| templates | generics, or one function per instantiation used |
| `dynamicval<T> g(x, v);` | `const g = dynamicval(() => G.x, (v) => { G.x = v; }, v); try { ... } finally { g.restore(); }` |
| destructors (celllister, manual_celllister, pathdata) | an explicit `destroy()` in `finally` |

`cell` fields that are bit fields or chars in C++ (`mpdist:7` signed, `pathdist`, `cpdist` signed 8,
`mondir`, `bardir`, `stuntime` unsigned 8, `hitpoints:7`, `landflags`, `wparam` signed char, `ligon`,
`monmirror`) are accessors that wrap on store like the desktop build (CAP_BITFIELD=1); heptagon's shorts and
bit fields likewise. `c->LHU.landpar/landpar_color/heat/bytes[k]/fi.*` and the macros `landparam`, `fval`,
`HEAT(c)` (= `c.LHU.heat`, a float) are on `cell`. New cells start with every field 0 (the oracle zero-fills).

### Pointer order

C++ orders `cell*`/`heptagon*` by address (`set<cell*>`, `map<cell*,..>`, `walker::operator<`,
`sort(airmap)`). The port uses the creation serial `_id` (`cell._id`, `heptagon._id`) for that order. The known
iterations over pointer-keyed containers in stage 1 are order-independent (NOTES.md); `airmap` is sorted by
`(_id, dist)` and searched with a lower bound, which gives the same `airdist`. If you find a place where the
result depends on the address order, the original itself is not deterministic there: report it in NOTES.md.

## Integers

* `int` arithmetic: `|0` after `+ -` that can overflow, `Math.imul` for products that can, `idiv(a, b)` for
  `/`, JS `%` is C's `%`. `unsigned`: `>>> 0`. `(int)x` of a double: `itrunc(x)`.
* Stores into `char`/`short` variables or fields: `i8`/`u8`/`i16` (fields of cell/heptagon wrap by themselves).
* `gmod`, `gdiv`, `zgmod`, `szgmod` (util.cpp) from `hyper.ts`/`util.ts`.

## Floating point

`ld` is `double` in 13.1o (NOTES.md), so the geometry is plain JS numbers; there is no long double to emulate.
`float` (only `LHU.heat` in the rules) rounds on every store (`fround`, or the `heat` accessor). The rules use
floats in a few places only (crossbow lines, fire lines of sight in environment.cpp, the sword and Wind code in
complex.cpp, heat): compare the dump's game state, never coordinates. `Math.sin/cos/exp/log/acosh/...` may differ
from glibc in the last bit; if an oracle difference is traced to that, port the glibc routine into `cpp.ts`.
Printing doubles (`fts`, `%.17g`): `fmtG` in cpp.ts is exact.

## Macros

* `forCellEx(ct, cf) body` → `for (let i = 0; i < cf.type; i++) { const ct = cf.move(i); if (!ct) continue; body }`;
  `forCellIdEx(ct, i, cf)` the same with `i` named; `forCellCM(ct, cf)` / `forCellAll` → `const ct =
  createMov(cf, i)` (creates cells: keep it where C++ has it, it changes the map); `forCellIdAll` → no null test.
  `break` leaves the loop, as in C++.
* `LATE(x)` → `if (changes.on) { changes.at_commit(() => f(args)); return; }`.
* `changes.value_set(x, v)` → `changes.value_set(G, 'x', v)`; `value_keep(items)` → `value_keep_array(G.items)`;
  `value_keep(hrngen)` → `value_keep_rng(hrngen)` (src/pcmove.ts has `changes_t` already).
* `XLAT(s, p...)`: `stringpar` built from an enum must say which enum: P2 exports `spM(m)`, `spL(l)`, `spW(w)`,
  `spI(i)` (the names) and `XLAT(s, ...string[])`. `its(n)`, `fts(x)` from hprint.ts.
* `DEBB`, `DEBBI`, `println(hlog, ...)`, `printf` debug output: leave out (comment `// DEBB ...`).
* `hassert`/`throw hr_exception`: keep (`throw new hr_exception(...)`).
* `U5`, `R10`, ... and `big_unlock`: functions in content-req.ts (`U5()`).
* Geometry macros (`S7`, `S3`, `S6`, `PURE`, `BITRUNCATED`, `STDVAR`, `euclid`, `sphere`, `hyperbolic`,
  `quotient`, `WDIM`, `GDIM`, `closed_or_bounded`, ...): functions in classes.ts next to `ginf`/`cginf` (P1):
  `if(euclid)` → `if (euclid())`.

## `#if CAP_*`, other geometries, later stages

The oracle is the desktop build (CAP_SDL=1, CAP_GL=1, CAP_SHMUP=1, CAP_INV=1, CAP_COMPLEX2=1, CAP_RACING=1,
CAP_TOUR=1, CAP_EDIT=1, CAP_SAVE=1, CAP_BITFIELD=1, CAP_ARCM/CRYSTAL/... =1, CAP_ACHIEVE=0, CAP_DAILY=0,
CAP_PNG=0, ISWEB=0, ISMOBILE=0). Keep the `#if` branch that build compiles, drop the other (no comment needed
for `ISMOBILE`/`ISWEB` branches; a one-line comment where a CAP branch is dropped).

Runtime branches for other geometries (`if(euclid) ...`, `if(arcm::in()) ...`, `if(GOLDBERG) ...`) stay as code;
the functions they call in later-stage files are **stubs**: `src/<file>.ts` modules whose functions are marked
`// STAGE1-STUB` and either return the value the standard geometry gives (`arcm_in()` → `false`,
`bt_in()` → `false`, `euclid` stays a real macro) or `throw new NotPorted('name')` where the standard game
never gets. Graphics calls in the rules (animateMovement, drawParticles, drawFlash, fallingFloorAnimation,
playSound, ...) are no-op stubs **except that they must keep their side effects on game state and on
`rand()`**: animations.cpp's `drawParticle`, `drawParticleSpeed`, `drawDirectionalParticle`, `drawParticles`,
`drawFireParticles` consume glibc `rand()` (which also names Camelot's knights) whenever `vid.particles` (on by
default) — port those calls of `rand()` and their `LATE` exactly, drop only the drawing.

**Sound and music** (wired in a later stage, with credits `sounds/credits.txt`, `hyperrogue-music.txt`): the rules
call `playSound(c, name, vol)` (about 150 call sites: attack, items, monstergen, monstermove, orbs, mapeffects,
environment, pcmove, complex, game, landgen, yendor), `playSeenSound(c)` (complex, landgen, monstergen,
monstermove) and `resetmusic()` (system). Stub them in `src/sound.ts` as no-ops that call an optional hook
(`export const soundhooks = { play: null as ((c, name, vol) => void) | null }`), keep the `LATE` of
`playSound`, and keep every call site with its exact sound name: the later stage then only fills the hook.
*Done in stage 3:* `src/sound.ts` is sound.cpp (music list, handlemusic, playSound, initAudio, resetmusic) on
`src/sdlmixer.ts` (the SDL_mixer calls on Web Audio); `soundhooks.play` stays as a tap that sees every sound.

`STUBS.md` lists, per later-stage file, what the stage-1 files use. Stub module ownership (create it when your
package first needs it; if both parallel packages need one, the first to land creates it, the other adds to it):

| Stub modules | Owner |
| --- | --- |
| euclid, sphere, binary-tiling, archimedean, arbitrile, rulegen, kite, aperiodic-hat, fake, quotient, crystal, reg3, nonisotropic, goldberg, goldberg-sub, irregular, asonov, embeddings, backed-map, intra, fundamental, arbiquotient | P1 |
| sound, animations, colors, graph, graph-*, celldrawer, drawing, hypgraph, hud, help, dialogs, menus, config, control, scores, quit, sky, textures, screenshot, models, floorshapes, polygons, 3d-models, rug, legacy, geom-exp, mapeditor, shmup, racing, tour, multigame (dual), inforder, wfcgen, basegraph (except messages) | P8 |

## Packages

Nine packages, run at most two at a time, in this order (each step's pair is independent: different files, no
shared sections of globals.ts). Line counts are of the whole C++ files; the parts for other geometries,
graphics and menus are stubbed, so the effective size is smaller where noted.

| Step | Package | C++ files | Lines | Test that turns green |
| --- | --- | --- | --- | --- |
| 1 | **P1 core map** | classes (non-content: geometry enum, ginf/cginf + the geometry macros, eVariation), util, hprint, language (English XLAT/grammar), heptagon, cell, expansion (what the rules use) | 6.7k (≈5k) | `map` (with P1b) |
| 1 | **P2 items** | flags, items, inventory, orbgen, yendor, achievement (stubs that keep the gating), basegraph's message log (`addMessage`, `msginfo`) | 5.4k | `content` (isNative needs flags) |
| 2 | **P1b geometry & patterns** | hyperpoint (2D hyperbolic matrices), geometry (`cgi` basics for {7,3}: `prepare_basics`, heptmove/adjmoves; not shapes), geometry2 (`calc_relative_matrix`, `generate_random_path*`), patterns, pattern2 (the pattern functions of the rules, not the pattern display), fieldpattern (the {7,3} field, `fieldval_uniq`, windmap support) | 10.8k (≈5k) | `map` |
| 2 | **P8 system** | system (start/stop/restart, initgame, save/load), debug (cheats), commandline (the CLI options the harness uses: `-nogui -fixx -W` and phases), hyper-main (`hyper_init`, register order), multi (single player parts), history (rules parts); the later-stage stub modules above | 5.7k (+stubs) | — (starts run until the first NotPorted) |
| 3 | **P3 land generation** | landgen, landlock, monstergen | 5.8k | — |
| 3 | **P4 big structures** | bigstuff (alt maps, horocycles, Camelot, temples), barriers, complex2 | 5.1k | — |
| 4 | **P6 monsters** | monstermove, environment (bfs, dcal, pathdist), attack, passable | 5.4k | first dumps of `icy-start`, `jungle-walk` |
| 4 | **P5 complex lands** | complex (mirrors, hive, heat, whirlpool, clearing, tortoise, dragons, kraken, windmap, ...), mapeffects, savemem | 5.8k | — |
| 5 | **P7 player** | pcmove (except changes_t, done), checkmove, orbs, crossbow, game | 5.4k | all game scenarios |

Imports between packages go through the names in MODULES.md: call the function by its TS name from its module
even if that module is still a stub; when the stub lacks it, add the stub function (`throw new NotPorted`) in
that module with the right signature — the owner replaces it. Do not port another package's file.

Each package: ports its files completely (all functions of the C++ file that stage 1 can reach), fills its
globals.ts sections, adds stubs it needs, keeps `npm run build` (tsc) green, adds a scenario if its feature is
not covered (e.g. a land via `goto`), and regenerates goldens with `re/hyperrogue/oracle/build.sh`.
`node --test web/games/hyperrogue/test/*.test.ts`: scenarios that reach unported code report TODO, real
differences fail with the first differing line.
