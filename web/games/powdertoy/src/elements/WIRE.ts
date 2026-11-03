// simulation/elements/WIRE.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, IPH, IPL, ITH, ITL, NT, SC_ELEC, TYPE_SOLID, TYP, ID } from '../sim/config.ts';
import { PT_NSCN, PT_PSCN, PT_SPRK, PT_WIRE } from '../sim/numbers.ts';

export function Element_WIRE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_WIRE';
  el.Name = 'WWLD';
  el.Colour = 0xFFCC00; // 0xFFCC00_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.00);
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

  el.HeatConduct = 250;
  el.Description = 'WireWorld wires, conducts based on a set of GOL-like rules.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let count = 0;
  /*
    0:  wire
    1:  spark head
    2:  spark tail

    tmp is previous state, ctype is current state
  */
  //parts[i].tmp=parts[i].ctype;
  parts[i].ctype = 0;
  if (parts[i].tmp === 1) {
    parts[i].ctype = 2;
  }
  else if (parts[i].tmp === 2) {
    parts[i].ctype = 0;
  }
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK && parts[ID(r)].life === 3 && parts[ID(r)].ctype === PT_PSCN) {
          parts[i].ctype = 1;
          return 0;
        }
        else if (TYP(r) === PT_NSCN && parts[i].tmp === 1)
          sim.create_part(-1, x + rx, y + ry, PT_SPRK);
        else if (TYP(r) === PT_WIRE && parts[ID(r)].tmp === 1 && !parts[i].tmp)
          count++;
      }
    }
  }
  if (count === 1 || count === 2)
    parts[i].ctype = 1;
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.ctype === 0) {
    g.colr = 255;
    g.colg = 204;
    g.colb = 0;
    return 0;
  }
  if (cpart.ctype === 1) {
    g.colr = 50;
    g.colg = 100;
    g.colb = 255;
    //*pixel_mode |= PMODE_GLOW;
    return 0;
  }
  if (cpart.ctype === 2) {
    g.colr = 255;
    g.colg = 100;
    g.colb = 50;
    //*pixel_mode |= PMODE_GLOW;
    return 0;
  }
  return 0;
}
