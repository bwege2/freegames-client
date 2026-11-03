// simulation/elements/SEED.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITL, NT, PROP_NEUTPASS, SC_POWDERS, TYP, TYPE_PART } from '../sim/config.ts';
import {
  PT_CBNW, PT_DEUT, PT_DSTW, PT_FIRE, PT_MWAX, PT_PLNT, PT_SAND, PT_SEED, PT_SLTW, PT_SPNG, PT_WATR,
} from '../sim/numbers.ts';
import {
  dir3x3, Element_PLNT_detectDown, PLNT_COLOUR, PLNT_DIR, PLNT_LIFE, PLNT_PHASE, PLNT_TOTAL_TMP,
} from './PLNT.ts';

export function Element_SEED(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SEED';
  el.Name = 'SEED';
  el.Colour = 0x88E788;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.95);
  el.AirDrag = f(f(0.005) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.80);
  el.Collision = f(-0.01);
  el.Gravity = f(0.05);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 19;
  el.PhotonReflectWavelengths = 0xE00;

  el.Weight = 36;

  el.HeatConduct = 32;
  el.Description = 'Seeds. Put on sand and add water to grow a tree.';

  el.Properties = TYPE_PART | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(673.15);
  el.HighTemperatureTransition = PT_FIRE; //@ SEED -> FIRE

  el.Update = update;
  el.Create = create;
  el.Graphics = graphics;
}

// Fields used (see also PLNT.cpp):
// ctype, tmp-tmp4 have the same meaning as in PLNT,
// but the first bit of ctype is used to determine whether a seed bred with another seed or not.
// life is used as a timer.

