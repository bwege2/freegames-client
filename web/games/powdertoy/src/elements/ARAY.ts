// simulation/elements/ARAY.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PT_NUM, SC_ELEC, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import {
  PT_ARAY, PT_BRAY, PT_FILT, PT_INST, PT_INWR, PT_PSCN, PT_SPRK, PT_STOR, PT_SWCH, PT_WIFI,
} from '../sim/numbers.ts';
import { Element_FILT_interactWavelengths } from './FILT.ts';

export function Element_ARAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ARAY';
  el.Name = 'ARAY';
  el.Colour = 0xFFBB00;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Ray Emitter. Rays create points when they collide.';

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
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const short_bray_life = parts[i].life > 0 ? parts[i].life : 30;
  const long_bray_life = parts[i].life > 0 ? parts[i].life : 1020;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK && parts[ID(r)].life === 3) {
          let isBlackDeco = false;
          const destroy = (parts[ID(r)].ctype === PT_PSCN) ? 1 : 0;
          const nostop = (parts[ID(r)].ctype === PT_INST) ? 1 : 0;
          let colored = 0, rt: number;
          for (let docontinue = 1, nxx = 0, nyy = 0, nxi = rx * -1, nyi = ry * -1; docontinue; nyy += nyi, nxx += nxi) {
            if (!(x + nxi + nxx < XRES && y + nyi + nyy < YRES && x + nxi + nxx >= 0 && y + nyi + nyy >= 0))
              break;

            r = pmap[y + nyi + nyy][x + nxi + nxx];
            rt = TYP(r);
            r = ID(r);
            if (!rt) {
              const nr = sim.create_part(-1, x + nxi + nxx, y + nyi + nyy, PT_BRAY);
              if (nr !== -1) {
                // if it came from PSCN
                if (destroy) {
                  parts[nr].tmp = 2;
                  parts[nr].life = 2;
                }
                else {
                  parts[nr].ctype = colored;
                  parts[nr].life = short_bray_life;
                }
                parts[nr].temp = parts[i].temp;
                if (isBlackDeco)
                  parts[nr].dcolour = 0xFF000000;
              }
            }
            else if (!destroy) {
              if (rt === PT_BRAY) {
                // cases for hitting different BRAY modes
                switch (parts[r].tmp) {
                  // normal white
                  case 0:
                    if (nyy !== 0 || nxx !== 0) {
                      parts[r].life = long_bray_life; // makes it last a while
                      parts[r].tmp = 1;
                      if (!parts[r].ctype) // and colors it if it isn't already
                        parts[r].ctype = colored;
                    }
                  // falls through
                  // red bray or any other random tmp mode, stop
                  case 2:
                  default:
                    docontinue = 0;
                    break;
                  // long life, reset it
                  case 1:
                    parts[r].life = long_bray_life;
                    //docontinue = 1;
                    break;
                }
                if (isBlackDeco)
                  parts[r].dcolour = 0xFF000000;
              }
              // get color if passed through FILT
              else if (rt === PT_FILT) {
                if (parts[r].tmp !== 6) {
                  colored = Element_FILT_interactWavelengths(sim, parts[r], colored);
                  if (!colored)
                    break;
                }
                isBlackDeco = (parts[r].dcolour === 0xFF000000);
                parts[r].life = 4;
              }
              else if (rt === PT_STOR) {
                if (parts[r].tmp) {
                  //Cause STOR to release
                  for (let ry1 = 1; ry1 >= -1; ry1--) {
                    for (let rx1 = 0; rx1 >= -1 && rx1 <= 1; rx1 = -rx1 - rx1 + 1) {
                      const np = sim.create_part(-1, x + nxi + nxx + rx1, y + nyi + nyy + ry1, TYP(parts[r].tmp));
                      if (np !== -1) {
                        parts[np].temp = parts[r].temp;
                        parts[np].life = parts[r].tmp2;
                        parts[np].tmp = parts[r].tmp3;
                        parts[np].ctype = parts[r].tmp4;
                        parts[r].tmp = 0;
                        parts[r].life = 10;
                        break;
                      }
                    }
                  }
                }
                else {
                  parts[r].life = 10;
                }
                // this if prevents BRAY from stopping on certain materials
              }
              else if (rt !== PT_INWR && (rt !== PT_SPRK || parts[r].ctype !== PT_INWR) && rt !== PT_ARAY && rt !== PT_WIFI && !(rt === PT_SWCH && parts[r].life >= 10)) {
                if (nyy !== 0 || nxx !== 0)
                  sim.create_part(-1, x + nxi + nxx, y + nyi + nyy, PT_SPRK);

                if (!(nostop && parts[r].type === PT_SPRK && parts[r].ctype >= 0 && parts[r].ctype < PT_NUM && (elements[parts[r].ctype].Properties & PROP_CONDUCTS)))
                  docontinue = 0;
                else
                  docontinue = 1;
              }
            }
            else if (destroy) {
              if (rt === PT_BRAY) {
                parts[r].tmp = 2;
                parts[r].life = 1;
                docontinue = 1;
                if (isBlackDeco)
                  parts[r].dcolour = 0xFF000000;
                //this if prevents red BRAY from stopping on certain materials
              }
              else if (rt === PT_STOR || rt === PT_INWR || (rt === PT_SPRK && parts[r].ctype === PT_INWR) || rt === PT_ARAY || rt === PT_WIFI || rt === PT_FILT || (rt === PT_SWCH && parts[r].life >= 10)) {
                if (rt === PT_STOR) {
                  parts[r].tmp = 0;
                  parts[r].life = 0;
                }
                else if (rt === PT_FILT) {
                  isBlackDeco = (parts[r].dcolour === 0xFF000000);
                  parts[r].life = 2;
                }
                docontinue = 1;
              }
              else {
                docontinue = 0;
              }
            }
          }
        }
        //parts[i].life = 4;
      }
    }
  }
  return 0;
}
