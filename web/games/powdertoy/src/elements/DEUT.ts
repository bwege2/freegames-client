// simulation/elements/DEUT.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITH, ITL, NT, PMODE_BLUR, PMODE_GLOW, PROP_NEUTPASS, R_TEMP, SC_NUCLEAR, TYP,
  TYPE_LIQUID, XCELLS,
} from '../sim/config.ts';
import { PT_DEUT } from '../sim/numbers.ts';

export function Element_DEUT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DEUT';
  el.Name = 'DEUT';
  el.Colour = 0x00153F;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 19;

  el.Weight = 31;

  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));
  el.HeatConduct = 251;
  el.Description = 'Deuterium oxide. Gets more concentrated when cold, explodes with neutrons or protons.';

  el.Properties = TYPE_LIQUID | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 10;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const cell = ((y / CELL) | 0) * XCELLS + ((x / CELL) | 0);
  const gravtot = f(Math.abs(sim.gravOut.forceX[cell]) +
    Math.abs(sim.gravOut.forceY[cell]));
  // Prevent division by 0
  const tp1 = f(parts[i].temp + 1);
  const temp = f((1.0 < tp1) ? tp1 : 1.0); // std::max(1.0f, (parts[i].temp + 1))
  let maxlife = itrunc(f(f(10000 / f(temp + 1)) - 1));
  if (sim.rng.chance(10000 % itrunc(f(temp + 1)), itrunc(f(temp + 1))))
    maxlife++;
  // Compress when Newtonian gravity is applied
  // multiplier=1 when gravtot=0, multiplier -> 5 as gravtot -> inf
  maxlife = Math.imul(maxlife, itrunc(f(f(5.0) - f(f(8.0) / f(gravtot + f(2.0))))));
  if (parts[i].life < maxlife) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r || (parts[i].life >= maxlife))
            continue;
          if (TYP(r) === PT_DEUT && sim.rng.chance(1, 3)) {
            // If neighbour life+1 fits in the free capacity for this particle, absorb neighbour
            // Condition is written in this way so that large neighbour life values don't cause integer overflow
            if (parts[ID(r)].life <= (maxlife - parts[i].life - 1 | 0)) {
              parts[i].life += parts[ID(r)].life + 1;
              sim.kill_part(ID(r));
            }
          }
        }
      }
    }
  }
  else {
    const tryExpand = (): void => {
      for (let rx = -1; rx <= 1; rx++) {
        for (let ry = -1; ry <= 1; ry++) {
          if (rx || ry) {
            //Leave if there is nothing to do
            if (parts[i].life <= maxlife) {
              return;
            }
            const r = pmap[y + ry][x + rx];
            if ((!r) && parts[i].life >= 1)//if nothing then create deut
            {
              const np = sim.create_part(-1, x + rx, y + ry, PT_DEUT);
              if (np < 0) continue;
              parts[i].life--;
              parts[np].temp = parts[i].temp;
              parts[np].life = 0;
            }
          }
        }
      }
    };
    tryExpand();
  }
  for (let trade = 0; trade < 4; trade++) {
    const rx = sim.rng.between(-2, 2);
    const ry = sim.rng.between(-2, 2);
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r)
        continue;
      if (TYP(r) === PT_DEUT && (parts[i].life > parts[ID(r)].life) && parts[i].life > 0)//diffusion
      {
        const temp = parts[i].life - parts[ID(r)].life | 0;
        if (temp === 1) {
          parts[ID(r)].life++;
          parts[i].life--;
        }
        else if (temp > 0) {
          parts[ID(r)].life += (temp / 2) | 0;
          parts[i].life -= (temp / 2) | 0;
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life >= 240) {
    g.firea = 60;
    g.firer = g.colr += 255;
    g.fireg = g.colg += 255;
    g.fireb = g.colb += 255;
    g.pixel_mode |= PMODE_GLOW | FIRE_ADD;
  }
  else if (cpart.life > 0) {
    g.colr += cpart.life * 1;
    g.colg += cpart.life * 2;
    g.colb += cpart.life * 3;
    g.pixel_mode |= PMODE_BLUR;
  }
  else {
    g.pixel_mode |= PMODE_BLUR;
  }
  return 0;
}
