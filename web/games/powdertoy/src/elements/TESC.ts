// simulation/elements/TESC.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, SC_ELEC, TYPE_SOLID,
} from '../sim/config.ts';

export function Element_TESC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_TESC';
  el.Name = 'TESC';
  el.Colour = 0x707040;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
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
  el.Description = 'Tesla coil! Creates lightning when sparked.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Create = create;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, v: number): void {
  if (v >= 0) {
    sim.parts[i].tmp = v;
    if (sim.parts[i].tmp > 300)
      sim.parts[i].tmp = 300;
  }
}
