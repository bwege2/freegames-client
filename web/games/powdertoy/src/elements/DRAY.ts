// simulation/elements/DRAY.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, InBounds, IPH, IPL, ITH, ITL, MAX_FIGHTERS, NT, SC_ELEC, TYP, TYPE_ENERGY, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_FIGH, PT_INWR, PT_LIFE, PT_METL, PT_PSCN, PT_SPRK, PT_STKM, PT_STKM2 } from '../sim/numbers.ts';

export function Element_DRAY(el: Element): void {
  el.Identifier = 'DEFAULT_PT_DRAY';
  el.Name = 'DRAY';
  el.Colour = 0xFFAA22;
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
  el.Description = 'Duplicator ray. Replicates a line of particles in front of it.';

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
  el.Graphics = null; // is this needed?
  el.CtypeDraw = Element.ctypeDrawVInCtype;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const ctype = TYP(parts[i].ctype), ctypeExtra = ID(parts[i].ctype);
  let copyLength = parts[i].tmp, copySpaces = parts[i].tmp2;
  if (copySpaces < 0)
    copySpaces = parts[i].tmp2 = 0;
  if (copyLength < 0)
    copyLength = parts[i].tmp = 0;
  else if (copyLength > 0)
    copySpaces++; //strange hack

  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (TYP(r) === PT_SPRK && parts[ID(r)].life === 3) { //spark found, start creating
          const overwrite = parts[ID(r)].ctype === PT_PSCN;
          let partsRemaining = copyLength, xCopyTo = -1, yCopyTo = -1; //positions where the line will start being copied at
          let localCopyLength = copyLength;

          if (parts[ID(r)].ctype === PT_INWR && rx && ry) // INWR doesn't spark from diagonals
            continue;

          //figure out where the copying will start/end
          let foundParticle = false;
          let isEnergy = false;
          for (let xStep = rx * -1, yStep = ry * -1, xCurrent = x + xStep, yCurrent = y + yStep; ; xCurrent += xStep, yCurrent += yStep) {
            // Out of bounds, stop looking and don't copy anything
            if (!InBounds(xCurrent, yCurrent))
              break;
            let rr: number;
            // haven't found a particle yet, keep looking for one
            // the first particle it sees decides whether it will copy energy particles or not
            if (!foundParticle) {
              rr = pmap[yCurrent][xCurrent];
              if (!rr) {
                rr = sim.photons[yCurrent][xCurrent];
                if (rr)
                  foundParticle = isEnergy = true;
              } else
                foundParticle = true;
            }
            // now that it knows what kind of particle it is copying, do some extra stuff here so we can determine when to stop
            if ((ctype && (elements[ctype].Properties & TYPE_ENERGY)) || isEnergy)
              rr = sim.photons[yCurrent][xCurrent];
            else
              rr = pmap[yCurrent][xCurrent];

            // Checks for when to stop:
            //	1: if .tmp isn't set, and the element in this spot is the ctype, then stop
            //	2: if .tmp is set, stop when the length limit reaches 0
            if ((!localCopyLength && TYP(rr) === ctype && (ctype !== PT_LIFE || parts[ID(rr)].ctype === ctypeExtra))
              || !--partsRemaining) {
              localCopyLength -= partsRemaining;
              xCopyTo = xCurrent + xStep * copySpaces;
              yCopyTo = yCurrent + yStep * copySpaces;
              break;
            }
          }

          // now, actually copy the particles
          partsRemaining = localCopyLength + 1;
          let type: number, p = 0;
          for (let xStep = rx * -1, yStep = ry * -1, xCurrent = x + xStep, yCurrent = y + yStep; InBounds(xCopyTo, yCopyTo) && --partsRemaining; xCurrent += xStep, yCurrent += yStep, xCopyTo += xStep, yCopyTo += yStep) {
            // get particle to copy
            if (isEnergy)
              type = TYP(sim.photons[yCurrent][xCurrent]);
            else
              type = TYP(pmap[yCurrent][xCurrent]);

            // if sparked by PSCN, overwrite whatever is in the target location, instead of just ignoring it
            if (overwrite) {
              if (isEnergy) {
                if (sim.photons[yCopyTo][xCopyTo])
                  sim.kill_part(ID(sim.photons[yCopyTo][xCopyTo]));
              } else {
                if (pmap[yCopyTo][xCopyTo])
                  sim.kill_part(ID(pmap[yCopyTo][xCopyTo]));
              }
            }
            if (type === PT_SPRK) // spark hack
              p = sim.create_part(-1, xCopyTo, yCopyTo, PT_METL);
            else if (type === PT_STKM || type === PT_STKM2)
              continue; // do not try to copy these non-copyable particles
            else if (type)
              p = sim.create_part(-1, xCopyTo, yCopyTo, type);
            else
              continue;

            // if new particle was created successfully
            if (p >= 0) {
              if (type === PT_SPRK) // spark hack
                sim.part_change_type(p, xCopyTo, yCopyTo, PT_SPRK);

              if (isEnergy)
                parts[p].copyFrom(parts[ID(sim.photons[yCurrent][xCurrent])]);
              else if (type !== PT_FIGH)
                parts[p].copyFrom(parts[ID(pmap[yCurrent][xCurrent])]);
              else {
                // FIGH needs special rules
                const other = parts[ID(pmap[yCurrent][xCurrent])];

                // need to keep .tmp consistent: it points to fighter metadata
                const old_tmp = parts[p].tmp;
                parts[p].copyFrom(other);
                parts[p].tmp = old_tmp;

                // Update the new fighter's metadata
                // Do not attempt to copy kinematics of legs - overwritten next frame anyway
                if (other.tmp >= 0 && other.tmp < MAX_FIGHTERS) {
                  const source_pst = sim.fighters[other.tmp];
                  const this_pst = sim.fighters[old_tmp];
                  this_pst.rocketBoots = source_pst.rocketBoots;
                  this_pst.fan = source_pst.fan;
                  this_pst.elem = source_pst.elem;
                }
              }

              parts[p].x = xCopyTo;
              parts[p].y = yCopyTo;
            }
          }
        }
      }
    }
  }
  return 0;
}
