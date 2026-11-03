// simulation/elements/VIBR.cpp (+ VIBR.h)
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_BLEND, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PMODE_NONE, PROP_CONDUCTS, PROP_LIFE_DEC,
  SC_NUCLEAR, TYPE_SOLID, TYP, ID,
} from '../sim/config.ts';
import {
  PT_ANAR, PT_BREC, PT_BVBR, PT_CFLM, PT_ELEC, PT_EXOT, PT_PHOT, PT_SPRK, PT_VIBR,
} from '../sim/numbers.ts';

export function Element_VIBR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VIBR';
  el.Name = 'VIBR';
  el.Colour = 0x005000; // 0x005000_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.85);
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

  el.DefaultProperties.temp = f(273.15);
  el.HeatConduct = 251;
  el.Description = 'Vibranium. Stores energy and releases it in violent explosions.';

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = Element_VIBR_update;
  el.Graphics = Element_VIBR_graphics;
}

const orbit_rx = [-1, 0, 1, 1, 1, 0, -1, -1];
const orbit_ry = [-1, -1, -1, 0, 1, 1, 1, 0];

export function Element_VIBR_update(sim: Simulation, i: number, x: number, y: number, _surround_space: number,
  _nt: number, parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
  let rndstore = 0;
  if (!parts[i].life) //if not exploding
  {
    //Heat absorption code
    if (parts[i].temp > f(274.65)) {
      parts[i].tmp++;
      parts[i].temp = f(parts[i].temp - 3);
    }
    else if (parts[i].temp < f(271.65)) {
      parts[i].tmp--;
      parts[i].temp = f(parts[i].temp + 3);
    }
    //Pressure absorption code
    if (sim.pv[cy][cx] > 2.5) {
      parts[i].tmp += 7;
      sim.pv[cy][cx] = f(sim.pv[cy][cx] - 1);
    }
    else if (sim.pv[cy][cx] < -2.5) {
      parts[i].tmp -= 2;
      sim.pv[cy][cx] = f(sim.pv[cy][cx] + 1);
    }
    //initiate explosion counter
    if (parts[i].tmp > 1000)
      parts[i].life = 750;
  }
  else //if it is exploding
  {
    //Release sparks before explode
    rndstore = sim.rng.gen();
    if (parts[i].life < 300) {
      const rx = orbit_rx[rndstore & 7];
      const ry = orbit_ry[rndstore & 7];
      rndstore = rndstore >> 3;
      const r = pmap[y + ry][x + rx];
      if (TYP(r) && TYP(r) !== PT_BREC && (elements[TYP(r)].Properties & PROP_CONDUCTS) && !parts[ID(r)].life) {
        parts[ID(r)].life = 4;
        parts[ID(r)].ctype = TYP(r);
        sim.part_change_type(ID(r), x + rx, y + ry, PT_SPRK);
      }
    }
    //Release all heat
    if (parts[i].life < 500) {
      const rx = rndstore % 7 - 3;
      const ry = (rndstore >> 3) % 7 - 3;
      const r = pmap[y + ry][x + rx];
      if (TYP(r) && TYP(r) !== PT_VIBR && TYP(r) !== PT_BVBR && (!sd.IsHeatInsulator(parts[ID(r)]))) {
        parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + f(parts[i].tmp * 3)), MIN_TEMP, MAX_TEMP);
        parts[i].tmp = 0;
      }
    }
    //Explosion code
    if (parts[i].life === 1) {
      if (!parts[i].tmp2) {
        //@ VIBR/BVBR -> EXOT + ELEC + PHOT + BREC
        rndstore = sim.rng.gen();
        let index = sim.create_part(-3, x + (orbit_rx[rndstore & 7]), y + (orbit_ry[rndstore & 7]), PT_ELEC);
        if (index !== -1)
          parts[index].temp = 7000;
        index = sim.create_part(-3, x + (orbit_rx[(rndstore >> 3) & 7]), y + (orbit_ry[(rndstore >> 3) & 7]), PT_PHOT);
        if (index !== -1)
          parts[index].temp = 7000;
        index = sim.create_part(-1, x + (orbit_rx[(rndstore >> 6) & 7]), y + (orbit_ry[(rndstore >> 6) & 7]), PT_BREC);
        if (index !== -1)
          parts[index].temp = 7000;
        sim.create_part(i, x, y, PT_EXOT);
        parts[i].tmp2 = (rndstore >> 9) % 1000;
        parts[i].temp = 9000;
        sim.pv[cy][cx] = f(sim.pv[cy][cx] + 50);

        return 1;
      }
      else {
        parts[i].tmp2 = 0;
        parts[i].temp = f(273.15);
        parts[i].tmp = 0;
      }
    }
  }
  //Neighbor check loop
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (parts[i].life) {
          //Makes EXOT around it get tmp to start exploding too
          if ((TYP(r) === PT_VIBR || TYP(r) === PT_BVBR)) {
            if (!parts[ID(r)].life)
              parts[ID(r)].tmp += 45;
            else if (parts[i].tmp2 && parts[i].life > 75 && sim.rng.chance(1, 2)) {
              parts[ID(r)].tmp2 = 1;
              parts[i].tmp = 0;
            }
          }
          else if (TYP(r) === PT_CFLM) {
            parts[i].tmp2 = 1;
            parts[i].tmp = 0;
          }
        }
        else {
          //Melts into EXOT
          if (TYP(r) === PT_EXOT && sim.rng.chance(1, 25)) {
            //@ VIBR/BVBR + EXOT -> 2xEXOT
            sim.part_change_type(i, x, y, PT_EXOT);
            return 1;
          }
        }
        //@ VIBR + ANAR -> BVBR
        if (parts[i].type !== PT_BVBR && TYP(r) === PT_ANAR) {
          sim.part_change_type(i, x, y, PT_BVBR);
          sim.pv[cy][cx] = f(sim.pv[cy][cx] - 1);
        }
      }
    }
  }
  for (let trade = 0; trade < 9; trade++) {
    if (!(trade % 2))
      rndstore = sim.rng.gen();
    const rx = rndstore % 7 - 3;
    rndstore >>= 3;
    const ry = rndstore % 7 - 3;
    rndstore >>= 3;
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (TYP(r) !== PT_VIBR && TYP(r) !== PT_BVBR)
        continue;
      if (parts[i].tmp > parts[ID(r)].tmp) {
        const transfer = parts[i].tmp - parts[ID(r)].tmp;
        parts[ID(r)].tmp += idiv(transfer, 2);
        parts[i].tmp -= idiv(transfer, 2);
        break;
      }
    }
  }
  parts[i].tmp = Math.min(Math.max(parts[i].tmp, 0), 1 << 15);
  return 0;
}

