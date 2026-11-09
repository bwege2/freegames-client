# Porting HyperRogue 13.1o, stage 3: the other geometries

Stages 1 and 2 ported the game in the standard geometry ({7,3}, bitruncated or pure) with its drawing. HyperRogue's
"experiment with geometry" menu offers about 90 geometries and a dozen variations; this file says which C++ files
implement them, what each needs, how they are checked against the original, and in which order to port them.
`PORTING.md` (conventions) and `PORTING-STAGE2.md` (the drawing oracle, the software renderer) stay in force.

## 1. Where the geometries live

Line counts are of the whole C++ files of 13.1o. "2D" means the game is played on a 2D tiling and drawn by the
software renderer the port already has (stage 2); "3D" means `WDIM == 3` or `GDIM == 3` (see section 3).

| C++ file | Lines | What | Kind | State in the port |
| --- | --- | --- | --- | --- |
| classes.cpp (ginf), system.cpp (`set_geometry`, `set_variation`, `geometry_settings`, `default_model`), geom-exp.cpp (`read_geom_args`, `readGeo`) | ≈0.2k of them | choosing a geometry/variation; `-geo`, `-gp`, `-7`, `-mineadj`, `-unrectified`... | all | **done (G1)** |
| cell.cpp `hrmap_hyperbolic`, heptagon.cpp, geometry.cpp `prepare_basics` | (stage 1) | the regular hyperbolic tilings {p,q} other than {7,3}: {8,3}, {5,4}, {6,4}, {7,4}, ... (pure and bitruncated) | 2D | **works already** (stage 1/2 code was general); `{4,7}`-like S3=4 pure needed G1's `gp::dist_*` |
| euclid.cpp | 1471 | Euclidean {6,3} and {4,4} grids (`hrmap_euclidean`), torus/Klein bottle/cylinder/Möbius quotients (`torus_config`), the quotient menu `show_torus3`; also the 3D cube/rhombic/bitruncated/octtet honeycombs and their quotients (`generate`: 3D cell shapes) | 2D (+3D part) | **done (G1)**, except `euc::generate` (3D cell shapes, package G6) |
| sphere.cpp | 211 | the closed spherical tilings ({5,3}, {4,3}, {3,3}, {3,4}, elliptic variants, the small spheres) | 2D | **done (G1)** |
| quotient.cpp | 430 | hyperbolic quotients (Zebra, Klein quartic, Bolza, Bolza x2, minimal, Macbeath, Bring, Schmutz, field quotient) | 2D | **done (G1)** |
| fieldpattern.cpp | 1647 | field quotients (2D part done in stage 1); 3D field patterns (`generate_all3`, `solve3`, `hread_fpattern`) | 2D / 3D | 2D done; 3D part → G6 |
| geom-exp.cpp | 1452 | the menus: geometry/filter/tiling lists, quotient list, field quotient config, land selection, `showEuclideanMenu` with the statistics (`compute_geometry_data`) | menus | **done (G1)** for what the ported geometries reach; entries of unported packages say "not available in this version yet" |
| goldberg.cpp | 1524 | Goldberg–Coxeter variations GP(x,y) (`extend_map`, local triangle mapping, `compute_geometry`, `prepare_matrices`, `drawrec`), inverse variations (unrectified, untruncated, warped: `hrmap_inverse`), the variations menu `gp::show` | 2D | parameters, `operation_name`, `dist_*`, `gp::show`/`whirl_set` **done (G1)**; the GP maps → G2 |
| goldberg-sub.cpp | 254 | subdivisions used by fake/3D | 2D/3D | G2 |
| floorshapes.cpp (Goldberg/irregular/arcm parts), hypgraph.cpp `gp::drawrec`, polygons.cpp | ≈0.6k | floor shapes for GP, irregular, Archimedean | 2D | G2/G3 |
| irregular.cpp | 1183 | irregular tilings (Voronoi cells on a base map, the visual creator) | 2D | G3 |
| archimedean.cpp | 1629 | Archimedean tilings (`arcm::archimedean_tiling`, parse, the `-arcm` symbol, menus) | 2D | G3 |
| binary-tiling.cpp | 1233 | binary tiling variants, ternary, {4,4}/{3,6}/{6,3} on horospheres (3D), Solv/NIH companions | 2D + 3D | 2D part G4, 3D part G6 |
| kite.cpp | 440 | Penrose kite-and-dart (2D) and its 3D version on horospheres | 2D + 3D | G4 |
| aperiodic-hat.cpp | 1233 | the hat/spectre aperiodic monotiles | 2D | G4 |
| inforder.cpp | 54 | {3,∞}, {4,∞} | 2D | G4 |
| arbitrile.cpp | 2255 | tessellations from `.tes` files (`-tes`), sliders, apeirogons, conversions of other tilings | 2D | G5 |
| rulegen.cpp | 2839 | tree-structure discovery for `.tes`/converted tilings (strict tree maps) | 2D | G5 |
| arbiquotient.cpp | 639 | quotients of `.tes` tilings | 2D | G5 |
| fundamental.cpp | 449 | the fundamental-domain view of quotients | 2D | G5 |
| crystal.cpp | 1821 | crystal geometries (n-dimensional grids seen as 2D/3D) | 2D + 3D | G5 (2D) / G6 |
| fake.cpp | 851 | "fake curvature" (a tiling drawn with another curvature) | 2D/3D | G5 |
| reg3.cpp | 2952 | regular 3D honeycombs ({4,3,5}, {5,3,4}, 120-cell, ...), subcube variations, Coxeter, field quotients in 3D | 3D | G6 |
| rulegen3.cpp | 1760 | rule generation in 3D | 3D | G7 |
| nonisotropic.cpp | 3425 | Solv, Nil, ~SL(2,R), product spaces H2xE/S2xE, twisted products, stretched spaces (`nisot`, `hybrid`, `product`, `slr`, `stretch`) | 3D | G7 |
| asonov.cpp | 268 | Arnold's cat (Solv quotient) | 3D | G7 |
| embeddings.cpp | 1398 | 2D geometries embedded in 3D (the "3D view" of 2D games: `geom3`, `spatial_embedding`, `emb_*`) | 2D in 3D | G6 |
| intra.cpp | 1221 | portals between geometries | 3D | G7 |
| backed-map.cpp | 302 | maps backed by another map (used by nonisotropic) | 3D | G7 |
| 3d-models.cpp | 1388 | 3D monster/item models | 3D drawing | G6 |
| sky.cpp | 730 | sky and fog in 3D | 3D drawing | G6 |
| raycaster.cpp | 3341 | the GLSL raycaster of 3D walls | 3D drawing (GL only) | G6/G7 |
| glhr.cpp, shaders.cpp | 969 + 1073 | the GL renderer and shader generator | GL | G6 |
| rug.cpp | 1962 | the hypersian rug (a 2D map relaxed onto a 3D surface; GL) | GL | later |
| textures.cpp, vr.cpp | 1787 + 1709 | texture mode, VR | GL | later |

