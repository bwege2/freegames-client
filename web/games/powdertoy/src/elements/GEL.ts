// simulation/elements/GEL.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, NT, PMODE_BLUR, PROP_LIFE_DEC, PROP_NEUTPENETRATE, R_TEMP, SC_LIQUID, TYPE_LIQUID,
  TYPE_PART, TYP, ID,
} from '../sim/config.ts';
import {
  PT_BASE, PT_CBNW, PT_CLST, PT_CO2, PT_DSTW, PT_FRZW, PT_GEL, PT_GOO, PT_PSTE, PT_SALT, PT_SLTW, PT_SPNG, PT_WATR,
} from '../sim/numbers.ts';

export function Element_GEL(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GEL';
  el.Name = 'GEL';
  el.Colour = 0xFF9900; // 0xFF9900_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 19;

  el.Weight = 35;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15)); // R_TEMP - 2.0f + 273.15f
  el.HeatConduct = 29;
  el.Description = 'A liquid with variable viscosity and heat conductivity. Absorbs water.';

  el.Properties = TYPE_LIQUID | PROP_LIFE_DEC | PROP_NEUTPENETRATE;

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
  if (parts[i].tmp > 100)
    parts[i].tmp = 100;
  if (parts[i].tmp < 0)
    parts[i].tmp = 0;
  const absorbChanceDenom = parts[i].tmp * 10 + 500;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        let gel = false;
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        //Desaturation
        switch (rt) {
          case PT_WATR:
          case PT_DSTW:
          case PT_FRZW:
            if (parts[i].tmp < 100 && sim.rng.chance(500, absorbChanceDenom)) {
              parts[i].tmp++;
              sim.kill_part(ID(r));
            }
            break;
          case PT_PSTE:
            if (parts[i].tmp < 100 && sim.rng.chance(20, absorbChanceDenom)) {
              parts[i].tmp++;
              //@ GEL + PSTE -> GEL + CLST
              sim.create_part(ID(r), x + rx, y + ry, PT_CLST);
            }
            break;
          case PT_SLTW:
            if (parts[i].tmp < 100 && sim.rng.chance(50, absorbChanceDenom)) {
              parts[i].tmp++;
              //@ GEL + SLTW -> GEL + SALT
              if (sim.rng.chance(3, 4))
                sim.kill_part(ID(r));
              else
                sim.part_change_type(ID(r), x + rx, y + ry, PT_SALT);
            }
            break;
          case PT_CBNW:
            if (parts[i].tmp < 100 && sim.rng.chance(100, absorbChanceDenom)) {
              parts[i].tmp++;
              //@ GEL + CBNW -> GEL + CO2
              sim.part_change_type(ID(r), x + rx, y + ry, PT_CO2);
            }
            break;
          case PT_SPNG:
            // Concentration diffusion
            if (parts[ID(r)].life > 0 && parts[i].tmp < 100 && ((parts[ID(r)].life + 1) > parts[i].tmp)) {
              // SPNG -> GEL
              parts[ID(r)].life--;
              parts[i].tmp++;
            }
            else if (parts[i].tmp > 0 && (parts[ID(r)].life + 1) < parts[i].tmp) {
              // SPNG <- GEL (saturation limit of SPNG is ignored here)
              parts[ID(r)].life++;
              parts[i].tmp--;
            }
            break;
          case PT_GEL:
            if ((parts[ID(r)].tmp + 1) < parts[i].tmp) {
              parts[ID(r)].tmp++;
              parts[i].tmp--;
            }
            gel = true;
            break;
          case PT_BASE:
            // Base absorbs water from gel
            if (parts[i].tmp > 0 && parts[ID(r)].life > 1) {
              // BASE <- GEL
              parts[ID(r)].life--;
              parts[i].tmp--;
            }
            break;
          default:
            break;
        }
        let dx: number, dy: number;
        dx = f(parts[i].x - parts[ID(r)].x);
        dy = f(parts[i].y - parts[ID(r)].y);

        //Stickiness
        if (f(f(dx * dx) + f(dy * dy)) > 1.5 && (gel || !elements[rt].Falldown || (Math.abs(rx) < 2 && Math.abs(ry) < 2))) {
          let per: number;
          const nd = f(f(f(dx * dx) + f(dy * dy)) - 0.5);
          // 1 - tmp/100 is int arithmetic; nd/(...) is float, - 0.5 promotes to double
          per = f(5 * (1 - idiv(parts[i].tmp, 100)) * (f(nd / f(f(f(dx * dx) + f(dy * dy)) + nd)) - 0.5));
          if (elements[rt].Properties & TYPE_LIQUID)
            per = f(per * f(0.1));
          dx = f(dx * per); dy = f(dy * per);
          parts[i].vx = f(parts[i].vx + dx);
          parts[i].vy = f(parts[i].vy + dy);
          if ((elements[rt].Properties & TYPE_PART) || rt === PT_GOO) {
            parts[ID(r)].vx = f(parts[ID(r)].vx - dx);
            parts[ID(r)].vy = f(parts[ID(r)].vy - dy);
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const q = cpart.tmp;
  g.colr = idiv(q * (32 - 255), 120) + 255;
  g.colg = idiv(q * (48 - 186), 120) + 186;
  g.colb = idiv(q * 208, 120);
  g.pixel_mode |= PMODE_BLUR;
  return 0;
}
