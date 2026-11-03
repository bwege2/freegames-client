# Porting conventions (The Powder Toy v100.1.400 → TypeScript)

The reference source is `re/powdertoy/orig/The-Powder-Toy-100.1.400/src/` (fetched by `re/powdertoy/fetch.sh`).
The port is line for line: same control flow, same order of RNG calls, same float/int semantics, same names.
Tests compare the port with the original's simulation frame by frame (`re/powdertoy/oracle/`), bit for bit, so
every difference in arithmetic or RNG order shows.

## Files

| C++ | TypeScript |
| --- | --- |
| `simulation/elements/XXXX.cpp` (+ `XXXX.h`) | `src/elements/XXXX.ts` |
| `simulation/Simulation.cpp`, `Simulation.h` | `src/sim/simulation.ts` |
| `simulation/Air.cpp` | `src/sim/air.ts` |
| `simulation/SimulationData.cpp` | `src/sim/simulationData.ts` |
| `simulation/Element.cpp` | `src/sim/element.ts` |
| `simulation/Editing.cpp` | `src/sim/editing.ts` |
| `simulation/simtools/*.cpp`, `SimTool.cpp` | `src/simtools/XXXX.ts`, `src/sim/simTool.ts` |
| `simulation/gravity/Fft.cpp`, `Gravity.h` | `src/sim/gravity.ts` (own FFT, synchronous; see its header) |
| `gui/game/Brush.*`, `*Brush.h`, `BitmapBrush.*` | `src/sim/brush.ts` |
| `gui/game/tool/*` (simulation effect only), `AccessProperty.cpp` | `src/sim/tools.ts` |
| `common/Vec2.h` (`Vec2<int>`, `Rect<int>`) | `src/sim/vec2.ts` |
| `SimulationConfig.h`, `ElementDefs.h`, `ElementGraphics.h`, ... | `src/sim/config.ts` |
| `ElementNumbers.h` (PT_*), `ToolNumbers.h` | `src/sim/numbers.ts` (generated) |
| `Misc.h`, `tpt-rand` (RNG) | `src/sim/cpp.ts` |
| `Particle.h` | `src/sim/particle.ts` |
| `Pixel.h` RGB, `Renderer::flameTableAt` etc., `Probability` | `src/sim/colour.ts` |

TypeScript is run by node's type stripping in the tests: no `enum`, no `namespace`, no constructor parameter
properties; imports carry the `.ts` extension; type-only imports use `import type`. `tsconfig` is strict with
`noUnusedLocals` and `noUnusedParameters`: name an unused parameter `_x`.

## An element file

```ts
// simulation/elements/WATR.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, R_TEMP, TYPE_LIQUID, /* ... */ TYP, ID } from '../sim/config.ts';
import { PT_SALT, PT_SLTW /* ... */ } from '../sim/numbers.ts';

export function Element_WATR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_WATR';
  el.Name = 'WATR';
  el.Colour = 0x2030D0;               // 0x2030D0_rgb
  el.AirDrag = f(f(0.01) * CFDS);     // 0.01f * CFDS
  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));   // R_TEMP - 2.0f + 273.15f
  ...
  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  ...
}
```

* `void Element::Element_XXXX()` becomes `export function Element_XXXX(el: Element): void`; every member it sets
  is `el.Member`. Keep every assignment, also those equal to the default. `Graphics = nullptr` is
  `el.Graphics = null` (the default is `Element.defaultGraphics`, set by the constructor).
* `static` functions stay module-local. Functions other files use (`Element_FIRE_update`, `Element_PIPE_transfer`,
  the declarations in `XXXX.h`) are exported under their C++ names from `XXXX.ts`, also constants from the `.h`.
* `IconGenerator` (only NONE): leave it out with a comment; the menu draws it.
* `auto &sd = SimulationData::CRef(); auto &elements = sd.elements;` → `const elements = sd.elements;`
  (`sd` is imported). `SimulationData::builtinGol` → `sd.builtinGol`.
* `UPDATE_FUNC_ARGS` → `(sim, i, x, y, surround_space, nt, parts, pmap)` with the types above;
  `UPDATE_FUNC_SUBCALL_ARGS` → `sim, i, x, y, surround_space, nt, parts, pmap`.
* `GRAPHICS_FUNC_ARGS` → `(gfctx: GraphicsFuncContext, cpart: Particle, nx: number, ny: number, g: Gfx)`;
  `*pixel_mode |= X` → `g.pixel_mode |= X`, `*colr` → `g.colr`, likewise `cola colg colb firea firer fireg fireb`.
  `GRAPHICS_FUNC_SUBCALL_ARGS` → `gfctx, cpart, nx, ny, g`. `gfctx.sim`, `gfctx.rng`, `gfctx.ren.decorationLevel`,
  `gfctx.pipeSubcallCpart/Tpart` as in C++. `RendererSettings::decorationAntiClickbait` → `decorationAntiClickbait`
  from `element.ts`.
* `ELEMENT_CREATE_FUNC_ARGS` → `(sim, i, x, y, t, v)`, `ELEMENT_CREATE_ALLOWED_FUNC_ARGS` → `(sim, i, x, y, t)`,
  `ELEMENT_CHANGETYPE_FUNC_ARGS` → `(sim, i, x, y, from, to)`, `CTYPEDRAW_FUNC_ARGS` → `(sim, i, t, v)`;
  `Element::basicCtypeDraw` etc. → `Element.basicCtypeDraw`.

## Data

