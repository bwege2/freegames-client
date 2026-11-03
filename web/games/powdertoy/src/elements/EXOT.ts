// simulation/elements/EXOT.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE, type Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PMODE_BLUR, PMODE_FLARE, PMODE_FLAT, PROP_NEUTPASS, R_TEMP,
  SC_NUCLEAR, TYPE_LIQUID, TYP, ID,
} from '../sim/config.ts';
import {
  PT_BREC, PT_CFLM, PT_CLNE, PT_DMND, PT_EXOT, PT_GOLD, PT_LAVA, PT_NBHL, PT_PCLN, PT_PROT, PT_PRTI, PT_PRTO,
  PT_TTAN, PT_VIBR, PT_VOID, PT_WARP,
} from '../sim/numbers.ts';

export function Element_EXOT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_EXOT';
  el.Name = 'EXOT';
  el.Colour = 0x247BFE; // 0x247BFE_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.0003) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;

  el.Weight = 46;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15)); // R_TEMP - 2.0f + 273.15f
  el.HeatConduct = 250;
  el.Description = 'Exotic matter. Explodes with excess exposure to electrons. Has many other odd reactions.';

  el.Properties = TYPE_LIQUID | PROP_NEUTPASS;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 1000;
  el.DefaultProperties.tmp = 244;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if (rt === PT_WARP) {
          if (parts[ID(r)].tmp2 > 2000 && sim.rng.chance(1, 100)) {
            parts[i].tmp2 += 100;
          }
        }
        else if (rt === PT_EXOT) {
          if (parts[ID(r)].ctype === PT_PROT)
            parts[i].ctype = PT_PROT;
          if (parts[ID(r)].life === 1500 && sim.rng.chance(1, 1000))
            parts[i].life = 1500;
        }
        else if (rt === PT_LAVA) {
          //turn molten TTAN or molten GOLD to molten VIBR
          if (parts[ID(r)].ctype === PT_TTAN || parts[ID(r)].ctype === PT_GOLD) {
            if (sim.rng.chance(1, 10)) {
              //@ EXOT + LAVA(TTAN/GOLD) -> LAVA(VIBR)
              parts[ID(r)].ctype = PT_VIBR;
              sim.kill_part(i);
              return 1;
            }
          }
          //molten VIBR will kill the leftover EXOT though, so the VIBR isn't killed later
          else if (parts[ID(r)].ctype === PT_VIBR) {
            if (sim.rng.chance(1, 1000)) {
              sim.kill_part(i);
              return 1;
            }
          }
        }
        if (parts[i].tmp > 245 && parts[i].life > 1337)
          if (rt !== PT_EXOT && rt !== PT_BREC && rt !== PT_DMND && rt !== PT_CLNE && rt !== PT_PRTI && rt !== PT_PRTO && rt !== PT_PCLN && rt !== PT_VOID && rt !== PT_NBHL && rt !== PT_WARP) {
            if (sim.create_part(i, x, y, rt) !== -1) {
              return 1;
            }
          }
      }
    }
  }

  parts[i].tmp--;
  parts[i].tmp2--;
  //reset tmp every 250 frames, gives EXOT it's slow flashing effect
  if (parts[i].tmp < 1 || parts[i].tmp > 250)
    parts[i].tmp = 250;

  if (parts[i].tmp2 < 1)
    parts[i].tmp2 = 1;
  else if (parts[i].tmp2 > 6000) {
    parts[i].tmp2 = 10000;
    if (parts[i].life < 1001) {
      //@ EXOT -> WARP
      sim.part_change_type(i, x, y, PT_WARP);
      return 1;
    }
  }
  else if (parts[i].life < 1001)
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] = f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] + f(f(parts[i].tmp2 * CFDS) / 160000));

  if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 200 && parts[i].temp > 9000 && parts[i].tmp2 > 200) {
    parts[i].tmp2 = 6000;
    //@ EXOT -> WARP
    sim.part_change_type(i, x, y, PT_WARP);
    return 1;
  }
  if (parts[i].tmp2 > 100) {
    for (let trade = 0; trade < 9; trade++) {
      const rx = sim.rng.between(-2, 2);
      const ry = sim.rng.between(-2, 2);
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_EXOT && (parts[i].tmp2 > parts[ID(r)].tmp2) && parts[ID(r)].tmp2 >= 0) //diffusion
        {
          const tym = parts[i].tmp2 - parts[ID(r)].tmp2;
          if (tym === 1) {
            parts[ID(r)].tmp2++;
            parts[i].tmp2--;
            break;
          }
          if (tym > 0) {
            parts[ID(r)].tmp2 += idiv(tym, 2);
            parts[i].tmp2 -= idiv(tym, 2);
            break;
          }
        }
      }
    }
  }
  if (parts[i].ctype === PT_PROT) {
    if (parts[i].temp < 50.0) {
      //@ EXOT(PROT) -> CFLM
      if (sim.create_part(i, x, y, PT_CFLM) !== -1) // I don't see how this could fail but whatever
      {
        return 1;
      }
    }
    else
      parts[i].temp = f(parts[i].temp - 1.0);
  }
  else if (parts[i].temp < f(273.15)) {
    parts[i].vx = 0;
    parts[i].vy = 0;
    sim.pv[(y / CELL) | 0][(x / CELL) | 0] = f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] - f(0.01));
    parts[i].tmp--;
  }
  return 0;
}

