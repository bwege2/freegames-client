// simulation/elements/PVOD.cpp
import { Element } from '../sim/element.ts';
import type { GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, SC_POWERED, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_NSCN, PT_PSCN, PT_PVOD, PT_SPRK } from '../sim/numbers.ts';

export function Element_PVOD(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PVOD';
  el.Name = 'PVOD';
  el.Colour = 0x792020;
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
  el.Description = 'Powered VOID. When activated, destroys entering particles.';

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
  el.Update = update;
  el.Graphics = graphics;
}

function update(_sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life > 0 && parts[i].life !== 10)
    parts[i].life--;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK) {
          if (parts[ID(r)].life > 0 && parts[ID(r)].life < 4) {
            if (parts[ID(r)].ctype === PT_PSCN)
              parts[i].life = 10;
            else if (parts[ID(r)].ctype === PT_NSCN)
              parts[i].life = 9;
          }
        }
        else if (TYP(r) === PT_PVOD) {
          if (parts[i].life === 10 && parts[ID(r)].life < 10 && parts[ID(r)].life > 0)
            parts[i].life = 9;
          else if (parts[i].life === 0 && parts[ID(r)].life === 10)
            parts[i].life = 10;
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const lifemod = ((cpart.life > 10 ? 10 : cpart.life) * 16);
  g.colr += lifemod;
  return 0;
}
