// simulation/elements/PRTI.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, CHANNELS, EFFECT_DBGLINES, EFFECT_GRAVIN, ID, IPH, IPL, ITH, ITL, NT, PMODE, PMODE_ADD, SC_SPECIAL, TYP,
  TYPE_ENERGY, TYPE_GAS, TYPE_LIQUID, TYPE_PART, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_FIGH, PT_SOAP, PT_SPRK, PT_STKM, PT_STKM2, PT_STOR } from '../sim/numbers.ts';
import { Element_PIPE_transfer_pipe_to_part } from './PIPE.ts';
import { Element_SOAP_detach } from './SOAP.ts';

// PRTI.h
export const portal_rx: readonly number[] = [-1, 0, 1, 1, 1, 0, -1, -1];
export const portal_ry: readonly number[] = [-1, -1, -1, 0, 1, 1, 1, 0];

// simulation/orbitalparts.h (header only; PRTO imports these from here)
export function orbitalparts_get(block1: number, block2: number, resblock1: number[], resblock2: number[]): void {
  resblock1[0] = (block1 & 0x000000FF);
  resblock1[1] = (block1 & 0x0000FF00) >> 8;
  resblock1[2] = (block1 & 0x00FF0000) >> 16;
  resblock1[3] = (block1 & 0xFF000000) >>> 24;

  resblock2[0] = (block2 & 0x000000FF);
  resblock2[1] = (block2 & 0x0000FF00) >> 8;
  resblock2[2] = (block2 & 0x00FF0000) >> 16;
  resblock2[3] = (block2 & 0xFF000000) >>> 24;
}

/** orbitalparts_set(int *block1, int *block2, ...): returns [*block1, *block2] */
export function orbitalparts_set(resblock1: number[], resblock2: number[]): [number, number] {
  let block1tmp = 0;
  let block2tmp = 0;

  block1tmp = (resblock1[0] & 0xFF);
  block1tmp |= (resblock1[1] & 0xFF) << 8;
  block1tmp |= (resblock1[2] & 0xFF) << 16;
  block1tmp |= (resblock1[3] & 0xFF) << 24;

  block2tmp = (resblock2[0] & 0xFF);
  block2tmp |= (resblock2[1] & 0xFF) << 8;
  block2tmp |= (resblock2[2] & 0xFF) << 16;
  block2tmp |= (resblock2[3] & 0xFF) << 24;

  return [block1tmp, block2tmp];
}

export function Element_PRTI(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PRTI';
  el.Name = 'PRTI';
  el.Colour = 0xEB5917;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(-0.005) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Portal IN. Particles go in here. Also has temperature dependent channels. (same as WIFI)';

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
  el.Graphics = graphics;
}

/*these are the count values of where the particle gets stored, depending on where it came from
   0 1 2
   7 . 3
   6 5 4
   PRTO does (count+4)%8, so that it will come out at the opposite place to where it came in
   PRTO does +/-1 to the count, so it doesn't jam as easily
*/

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let fe = 0;

  parts[i].tmp = itrunc(f(f(f(parts[i].temp - f(73.15)) / 100) + 1));
  if (parts[i].tmp >= CHANNELS)
    parts[i].tmp = CHANNELS - 1;
  else if (parts[i].tmp < 0)
    parts[i].tmp = 0;

  for (let count = 0; count < 8; count++) {
    const rx = portal_rx[count];
    const ry = portal_ry[count];
    if (rx || ry) {
      let r = pmap[y + ry][x + rx];
      if (!r || TYP(r) === PT_STOR)
        fe = 1;
      if (!r || (!(elements[TYP(r)].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS | TYPE_ENERGY)) && TYP(r) !== PT_SPRK && TYP(r) !== PT_STOR)) {
        r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
      }

      if (TYP(r) === PT_STKM || TYP(r) === PT_STKM2 || TYP(r) === PT_FIGH)
        continue;// Handling these is a bit more complicated, and is done in STKM_interact()

      if (TYP(r) === PT_SOAP)
        Element_SOAP_detach(sim, ID(r));

      for (let nnx = 0; nnx < 80; nnx++)
        if (!sim.portalp[parts[i].tmp][count][nnx].type) {
          if (TYP(r) === PT_STOR) {
            if (sd.IsElement(parts[ID(r)].tmp) && (elements[parts[ID(r)].tmp].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS | TYPE_ENERGY))) {
              // STOR uses same format as PIPE, so we can use this function to do the transfer
              Element_PIPE_transfer_pipe_to_part(sim, parts[ID(r)], sim.portalp[parts[i].tmp][count][nnx], true);
              break;
            }
          }
          else {
            sim.portalp[parts[i].tmp][count][nnx].copyFrom(parts[ID(r)]);
            if (TYP(r) === PT_SPRK)
              sim.part_change_type(ID(r), x + rx, y + ry, parts[ID(r)].ctype);
            else
              sim.kill_part(ID(r));
            fe = 1;
            break;
          }
        }
    }
  }


  if (fe) {
    const orbd = [0, 0, 0, 0];	//Orbital distances
    const orbl = [0, 0, 0, 0];	//Orbital locations
    if (!sim.parts[i].life) parts[i].life = sim.rng.gen();
    if (!sim.parts[i].ctype) parts[i].ctype = sim.rng.gen();
    orbitalparts_get(parts[i].life, parts[i].ctype, orbd, orbl);
    for (let r = 0; r < 4; r++) {
      if (orbd[r] > 1) {
        orbd[r] -= 12;
        if (orbd[r] < 1) {
          orbd[r] = sim.rng.between(128, 255);
          orbl[r] = sim.rng.between(0, 254);
        } else {
          orbl[r] += 2;
          orbl[r] = orbl[r] % 255;
        }
      } else {
        orbd[r] = sim.rng.between(128, 255);
        orbl[r] = sim.rng.between(0, 254);
      }
    }
    [parts[i].life, parts[i].ctype] = orbitalparts_set(orbd, orbl);
  } else {
    parts[i].life = 0;
    parts[i].ctype = 0;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 8;
  g.firer = 255;
  g.fireg = 0;
  g.fireb = 0;
  g.pixel_mode |= EFFECT_DBGLINES;
  g.pixel_mode |= EFFECT_GRAVIN;
  g.pixel_mode &= ~PMODE;
  g.pixel_mode |= PMODE_ADD;
  return 1;
}