// sin() of a float: the C library's double sin (the float is promoted), as with only <cmath> in GCC's global namespace
function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const q = cpart.temp;
  const b = cpart.tmp;
  const c = cpart.tmp2;
  if (cpart.life < 1001) {
    if (gfctx.rng.chance(cpart.tmp2 - 1, 1000)) {
      const frequency = f(0.04045);
      g.colr = itrunc(Math.sin(f(f(frequency * c) + 4)) * 127 + 150);
      g.colg = itrunc(Math.sin(f(f(frequency * c) + 6)) * 127 + 150);
      g.colb = itrunc(Math.sin(f(f(frequency * c) + 8)) * 127 + 150);

      g.firea = 100;
      g.firer = 0;
      g.fireg = 0;
      g.fireb = 0;

      g.pixel_mode |= PMODE_FLAT;
      g.pixel_mode |= PMODE_FLARE;
    }
    else {
      const frequency = f(0.00045);
      g.colr = itrunc(Math.sin(f(f(frequency * q) + 4)) * 127 + (b / 1.7));
      g.colg = itrunc(Math.sin(f(f(frequency * q) + 6)) * 127 + (b / 1.7));
      g.colb = itrunc(Math.sin(f(f(frequency * q) + 8)) * 127 + (b / 1.7));
      g.cola = idiv(cpart.tmp, 6);

      g.firea = g.cola;
      g.firer = g.colr;
      g.fireg = g.colg;
      g.fireb = g.colb;

      g.pixel_mode |= FIRE_ADD;
      g.pixel_mode |= PMODE_BLUR;
    }
  }
  else {
    const frequency = f(0.01300);
    g.colr = itrunc(Math.sin(f(frequency * q) + 6.00) * 127 + ((b / 2.9) + 80));
    g.colg = itrunc(Math.sin(f(frequency * q) + 6.00) * 127 + ((b / 2.9) + 80));
    g.colb = itrunc(Math.sin(f(frequency * q) + 6.00) * 127 + ((b / 2.9) + 80));
    g.cola = idiv(cpart.tmp, 6);
    g.firea = g.cola;
    g.firer = g.colr;
    g.fireg = g.colg;
    g.fireb = g.colb;
    g.pixel_mode |= FIRE_ADD;
    g.pixel_mode |= PMODE_BLUR;
  }
  return 0;
}
