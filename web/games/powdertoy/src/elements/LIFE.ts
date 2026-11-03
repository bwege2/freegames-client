// simulation/elements/LIFE.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import { decorationAntiClickbait, decorationDisabled } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { Blue, Green, Red } from '../sim/colour.ts';
import { CFDS, IPH, IPL, ITH, ITL, NGOL, NO_DECO, NT, PROP_LIFE, SC_LIFE, TYPE_SOLID } from '../sim/config.ts';

export function Element_LIFE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LIFE';
  el.Name = 'LIFE';
  el.Colour = 0x0CAC00;
  el.MenuVisible = 0;
  el.MenuSection = SC_LIFE;
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
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = 9000.0;
  el.HeatConduct = 40;
  el.Description = 'Game Of Life! B3/S23';

  el.Properties = TYPE_SOLID | PROP_LIFE;

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

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const builtinGol = sd.builtinGol;
  let colour1 = cpart.dcolour & 0xFFFFFF;
  let colour2 = cpart.tmp & 0xFFFFFF;
  if (!cpart.dcolour) {
    colour1 = 0xFFFFFF;
  }
  let ruleset = cpart.ctype;
  let renderDeco = gfctx.ren.decorationLevel !== decorationAntiClickbait;
  if (ruleset >= 0 && ruleset < NGOL) {
    if (!renderDeco || gfctx.ren.decorationLevel === decorationDisabled) {
      colour1 = builtinGol[ruleset].colour;
      colour2 = builtinGol[ruleset].colour2;
      renderDeco = true;
    }
    ruleset = builtinGol[ruleset].ruleset;
  }
  if (renderDeco) {
    const states = ((ruleset >> 17) & 0xF) + 2;
    if (states === 2) {
      g.colr = Red(colour1);
      g.colg = Green(colour1);
      g.colb = Blue(colour1);
    }
    else {
      const mul = f(f(cpart.tmp2 - 1) / f(states - 2));
      g.colr = itrunc(f(f(Red(colour1) * mul) + f(Red(colour2) * f(1.0 - mul))));
      g.colg = itrunc(f(f(Green(colour1) * mul) + f(Green(colour2) * f(1.0 - mul))));
      g.colb = itrunc(f(f(Blue(colour1) * mul) + f(Blue(colour2) * f(1.0 - mul))));
    }
  }
  g.pixel_mode |= NO_DECO;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, v: number): void {
  const builtinGol = sd.builtinGol;
  if (v === -1)
    v = 0;
  // * 0x200000: No need to look for colours, they'll be set later anyway.
  const skipLookup = (v & 0x200000) !== 0;
  v &= 0x1FFFFF;
  sim.parts[i].ctype = v;
  if (v < NGOL) {
    sim.parts[i].dcolour = builtinGol[v].colour;
    sim.parts[i].tmp = builtinGol[v].colour2;
    v = builtinGol[v].ruleset;
  }
  else if (!skipLookup) {
    const cgol = sd.GetCustomGOLByRule(v);
    if (cgol) {
      sim.parts[i].dcolour = cgol.colour1;
      sim.parts[i].tmp = cgol.colour2;
    }
  }
  sim.parts[i].tmp2 = ((v >> 17) & 0xF) + 1;
}