* `parts[i].field` as in C++. The float fields (x y vx vy temp) round every store to binary32, the int fields
  wrap to int32, `dcolour` to uint32. A struct copy (`Particle p = parts[i]`, `parts[a] = parts[b]`) is
  `parts[i].clone()` / `parts[a].copyFrom(parts[b])`; a reference (`Particle &p = parts[i]`, `auto *p = &parts[i]`)
  is the object itself.
* `pmap[y][x]`, `sim->photons[y][x]`: `Int32Array` rows. `sim->pv[y/CELL][x/CELL]` →
  `sim.pv[(y / CELL) | 0][(x / CELL) | 0]` (Float32Array rows; a store rounds to binary32). Same for `vx vy hv
  fvx fvy` (float) and `bmap emap` (Uint8Array). `sim->air->bmap_blockair[cy][cx]`, `bmap_blockairh[cy][cx]`:
  Uint8Array rows.
* `sim->gravIn.mass[Vec2{x, y} / CELL]` → `sim.gravIn.mass[((y / CELL) | 0) * XCELLS + ((x / CELL) | 0)]`;
  likewise `gravOut.forceX/forceY`.
* `sim->portalp[a][b][c]` is a Particle; `sim->wireless[a][b]`, `sim->Element_LOLZ_lolz[a][b]`: Int32Array rows.
* `sim->rng.chance(a, b)`, `.between(a, b)`, `.gen()`, `.uniform01()`; `sim->rng()` → `sim.rng.call()`.
* `TYP(r)`, `ID(r)`, `PMAP(id, t)`, `PMAPID(id)`, `InBounds`, `PT_*`, flags: `config.ts` / `numbers.ts`.
* Out-parameters: `sim->eval_move(pt, nx, ny, &rr)` → `sim.eval_move(pt, nx, ny, ref)` with `const ref = { v: 0 }`;
  `sim->GetGravityField(x, y, pg, ng, gx, gy)` → `const g = { x: 0, y: 0 }; sim.GetGravityField(x, y, pg, ng, g)`;
  `sim->get_wavelength_bin(&wm)` → `{ v: wm }`. Any other `int *` / `float &` parameter of a local function:
  pass a small object or return a tuple, whatever stays closest.
* Colours: `0xRRGGBB_rgb` → the number `0xRRGGBB`; `.Red/.Green/.Blue` → `Red(c)/Green(c)/Blue(c)`;
  `RGB(r, g, b)` → `rgb(r, g, b)`; `.Pack()` → the number; `RGB::Unpack(n)` → `n & 0xFFFFFF`;
  `Renderer::flameTableAt(i)` → `flameTableAt(i)` (`colour.ts`), likewise plasma, clfm, firw.
  `Probability::binomial_gte1` / `SmallKBinomialGenerator` → `colour.ts`.

## Arithmetic: the part that makes or breaks the oracle

The original runs on x86-64 SSE: a `float` operation rounds to binary32, a `double` operation to binary64,
nothing else. JavaScript numbers are binary64. So:

* **Every float operation is wrapped in `f()`** (`Math.fround`): `float a = b * c + d;` (all float) →
  `const a = f(f(b * c) + d);`. One `f()` per `+ - * /`, not one for the whole expression.
* A float operand meets a **double literal** (`0.5`, `273.15` without `f`) or a double variable: C++ promotes to
  double, so that operation is computed in double and **not** wrapped; it is rounded where it is stored into a
  float (a float local: `f(...)`; a Particle float field or a Float32Array: the store rounds by itself).
  `parts[i].temp > 273.15f + 12.0f` → `parts[i].temp > f(f(273.15) + f(12.0))`; `fabs(vx) + fabs(vy) >= 0.5` is
  float + float compared in double → `f(Math.abs(vx) + Math.abs(vy)) >= 0.5`.
* Float literals with an `f` suffix are `f(literal)` unless exact in binary32 (`2.0f`, `0.5f`, `256.0f`, `-1.0f`).
* `int` op `float` → float: `i * 0.1f` → `f(i * f(0.1))` (int converted to float first: for |i| > 2^24 also `f(i)`).
* Locals: a C++ `float` local is stored with `f()`; an `int` local gets ints. `auto` takes the type of its
  initializer.
* Conversions: `(int)x` of a float/double → `itrunc(x)` (or `x | 0` when |x| < 2^31); `(unsigned)` → `>>> 0`.
* **Integer division** `a / b` of ints → `(a / b) | 0` or `idiv(a, b)`. `%` of ints is JavaScript's `%`
  (same sign rule). Unsigned arithmetic (`unsigned`, `uint32_t`): keep it `>>> 0`.
  32-bit products that may overflow: `Math.imul`.
* Math functions: `sqrtf`/`std::sqrt(float)` → `f(Math.sqrt(x))` (exact); `sinf`, `cosf`, `atan2f`, `powf`,
  `expf`, `logf` → `f(Math.sin(x))` etc. (not always bit exact; keep the C++ argument type); `std::sqrt(double)` →
  `Math.sqrt`. `fabs`/`std::abs(float)` → `Math.abs`; `std::abs(int)` → `Math.abs`. `floor`, `ceil`, `round`
  (`Math.round` differs for negative halves: use `Math.sign(x) * Math.round(Math.abs(x))`), `fmod` → `%`.
  `std::min/std::max` → `Math.min/Math.max` (same result for numbers that are not NaN).
* `bool` → boolean, but where C++ uses a bool as int (`a + (b > c)`) write `(b > c ? 1 : 0)`.
* `char`/`unsigned char` fields: keep them in range (`& 0xFF`, or `<< 24 >> 24` for signed char) where C++ wraps.

Do not optimise, reorder or "clean up": same branches, same loops, same order of RNG calls, the original's
quirks and bugs included. Keep the original's comments (they explain the rules) and the `//@` reaction notes.
