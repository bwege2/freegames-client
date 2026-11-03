// simulation/elements/DSTW.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, NT, PROP_NEUTPASS, PROP_PHOTPASS, R_TEMP, SC_LIQUID, TYP, TYPE_LIQUID } from '../sim/config.ts';
import { PT_BASE, PT_FIRE, PT_ICEI, PT_LRBD, PT_RBDM, PT_SALT, PT_SLTW, PT_SMKE, PT_WATR, PT_WTRV } from '../sim/numbers.ts';

export function Element_DSTW(el: Element): void {
  el.Identifier = "DEFAULT_PT_DSTW";
  el.Name = "DSTW";
  el.Colour = 0x1020C0;
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
  el.HeatConduct = 23;
  el.Description = "Distilled water, does not conduct electricity.";

  el.Properties = TYPE_LIQUID | PROP_NEUTPASS | PROP_PHOTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = f(273.15);
  el.LowTemperatureTransition = PT_ICEI; //@ DSTW -> ICEI(DSTW)
  el.HighTemperature = 373.0;
  el.HighTemperatureTransition = PT_WTRV; //@ DSTW -> WTRV

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
          if (sim.rng.chance(1, 50))
          {
            //@ DSTW + SALT -> 2xSLTW
            sim.part_change_type(i,x,y,PT_SLTW);
            // on average, convert 3 DSTW to SLTW before SALT turns into SLTW
            if (sim.rng.chance(1, 3))
              sim.part_change_type(ID(r),x+rx,y+ry,PT_SLTW);
          }
          break;
        case PT_SLTW:
          if (sim.rng.chance(1, 2000))
          {
            //@ DSTW + SLTW -> 2xSLTW
            sim.part_change_type(i,x,y,PT_SLTW);
            break;
          }
          // falls through
        case PT_WATR:
          if (sim.rng.chance(1, 100))
          {
            //@ DSTW + WATR -> 2xWATR
            sim.part_change_type(i,x,y,PT_WATR);
          }
          break;
        case PT_RBDM:
        case PT_LRBD:
          if ((sim.legacy_enable||parts[i].temp>12.0) && sim.rng.chance(1, 100))
          {
            //@ DSTW + RBDM/LRBD -> FIRE + RBDM/LRBD
            sim.part_change_type(i,x,y,PT_FIRE);
            parts[i].life = 4;
          }
          break;
        case PT_FIRE:
          sim.kill_part(ID(r));
          if (sim.rng.chance(1, 30))
          {
            sim.kill_part(i);
            return 1;
          }
          break;
        case PT_SMKE:
          if (parts[ID(r)].temp > f(40 + f(273.15)) && parts[ID(r)].temp < f(60 + f(273.15)) &&
            parts[i].temp > f(40 + f(273.15)) && parts[i].temp < f(60 + f(273.15)))
          {
            if (sim.rng.chance(1, 100))
            {
              //@ DSTW + SMKE -> BASE
              sim.part_change_type(i,x,y,PT_BASE);
              parts[i].life = 1;
              sim.kill_part(ID(r));
            }
          }
          break;
        default:
          continue;
        }
      }
    }
  }
  return 0;
}
