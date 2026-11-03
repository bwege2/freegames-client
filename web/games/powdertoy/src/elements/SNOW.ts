// simulation/elements/SNOW.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_NEUTPASS, R_TEMP, SC_POWDERS, ST, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_FRZW, PT_SALT, PT_SLTW } from '../sim/numbers.ts';

export function Element_SNOW(el: Element): void {
  el.Identifier = "DEFAULT_PT_SNOW";
  el.Name = "SNOW";
  el.Colour = 0xC0E0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.90);
  el.Collision = f(-0.1);
  el.Gravity = f(0.05);
  el.Diffusion = f(0.01);
  el.HotAir = f(f(-0.00005) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;
  el.PhotonReflectWavelengths = 0x03FFFFFF;

  el.Weight = 50;

  el.DefaultProperties.temp = f(f(R_TEMP - 30.0) + f(273.15));
  el.HeatConduct = 46;
  el.Description = "Light particles. Created when ICE breaks under pressure.";

  el.Properties = TYPE_PART | PROP_NEUTPASS;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(252.05);
  el.HighTemperatureTransition = ST;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
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
        //@ SNOW + SALT/SLTW -> 2xSLTW
        if ((TYP(r)==PT_SALT || TYP(r)==PT_SLTW) && sim.rng.chance(1, 333))
        {
          sim.part_change_type(i,x,y,PT_SLTW);
          sim.part_change_type(ID(r),x+rx,y+ry,PT_SLTW);
        }
      }
    }
  }
  return 0;
}
