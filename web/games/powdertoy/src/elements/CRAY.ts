// simulation/elements/CRAY.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, PMAPID, PT_NUM, SC_ELEC, TYP, TYPE_SOLID, XRES, YRES } from '../sim/config.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { PT_CRAY, PT_DMND, PT_FILT, PT_INST, PT_INWR, PT_LIGH, PT_METL, PT_PSCN, PT_SPRK } from '../sim/numbers.ts';
import { Element_FILT_getWavelengths } from './FILT.ts';

export function Element_CRAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_CRAY';
  el.Name = 'CRAY';
  el.Colour = 0xBBFF00;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Particle Ray Emitter. Creates a beam of particles set by its ctype, with a range set by tmp.';

  el.Properties = TYPE_SOLID;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.CtypeDraw = ctypeDraw;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let nxx: number, nyy: number, docontinue: number, nxi: number, nyi: number;
  // set ctype to things that touch it if it doesn't have one already
  if (parts[i].ctype <= 0 || !elements[TYP(parts[i].ctype)].Enabled) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        let r = sim.photons[y + ry][x + rx];
        if (!r)
          r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) !== PT_CRAY && TYP(r) !== PT_PSCN && TYP(r) !== PT_INST && TYP(r) !== PT_METL && TYP(r) !== PT_SPRK && TYP(r) < PT_NUM) {
          parts[i].ctype = TYP(r);
          parts[i].temp = parts[ID(r)].temp;
        }
      }
    }
  } else {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if (rx || ry) {
          let r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_SPRK && parts[ID(r)].life === 3) { //spark found, start creating
            /** unsigned int */
            let colored = 0;
            const destroy = parts[ID(r)].ctype === PT_PSCN;
            const nostop = parts[ID(r)].ctype === PT_INST;
            const createSpark = (parts[ID(r)].ctype === PT_INWR);
            let partsRemaining = 255;
            if (parts[i].tmp) //how far it shoots
              partsRemaining = parts[i].tmp;
            const spacesRemaining = parts[i].tmp2;
            for (docontinue = 1, nxi = rx * -1, nyi = ry * -1, nxx = spacesRemaining * nxi, nyy = spacesRemaining * nyi; docontinue; nyy += nyi, nxx += nxi) {
              if (!(x + nxi + nxx < XRES && y + nyi + nyy < YRES && x + nxi + nxx >= 0 && y + nyi + nyy >= 0)) {
                break;
              }
              r = pmap[y + nyi + nyy][x + nxi + nxx];
              if (!sim.IsWallBlocking(x + nxi + nxx, y + nyi + nyy, TYP(parts[i].ctype)) && (!sim.pmap[y + nyi + nyy][x + nxi + nxx] || createSpark)) { // create, also set color if it has passed through FILT
                const nr = sim.create_part(-1, x + nxi + nxx, y + nyi + nyy, TYP(parts[i].ctype), ID(parts[i].ctype));
                if (nr !== -1) {
                  if (colored)
                    parts[nr].dcolour = colored;
                  parts[nr].temp = parts[i].temp;
                  if (parts[i].life > 0)
                    parts[nr].life = parts[i].life;
                  if (!--partsRemaining)
                    docontinue = 0;
                }
              } else if (TYP(r) === PT_FILT) { // get color if passed through FILT
                if (parts[ID(r)].dcolour === 0xFF000000)
                  colored = 0xFF000000;
                else if (parts[ID(r)].tmp === 0) {
                  colored = wavelengthToDecoColour(Element_FILT_getWavelengths(parts[ID(r)]));
                } else if (colored === 0xFF000000)
                  colored = 0;
                parts[ID(r)].life = 4;
              } else if (TYP(r) === PT_CRAY || nostop) {
                docontinue = 1;
              } else if (destroy && r && (TYP(r) !== PT_DMND)) {
                sim.kill_part(ID(r));
                if (!--partsRemaining)
                  docontinue = 0;
              } else
                docontinue = 0;
              if (!partsRemaining)
                docontinue = 0;
            }
          }
        }
      }
    }
  }
  return 0;
}

/** returns unsigned int */
function wavelengthToDecoColour(wavelength: number): number {
  let colr = 0, colg = 0, colb = 0, x: number;
  for (x = 0; x < 12; x++) {
    colr += (wavelength >> (x + 18)) & 1;
    colb += (wavelength >> x) & 1;
  }
  for (x = 0; x < 12; x++)
    colg += (wavelength >> (x + 9)) & 1;
  x = (624 / (colr + colg + colb + 1)) | 0;
  colr *= x;
  colg *= x;
  colb *= x;

  if (colr > 255) colr = 255;
  else if (colr < 0) colr = 0;
  if (colg > 255) colg = 255;
  else if (colg < 0) colg = 0;
  if (colb > 255) colb = 255;
  else if (colb < 0) colb = 0;

  return ((255 << 24) | (colr << 16) | (colg << 8) | colb) >>> 0;
}

function ctypeDraw(sim: Simulation, i: number, t: number, v: number): boolean {
  const elements = sd.elements;
  if (!Element.ctypeDrawVInCtype(sim, i, t, v)) {
    return false;
  }
  if (t === PT_LIGH) {
    sim.parts[i].ctype |= PMAPID(30);
  }
  sim.parts[i].temp = elements[t].DefaultProperties.temp;
  return true;
}
