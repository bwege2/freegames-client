// simulation/elements/PQRT.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITL, NT, PROP_HOT_GLOW, PROP_PHOTPASS, SC_POWDERS, TYPE_PART,
} from '../sim/config.ts';
import { PT_LAVA } from '../sim/numbers.ts';
import { Element_QRTZ_graphics, Element_QRTZ_update } from '../elements/QRTZ.ts';

export function Element_PQRT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PQRT';
  el.Name = 'PQRT';
  el.Colour = 0x88BBBB; // 0x88BBBB_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.27);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 90;

  el.HeatConduct = 3;
  el.Description = 'Powdered quartz, broken form of QRTZ.';

  el.Properties = TYPE_PART | PROP_PHOTPASS | PROP_HOT_GLOW;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(2573.15);
  el.HighTemperatureTransition = PT_LAVA; //@ PQRT -> LAVA(QRTZ)

  el.Update = Element_QRTZ_update;
  el.Graphics = Element_QRTZ_graphics;
  el.Create = create;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].tmp2 = sim.rng.between(0, 10);
}
