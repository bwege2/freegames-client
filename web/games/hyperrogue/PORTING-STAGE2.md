# Porting HyperRogue 13.1o, stage 2: graphics and interface

Stage 2 makes the game playable in the browser (the Play button, `src/index.ts`) in the standard geometry:
projection, shapes, the drawing of cells, walls, monsters, items and the player, animations, the HUD, messages,
menus, dialogs, help, the end screen, the configuration screens, keyboard and mouse, the score file and saved game
in account storage, and the fonts. Not in stage 2: other geometries, 3D, shmup and local multiplayer, the map
editor, sound and music, translations, textures, the screenshot/animation menus (stage 3).

`PORTING.md` (the conventions of stage 1) stays in force: line by line, the same names, `G` for the globals, stub
modules, `#if` branches of the desktop build. This file adds what is new: the drawing oracle, the architecture of
the drawing in the browser, and the packages.

## 1. The drawing oracle

The original renders without a display through its own SVG renderer (screenshot.cpp `namespace svg`; CAP_SVG is on
in the desktop build). When `svg::in`, drawing.cpp's `dqi_poly::draw`, `dqi_string::draw`, `dqi_circle::draw`
print `<path>`, `<text>`, `<circle>` instead of drawing; everything before that (the queue, the projection, the
clipping, the float vertices, `coords_to_poly`'s int pixels) is the normal pipeline. `re/hyperrogue/oracle` (build
and findings: `re/hyperrogue/NOTES.md`, "Drawing oracle"; commands: `scenarios-format.md`) has:

