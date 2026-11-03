// simulation/elements/PBCN.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE, type Particle } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import {
  CELL, CFDS, FLAG_SKIPMOVE, IPH, IPL, ITH, ITL, NT, PROP_NOCTYPEDRAW, PROP_PHOTPASS, PT_NUM, SC_POWERED, TYPE_SOLID,
  TYP, ID,
} from '../sim/config.ts';
import {
  PT_BCLN, PT_CLNE, PT_LAVA, PT_LIFE, PT_LIGH, PT_NSCN, PT_PBCN, PT_PCLN, PT_PHOT, PT_PSCN, PT_SPRK, PT_STKM,
  PT_STKM2,
} from '../sim/numbers.ts';
import { Element_PCLN_ctypeDraw } from '../elements/PCLN.ts';

export function Element_PBCN(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PBCN';
  el.Name = 'PBCN';
  el.Colour = 0x3B1D0A; // 0x3B1D0A_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.50);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 12;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Powered breakable clone.';

  el.Properties = TYPE_SOLID | PROP_PHOTPASS | PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
  el.CtypeDraw = Element_PCLN_ctypeDraw;
}

const ADVECTION = f(0.1);

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (!parts[i].tmp2 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 4.0)
    parts[i].tmp2 = sim.rng.between(80, 119);
  if (parts[i].tmp2) {
    parts[i].vx = f(parts[i].vx + f(ADVECTION * sim.vx[(y / CELL) | 0][(x / CELL) | 0]));
    parts[i].vy = f(parts[i].vy + f(ADVECTION * sim.vy[(y / CELL) | 0][(x / CELL) | 0]));
    parts[i].tmp2--;
    if (!parts[i].tmp2) {
      sim.kill_part(i);
      return 1;
    }
  }
  if (parts[i].ctype <= 0 || parts[i].ctype >= PT_NUM || !elements[parts[i].ctype].Enabled) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        let r = sim.photons[y + ry][x + rx];
        if (!r)
          r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if (rt !== PT_CLNE && rt !== PT_PCLN &&
          rt !== PT_BCLN && rt !== PT_SPRK &&
          rt !== PT_NSCN && rt !== PT_PSCN &&
          rt !== PT_STKM && rt !== PT_STKM2 &&
          rt !== PT_PBCN && rt < PT_NUM) {
          parts[i].ctype = rt;
          if (rt === PT_LIFE || rt === PT_LAVA)
            parts[i].tmp = parts[ID(r)].ctype;
        }
      }
    }
  }
  if (parts[i].life !== 10) {
    if (parts[i].life > 0)
      parts[i].life--;
  }
  else {
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_PBCN) {
            if (parts[ID(r)].life < 10 && parts[ID(r)].life > 0)
              parts[i].life = 9;
            else if (parts[ID(r)].life === 0)
              parts[ID(r)].life = 10;
          }
        }
      }
    }
    if (parts[i].ctype > 0 && parts[i].ctype < PT_NUM && elements[parts[i].ctype].Enabled) {
      if (parts[i].ctype === PT_PHOT) {//create photons a different way
        for (let rx = -1; rx <= 1; rx++) {
          for (let ry = -1; ry <= 1; ry++) {
            if (rx || ry) {
              const r = sim.create_part(-1, x + rx, y + ry, PT_PHOT);
              if (r !== -1) {
                parts[r].vx = rx * 3;
                parts[r].vy = ry * 3;
                if (r > i) {
                  // Make sure movement doesn't happen until next frame, to avoid gaps in the beams of photons produced
                  parts[r].flags |= FLAG_SKIPMOVE;
                }
              }
            }
          }
        }
      }
      else if (parts[i].ctype === PT_LIFE)//create life a different way
      {
        for (let rx = -1; rx <= 1; rx++) {
          for (let ry = -1; ry <= 1; ry++) {
            sim.create_part(-1, x + rx, y + ry, PT_LIFE, parts[i].tmp);
          }
        }
      }
      else if (parts[i].ctype !== PT_LIGH || sim.rng.chance(1, 30)) {
        // the call's arguments: GCC evaluates them right to left (y offset first)
        const dy = sim.rng.between(-1, 1);
        const dx = sim.rng.between(-1, 1);
        const np = sim.create_part(-1, x + dx, y + dy, TYP(parts[i].ctype));
        if (np > -1) {
          if (parts[i].ctype === PT_LAVA && parts[i].tmp > 0 && parts[i].tmp < PT_NUM && elements[parts[i].tmp].HighTemperatureTransition === PT_LAVA)
            parts[np].ctype = parts[i].tmp;
        }
      }
    }
  }

  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const lifemod = ((cpart.life > 10 ? 10 : cpart.life) * 10);
  g.colr += lifemod;
  g.colg += idiv(lifemod, 2);
  return 0;
}