/** the int* arrays of tmp..tmp4 (new_tmpsi / new_tmpsr) */
const TMP_FIELDS = ['tmp', 'tmp2', 'tmp3', 'tmp4'] as const;

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const temp = parts[i].temp;

  // Turn into liquid wax under high temperature and pressure
  if (temp > 320.0 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 50.0 && sim.rng.chance(1, 150)) {
    //@ SEED -> MWAX
    sim.create_part(i, x, y, PT_MWAX);

    parts[i].ctype = 0;
    parts[i].life = 0;
    parts[i].tmp = 0;
    parts[i].tmp2 = 0;
    parts[i].tmp3 = 0;
    parts[i].tmp4 = 0;

    return 0;
  }

  // Don't do anything at bad temperatures
  if (temp > f(343.15) || temp < f(278.15)) {
    parts[i].ctype &= ~(0xFF << PLNT_LIFE); // Set water to zero
    parts[i].life = 0;

    return 0;
  }

  let water = (parts[i].ctype >> PLNT_LIFE) & 0xFF;

  // Check if we can grow
  if (water > 3) {
    let down = Element_PLNT_detectDown(sim, x, y); // Down gravity direction

    // Set a default direction if can't decide using gravity
    if (down < 0 || down > 7)
      down = 4;

    const up = (down + 4) % 8;

    // Check if there's SAND/SPNG under the seed particle and empty space above
    const downPart = pmap[y + dir3x3[down].Y][x + dir3x3[down].X];
    if ((TYP(downPart) === PT_SAND || TYP(downPart) === PT_SPNG) && !TYP(pmap[y + dir3x3[up].Y][x + dir3x3[up].X])) {
      if (parts[i].life > 200) {
        // Start growth
        //@ SEED -> PLNT
        sim.part_change_type(i, x, y, PT_PLNT);

        parts[i].ctype &= ~((7 << PLNT_DIR) | (3 << PLNT_PHASE)); // Clear direction and phase
        parts[i].ctype |= ((up & 7) << PLNT_DIR) | 1; // Set initial growth direction and growth bit
        parts[i].life = 15 * water; // Make the first branch longer

        return 1;
      } else
        parts[i].life++;
    } else
      parts[i].life = 0; // Reset growth counter if we lost contact with ground
  }

  for (let rx = -1; rx <= 1; rx++)
    for (let ry = -1; ry <= 1; ry++)
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];

        switch (TYP(r)) {
          case PT_WATR: // Drink water
            if (water < 31) {
              sim.kill_part(ID(r));
              water++;
              parts[i].life = 0;
            }
            break;
          case PT_DEUT: // Heavy water allows extra growth
            if (water < 255) {
              sim.kill_part(ID(r));
              water++;
              parts[i].life = 0;
            }
            break;
          case PT_CBNW:
          case PT_DSTW: // Distilled or carbonated water is allowed only in very limited amount
            if (water < 3) {
              sim.kill_part(ID(r));
              water++;
              parts[i].life = 0;
            }
            break;
          case PT_SLTW: // Salty water is harmful
            if (water > 0) {
              sim.kill_part(ID(r));
              water--;
              parts[i].life = 0;
            }
            break;
          case PT_SPNG: // Allow absorbing some water from SPNG
            if (water < 15 && parts[ID(r)].life > 0) {
              parts[ID(r)].life--;
              water++;
              parts[i].life = 0;
            }
            break;
          case PT_SEED: // Breed with another seed
            if (water > 0 && !(parts[i].ctype & 1) && !(parts[ID(r)].ctype & 1) && sim.rng.chance(1, 10)) {
              const ac = parts[i].ctype;
              const bc = parts[ID(r)].ctype;

              const old_tmpsi = [parts[i].tmp, parts[i].tmp2, parts[i].tmp3, parts[i].tmp4];
              const old_tmpsr = [parts[ID(r)].tmp, parts[ID(r)].tmp2, parts[ID(r)].tmp3, parts[ID(r)].tmp4];
              const new_tmpsi = parts[i];
              const new_tmpsr = parts[ID(r)];

              // We set breeding bits, so these seeds will no longer breed with others
              parts[i].ctype = 1;
              parts[ID(r)].ctype = 1;

              // Inherit colour
              for (let ind = 0; ind < 3; ind++) {
                const bits = [[0, 0], [0, 0]];

                for (let kid = 0; kid < 2; kid++) {
                  // Decide which allele is chosen from the first parent
                  if (sim.rng.chance(1, 2))
                    bits[kid][0] = (ac & (1 << (2 * ind + PLNT_COLOUR))) !== 0 ? 1 : 0;
                  else
                    bits[kid][0] = (ac & (1 << (1 + 2 * ind + PLNT_COLOUR))) !== 0 ? 1 : 0;

                  // ... from the second parent
                  if (sim.rng.chance(1, 2))
                    bits[kid][1] = (bc & (1 << (2 * ind + PLNT_COLOUR))) !== 0 ? 1 : 0;
                  else
                    bits[kid][1] = (bc & (1 << (1 + 2 * ind + PLNT_COLOUR))) !== 0 ? 1 : 0;
                }

                // Set the corresponding genes
                parts[i].ctype |= bits[0][0] << (2 * ind + PLNT_COLOUR);
                parts[i].ctype |= bits[0][1] << (1 + 2 * ind + PLNT_COLOUR);

                parts[ID(r)].ctype |= bits[1][0] << (2 * ind + PLNT_COLOUR);
                parts[ID(r)].ctype |= bits[1][1] << (1 + 2 * ind + PLNT_COLOUR);
              }

              // Inherit the branching part of tmp - tmp4
              for (let ind = 0; ind < 5; ind++) {
                // Loop over tmp - tmp4
                for (let field = 0; field < 4; field++) {
                  new_tmpsi[TMP_FIELDS[field]] |= sim.rng.chance(1, 2) ?
                    (old_tmpsi[field] & (1 << ind)) : (old_tmpsr[field] & (1 << ind));
                  new_tmpsr[TMP_FIELDS[field]] |= sim.rng.chance(1, 2) ?
                    (old_tmpsi[field] & (1 << ind)) : (old_tmpsr[field] & (1 << ind));
                }
              }

              // Inherit the phases part of tmp - tmp4
              for (let ind = 5; ind < PLNT_TOTAL_TMP; ind += 2) {
                // Loop over tmp - tmp4
                for (let field = 0; field < 4; field++) {
                  new_tmpsi[TMP_FIELDS[field]] |= sim.rng.chance(1, 2) ?
                    (old_tmpsi[field] & (3 << ind)) : (old_tmpsr[field] & (3 << ind));
                  new_tmpsr[TMP_FIELDS[field]] |= sim.rng.chance(1, 2) ?
                    (old_tmpsi[field] & (3 << ind)) : (old_tmpsr[field] & (3 << ind));
                }
              }
            }
            break;
          default:
            continue;
        }
      }

  // Update water counter
  parts[i].ctype &= ~(0xFF << PLNT_LIFE);
  parts[i].ctype |= (water & 0xFF) << PLNT_LIFE;

  return 0;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, _v: number): void {
  sim.parts[i].ctype = 0b1110110000000; // 0b111011'000'00'0

  let down = Element_PLNT_detectDown(sim, x, y); // Down gravity direction

  // Use random down direction if can't decide using gravity
  if (down < 0 || down > 7)
    down = sim.rng.between(0, 7);

  const up = (down + 4) % 8; // Up gravity direction

  sim.parts[i].ctype |= (up & 7) << PLNT_DIR;
  sim.parts[i].tmp = 0;
  sim.parts[i].tmp2 = 0;
  sim.parts[i].tmp3 = 0;
  sim.parts[i].tmp4 = 0;

  for (let ind = 0; ind < PLNT_TOTAL_TMP; ind++) {
    if (sim.rng.chance(1, 2))
      sim.parts[i].tmp |= (1 << ind);
    if (sim.rng.chance(1, 2))
      sim.parts[i].tmp2 |= (1 << ind);
    if (sim.rng.chance(1, 2))
      sim.parts[i].tmp3 |= (1 << ind);
    if (sim.rng.chance(1, 2))
      sim.parts[i].tmp4 |= (1 << ind);
  }
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const water = (cpart.ctype >> PLNT_LIFE) & 0xFF;

  if (water > 3) { // Ready for growth
    g.colr -= 50;
    g.colg -= 50;
    g.colb -= 50;
  } else if (water > 0) { // Had a sip of water
    g.colr -= 25;
    g.colg -= 25;
    g.colb -= 25;
  }

  return 0;
}
