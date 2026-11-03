// simulation/elements/BRMT.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_POWDERS, ST, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_BREC, PT_THRM } from '../sim/numbers.ts';

export function Element_BRMT(el: Element): void {
  el.Identifier = "DEFAULT_PT_BRMT";
  el.Name = "BRMT";
  el.Colour = 0x705060;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.3);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 2;
  el.Hardness = 2;

  el.Weight = 90;

  el.HeatConduct = 211;
  el.Description = "Broken metal. Created when iron rusts or when metals break from pressure.";

  el.Properties = TYPE_PART | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1273.0;
  el.HighTemperatureTransition = ST; //@ BRMT -> LAVA(BMTL)

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].temp > f(523.15))//250.0f+273.15f
  {
    let tempFactor = itrunc(f(1000 - f(f(f(523.15)-parts[i].temp)*2)));
    if(tempFactor < 2)
      tempFactor = 2;
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        if (rx || ry)
        {
          const r = pmap[y+ry][x+rx];
          if (!r)
            continue;
          if (TYP(r)==PT_BREC && sim.rng.chance(1, tempFactor))
          {
            if (sim.rng.chance(1, 2))
            {
              //@ BRMT + BREC -> BRMT + THRM
              sim.create_part(ID(r), x+rx, y+ry, PT_THRM);
            }
            else //@ BRMT + BREC -> THRM + BREC
              sim.create_part(i, x, y, PT_THRM);
          }
        }
      }
    }
  }
  return 0;
}
