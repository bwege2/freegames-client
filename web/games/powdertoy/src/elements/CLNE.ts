// simulation/elements/CLNE.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_NOCTYPEDRAW, PROP_PHOTPASS, PT_NUM, SC_SPECIAL, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BCLN, PT_CLNE, PT_LAVA, PT_LIFE, PT_LIGH, PT_PBCN, PT_PCLN, PT_STKM, PT_STKM2 } from '../sim/numbers.ts';

export function Element_CLNE(el: Element): void {
  el.Identifier = "DEFAULT_PT_CLNE";
  el.Name = "CLNE";
  el.Colour = 0xFFD010;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "Clone. Duplicates any particles it touches.";

  el.Properties = TYPE_SOLID | PROP_PHOTPASS | PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

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

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (parts[i].ctype<=0 || parts[i].ctype>=PT_NUM || !elements[parts[i].ctype].Enabled)
  {
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        let r = sim.photons[y+ry][x+rx];
        if (!r)
          r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if (rt!=PT_CLNE && rt!=PT_PCLN &&
            rt!=PT_BCLN && rt!=PT_STKM &&
            rt!=PT_PBCN && rt!=PT_STKM2 &&
            rt<PT_NUM)
        {
          parts[i].ctype = rt;
          if (rt==PT_LIFE || rt==PT_LAVA)
            parts[i].tmp = parts[ID(r)].ctype;
        }
      }
    }
  }
  else
  {
    // g++ evaluates the arguments right to left: the y offset is drawn first
    if (parts[i].ctype==PT_LIFE) { const ry = sim.rng.between(-1, 1); const rx = sim.rng.between(-1, 1); sim.create_part(-1, x + rx, y + ry, PT_LIFE, parts[i].tmp); }
    else if (parts[i].ctype!=PT_LIGH || sim.rng.chance(1, 30))
    {
      const ry = sim.rng.between(-1, 1);
      const rx = sim.rng.between(-1, 1);
      const np = sim.create_part(-1, x + rx, y + ry, TYP(parts[i].ctype));
      if (np>=0)
      {
        if (parts[i].ctype==PT_LAVA && parts[i].tmp>0 && parts[i].tmp<PT_NUM && elements[parts[i].tmp].HighTemperatureTransition==PT_LAVA)
          parts[np].ctype = parts[i].tmp;
      }
    }
  }
  return 0;
}