## 2. Dependencies

* Everything 2D depends only on what stages 1–2 ported plus `set_geometry`/`set_variation` (G1).
* G2 (Goldberg) is the basis of: irregular (G3, uses `gp::` helpers and its own base map), the inverse variations,
  fake curvature for GP, and textures of GP. floorshapes.cpp's GP branch and hypgraph.cpp's `gp::drawrec` belong to G2.
* G3 Archimedean is independent of G2 except `arcm::current_or_fake` uses in geometry.cpp.
* G4 binary/kite/hat/inforder: independent of G2/G3 (own maps; `bt::` is also needed by Solv in G7).
* G5 arbitrile + rulegen: the most generic 2D machinery; converts Archimedean/GP tilings (needs G2, G3 for the
  conversions, not for `.tes` files themselves). Tessellation files must come from somewhere: the original ships
  `tessellations/` (a few hundred .tes); they can be shipped as assets.
* G6 (3D regular honeycombs, embeddings, 3D cell shapes) needs a 3D renderer (section 3).
* G7 (nonisotropic, product, portals, rulegen3) needs G6 plus G4's `bt::` (Solv).

## 3. 3D: the software renderer is not enough — an honest assessment

The original draws 3D geometries with OpenGL only in any usable sense:

* drawing.cpp has a non-GL branch for `GDIM == 3` (`dqi_poly::draw` projects with `applymodel` in mdPerspective and
  clips at z), but without a depth buffer: polygons are painted in PPR order, not by depth, so walls show through each
  other. The original's own SVG export refuses 3D ("SVG screenshots do not work in this 3D mode", screenshot.cpp), so
  the drawing oracle cannot check 3D pictures.
