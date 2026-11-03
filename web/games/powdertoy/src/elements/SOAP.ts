// simulation/elements/SOAP.cpp (+ SOAP.h)
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, EFFECT_LINES, IPH, IPL, ITH, ITL, NPART, NT, PMODE_BLUR, PROP_LIFE_DEC, PROP_NEUTPENETRATE, R_TEMP,
  SC_LIQUID, TYPE_GAS, TYPE_LIQUID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import { PT_GLAS, PT_OIL, PT_SOAP } from '../sim/numbers.ts';

/** void Element_SOAP_neighourLoop(float &dx, float &dy): d.dx and d.dy are the references */
export function Element_SOAP_neighourLoop(d: { dx: number; dy: number }): void {
  if (d.dx >= (XRES / 2 - CELL)) d.dx = f(d.dx - (XRES - 2 * CELL));
  if (d.dy >= (YRES / 2 - CELL)) d.dy = f(d.dy - (YRES - 2 * CELL));
  if (d.dx < -(XRES / 2 - CELL)) d.dx = f(d.dx + (XRES - 2 * CELL));
  if (d.dy < -(YRES / 2 - CELL)) d.dy = f(d.dy + (YRES - 2 * CELL));
}

export function Element_SOAP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SOAP';
  el.Name = 'SOAP';
  el.Colour = 0xF5F5DC; // 0xF5F5DC_rgb
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
  el.Description = 'Soap. Creates bubbles, washes off deco color, and cures virus.';

  el.Properties = TYPE_LIQUID | PROP_NEUTPENETRATE | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.tmp = -1;
  el.DefaultProperties.tmp2 = -1;

  el.Update = update;
  el.Graphics = graphics;
  el.ChangeType = changeType;
}

function validIndex(i: number): boolean {
  return i >= 0 && i < NPART;
}

export function Element_SOAP_detach(sim: Simulation, i: number): void {
  if ((sim.parts[i].ctype & 2) === 2 && validIndex(sim.parts[i].tmp) && sim.parts[sim.parts[i].tmp].type === PT_SOAP) {
    if ((sim.parts[sim.parts[i].tmp].ctype & 4) === 4)
      sim.parts[sim.parts[i].tmp].ctype ^= 4;
  }

  if ((sim.parts[i].ctype & 4) === 4 && validIndex(sim.parts[i].tmp2) && sim.parts[sim.parts[i].tmp2].type === PT_SOAP) {
    if ((sim.parts[sim.parts[i].tmp2].ctype & 2) === 2)
      sim.parts[sim.parts[i].tmp2].ctype ^= 2;
  }

  sim.parts[i].ctype = 0;
}

function attach(parts: Particle[], i1: number, i2: number): void {
  if (!(parts[i2].ctype & 4)) {
    parts[i1].ctype |= 2;
    parts[i1].tmp = i2;

    parts[i2].ctype |= 4;
    parts[i2].tmp2 = i1;
  }
  else if (!(parts[i2].ctype & 2)) {
    parts[i1].ctype |= 4;
    parts[i1].tmp2 = i2;

    parts[i2].ctype |= 2;
    parts[i2].tmp = i1;
  }
}

