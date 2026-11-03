// simulation/elements/THDR.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MIN_PRESSURE, NT, PROP_CONDUCTS, SC_EXPLOSIVE, TYP, TYPE_PART } from '../sim/config.ts';
import { PT_CLNE, PT_DMND, PT_FIRE, PT_SLTW, PT_SPRK, PT_THDR, PT_WATR } from '../sim/numbers.ts';

export function Element_THDR(el: Element): void {
  el.Identifier = "DEFAULT_PT_THDR";
  el.Name = "THDR";
  el.Colour = 0xFFFFA0;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.0;
  el.Loss = f(0.30);
  el.Collision = f(-0.99);
  el.Gravity = f(0.6);
  el.Diffusion = f(0.62);
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 1;

  el.DefaultProperties.temp = f(9000.0 + f(273.15));
  el.HeatConduct = 1;
  el.Description = "Lightning! Very hot, inflicts damage upon most materials, and transfers current to metals.";

  el.Properties = TYPE_PART;

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
  const elements = sd.elements;
  let kill=false;
  for (let rx = -2; rx <= 2; rx++)
  {
    for (let ry = -2; ry <= 2; ry++)
    {
      if (rx || ry)
      {
        const r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if ((elements[TYP(r)].Properties&PROP_CONDUCTS) && parts[ID(r)].life==0 && !(rt==PT_WATR||rt==PT_SLTW) && parts[ID(r)].ctype!=PT_SPRK)
        {
          parts[ID(r)].ctype = parts[ID(r)].type;
          sim.part_change_type(ID(r),x+rx,y+ry,PT_SPRK);
          parts[ID(r)].life = 4;
          kill=true;
        }
        else if (rt!=PT_CLNE&&rt!=PT_THDR&&rt!=PT_SPRK&&rt!=PT_DMND&&rt!=PT_FIRE)
        {
          sim.pv[(y/CELL) | 0][(x/CELL) | 0] = restrict_flt(f(sim.pv[(y/CELL) | 0][(x/CELL) | 0] + 100.0), MIN_PRESSURE, MAX_PRESSURE);
          if (sim.legacy_enable && sim.rng.chance(1, 200))
          {
            //@ THDR -> FIRE
            parts[i].life = sim.rng.between(120, 169);
            sim.part_change_type(i,x,y,PT_FIRE);
          }
          else
            kill=true;
        }
      }
    }
  }
  if (kill) {
    sim.kill_part(i);
    return 1;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 160;
  g.fireg = 192;
  g.fireb = 255;
  g.firer = 144;
  g.pixel_mode |= FIRE_ADD;
  return 1;
}