* the raycaster (raycaster.cpp, 3.3k lines of GLSL generation) is how walls are drawn in many 3D geometries
  (nonisotropic, product, Solv/Nil); 3d-models.cpp builds triangle meshes for creatures; sky.cpp needs depth.

So: **3D needs a WebGL port** of glhr.cpp (matrices, shader programs, vertex buffers, `glhr::` state), shaders.cpp
(the shader generator, which writes GLSL for every model and geometry — this ports almost line by line to WebGL1/2,
GLSL ES differences aside), the GL branches of drawing.cpp (`dqi_poly::gldraw`, `set_all`, depth, stencil for
two-sided polygons) and later raycaster.cpp. Estimate: ≈3k lines of GL code (glhr + shaders + drawing GL branch) for
G6, +3.3k for the raycaster in G7, plus WebGL context handling. **What the oracle can check in 3D:** map structure and
game turns (the dumps are geometry-independent), the shape vertices (`shapes` command: `cgi.hpc`/`ourshape` are
computed without GL), and — new harness command, proposed — the projected vertex lists of the GL queue (the matrices
`dqi_poly` would upload: `V.T`, `offset`, `cnt`, color, flags) instead of pixels. Pixels themselves cannot be
compared; e2e screenshots by eye.

The 2D games embedded in 3D (embeddings.cpp: "3D view" of the normal game, `vid.always3`, first-person) need the same
WebGL renderer; they are part of G6.

## 4. Oracle approach

The headless original switches geometry by its command line, which the harness's `start <seed> [args...]` passes
on: `-geo <name|number>` (readGeo: ginf shortname, number or a part of the menu name), `-7` (pure), `-gp x y`,
`-unrectified`/`-untruncated`/`-warped`, `-t2 a b c d twist` (Euclidean torus), `-arcm <symbol>`, `-tes <file>`,
`-irr <n>` (irregular), `-bt`... No harness change was needed for G1. Three kinds of scenarios per geometry:

* `geo-*`: a game: `start <seed> -geo ... -W <land>` and seeded walks (fights, items, `goto` other lands, `saveload`),
  written by `re/hyperrogue/tools/gen-geo-scenarios.py` (uses gen-scenarios.py's walker; the oracle chooses the
  moves). The dump compares land generation, monsters and rules turn by turn in that geometry.
* `draw-geo-*`: SVG views (`svg 400 300 map`, one `svg 640 480 screen`) after a few fixed moves: the shapes and floor
  shapes of the geometry, the projection (sphere: animation half-way), the HUD.
* menus: `key` scenarios through the menus (`menu-geometry`: `-d:geom`, the filter and tiling lists, the hex grid,
  the Euclidean quotient menu with a Klein bottle, the variations menu, the quotient filter; `nomap=1`).

G1's goldens take 1.2 MB (the game dumps are plain text, 30-90 KB each; the drawings 15-190 KB gzipped); later
packages should keep to about 1 MB each (SVG views of 400x300, walks of ~20 turns per land).

Pitfalls found: `-geo torus` (gTorus, the deprecated legacy torus) crashes the original (`euc::get_shifttable()
called in geometry that is not euclid3`): use `-geo euclid -t2 ...`. `-geo 22` etc. are ginf indices.

## 5. Work packages