const FREEZING = f(248.15);
const BLEND = f(0.85);

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //0x01 - bubble on/off
  //0x02 - first mate yes/no
  //0x04 - "back" mate yes/no

  const elements = sd.elements;
  if (parts[i].ctype & 1) {
    // reset invalid SOAP links
    if (!validIndex(parts[i].tmp) || !validIndex(parts[i].tmp2)) {
      parts[i].tmp = parts[i].tmp2 = parts[i].ctype = 0;
      return 0;
    }
    if (parts[i].temp > FREEZING) {
      if (parts[i].life <= 0) {
        //if only connected on one side
        if ((parts[i].ctype & 6) !== 6 && (parts[i].ctype & 6)) {
          let target = i;
          //break entire bubble in a loop
          while ((parts[target].ctype & 6) !== 6 && (parts[target].ctype & 6) && parts[target].type === PT_SOAP) {
            if (parts[target].ctype & 2) {
              target = parts[target].tmp;
              if (!validIndex(target)) {
                break;
              }
              Element_SOAP_detach(sim, target);
            }
            if (parts[target].ctype & 4) {
              target = parts[target].tmp2;
              if (!validIndex(target)) {
                break;
              }
              Element_SOAP_detach(sim, target);
            }
          }
        }
        if ((parts[i].ctype & 6) !== 6)
          parts[i].ctype = 0;
        if (validIndex(parts[i].tmp) && (parts[i].ctype & 6) === 6 && (parts[parts[i].tmp].ctype & 6) === 6 && parts[parts[i].tmp].tmp === i)
          Element_SOAP_detach(sim, i);
      }
      parts[i].vy = f(f(parts[i].vy - f(0.1)) * 0.5);
      parts[i].vx = f(parts[i].vx * 0.5);
    }
    if (!(parts[i].ctype & 2)) {
      for (let rx = -2; rx <= 2; rx++) {
        for (let ry = -2; ry <= 2; ry++) {
          if (rx || ry) {
            const r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if ((parts[ID(r)].type === PT_SOAP) && (parts[ID(r)].ctype & 1) && !(parts[ID(r)].ctype & 4))
              attach(parts, i, ID(r));
          }
        }
      }
    }
    else {
      if (parts[i].life <= 0) {
        for (let rx = -2; rx <= 2; rx++) {
          for (let ry = -2; ry <= 2; ry++) {
            if (rx || ry) {
              const r = pmap[y + ry][x + rx];
              if (!r && !sim.bmap[idiv(y + ry, CELL)][idiv(x + rx, CELL)])
                continue;
              if (parts[i].temp > FREEZING) {
                if (sim.bmap[idiv(y + ry, CELL)][idiv(x + rx, CELL)]
                  || (r && !(elements[TYP(r)].Properties & TYPE_GAS)
                    && TYP(r) !== PT_SOAP && TYP(r) !== PT_GLAS)) {
                  Element_SOAP_detach(sim, i);
                  continue;
                }
              }
              if (TYP(r) === PT_SOAP) {
                if (parts[ID(r)].ctype === 1) {
                  const buf = parts[i].tmp;

                  parts[i].tmp = ID(r);
                  if (validIndex(buf) && parts[buf].type === PT_SOAP)
                    parts[buf].tmp2 = ID(r);
                  parts[ID(r)].tmp2 = i;
                  parts[ID(r)].tmp = buf;
                  parts[ID(r)].ctype = 7;
                }
                else if (parts[ID(r)].ctype === 7 && parts[i].tmp !== ID(r) && parts[i].tmp2 !== ID(r)) {
                  if (validIndex(parts[i].tmp) && parts[parts[i].tmp].type === PT_SOAP)
                    parts[parts[i].tmp].tmp2 = parts[ID(r)].tmp2;
                  if (validIndex(parts[ID(r)].tmp2) && parts[parts[ID(r)].tmp2].type === PT_SOAP)
                    parts[parts[ID(r)].tmp2].tmp = parts[i].tmp;
                  parts[ID(r)].tmp2 = i;
                  parts[i].tmp = ID(r);
                }
              }
            }
          }
        }
      }
    }
    if (parts[i].ctype & 2 && validIndex(parts[i].tmp)) {
      let d: number;
      const dd = { dx: 0, dy: 0 };
      dd.dx = f(parts[i].x - parts[parts[i].tmp].x);
      dd.dy = f(parts[i].y - parts[parts[i].tmp].y);
      Element_SOAP_neighourLoop(dd);
      // pow(float, 2) computes in double
      d = f(9 / (Math.pow(dd.dx, 2) + Math.pow(dd.dy, 2) + 9) - 0.5);
      parts[parts[i].tmp].vx = f(parts[parts[i].tmp].vx - f(dd.dx * d));
      parts[parts[i].tmp].vy = f(parts[parts[i].tmp].vy - f(dd.dy * d));
      parts[i].vx = f(parts[i].vx + f(dd.dx * d));
      parts[i].vy = f(parts[i].vy + f(dd.dy * d));
      if ((parts[parts[i].tmp].ctype & 2) && (parts[parts[i].tmp].ctype & 1)
        && validIndex(parts[parts[i].tmp].tmp)
        && (parts[parts[parts[i].tmp].tmp].ctype & 2) && (parts[parts[parts[i].tmp].tmp].ctype & 1)) {
        const ii = parts[parts[parts[i].tmp].tmp].tmp;
        if (validIndex(ii)) {
          dd.dx = f(parts[ii].x - parts[parts[i].tmp].x);
          dd.dy = f(parts[ii].y - parts[parts[i].tmp].y);
          Element_SOAP_neighourLoop(dd);
          d = f(81 / (Math.pow(dd.dx, 2) + Math.pow(dd.dy, 2) + 81) - 0.5);
          parts[parts[i].tmp].vx = f(parts[parts[i].tmp].vx - f(f(dd.dx * d) * 0.5));
          parts[parts[i].tmp].vy = f(parts[parts[i].tmp].vy - f(f(dd.dy * d) * 0.5));
          parts[ii].vx = f(parts[ii].vx + f(f(dd.dx * d) * 0.5));
          parts[ii].vy = f(parts[ii].vy + f(f(dd.dy * d) * 0.5));
        }
      }
    }
  }
  else {
    if (sim.pv[(y / CELL) | 0][(x / CELL) | 0] > 0.5 || sim.pv[(y / CELL) | 0][(x / CELL) | 0] < (-0.5)) {
      parts[i].ctype = 1;
      parts[i].life = 10;
    }

    //SOAP+OIL foam effect
    for (let rx = -2; rx < 3; rx++)
      for (let ry = -2; ry < 3; ry++)
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_OIL) {
            let ax: number, ay: number;
            const g = { x: 0, y: 0 };

            sim.GetGravityField(x, y, elements[PT_SOAP].Gravity, 1.0, g);

            ax = f(f(f(f(parts[i].vx - g.x) * 0.5) + parts[ID(r)].vx) / 2);
            ay = f(f(f(f(parts[i].vy - g.y) * 0.5) + parts[ID(r)].vy) / 2);
            parts[i].vx = parts[ID(r)].vx = ax;
            parts[i].vy = parts[ID(r)].vy = ay;
          }
        }
  }
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) !== PT_SOAP) {
          const tr = (parts[ID(r)].dcolour >>> 16) & 0xFF;
          const tg = (parts[ID(r)].dcolour >>> 8) & 0xFF;
          const tb = (parts[ID(r)].dcolour) & 0xFF;
          const ta = (parts[ID(r)].dcolour >>> 24) & 0xFF;
          const nr = itrunc(f(tr * BLEND));
          const ng = itrunc(f(tg * BLEND));
          const nb = itrunc(f(tb * BLEND));
          const na = itrunc(f(ta * BLEND));
          parts[ID(r)].dcolour = nr << 16 | ng << 8 | nb | na << 24;
        }
      }
    }
  }

  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.pixel_mode |= EFFECT_LINES | PMODE_BLUR;
  return 1;
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, from: number, to: number): void {
  if (from === PT_SOAP && to !== PT_SOAP) {
    Element_SOAP_detach(sim, i);
  }
}
