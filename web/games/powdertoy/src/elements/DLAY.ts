// simulation/elements/DLAY.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, SC_POWERED, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_DLAY, PT_INSL, PT_NSCN, PT_PSCN, PT_RSSS, PT_SPRK } from '../sim/numbers.ts';

export function Element_DLAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DLAY';
  el.Name = 'DLAY';
  el.Colour = 0x753590;
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

  el.DefaultProperties.temp = f(4.0 + f(273.15));
  el.HeatConduct = 0;
  el.Description = 'Conducts with temperature-dependent delay. (use HEAT/COOL).';

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
  const oldl = parts[i].life;
  if (parts[i].life > 0)
    parts[i].life--;
  if (parts[i].temp <= f(1.0 + f(273.15)))
    parts[i].temp = f(1.0 + f(273.15));
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const pavg = sim.parts_avg(ID(r), i, PT_INSL);
        if (pavg === PT_INSL || pavg === PT_RSSS)
          continue;
        if (TYP(r) === PT_SPRK && parts[i].life === 0 && parts[ID(r)].life > 0 && parts[ID(r)].life < 4 && parts[ID(r)].ctype === PT_PSCN) {
          parts[i].life = itrunc(f(f(parts[i].temp - f(273.15)) + 0.5));
        }
        else if (TYP(r) === PT_DLAY) {
          if (!parts[i].life) {
            if (parts[ID(r)].life) {
              parts[i].life = parts[ID(r)].life;
              if ((ID(r)) > i) //If the other particle hasn't been life updated
                parts[i].life--;
            }
          }
          else if (!parts[ID(r)].life) {
            parts[ID(r)].life = parts[i].life;
            if ((ID(r)) > i) //If the other particle hasn't been life updated
              parts[ID(r)].life++;
          }
        }
        else if (TYP(r) === PT_NSCN && oldl === 1) {
          sim.create_part(-1, x + rx, y + ry, PT_SPRK);
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  // (float)life / (temp - 273.15) is a double division (273.15 is a double), * 100.0f stays double
  const stage = itrunc((f(cpart.life) / (cpart.temp - 273.15)) * 100.0);
  g.colr += stage;
  g.colg += stage;
  g.colb += stage;
  return 0;
}