About 5k lines of C++ each (effective lines: the parts reachable in that package), in this order; two agents can run
G2 ∥ G3 and G4 ∥ G5 (no shared files except stub modules and geom-exp's availability test).

| Package | Content | C++ (lines) | Needs | Checked by |
| --- | --- | --- | --- | --- |
| **G1 (done)** | set_geometry/set_variation, euclid.cpp 2D + quotients + menu, sphere.cpp, quotient.cpp, geom-exp.cpp menus and args, save/load of the geometry in mode codes (mapeditor.cpp `save_geometry`/`load_geometry` for these geometries), models.cpp `euclidean_spin`, Goldberg parameters and the variations menu | ≈4.5k | — | 13 `geo-*` + 6 `draw-geo-*` scenarios, `menu-geometry` |
| G2 Goldberg | goldberg.cpp (maps, `compute_geometry`, `prepare_matrices`, `gp::drawrec`, inverse maps, patterns), goldberg-sub.cpp, floorshapes.cpp GP branch, `get_plainshape_id`, the GP parts of pattern2/celldrawer/landgen | ≈2.5k + 1k | G1 | `geo-gp-*` (`-gp 2 1`, `-gp 3 0` on {7,3}, {5,3}, {6,3}; `-unrectified`, `-untruncated`, `-warped`), `draw-geo-gp-*` |
| G3 Irregular + Archimedean | irregular.cpp, archimedean.cpp (+ their floorshapes, `arcm::` in geometry/hypgraph), the menus `arcm::show`, `irr::visual_creator` | ≈3.2k + 0.6k | G2 for irregular | `-arcm 3^2,4,3,4`, `-arcm 4,8,8`, `-irr 150` scenarios |
| G4 Binary, aperiodic, infinite | binary-tiling.cpp 2D, kite.cpp 2D, aperiodic-hat.cpp, inforder.cpp, their shapes | ≈3k | G1 | `-geo binary4`, `-geo ternary`, `-geo kd2`, hat, `{3,∞}` |
| G5 Tessellation files | arbitrile.cpp, rulegen.cpp, arbiquotient.cpp, fundamental.cpp, crystal.cpp 2D, fake.cpp 2D, the shipped .tes files | ≈7k (two agents or two steps) | G2, G3 | `-tes` scenarios with shipped files; rulegen trees compared via `map` dumps |
| G6 3D renderer + regular honeycombs | WebGL renderer (glhr, shaders, drawing.cpp GL branches), reg3.cpp, euclid.cpp `generate`, fieldpattern 3D, embeddings.cpp, 3d-models.cpp, sky.cpp, the 3D parts of polygons/geometry/hypgraph/celldrawer | ≈9k (two packages: renderer 4k, geometries 5k) | G1 | dumps of 3D games (`-geo 435`, `-geo 534`, `-geo 434`), `shapes`, the proposed GL-queue dump |
| G7 Nonisotropic | nonisotropic.cpp, asonov.cpp, binary-tiling 3D, kite 3D, backed-map.cpp, intra.cpp, rulegen3.cpp, raycaster.cpp | ≈13k (three packages) | G6, G4 | dumps of Solv/Nil/SL2/product games; raycaster only by eye |

Honest estimate for the rest: 2D (G2–G5) ≈ 18k lines of C++, four to five packages of ~5k, done with the same oracle
precision as G1 (everything 2D is SVG-checkable). 3D (G6–G7) ≈ 22k lines plus a WebGL renderer the oracle cannot
check pixel by pixel; it is the larger and riskier half, and should start with the renderer (G6a) on the existing
`{7,3}` game in "3D view" (embeddings), which is the most played 3D feature.

## 6. What G1 did (stage 3, package G1)

* `src/euclid.ts` (euclid.cpp): `hrmap_euclidean` (spacemap, `create_step`, twisted adjacency, `draw_at`,
  `relative_matrixh`, `pattern_value`), `torus_config`/`torus_config_full` with `canonicalize` (Klein bottles,
  third-turn and Hantzsche-Wendt spaces), `build_torus3`, the `-t2/-t3/-twist3/-hw` options, `full_coords2`,
  `celldistance`, `cyldist`, `dist_alt`, `set_land` (3D), `eumove`, the quotient menu `show_torus3`.
* `src/sphere.ts` (sphere.cpp), `src/quotient.ts` (quotient.cpp): all their maps.
* `src/system.ts`: `set_geometry`, `set_variation`, `geometry_settings`, `default_model`.
* `src/geom-exp.ts` (geom-exp.cpp): `readGeo`, `read_geom_args`, the whole geometry experiments menu tree.
* `src/goldberg.ts`: the `gp::loc` arithmetic, `eudir`, `length`, `univ_param`, `dist_1/2/3`, `variation_for`,
  `operation_name`, `human_representation`, and the variations menu (`gp::show`, `whirl_set`, `configure`).
* `src/mapeditor.ts`: `save_geometry`/`load_geometry` (the mode code of scores and saved games in these geometries).
* `src/models.ts`: `euclidean_spin` in `models::configure`; `src/bigstuff.ts`: `euclidAlt`'s Camelot/Princess
  distances and `cylinder_alt`.
* Lazy classes: a module's top level may not extend `hrmap_standard` (cell.ts is no leaf module), so
  `hrmap_euclidean`, `hrmap_spherical`, `hrmap_quotient` are created on first use (`make_hrmap_*`).
* Deviation (README.md): in the menus, geometries and variations of packages not ported yet are listed as in the
  original but choosing them shows "not available in this version yet" (`geometry_ported`, `variation_ported` in
  geom-exp.ts) instead of starting a game the port cannot run.
