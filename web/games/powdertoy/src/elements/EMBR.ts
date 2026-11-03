// simulation/elements/EMBR.cpp
import { sd } from '../sim/simulationData.ts';
import { decorationDisabled, decorationEnabled, type Element, type GraphicsFuncContext, type Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PMODE_ADD, PMODE_BLEND, PMODE_FLAT, PMODE_GLOW, PMODE_SPARK, PROP_LIFE_DEC,
  PROP_LIFE_KILL, PROP_SPARKSETTLE, SC_EXPLOSIVE, TYPE_LIQUID, TYPE_PART, TYPE_SOLID, TYP,
} from '../sim/config.ts';

export function Element_EMBR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_EMBR';
  el.Name = 'EMBR';
  el.Colour = 0xFFF288; // 0xFFF288_rgb
  el.MenuVisible = 0;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.001) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.90);
  el.Collision = 0.0;
  el.Gravity = f(0.07);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 21;

  el.Weight = 30;

  el.DefaultProperties.temp = f(500.0 + f(273.15)); // 500.0f + 273.15f
  el.HeatConduct = 29;
  el.Description = 'Sparks. Formed by explosions.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC | PROP_LIFE_KILL | PROP_SPARKSETTLE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 50;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  _parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if ((elements[TYP(r)].Properties & (TYPE_SOLID | TYPE_PART | TYPE_LIQUID)) && !(elements[TYP(r)].Properties & PROP_SPARKSETTLE)) {
          sim.kill_part(i);
          return 1;
        }
      }
    }
  }
  return 0;
}

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.ctype & 0xFFFFFF) {
    let maxComponent: number;
    g.colr = (cpart.ctype & 0xFF0000) >> 16;
    g.colg = (cpart.ctype & 0x00FF00) >> 8;
    g.colb = (cpart.ctype & 0x0000FF);
    maxComponent = g.colr;

    if (g.colg > maxComponent) maxComponent = g.colg;
    if (g.colb > maxComponent) maxComponent = g.colb;
    if (maxComponent < 60)//make sure it isn't too dark to see
    {
      const multiplier = f(60.0 / maxComponent);
      g.colr = itrunc(f(g.colr * multiplier));
      g.colg = itrunc(f(g.colg * multiplier));
      g.colb = itrunc(f(g.colb * multiplier));
    }
  }
  else if (cpart.tmp !== 0) {
    g.colr = g.colg = g.colb = 255;
  }

  let deco = false;
  if (gfctx.ren.decorationLevel !== decorationDisabled && cpart.dcolour && (cpart.dcolour & 0xFF000000)) {
    if (gfctx.ren.decorationLevel === decorationEnabled) // if blackDecorations is off, always show deco
      deco = true;
    else if (((cpart.dcolour >>> 24) & 0xFF) >= 250 && ((cpart.dcolour >>> 16) & 0xFF) <= 5 && ((cpart.dcolour >>> 8) & 0xFF) <= 5 && ((cpart.dcolour) & 0xFF) <= 5) // else only render black deco
      deco = true;
  }
  if (deco) {
    const a = (cpart.dcolour >>> 24) & 0xFF;
    g.colr = (a * ((cpart.dcolour >>> 16) & 0xFF) + (255 - a) * g.colr) >> 8;
    g.colg = (a * ((cpart.dcolour >>> 8) & 0xFF) + (255 - a) * g.colg) >> 8;
    g.colb = (a * ((cpart.dcolour) & 0xFF) + (255 - a) * g.colb) >> 8;
  }
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;
  if (cpart.tmp === 1) {
    g.pixel_mode = FIRE_ADD | PMODE_BLEND | PMODE_GLOW;
    g.firea = (cpart.life - 15) * 4;
    g.cola = (cpart.life + 15) * 4;
  }
  else if (cpart.tmp === 2) {
    g.pixel_mode = PMODE_FLAT | FIRE_ADD;
    g.firea = 255;
  }
  else {
    g.pixel_mode = PMODE_SPARK | PMODE_ADD;
    if (cpart.life < 64) g.cola = 4 * cpart.life;
  }
  return 0;
}
