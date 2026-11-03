// simulation/elements/LRBD.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, R_TEMP, SC_EXPLOSIVE, TYPE_LIQUID } from '../sim/config.ts';
import { PT_FIRE, PT_RBDM } from '../sim/numbers.ts';

export function Element_LRBD(el: Element): void {
  el.Identifier = "DEFAULT_PT_LRBD";
  el.Name = "LRBD";
  el.Colour = 0xAAAAAA;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.3);
  el.AirDrag = f(f(0.02) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.80);
  el.Collision = 0.0;
  el.Gravity = f(0.15);
  el.Diffusion = 0.00;
  el.HotAir = f(f(0.000001) * CFDS);
  el.Falldown = 2;

  el.Flammable = 1000;
  el.Explosive = 1;
  el.Meltable = 0;
  el.Hardness = 2;

  el.Weight = 45;

  el.DefaultProperties.temp = f(f(R_TEMP + 45.0) + f(273.15));
  el.HeatConduct = 170;
  el.Description = "Liquid Rubidium.";

  el.Properties = TYPE_LIQUID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 311.0;
  el.LowTemperatureTransition = PT_RBDM; //@ LRBD -> RBDM
  el.HighTemperature = 961.0;
  el.HighTemperatureTransition = PT_FIRE; //@ LRBD -> FIRE
}
