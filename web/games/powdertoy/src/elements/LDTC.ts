// simulation/elements/LDTC.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_NOCTYPEDRAW, SC_SENSOR, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import {
  PT_BIZR, PT_BIZRG, PT_BIZRS, PT_BRAY, PT_FILT, PT_INWR, PT_LIFE, PT_NTCT, PT_PHOT, PT_PTCT, PT_SLTW, PT_SPRK, PT_WATR,
} from '../sim/numbers.ts';
import { Element_FILT_getWavelengths } from './FILT.ts';

export function Element_LDTC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LDTC';
  el.Name = 'LDTC';
  el.Colour = 0x66ff66;
  el.MenuVisible = 1;
  el.MenuSection = SC_SENSOR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Linear detector. Scans in 8 directions for particles with its ctype and creates a spark on the opposite side.';

  el.Properties = TYPE_SOLID | PROP_NOCTYPEDRAW;
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
  el.CtypeDraw = Element.ctypeDrawVInCtype;
}

const FLAG_INVERT_FILTER = 0x1;
const FLAG_IGNORE_ENERGY = 0x2;
const FLAG_NO_COPY_COLOR = 0x4;
const FLAG_KEEP_SEARCHING = 0x8;

//NOTES:
// ctype is used to store the target element, if any. (NONE is treated as a wildcard)
// life is used for the amount of pixels to skip before starting the scan. Starts just in front of the LDTC if 0.
// tmp is the number of particles that will be scanned before scanning stops. Unbounded if 0.
// tmp2 is used for settings (binary flags). The flags are as follows:
// 0x01: Inverts the CTYPE filter so that the element in ctype is the only thing that doesn't trigger LDTC, instead of the opposite.
// 0x02: Ignore energy particles
// 0x04: Ignore FILT (do not use color copying mode)
// 0x08: Keep searching even after finding a particle


/* Returns true for particles that activate the special FILT color copying mode */
function phot_data_type(rt: number): boolean {
  return rt === PT_FILT || rt === PT_PHOT || rt === PT_BRAY || rt === PT_BIZR || rt === PT_BIZRG || rt === PT_BIZRS;
}

/* Returns true for particles that start a ray search ("dtec" mode)
 */
function accepted_conductor(sim: Simulation, r: number): boolean {
  const elements = sd.elements;
  const rt = TYP(r);
  return !!(elements[rt].Properties & PROP_CONDUCTS) &&
    !(rt === PT_WATR || rt === PT_SLTW || rt === PT_NTCT ||
    rt === PT_PTCT || rt === PT_INWR) &&
    sim.parts[ID(r)].life === 0;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const ctype = TYP(parts[i].ctype), ctypeExtra = ID(parts[i].ctype);
  let detectLength = parts[i].tmp, detectSpaces = parts[i].tmp2;
  const copyColor = !(parts[i].tmp2 & FLAG_NO_COPY_COLOR);
  const ignoreEnergy = !!(parts[i].tmp2 & FLAG_IGNORE_ENERGY);
  const invertFilter = !!(parts[i].tmp2 & FLAG_INVERT_FILTER);
  const keepSearching = !!(parts[i].tmp2 & FLAG_KEEP_SEARCHING);
  if (detectSpaces < 0)
    detectSpaces = parts[i].tmp2 = 0;
  if (detectLength < 0)
    detectLength = parts[i].tmp = 0;
  void detectSpaces; void detectLength; // set but not read further, as in C++
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const boolMode = accepted_conductor(sim, r);
        const filtMode = copyColor && TYP(r) === PT_FILT;
        if (!boolMode && !filtMode)
          continue;

        const maxRange = parts[i].life + parts[i].tmp;
        const xStep = rx * -1, yStep = ry * -1;
        let xCurrent = x + (xStep * (parts[i].life + 1)), yCurrent = y + (yStep * (parts[i].life + 1));
        for (; !parts[i].tmp ||
          (xStep * (xCurrent - x) <= maxRange &&
          yStep * (yCurrent - y) <= maxRange);
          xCurrent += xStep, yCurrent += yStep) {
          if (!(xCurrent >= 0 && yCurrent >= 0 && xCurrent < XRES && yCurrent < YRES))
            break; // We're out of bounds! Oops!
          let rr = pmap[yCurrent][xCurrent];
          if (!rr && !ignoreEnergy)
            rr = sim.photons[yCurrent][xCurrent];
          if (!rr)
            continue;

          // If ctype isn't set (no type restriction), or ctype matches what we found
          // Can use .tmp2 flag to invert this
          const matchesCtype = ctype === TYP(rr) && (ctype !== PT_LIFE || parts[ID(rr)].ctype === ctypeExtra);
          const matchesFilter = !ctype || !!((invertFilter ? 1 : 0) ^ (matchesCtype ? 1 : 0));
          if (!matchesFilter) {
            if (keepSearching)
              continue;
            else
              break;
          }
          // room for more conditions here.

          if (boolMode) {
            parts[ID(r)].life = 4;
            parts[ID(r)].ctype = TYP(r);
            sim.part_change_type(ID(r), x + rx, y + ry, PT_SPRK);
            break;
          }

          if (filtMode) {
            if (!phot_data_type(TYP(rr)))
              continue;

            let nx = x + rx, ny = y + ry;
            const photonWl = TYP(rr) === PT_FILT ?
              Element_FILT_getWavelengths(parts[ID(rr)]) :
              parts[ID(rr)].ctype;
            while (TYP(r) === PT_FILT) {
              parts[ID(r)].ctype = photonWl;
              nx += rx;
              ny += ry;
              if (nx < 0 || ny < 0 || nx >= XRES || ny >= YRES)
                break;
              r = pmap[ny][nx];
            }
            break;
          }
        }
      }
    }
  }
  return 0;
}
