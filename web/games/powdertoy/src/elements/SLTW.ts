// simulation/elements/SLTW.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_NEUTPENETRATE, PROP_PHOTPASS, SC_LIQUID, ST, TYP, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE, PT_ICEI, PT_LRBD, PT_NONE, PT_PLNT, PT_RBDM, PT_SALT, PT_SLTW, PT_WATR } from '../sim/numbers.ts';

export function Element_SLTW(el: Element): void {
  el.Identifier = "DEFAULT_PT_SLTW";
  el.Name = "SLTW";
  el.Colour = 0x4050F0;
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

  el.Weight = 35;

  el.HeatConduct = 75;
  el.Description = "Saltwater, conducts electricity, difficult to freeze.";

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_NEUTPENETRATE | PROP_PHOTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(252.05);
  el.LowTemperatureTransition = PT_ICEI; //@ SLTW -> ICE(SLTW)
  el.HighTemperature = 383.0;
  el.HighTemperatureTransition = ST;

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
        switch (TYP(r))
        {
        case PT_SALT:
          //@ SLTW + SALT -> 2xSLTW
          if (sim.rng.chance(1, 2000))
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SLTW);
          break;
        case PT_PLNT:
          if (sim.rng.chance(1, 40))
            sim.kill_part(ID(r));
          break;
        case PT_RBDM:
        case PT_LRBD:
          //@ SLTW + RBDM/LRBD -> FIRE + RBDM/LRBD
          if ((sim.legacy_enable||parts[i].temp>f(f(273.15)+f(12.0))) && sim.rng.chance(1, 100))
          {
            sim.part_change_type(i,x,y,PT_FIRE);
            parts[i].life = 4;
            parts[i].ctype = PT_WATR;
          }
          break;
        case PT_FIRE:
          if (parts[ID(r)].ctype!=PT_WATR)
          {
            sim.kill_part(ID(r));
            if (sim.rng.chance(1, 30))
            {
              sim.kill_part(i);
              return 1;
            }
          }
          break;
        case PT_NONE:
          break;
        default:
          continue;
        }
      }
    }
  }
  return 0;
}
