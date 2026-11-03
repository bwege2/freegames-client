// simulation/elements/DMG.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, IPH, IPL, ITH, ITL, NT, PMODE_FLARE, PROP_SPARKSETTLE, PT_NUM, R_TEMP, SC_FORCE, TYPE_PART, XRES, YRES,
  TYP, ID,
} from '../sim/config.ts';
import {
  PT_BCLN, PT_BCOL, PT_BGLA, PT_BMTL, PT_BRMT, PT_CLNE, PT_COAL, PT_DMG, PT_DMND, PT_EMBR, PT_GLAS, PT_PCLN, PT_PQRT,
  PT_QRTZ, PT_SAWD, PT_TUNG, PT_WOOD,
} from '../sim/numbers.ts';

export function Element_DMG(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DMG';
  el.Name = 'DMG';
  el.Colour = 0x88FF88; // 0x88FF88_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(f(R_TEMP - 2.0) + f(273.15)); // R_TEMP - 2.0f + 273.15f
  el.HeatConduct = 29;
  el.Description = 'Generates damaging pressure and breaks any elements it hits.';

  el.Properties = TYPE_PART | PROP_SPARKSETTLE;

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
  const rad = 25;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) !== PT_DMG && TYP(r) !== PT_EMBR && TYP(r) !== PT_DMND && TYP(r) !== PT_CLNE && TYP(r) !== PT_PCLN && TYP(r) !== PT_BCLN) {
          sim.kill_part(i);
          for (let nxj = -rad; nxj <= rad; nxj++) {
            for (let nxi = -rad; nxi <= rad; nxi++) {
              if (x + nxi >= 0 && y + nxj >= 0 && x + nxi < XRES && y + nxj < YRES && (nxi || nxj)) {
                // pow(int, float) and sqrt compute in double
                const dist = itrunc(Math.sqrt(Math.pow(nxi, 2.0) + Math.pow(nxj, 2.0)));//;(pow((float)nxi,2))/(pow((float)rad,2))+(pow((float)nxj,2))/(pow((float)rad,2));
                if (!dist || (dist <= rad)) {
                  const rr = pmap[y + nxj][x + nxi];
                  if (rr) {
                    // atan2(float, int), cos, sin: double
                    const angle = Math.atan2(nxj, nxi);
                    const fx = Math.cos(angle) * 7.0;
                    const fy = Math.sin(angle) * 7.0;
                    parts[ID(rr)].vx = parts[ID(rr)].vx + fx;
                    parts[ID(rr)].vy = parts[ID(rr)].vy + fy;
                    sim.vx[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] = sim.vx[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] + fx;
                    sim.vy[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] = sim.vy[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] + fy;
                    sim.pv[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] = f(sim.pv[idiv(y + nxj, CELL)][idiv(x + nxi, CELL)] + 1.0);
                    const t = TYP(rr);
                    if (t && elements[t].HighPressureTransition > -1 && elements[t].HighPressureTransition < PT_NUM)
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, elements[t].HighPressureTransition);
                    else if (t === PT_BMTL) //@ DMG + BMTL -> BRMT
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_BRMT);
                    else if (t === PT_GLAS) //@ DMG + GLAS -> BGLA
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_BGLA);
                    else if (t === PT_COAL) //@ DMG + COAL -> BCOL
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_BCOL);
                    else if (t === PT_QRTZ) //@ DMG + QRTZ -> PQRT
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_PQRT);
                    else if (t === PT_TUNG) //@ DMG + TUNG -> BRMT(TUNG)
                    {
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_BRMT);
                      parts[ID(rr)].ctype = PT_TUNG;
                    }
                    else if (t === PT_WOOD) //@ DMG + WOOD -> SAWD
                      sim.part_change_type(ID(rr), x + nxi, y + nxj, PT_SAWD);
                  }
                }
              }
            }
          }
          return 1;
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.pixel_mode |= PMODE_FLARE;
  return 1;
}
