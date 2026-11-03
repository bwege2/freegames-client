// simulation/elements/QRTZ.cpp (+ QRTZ.h)
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITL, NT, PROP_HOT_GLOW, PROP_LIFE_DEC, PROP_PHOTPASS, SC_SOLIDS, TYPE_SOLID, TYP, ID,
} from '../sim/config.ts';
import { PT_LAVA, PT_PQRT, PT_QRTZ, PT_SLTW } from '../sim/numbers.ts';

export function Element_QRTZ(el: Element): void {
  el.Identifier = 'DEFAULT_PT_QRTZ';
  el.Name = 'QRTZ';
  el.Colour = 0xAADDDD; // 0xAADDDD_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 3;
  el.Description = 'Quartz, breakable mineral. Conducts but becomes brittle when cold. Scatters photons.';

  el.Properties = TYPE_SOLID | PROP_PHOTPASS | PROP_HOT_GLOW | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(2573.15);
  el.HighTemperatureTransition = PT_LAVA; //@ QRTZ -> LAVA(QRTZ)

  el.Update = Element_QRTZ_update;
  el.Graphics = Element_QRTZ_graphics;
  el.Create = create;
}

export function Element_QRTZ_update(sim: Simulation, i: number, x: number, y: number, _surround_space: number,
  _nt: number, parts: Particle[], pmap: Int32Array[]): number {
  const t = parts[i].type;
  if (t === PT_QRTZ) {
    const press = itrunc(f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] * 64));
    const diffTolerance = f(parts[i].temp * f(1.0666));
    if (f(press - parts[i].tmp3) > diffTolerance || f(press - parts[i].tmp3) < -diffTolerance) {
      //@ QRTZ -> PQRT
      sim.part_change_type(i, x, y, PT_PQRT);
      parts[i].life = 5; //timer before it can grow or diffuse again
    }
    parts[i].tmp3 = press;
  }
  if (parts[i].life > 5)
    parts[i].life = 5;
  // absorb SLTW
  if (parts[i].tmp !== -1) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          else if (TYP(r) === PT_SLTW && sim.rng.chance(1, 500)) {
            sim.kill_part(ID(r));
            parts[i].tmp++;
          }
        }
      }
    }
  }
  // grow and diffuse
  if (parts[i].tmp > 0 && f(f(parts[i].vx * parts[i].vx) + f(parts[i].vy * parts[i].vy)) < f(0.2) && parts[i].life <= 0) {
    let stopgrow = false;
    for (let trade = 0; trade < 9; trade++) {
      // rnd, rx, srx, ry, sry are unsigned in C++; x+srx wraps back to the signed value
      let rnd = sim.rng.gen() % 0x3FF;
      const rx = (rnd % 5) - 2;
      const srx = (rnd % 3) - 1;
      rnd >>>= 3;
      const ry = (rnd % 5) - 2;
      const sry = (rnd % 3) - 1;
      if (rx || ry) {
        if (!stopgrow)//try to grow
        {
          if (!pmap[y + sry][x + srx] && parts[i].tmp !== 0) {
            //@ PQRT/QRTZ -> 2xQRTZ
            const np = sim.create_part(-1, x + srx, y + sry, PT_QRTZ);
            if (np > -1) {
              parts[np].temp = parts[i].temp;
              parts[np].tmp2 = parts[i].tmp2;
              if (sim.rng.chance(1, 2)) {
                parts[np].tmp2 = Math.min(Math.max(parts[np].tmp2 + sim.rng.between(-1, 1), 0), 10);
              }
              parts[i].tmp--;
              if (t === PT_PQRT) {
                // If PQRT is stationary and has started growing particles of QRTZ, the PQRT is basically part of a new QRTZ crystal. So turn it back into QRTZ so that it behaves more like part of the crystal.
                sim.part_change_type(i, x, y, PT_QRTZ);
              }
              if (sim.rng.chance(1, 2)) {
                parts[np].tmp = -1;//dead qrtz
              }
              else if (!parts[i].tmp && sim.rng.chance(1, 15)) {
                parts[i].tmp = -1;
              }
              stopgrow = true;
            }
          }
        }
        //diffusion
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        else if (TYP(r) === PT_QRTZ && (parts[i].tmp > parts[ID(r)].tmp) && parts[ID(r)].tmp >= 0) {
          const tmp = parts[i].tmp - parts[ID(r)].tmp;
          if (tmp === 1) {
            parts[ID(r)].tmp++;
            parts[i].tmp--;
            break;
          }
          if (tmp > 0) {
            parts[ID(r)].tmp += idiv(tmp, 2);
            parts[i].tmp -= idiv(tmp, 2);
            break;
          }
        }
      }
    }
  }
  return 0;
}

export function Element_QRTZ_graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number
//QRTZ and PQRT
{
  const z = (cpart.tmp2 - 5) * 16;//speckles!
  g.colr += z;
  g.colg += z;
  g.colb += z;
  return 0;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, _v: number): void {
  sim.parts[i].tmp2 = sim.rng.between(0, 10);
  sim.parts[i].tmp3 = itrunc(f(sim.pv[(y / CELL) | 0][(x / CELL) | 0] * 64));
}
