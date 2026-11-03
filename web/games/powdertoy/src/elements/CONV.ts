// simulation/elements/CONV.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE, FIELD_TMP } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PMAPID, PROP_NOCTYPEDRAW, PT_NUM, SC_SPECIAL, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_CONV, PT_DMND, PT_LIFE, PT_PBCN, PT_PCLN, PT_STKM, PT_STKM2 } from '../sim/numbers.ts';

export function Element_CONV(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CONV';
  el.Name = 'CONV';
  el.Colour = 0x0AAB0A;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
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
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Converter. Converts everything into whatever it first touches.';

  el.Properties = TYPE_SOLID | PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE) | (1 << FIELD_TMP)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.CtypeDraw = Element.ctypeDrawVInCtype;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const ctype = TYP(parts[i].ctype);
  if (ctype <= 0 || ctype >= PT_NUM || !elements[ctype].Enabled || ctype === PT_CONV) {
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
          rt !== PT_CONV && rt < PT_NUM) {
          parts[i].ctype = rt;
          if (rt === PT_LIFE)
            parts[i].ctype |= PMAPID(parts[ID(r)].ctype);
        }
      }
    }
  }
  else {
    const restrictElement = sd.IsElement(parts[i].tmp) ? parts[i].tmp : 0;
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (x + rx >= 0 && y + ry >= 0 && x + rx < XRES && y + ry < YRES) {
          let r = sim.photons[y + ry][x + rx];
          if (!r || (restrictElement && ((TYP(r) === restrictElement) === (parts[i].tmp2 === 1))))
            r = pmap[y + ry][x + rx];
          if (!r || (restrictElement && ((TYP(r) === restrictElement) === (parts[i].tmp2 === 1))))
            continue;
          if (TYP(r) !== PT_CONV && TYP(r) !== PT_DMND && TYP(r) !== ctype) {
            sim.create_part(ID(r), x + rx, y + ry, TYP(parts[i].ctype), ID(parts[i].ctype));
          }
        }
      }
    }
  }
  return 0;
}
