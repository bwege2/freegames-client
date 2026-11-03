// simulation/elements/VOID.cpp
import { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_SPECIAL, TYPE_SOLID } from '../sim/config.ts';

export function Element_VOID(el: Element): void {
  el.Identifier = "DEFAULT_PT_VOID";
  el.Name = "VOID";
  el.Colour = 0x790B0B;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(f(-0.0003) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "Hole, will drain away any particles.";

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;
  el.CtypeDraw = Element.basicCtypeDraw;
}
