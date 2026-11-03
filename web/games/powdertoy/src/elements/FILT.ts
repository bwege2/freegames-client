// simulation/elements/FILT.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PMODE, PMODE_BLEND, PROP_LIFE_DEC, PROP_NOAMBHEAT, PROP_PHOTPASS, SC_SOLIDS,
  TYPE_SOLID,
} from '../sim/config.ts';

export function Element_FILT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FILT';
  el.Name = 'FILT';
  el.Colour = 0x000056;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Filter. Changes color of PHOT and BIZR. Color depends on temperature.';

  el.Properties = TYPE_SOLID | PROP_PHOTPASS | PROP_NOAMBHEAT | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Graphics = graphics;
  el.Create = create;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let x: number;
  const wl = Element_FILT_getWavelengths(cpart);
  g.colg = 0;
  g.colb = 0;
  g.colr = 0;
  for (x = 0; x < 12; x++) {
    g.colr += (wl >> (x + 18)) & 1;
    g.colb += (wl >> x) & 1;
  }
  for (x = 0; x < 12; x++)
    g.colg += (wl >> (x + 9)) & 1;
  x = (624 / (g.colr + g.colg + g.colb + 1)) | 0;
  if (cpart.life > 0 && cpart.life <= 4)
    g.cola = 127 + cpart.life * 30;
  else
    g.cola = 127;
  g.colr *= x;
  g.colg *= x;
  g.colb *= x;
  g.pixel_mode &= ~PMODE;
  g.pixel_mode |= PMODE_BLEND;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, v: number): void {
  sim.parts[i].tmp = v;
}

// Returns the wavelengths in a particle after FILT interacts with it (e.g. a photon)
// cpart is the FILT particle, origWl the original wavelengths in the interacting particle
export function Element_FILT_interactWavelengths(sim: Simulation, cpart: Particle, origWl: number): number {
  const mask = 0x3FFFFFFF;
  const filtWl = Element_FILT_getWavelengths(cpart);
  switch (cpart.tmp) {
    case 0:
      return filtWl; //Assign Colour
    case 1:
      return origWl & filtWl; //Filter Colour
    case 2:
      return origWl | filtWl; //Add Colour
    case 3:
      return origWl & (~filtWl); //Filter Colour the other way
    case 4:
    {
      let shift = itrunc(f(f(cpart.temp - f(273.0)) * f(0.025)));
      if (shift <= 0) shift = 1;
      return (origWl << shift) & mask; // red shift
    }
    case 5:
    {
      let shift = itrunc(f(f(cpart.temp - f(273.0)) * f(0.025)));
      if (shift <= 0) shift = 1;
      return (origWl >> shift) & mask; // blue shift
    }
    case 6:
      return origWl; // No change
    case 7:
      return origWl ^ filtWl; // XOR colours
    case 8:
      return (~origWl) & mask; // Invert colours
    case 9:
    {
      const t1 = (origWl & 0x0000FF) + sim.rng.between(-2, 2);
      const t2 = ((origWl & 0x00FF00) >> 8) + sim.rng.between(-2, 2);
      const t3 = ((origWl & 0xFF0000) >> 16) + sim.rng.between(-2, 2);
      return (origWl & 0xFF000000) | (t3 << 16) | (t2 << 8) | t1;
    }
    case 10:
    {
      const lsb = filtWl & (-filtWl);
      // long long product: its low 30 bits are those of the 32-bit product
      return Math.imul(origWl, lsb) & 0x3FFFFFFF; //red shift
    }
    case 11:
    {
      const lsb = filtWl & (-filtWl);
      // long long division (lsb == 0 is a division by zero in C++)
      return (Math.trunc(origWl / lsb) | 0) & 0x3FFFFFFF; // blue shift
    }
    default:
      return filtWl;
  }
}

export function Element_FILT_getWavelengths(cpart: Particle): number {
  if (cpart.ctype & 0x3FFFFFFF) {
    return cpart.ctype;
  }
  else {
    let temp_bin = itrunc(f(f(cpart.temp - f(273.0)) * f(0.025)));
    if (temp_bin < 0) temp_bin = 0;
    if (temp_bin > 25) temp_bin = 25;
    return (0x1F << temp_bin);
  }
}
