// simulation/elements/BMTL.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_SOLIDS, ST, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BMTL, PT_BRMT, PT_IRON, PT_LAVA, PT_METL } from '../sim/numbers.ts';

export function Element_BMTL(el: Element): void {
  el.Identifier = "DEFAULT_PT_BMTL";
  el.Name = "BMTL";
  el.Colour = 0x505070;
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
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 1;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "Breakable metal. Common conductive building material, can melt and break under pressure.";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = 1.0;
  el.HighPressureTransition = ST;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1273.0;
  el.HighTemperatureTransition = PT_LAVA; //@ BMTL -> LAVA(BMTL)

  el.Update = update;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].tmp>1)
  {
    parts[i].tmp--;
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        if (rx || ry)
        {
          const r = pmap[y+ry][x+rx];
          if (!r)
            continue;
          if ((TYP(r)==PT_METL || TYP(r)==PT_IRON) && sim.rng.chance(1, 100))
          {
            //@ BMTL + METL/IRON -> 2xBMTL
            sim.part_change_type(ID(r),x+rx,y+ry,PT_BMTL);
            parts[ID(r)].tmp = (parts[i].tmp<=7) ? (parts[i].tmp=1) : parts[i].tmp - sim.rng.between(0, 4);
          }
        }
      }
    }
  }
  else if (parts[i].tmp==1 && sim.rng.chance(1, 1000))
  {
    //@ BMTL -> BRMT
    parts[i].tmp = 0;
    sim.part_change_type(i,x,y,PT_BRMT);
  }
  return 0;
}
