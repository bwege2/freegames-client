// simulation/elements/ICEI.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CFDS, ID, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_LIFE_DEC, PROP_NEUTPASS, R_TEMP, SC_SOLIDS, ST, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_FRZW, PT_FRZZ, PT_ICEI, PT_SALT, PT_SLTW, PT_SNOW, PT_WATR } from '../sim/numbers.ts';

export function Element_ICEI(el: Element): void {
  el.Identifier = "DEFAULT_PT_ICEI";
  el.Name = "ICE";
  el.Colour = 0xA0C0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(f(-0.0003) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 100;

  el.DefaultProperties.temp = f(f(R_TEMP - 50.0) + f(273.15));
  el.HeatConduct = 46;
  el.Description = "Crushes under pressure. Cools down air.";

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC | PROP_NEUTPASS;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(0.8);
  el.HighPressureTransition = PT_SNOW; //@ ICEI -> SNOW
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(252.05);
  el.HighTemperatureTransition = ST;

  el.DefaultProperties.ctype = PT_WATR;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (parts[i].ctype==PT_FRZW)//get colder if it is from FRZW
  {
    parts[i].temp = restrict_flt(f(parts[i].temp-1.0), MIN_TEMP, MAX_TEMP);
  }
  for (let rx = -1; rx <= 1; rx++)
  {
    for (let ry = -1; ry <= 1; ry++)
    {
      if (rx || ry)
      {
        const r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        if (TYP(r)==PT_SALT || TYP(r)==PT_SLTW)
        {
          if (parts[i].temp > elements[PT_SLTW].LowTemperature && sim.rng.chance(1, 200))
          {
            //@ ICEI + SALT/SLTW -> 2xSLTW
            sim.part_change_type(i,x,y,PT_SLTW);
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SLTW);
            return 0;
          }
        }
        else if ((TYP(r)==PT_FRZZ) && sim.rng.chance(1, 200))
        {
          //@ ICEI + FRZZ -> ICEI + ICEI(FRZW)
          sim.part_change_type(ID(r),x+rx,y+ry,PT_ICEI);
          parts[ID(r)].ctype = PT_FRZW;
        }
      }
    }
  }
  return 0;
}
