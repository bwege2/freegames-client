// simulation/elements/BCOL.cpp
import type { Element } from '../sim/element.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_POWDERS, TYPE_PART } from '../sim/config.ts';
import { Element_COAL_graphics, Element_COAL_update } from './COAL.ts';

export function Element_BCOL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BCOL';
  el.Name = 'BCOL';
  el.Colour = 0x333333;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWDERS;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.94);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.3);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;
  el.PhotonReflectWavelengths = 0x00000000;

  el.Weight = 90;

  el.HeatConduct = 150;
  el.Description = 'Broken Coal. Heavy particles, burns slowly.';

  el.Properties = TYPE_PART;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 110;

  el.Update = Element_COAL_update;
  el.Graphics = Element_COAL_graphics;
}
