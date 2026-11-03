// simulation/elements/BCLN.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, PROP_NOCTYPEDRAW, PROP_PHOTPASS,
  PT_NUM, SC_SPECIAL, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_LAVA, PT_LIFE, PT_LIGH, PT_PBCN, PT_PCLN, PT_STKM, PT_STKM2 } from '../sim/numbers.ts';

export function Element_BCLN(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BCLN';
  el.Name = 'BCLN';
  el.Colour = 0xFFD040;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.50);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 12;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Breakable Clone.';

  el.Properties = TYPE_SOLID | PROP_PHOTPASS | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC | PROP_NOCTYPEDRAW;
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
  el.CtypeDraw = Element.ctypeDrawVInTmp;
}

const ADVECTION = f(0.1);

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (!parts[i].life && sim.pv[(y / CELL) | 0][(x / CELL) | 0] > f(4.0))
    parts[i].life = sim.rng.between(80, 119);
  if (parts[i].life) {
    parts[i].vx = f(parts[i].vx + f(ADVECTION * sim.vx[(y / CELL) | 0][(x / CELL) | 0]));
    parts[i].vy = f(parts[i].vy + f(ADVECTION * sim.vy[(y / CELL) | 0][(x / CELL) | 0]));
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
          rt !== PT_BCLN && rt !== PT_STKM &&
          rt !== PT_PBCN && rt !== PT_STKM2 &&
          rt < PT_NUM) {
          parts[i].ctype = rt;
          if (rt === PT_LIFE || rt === PT_LAVA)
            parts[i].tmp = parts[ID(r)].ctype;
        }
      }
    }
  }
  else {
    if (parts[i].ctype === PT_LIFE) { const ry_ = sim.rng.between(-1, 1); const rx_ = sim.rng.between(-1, 1); sim.create_part(-1, x + rx_, y + ry_, PT_LIFE, parts[i].tmp) }
    else if (parts[i].ctype !== PT_LIGH || sim.rng.chance(1, 30)) {
      // g++ evaluates the arguments right to left: the y offset is drawn first
      const ry_ = sim.rng.between(-1, 1);
      const rx_ = sim.rng.between(-1, 1);
      const np = sim.create_part(-1, x + rx_, y + ry_, TYP(parts[i].ctype));
      if (np >= 0) {
        if (parts[i].ctype === PT_LAVA && parts[i].tmp > 0 && parts[i].tmp < PT_NUM && elements[parts[i].tmp].HighTemperatureTransition === PT_LAVA)
          parts[np].ctype = parts[i].tmp;
      }
    }
  }
  return 0;
}
