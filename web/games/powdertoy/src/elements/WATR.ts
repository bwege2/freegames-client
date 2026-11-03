// simulation/elements/WATR.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_NEUTPASS, PROP_PHOTPASS, R_TEMP, SC_LIQUID, TYP, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE, PT_ICEI, PT_LRBD, PT_RBDM, PT_ROCK, PT_SALT, PT_SAND, PT_SLTW, PT_STNE, PT_WATR, PT_WTRV } from '../sim/numbers.ts';

export function Element_WATR(el: Element): void {
  el.Identifier = "DEFAULT_PT_WATR";
  el.Name = "WATR";
  el.Colour = 0x2030D0;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15));
  el.HeatConduct = 29;
  el.Description = "Water. Conducts electricity, freezes, and extinguishes fires.";

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_NEUTPASS | PROP_PHOTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(273.15);
  el.LowTemperatureTransition = PT_ICEI; //@ WATR -> ICEI
  el.HighTemperature = 373.0;
  el.HighTemperatureTransition = PT_WTRV; //@ WATR -> WTRV

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
        if (TYP(r)==PT_SALT && sim.rng.chance(1, 50))
        {
          //@ WATR + SALT -> SLTW + SALT
          sim.part_change_type(i,x,y,PT_SLTW);
          // on average, convert 3 WATR to SLTW before SALT turns into SLTW
          if (sim.rng.chance(1, 3))
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SLTW);
        }
        else if ((TYP(r)==PT_RBDM||TYP(r)==PT_LRBD) && (sim.legacy_enable||parts[i].temp>f(f(273.15)+f(12.0))) && sim.rng.chance(1, 100))
        {
          //@ WATR + RBDM/LRBD -> FIRE + RBDM/LRBD
          sim.part_change_type(i,x,y,PT_FIRE);
          parts[i].life = 4;
          parts[i].ctype = PT_WATR;
        }
        else if (TYP(r)==PT_FIRE && parts[ID(r)].ctype!=PT_WATR)
        {
          sim.kill_part(ID(r));
          if (sim.rng.chance(1, 30))
          {
            sim.kill_part(i);
            return 1;
          }
        }
        else if (TYP(r)==PT_SLTW && sim.rng.chance(1, 2000))
        {
          //@ WATR + SLTW -> 2xSLTW
          sim.part_change_type(i,x,y,PT_SLTW);
        }
        else if (TYP(r)==PT_ROCK && f(Math.abs(parts[i].vx)+Math.abs(parts[i].vy)) >= 0.5 && sim.rng.chance(1, 1000)) // ROCK erosion
        {
          //@ WATR + ROCK -> WATR + SAND/STNE
          if (sim.rng.chance(1,3))
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SAND);
          else
            sim.part_change_type(ID(r),x+rx,y+ry,PT_STNE);
        }
      }
    }
  }
  return 0;
}
