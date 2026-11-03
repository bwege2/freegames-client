// simulation/elements/BOMB.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MAX_TEMP, NT, PMODE_FLARE, PROP_SPARKSETTLE, R_TEMP, SC_EXPLOSIVE, TYP,
  TYPE_PART, XRES, YRES,
} from '../sim/config.ts';
import { PT_BCLN, PT_BOMB, PT_CLNE, PT_DMND, PT_EMBR, PT_PCLN, PT_VIBR } from '../sim/numbers.ts';

export function Element_BOMB(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BOMB';
  el.Name = 'BOMB';
  el.Colour = 0xFFF288;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = f(0.0);
  el.Gravity = f(0.1);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 30;

  el.DefaultProperties.temp = f(f(R_TEMP - f(2.0)) + f(273.15));
  el.HeatConduct = 29;
  el.Description = 'Bomb. Explodes and destroys all surrounding particles when it touches something.';

  el.Properties = TYPE_PART|PROP_SPARKSETTLE;

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
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if (rt !== PT_BOMB && rt !== PT_EMBR && rt !== PT_DMND && rt !== PT_CLNE && rt !== PT_PCLN && rt !== PT_BCLN && rt !== PT_VIBR) {
          const rad = 8;
          sim.kill_part(i);
          for (let nxj = -rad; nxj <= rad; nxj++) {
            for (let nxi = -rad; nxi <= rad; nxi++) {
              if ((nxi * nxi + nxj * nxj) <= rad * rad) {
                const ynxj = y + nxj, xnxi = x + nxi;

                if ((ynxj < 0) || (ynxj >= YRES) || (xnxi < 0) || (xnxi >= XRES))
                  continue;

                const nt = TYP(pmap[ynxj][xnxi]);
                if (nt !== PT_DMND && nt !== PT_CLNE && nt !== PT_PCLN && nt !== PT_BCLN && nt !== PT_VIBR) {
                  if (nt)
                    sim.kill_part(ID(pmap[ynxj][xnxi]));
                  sim.pv[(ynxj / CELL) | 0][(xnxi / CELL) | 0] = f(sim.pv[(ynxj / CELL) | 0][(xnxi / CELL) | 0] + f(0.1));
                  //@ BOMB -> EMBR
                  const nb = sim.create_part(-3, xnxi, ynxj, PT_EMBR);
                  if (nb !== -1) {
                    parts[nb].tmp = 2;
                    parts[nb].life = 2;
                    parts[nb].temp = MAX_TEMP;
                  }
                }
              }
            }
          }
          for (let nxj = -(rad + 1); nxj <= (rad + 1); nxj++) {
            for (let nxi = -(rad + 1); nxi <= (rad + 1); nxi++) {
              if ((nxi * nxi + nxj * nxj) <= (rad + 1) * (rad + 1)) {
                const ynxj = y + nxj, xnxi = x + nxi;

                if ((ynxj < 0) || (ynxj >= YRES) || (xnxi < 0) || (xnxi >= XRES))
                  continue;

                if (TYP(pmap[ynxj][xnxi]))
                  continue;

                //@ BOMB -> EMBR
                const nb = sim.create_part(-3, xnxi, ynxj, PT_EMBR);
                if (nb !== -1) {
                  parts[nb].tmp = 0;
                  parts[nb].life = 50;
                  parts[nb].temp = MAX_TEMP;
                  parts[nb].vx = sim.rng.between(-20, 20);
                  parts[nb].vy = sim.rng.between(-20, 20);
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
