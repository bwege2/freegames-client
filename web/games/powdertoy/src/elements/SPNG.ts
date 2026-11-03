// simulation/elements/SPNG.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, ID, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, SC_SOLIDS, TYP, TYPE_SOLID } from '../sim/config.ts';
import {
  PT_CBNW, PT_CLST, PT_CO2, PT_DSTW, PT_FIRE, PT_FRZW, PT_PSTE, PT_SALT, PT_SLTW, PT_SPNG, PT_WATR, PT_WTRV,
} from '../sim/numbers.ts';

export function Element_SPNG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SPNG';
  el.Name = 'SPNG';
  el.Colour = 0xFFBE30;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = f(0.00);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.00);
  el.Loss = f(0.00);
  el.Collision = f(0.00);
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 31;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Sponge, absorbs water. Is not a moving solid.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 2730.0;
  el.HighTemperatureTransition = PT_FIRE; //@ SPNG -> FIRE

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const limit = 50;
  if (parts[i].life < limit && sim.pv[(y / CELL) | 0][(x / CELL) | 0] <= 3 && sim.pv[(y / CELL) | 0][(x / CELL) | 0] >= -3 && parts[i].temp <= 374.0) {
    const absorbChanceDenom = idiv(Math.imul(parts[i].life, 10000), limit) + 500;
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          switch (TYP(r)) {
            case PT_WATR:
            case PT_DSTW:
            case PT_FRZW:
              if (parts[i].life < limit && sim.rng.chance(500, absorbChanceDenom)) {
                parts[i].life++;
                sim.kill_part(ID(r));
              }
              break;
            case PT_SLTW:
              if (parts[i].life < limit && sim.rng.chance(50, absorbChanceDenom)) {
                parts[i].life++;
                if (sim.rng.chance(3, 4))
                  sim.kill_part(ID(r));
                else //@ SPNG + SLTW -> SPNG + SALT
                  sim.part_change_type(ID(r), x + rx, y + ry, PT_SALT);
              }
              break;
            case PT_CBNW:
              if (parts[i].life < limit && sim.rng.chance(100, absorbChanceDenom)) {
                parts[i].life++;
                //@ SPNG + CBNW -> SPNG + CO2
                sim.part_change_type(ID(r), x + rx, y + ry, PT_CO2);
              }
              break;
            case PT_PSTE:
              if (parts[i].life < limit && sim.rng.chance(20, absorbChanceDenom)) {
                parts[i].life++;
                //@ SPNG + PSTE -> SPNG + CLST
                sim.create_part(ID(r), x + rx, y + ry, PT_CLST);
              }
              break;
            default:
              continue;
          }
        }
      }
    }
  }
  else {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if ((!r) && parts[i].life >= 1)//if nothing then create water
          {
            //@ SPNG -> SPNG + WATR
            const np = sim.create_part(-1, x + rx, y + ry, PT_WATR);
            if (np > -1) parts[i].life--;
          }
        }
      }
    }
  }
  for (let trade = 0; trade < 9; trade++) {
    const rx = sim.rng.between(-2, 2);
    const ry = sim.rng.between(-2, 2);
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r)
        continue;
      if (TYP(r) === PT_SPNG && (parts[i].life > parts[ID(r)].life) && parts[i].life > 0)//diffusion
      {
        const tmp = parts[i].life - parts[ID(r)].life;
        if (tmp === 1) {
          parts[ID(r)].life++;
          parts[i].life--;
          trade = 9;
        }
        else if (tmp > 0) {
          parts[ID(r)].life += idiv(tmp, 2);
          parts[i].life -= idiv(tmp, 2);
          trade = 9;
        }
      }
    }
  }
  let tmp = 0;
  if (parts[i].life > 0) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_FIRE) {
            tmp++;
            if (parts[ID(r)].life > 60)
              parts[ID(r)].life -= idiv(parts[ID(r)].life, 60);
            else if (parts[ID(r)].life > 2)
              parts[ID(r)].life--;
          }
        }
      }
    }
  }
  if (tmp && parts[i].life > 3)
    parts[i].life -= idiv(parts[i].life, 3);
  if (tmp > 1)
    tmp = idiv(tmp, 2);
  if (tmp || parts[i].temp >= 374) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if ((!r) && parts[i].life >= 1)//if nothing then create steam
          {
            //@ SPNG -> SPNG + WTRV
            const np = sim.create_part(-1, x + rx, y + ry, PT_WTRV);
            if (np > -1) {
              parts[np].temp = parts[i].temp;
              tmp--;
              parts[i].life--;
              parts[i].temp = restrict_flt(f(parts[i].temp - 20.0), MIN_TEMP, MAX_TEMP);
            }
          }
        }
      }
    }
  }
  if (tmp > 0) {
    if (parts[i].life > tmp)
      parts[i].life -= tmp;
    else
      parts[i].life = 0;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.colr -= cpart.life * 15;
  g.colg -= cpart.life * 15;
  g.colb -= cpart.life * 15;
  if (g.colr <= 50)
    g.colr = 50;
  if (g.colg <= 50)
    g.colg = 50;
  if (g.colb <= 20)
    g.colb = 20;
  return 0;
}