// exp() and sin() of a float: the C library's double functions (the float is promoted)
export function Element_VIBR_graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const gradient = idiv(cpart.tmp, 10);
  if (gradient >= 100 || cpart.life) {
    g.colr = itrunc(Math.abs(Math.sin(Math.exp(f(f(750.0 - cpart.life) / 170)))) * 200.0);
    if (cpart.tmp2) {
      g.colg = g.colr;
      g.colb = 255;
    }
    else {
      g.colg = 255;
      g.colb = g.colr;
    }

    g.firea = 90;
    g.firer = g.colr;
    g.fireg = g.colg;
    g.fireb = g.colb;
    g.pixel_mode = PMODE_NONE;
    g.pixel_mode |= FIRE_BLEND;
  }
  else if (gradient < 100) {
    g.colr += itrunc(restrict_flt(f(gradient * 2.0), 0, 255));
    g.colg += itrunc(restrict_flt(f(gradient * 2.0), 0, 175));
    g.colb += itrunc(restrict_flt(f(gradient * 2.0), 0, 255));
    g.firea = itrunc(restrict_flt(f(gradient * f(.6)), 0, 60));
    g.firer = idiv(g.colr, 2);
    g.fireg = idiv(g.colg, 2);
    g.fireb = idiv(g.colb, 2);
    g.pixel_mode |= FIRE_BLEND;
  }
  return 0;
}