| Command | What it compares |
| --- | --- |
| `svg <w> <h> map` | the original's SVG screenshot (`shot::take`): the map without HUD, coordinates in 1/10 pixel |
| `svg <w> <h> screen` | the window (`drawscreen`: screen stack, map, HUD, messages, dialogs) in whole pixels, plus the interface text as `text x y w h size colour string` lines (where `displaystr` blits SDL_ttf's text) |
| `ticks <n>` | the animation clock |
| `textwidth <size> <text>` | the font metrics (`TTF_SizeUTF8`) every layout depends on |
| `shapes [a b]` | the float vertices of all shapes (`cgi.ourshape`): count and hash, or a range |

Both are headless and deterministic (repeated runs are identical). The port runs the same commands
(`test/trace.ts`) through the **same SVG renderer** (`src/screenshot.ts`, the port of `svg::`): the test compares
the text exactly, point lists, colours, widths and all. Goldens of drawing scenarios are gzipped
(`golden/<name>.txt.gz`); keep views few and small: a 640x480 map is ~180 KB gzipped, stage 2 stays under 5 MB
(now 1.7 MB).

First scenarios (`test/scenarios/draw-*.txt`), and the package that turns each green:

| Scenario | What | Green after |
| --- | --- | --- |
| `draw-shapes` | the shapes of {7,3} bitruncated (15369 float vertices, hash) | D2 |
| `draw-text` | `textwidth` of strings and sizes (kerning: `AV` 25 px at 16, `A` 13, `V` 13) | U1 |
| `draw-textwidth` | `textwidth` of 408 strings of the HUD, dialogs and menus at the sizes of 800x600 and 1920x1080 | U1 |
| `draw-bare` | **the first SVG**: the start of the default game without player and HUD (`-viz`): floors, walls, the disk | D3 |
| `draw-start` | the default start with the player, two steps, an animation half-way and finished | D4 |
| `draw-lands` | Jungle, Caves, Desert, Hive after the cheat teleport (walls, monsters, items) | D4 |
| `draw-screen` | the 800x600 window: map, HUD (score, kills, glyphs), messages, the menu button | U1 + D4 (+ D3's normalscreen) |
| `draw-monsters-a/b/c` | monsters on the map at steps of the lands walks: knights and a sandworm; hexers, a slime and a thrown item; R'lyeh's ivies and a cultist (480x360) | D4 |

Each package adds scenarios for what it ports (a land, a monster, a menu opened with keys, a dialog, the end
screen), regenerates the goldens with `re/hyperrogue/oracle/build.sh` (`NOGOLDEN=1` builds only) and keeps under
its share of the 5 MB (about 0.4 MB per package). Commands the later packages add to both harness.cpp and
trace.ts: `key <sym> <uni>` (U2: draw the screen once to set `keyhandler`, then `handlekey`), `mouse <x> <y>` (U3:
`mousex/mousey`, `mouseh`), `click <x> <y> <button>` (U3), `resize`/`config <param> <value>` (U4).

Exactness. Shapes are built in double and stored as floats (`glvertex` = 4 floats); projected points are floats
again (`glcoords`), `coords_to_poly` truncates `xcenter + x` to int. The port stores with `Math.fround` at exactly
those places. `svg::coord` prints with `%.1f`: `cpp.ts fmtF` is glibc's `%f` (exact value, ties to even). Where
V8's `Math.sin/cosh/atan2/...` differs from glibc in the last bit and that flips a printed tenth of a pixel, port
glibc's routine into `cpp.ts` (PORTING.md, "Floating point"); a tolerance in the comparison is the last resort and
must count and report every difference it lets through.

## 2. Architecture of the drawing in the port

```
mainloopiter (control.cpp)          once per browser frame (ctx.frame), ticks = SDL_GetTicks()
  drawscreen (graph.cpp)            calcparam, screens.back()() = normalscreen / a menu / a dialog
    gamescreen -> drawthemap        View, centerover, draw_all -> draw_at -> drawcell (celldrawer)
      queuepoly / queuestr / ...    drawing.cpp: the queue ptds (dqi_poly, dqi_line, dqi_string, dqi_circle, ...)
    drawStats (hud.cpp), dialogs    queue items and displaystr/displayfr (immediate text)
    drawqueue                       sort by PPR, then each item's draw():
      dqi_poly::draw                apply the matrix, applymodel (hypgraph.cpp), clip, glcoords (float),
                                    coords_to_poly (int pixels), then by branch:
        svg::in        -> svg::polygon / circle / text        (src/screenshot.ts; tests, the screenshot feature)
        not GL (SDL)   -> filledPolygonColorI, polylineColor   (src/sdlgfx.ts on a CanvasRenderingContext2D)
  displaystr (basegraph.cpp)        TTF_RenderUTF8 + SDL_BlitSurface -> sdlgfx.ts: fillText at the same rectangle
```

**Decision: the browser draws the original's non-GL path (SDL software renderer, `CAP_SDLGFX`) on a Canvas 2D
context; no WebGL in stage 2.** Reasons: (1) the oracle's SVG is the non-GL path (`svg::render` sets
`vid.usingGL = false`), so the browser draws exactly the polygons, int pixels, colours and texts the tests check;
(2) the GL path (glhr's shaders, vertex buffers, stencil for inverted polygons, the GL font texture) is a second
renderer of ~2k lines that the oracle cannot check; (3) the software renderer is a setting of the original
("OpenGL mode" off), so this is the original's own behaviour. The C++ calls SDL, SDL_gfx and SDL_ttf; the port
keeps those calls and implements the few functions it uses in shim modules instead of changing the game's code:

| Shim | Implements (on the canvas) |
| --- | --- |
| `src/sdlgfx.ts` | `filledPolygonColorI` (fill, even-odd: SDL_gfx's scanline fill; inverted polygons get the screen rectangle as in drawing.cpp), `polylineColor`/`aapolylineColor` (1 px, the `fatborder`/`xres >= 2000` rule kept), `circleColor`, `filledCircleColor`, `aacircleColor`, `ellipseColor`..., `SDL_FillSurfaceRect` |
| `src/sdlttf.ts` | `TTF_SizeUTF8` from the metrics table (section 3), `TTF_RenderUTF8_*` + `SDL_BlitSurface` as one "draw this string in this rectangle" (fillText at the rectangle's baseline), `TTF_GlyphIsProvided` |
| `src/sdl.ts` | `SDL_GetTicks`, the event queue (`SDL_PollEvent` filled from DOM events), keycodes, `SDL_GetKeyboardState`, the window size |

Where the browser forces a difference (listed in README.md as deviations): the original's default is OpenGL on (the
port behaves as with it off: aliased int-pixel polygons as SDL_gfx draws them; the canvas antialiases them, which
looks closer to the GL default than SDL_gfx does); text is rasterized by the browser from the same TTF at the same
place and size (pixels differ slightly from FreeType's); GL-only options (antialiasing modes, 3D, shaders, the
"OpenGL mode" toggle, textures) are shown but have no effect, or are hidden as the original hides them without GL.

The globals of the drawing are objects, as in C++: `G.vid` (class `videopar`, with `clone()`: `shot::take` does
`dynamicval<videopar> v(vid, vid)`), `pconf` (`vid.projection_config`), `current_display` (`display_data`),
`cgi` (the shapes in `geometry_information`). Stage 1 flattened what the rules read (`G.vid_particles`,
`G.vid_creature_scale`, ...): D1 moves them into `G.vid` (a mechanical rename in the stage-1 files, done first).

## 3. Fonts

The interface font is DejaVuSans-Bold.ttf (font 0; the others are options in the configuration), shipped under
`assets/fonts/` with its license (LICENSE.md). Layout depends on `textwidth` = `TTF_SizeUTF8` in whole pixels
at sizes 1..288 (`fix_font_size`), with FreeType 2.14 hinting and HarfBuzz kerning (NOTES.md). The browser's
`measureText` does not give these numbers, so U1:

1. adds `fontmetrics <font> <size>` to the harness: per glyph of the characters the game prints (ASCII 32..126
   and the few others of the English texts, `natchars`), `TTF_GlyphMetrics32` (minx, maxx, miny, maxy, advance),
   the font's ascent/descent/height/line skip, and the HarfBuzz pair adjustments (`TTF_GetFontKerningSizeGlyphs32`)
   for pairs that have one;
2. writes `src/fontmetrics.ts` from it (a compact table per size; sizes above 72 are multiples of 4, above 144 of
   8, so 108 sizes), with a generator in `re/hyperrogue/tools/`;
3. ports SDL_ttf 2.24's `TTF_Size_Internal` (positions, kerning, the bounding box) on that table;
4. checks it with `draw-text` and a long `textwidth` scenario (every string of the HUD, menus and help at the
   sizes 800x600 and 1920x1080 use). A table of measured strings is no fallback (the strings are dynamic: scores,
   names, numbers); if pair data does not reproduce HarfBuzz exactly, U1 reports what differs before choosing
   (e.g. a per-size table of all pairs of the printable characters, ~9k pairs, only the non-zero ones stored).

**Outcome (U1).** Settled and exact: as SDL_ttf calls HarfBuzz, DejaVu's kerning and ligatures never apply (they
are only under the `latn` script; NOTES.md "Font metrics"), so the table has no pair data: per size the hinted
advances and SDL_ttf's glyph boxes of 394 glyphs. The generator is a separate program against the oracle's
libraries (`re/hyperrogue/tools/gen-fontmetrics.sh`, not a harness command); `sdlttf.ts` ports TTF_Size_Internal.
Checks: `test/fontmetrics.test.ts` (5192 strings at 44 sizes, all equal to TTF_SizeUTF8), `draw-text`,
`draw-textwidth` (408 strings of the HUD, dialogs and menus at the sizes of 800x600 and 1920x1080).

Drawing text: canvas `fillText` with a `FontFace` of the same TTF at `size` pixels, placed at the rectangle the
original blits to (`x - w * align / 16`, `y - h / 2`, baseline at the TTF ascent). The outlines of `displayfr`
are the original's eight shifted copies; nothing else is needed.

## 4. Screens, dialogs and menus

As in C++: `screens` is a stack of `() => void`; every frame `drawscreen` calls `screens.back()()`, which draws
and sets `keyhandler` (and `dialog::key_actions`, the `getcstat` of the item under the mouse); `pushScreen`,
`popScreen`, `popScreenAll`. A dialog is built anew every frame (`dialog::init`, `addItem`, `addSelItem`,
`addBoolItem`, `add_action`, `display`), laid out with `textwidth` and `vid.fsize`. `function<void()>` and
`reaction_t` are closures; `dialog::editNumber` / `edit_string` / color pickers keep their state in the dialog
structs as in C++. No DOM widgets: everything is drawn on the canvas, as the original draws it.

## 5. Input

`handle_event` (control.cpp, SDL2 branch) is fed `SDL_Event`s that `src/sdl.ts` makes from DOM events, queued
and drained where `mainloopiter` polls (`SDL_PollEvent`), never handled inside the DOM callback:

* Keys: `sym` = the SDL2 keycode. Printable keys: the lowercase character of `KeyboardEvent.key` (SDL2 keycodes
  follow the layout as `key` does); others from `KeyboardEvent.code`: arrows, Home/End/PageUp/PageDown/Insert/
  Delete, F1..F12, Escape, Return, Backspace, Tab, Space, and the numpad (`Numpad1` -> `SDLK_KP_1`,
  `NumpadEnter` -> `SDLK_KP_ENTER`; HyperRogue moves with the numpad, so these matter; NumLock state ->
  `SDL_KMOD_NUM`). `mod` from shift/ctrl/alt/meta. `uni` is computed by the original's code from `sym` and `mod`
  (`'1'` + shift -> `'!'`, letters + shift/ctrl), as the SDL2 build does; text fields of dialogs get
  `SDL_EVENT_TEXT_INPUT` from `KeyboardEvent.key` (and paste). `preventDefault` for every key the game uses;
  browser shortcuts the page cannot take (Ctrl+W/T/N) are listed in README.md.
* Mouse: pointer events in device pixels (`clientX * devicePixelRatio` relative to the canvas) -> mouse motion
  (`mousex/mousey`), button down/up (left 1, middle 2, right 3; the right button is help: `contextmenu` is
  prevented), wheel -> `SDL_EVENT_MOUSE_WHEEL`. Touch: a tap is a left click (stage 2), no mobile UI.
* `SDL_GetKeyboardState` (graph.cpp, control.cpp read held keys for scrolling) from keydown/keyup.

## 6. Main loop and time

`ctx.frame` calls `mainloopiter()` once per animation frame (the original loops `while(!quitmainloop)
mainloopiter()`; the browser cannot block). `SDL_GetTicks()` = whole milliseconds since start
(`performance.now()`). The frame limit (`timetowait`, `vid.framelimit`) is kept: a frame that is too early does
not draw. The two nested main loops (savefile selection, off by default; the debug screen of `modalDebug`) are not
reachable in stage 2. The window: `vid.xres/yres` = the canvas size in device pixels (a `ResizeObserver` sends
`SDL_EVENT_WINDOW_RESIZED` and the original's resize code runs); `vid.fsize` follows from `compute_fsize`.
`quitmainloop` / "quit" -> `ctx.exit()`.

## 7. Files: score file, saved game, configuration

The C stdio of the system files is `src/cfile.ts` (stage 1). Stage 2 backs `cfs.files` with `ctx.storage`
(account scope): before `hyper_init`, load `hyperrogue.log` (score file and saved game: the save is the last entry
with an Orb of Safety, NOTES.md) and `hyperrogue.ini` (configuration) into `cfs.files`; `cfs.onwrite` writes a
changed file back (debounced, in order, and once more on stop). Same names and formats as the original, so files
can be exchanged. Limits: 512 KiB per file. A game adds ~1-2 KB to the log, so after a few hundred games the port
drops the oldest entries (never the last one) to stay under the limit: a deviation, listed in README.md. The score
list (scores.cpp) is the player's own, as in the original; no shared score table in stage 2.

## 8. Packages

Line counts are of the C++ that stage 2 ports (the files' 2D and non-GL parts; 3D, GL, other geometries and the
editor stay stubs). About 36k lines in eight packages, two at a time, four steps. Each package: ports its files
completely as far as stage 2 reaches, owns their `globals.ts` sections, replaces the `STAGE1-STUB` functions of its
files (stubs that stay get `// STAGE2-STUB` with the reason), adds scenarios, keeps `npm run build` (tsc) and
`node --test games/hyperrogue/test/*.test.ts` green, and lists deviations in README.md.

| Step | Package | C++ (effective lines) | Provides | Turns green |
| --- | --- | --- | --- | --- |
| 1 | **D1 projection, queue, SVG** | hypgraph.cpp 2D (≈2.6k of 3.8k: calcparam, the 2D models of `applymodel`, View/centerover/optimizeview/resetview/centerpc/spin, `gethyper`, `draw_all`/`hrmap_standard::draw_at`/`drawcell_subs`/`do_draw`, `draw_boundary`, `inscreenrange`), drawing.cpp without GL (≈2.3k: the queue and PPR, `queuepoly/queuepolyat/queueline/queuestr/queuechr/queuecircle/queueaction/queuereset`, `dqi_*`, `dqi_poly::draw` with clipping, two-sided and inverse polygons, `glcoords`, `coords_to_poly`, `prettyline/prettypoly`, `drawqueue`, quick queues), screenshot.cpp (svg::, `shot::take`, `default_screenshot_content`; ≈0.4k), colors.cpp (0.3k), basegraph.cpp's `display_data`/`videopar` (≈0.2k); the shim `sdlgfx.ts`; the `G.vid` migration | the queue API, `applymodel`, `current_display`, `svg_*`, `shot_take` | `s2-svg` (done), unit tests of `applymodel`/`calcparam`; `svg` header lines |
| 1 | **D2 shapes** | polygons.cpp (≈2.3k: `prepare_shapes`, `hpcpush`, `bshape`, the polydata tables, `finishshape`, `initPolyForGL`'s `ourshape`), floorshapes.cpp 2D (≈0.95k: `generate_floorshapes` for standard/bitruncated, `shvid`, `set_floor`, `draw_floorshape`, `draw_qfi`), geometry.cpp's graphical rest (≈0.5k: `prepare_compute3` for the 2D levels, `geom3` level functions), 3d-models.cpp as far as 2D calls it (stubs), models.cpp without its menus (≈0.5k: `pconf` defaults, `models::configure`, model names); stub modules textures, sky, rug, vr for 2D | `cgi.sh*`, `floorshape`s, `shvid`, `draw_floorshape`, `models_configure` | `draw-shapes` |
| 2 | **D3 cells** (the first SVG) | celldrawer.cpp (≈3.0k: `celldrawer::draw`, floors, walls, colours by land, darkening, `setcolors`, fog, the ASCII/shading variants of the default), graph.cpp (≈1.9k: `drawthemap`, `gamescreen`, `normalscreen`, `drawscreen`, auras, the glue to monsters and items, `restartGraph`, `drawFlash`/`drawBigFlash` effects), graph-wall.cpp (0.57k) | `drawcell`, `drawthemap`, `drawscreen` | **`draw-bare`** |
| 2 | **U1 text, dialogs, HUD** | basegraph.cpp (≈1.1k: fonts, `textwidth`, `displaystr/displayfr/displaychr`, `displayButton`, `drawCircle`, the screen stack, `drawmessages`), the font metrics (harness `fontmetrics`, generator, `fontmetrics.ts`, `sdlttf.ts`; ≈0.4k), dialogs.cpp (2.25k), hud.cpp (0.85k) | `dialog_*`, `textwidth`, `displaystr`, `drawStats` | `draw-text` |
| 3 | **D4 creatures and items** | graph-monster.cpp (2.05k), graph-player.cpp (0.81k), graph-item.cpp (0.51k), animations.cpp (the rest, 0.5k: movement animations, flashes and particles drawn, `fallanims`) | `drawMonster`, `drawMonsterType`, `drawItemType`, `drawPlayer`, animations | `draw-start`, `draw-lands`, `draw-screen` (with U1) |
| 3 | **U3 control and the browser** (playable) | control.cpp (≈1.5k: `handle_event`, `handlekey`, `handleKeyNormal`, mouse, `mainloopiter`, `mainloop`, panning, `movepckeydir`), quit.cpp (0.73k: the end screen, `showMissionScreen`, `showGameMenu`); `src/index.ts`, `sdl.ts` (events, keycodes), the canvas and resize, storage of `cfs.files` (≈1k TS); `game.json` (`added`, controls, screenshots) | `start(host, ctx)`, Play | input-mapping unit tests, `mouse`/`click` scenarios, an e2e start in Chromium |
| 4 | **U2 menus and help** | menus.cpp (1.3k: main menu, special modes, tactics/Yendor/peace menus), help.cpp (1.3k: help screens, `describeMouseover`, the land/monster/item help), scores.cpp (0.44k), the menus of stage-1 files reached from them (inventory.cpp `inv::show`, yendor.cpp `showMenu`, debug.cpp cheat menu, system.cpp's confirmations; ≈0.6k) | the menus | `key` scenarios: menu, help, scores, modes |
| 4 | **U4 configuration** | config.cpp's screens (≈3.5k of 5k: `showGraphConfig`, `showBasicConfig`, `configureInterface`, `configureMouse`, the parameter editors, `saveConfig`/`loadConfig` of `hyperrogue.ini`), models.cpp's menus (≈0.6k), pattern2.cpp's colour/pattern menus that the configuration reaches (stubbed if 3D/editor) | the settings | `key` scenarios through the settings; `config` round trip of `hyperrogue.ini` |

Order and parallelism: D1 ∥ D2 (no shared files; D2 needs only `geometry_information` and hyperpoint.ts; D1 lands
the `G.vid` rename in its first commit, D2 rebases on it). D3 needs D1 + D2; U1 needs D1 (queue, screen stack). D4
needs D3; U3 needs D1, U1 and D3 (`drawscreen`). U2 and U4 need U1 and U3 (`key`). After step 3 the game is
playable (map, creatures, HUD, keys and mouse, death screen, save); step 4 brings the menus behind Esc/F1/v and
the settings. Imports across packages go through the names in MODULES.md, as in stage 1 (a missing function is
added to its owner's module as a stub with the right signature).

## 9. Size and risks

Stage 2 is about 36k lines of C++ (stage 1: ~45k), most of it straightforward drawing code; the effort is in the
exactness. Risks, highest first:

1. **Font metrics.** Layout of every dialog and the HUD depends on `TTF_SizeUTF8` with HarfBuzz kerning. If the
   pair data does not reproduce it exactly, dialogs shift by pixels; U1 must settle this early.
2. **Floating point.** One flipped tenth of a pixel fails a comparison. Floats at the right places (`fround`), the
   order of operations of the matrix code, and V8 vs glibc transcendental functions. Expect a few days of
   chasing in D1/D2/D3; glibc ports into cpp.ts where needed.
3. **Drawing changes the game.** The traversal creates heptagons and cells (creation order = `_id` order, the
   port's address order), `shot::take` runs `doOvergenerate()` with `hrand`. The dump after each `svg` and later
   moves catch differences.
4. **The `vid` migration** touches stage-1 files (renames only); do it in one commit with all tests green.
5. **Performance.** ~2-4k polygons per frame at 1080p with a matrix product and projection per vertex in JS and a
   canvas path each. Probably 30-60 fps on a desktop; measure in D3 and batch paths per colour if needed (the
   queue order must stay).
6. **Untested by the oracle:** what only pixels show (the canvas shims, text rasterization), the main loop timing,
   input mapping. Unit tests plus e2e screenshots compared by eye with the original.
7. **Storage limits** (512 KiB per file) force the log trimming deviation.
