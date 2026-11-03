// simulation/elements/LCRY.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import { decorationDisabled, decorationEnabled } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NO_DECO, NT, SC_POWERED, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BGLA, PT_LCRY } from '../sim/numbers.ts';

export function Element_LCRY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LCRY';
  el.Name = 'LCRY';
  el.Colour = 0x505050;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
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
  el.Description = 'Liquid Crystal. Changes colour when charged. (PSCN Charges, NSCN Discharges)';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1273.0;
  el.HighTemperatureTransition = PT_BGLA; //@ LCRY -> BGLA

  el.Update = update;
  el.Graphics = graphics;
}

function update(_sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let check: number, setto: number;
  switch (parts[i].tmp) {
    case 1:
      if (parts[i].life <= 0)
        parts[i].tmp = 0;
      else {
        parts[i].life -= 2;
        if (parts[i].life < 0)
          parts[i].life = 0;
        parts[i].tmp2 = parts[i].life;
      }
    // fallthrough
    case 0:
      check = 3;
      setto = 1;
      break;
    case 2:
      if (parts[i].life >= 10)
        parts[i].tmp = 3;
      else {
        parts[i].life += 2;
        if (parts[i].life > 10)
          parts[i].life = 10;
        parts[i].tmp2 = parts[i].life;
      }
    // fallthrough
    case 3:
      check = 0;
      setto = 2;
      break;
    default:
      parts[i].tmp = 0;
      parts[i].life = 0;
      return 0;
  }
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_LCRY && parts[ID(r)].tmp === check) {
          parts[ID(r)].tmp = setto;
        }
      }
    }
  }
  return 0;
}

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let deco = false;
  if (gfctx.ren.decorationLevel !== decorationDisabled && cpart.dcolour && (cpart.dcolour & 0xFF000000)) {
    if (gfctx.ren.decorationLevel === decorationEnabled) // if blackDecorations is off, always show deco
      deco = true;
    else if (((cpart.dcolour >>> 24) & 0xFF) >= 250 && ((cpart.dcolour >>> 16) & 0xFF) <= 5 && ((cpart.dcolour >>> 8) & 0xFF) <= 5 && ((cpart.dcolour) & 0xFF) <= 5) // else only render black deco
      deco = true;
  }

  if (deco) {
    g.colr = (cpart.dcolour >>> 16) & 0xFF;
    g.colg = (cpart.dcolour >>> 8) & 0xFF;
    g.colb = (cpart.dcolour) & 0xFF;

    if (cpart.tmp2 < 10) {
      g.colr = (g.colr / (10 - cpart.tmp2)) | 0;
      g.colg = (g.colg / (10 - cpart.tmp2)) | 0;
      g.colb = (g.colb / (10 - cpart.tmp2)) | 0;
    }

  }
  else {
    g.colr = g.colg = g.colb = 0x50 + ((cpart.tmp2 > 10 ? 10 : cpart.tmp2) * 10);
  }
  g.pixel_mode |= NO_DECO;
  return 0;
}
