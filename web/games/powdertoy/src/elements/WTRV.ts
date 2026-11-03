// simulation/elements/WTRV.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, NT, R_TEMP, SC_GAS, ST, TYP, TYPE_GAS } from '../sim/config.ts';
import { PT_FIRE, PT_LRBD, PT_RBDM, PT_WATR } from '../sim/numbers.ts';

export function Element_WTRV(el: Element): void {
  el.Identifier = "DEFAULT_PT_WTRV";
  el.Name = "WTRV";
  el.Colour = 0xA0A0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_GAS;
  el.Enabled = 1;

  el.Advection = 1.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.30);
  el.Collision = f(-0.1);
  el.Gravity = f(-0.1);
  el.Diffusion = 0.75;
  el.HotAir = f(f(0.0003) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 4;

  el.Weight = 1;

  el.DefaultProperties.temp = f(f(R_TEMP + 100.0) + f(273.15));
  el.HeatConduct = 48;
  el.Description = "Steam. Produced from hot water.";

  el.Properties = TYPE_GAS;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 371.0;
  el.LowTemperatureTransition = ST;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  for (let rx = -1; rx <= 1; rx++)
  {
    for (let ry = -1; ry <= 1; ry++)
    {
      if (rx || ry)
      {
        const r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        if ((TYP(r)==PT_RBDM||TYP(r)==PT_LRBD) && !sim.legacy_enable && parts[i].temp>f(f(273.15)+f(12.0)) && sim.rng.chance(1, 100))
        {
          //@ WTRV + RBDM/LRBD -> FIRE + RBDM/LRBD
          sim.part_change_type(i,x,y,PT_FIRE);
          parts[i].life = 4;
          parts[i].ctype = PT_WATR;
        }
      }
    }
  }
  if(parts[i].temp>1273&&parts[i].ctype==PT_FIRE)
    parts[i].temp-=f(parts[i].temp/1000);
  return 0;
}
