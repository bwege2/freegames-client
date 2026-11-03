// simulation/elements/PTNM.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITL, NT, PMODE_FLARE, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, PROP_SPARKSETTLE,
  SC_SOLIDS, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import {
  PT_BCOL, PT_BIZR, PT_BREC, PT_CO2, PT_DESL, PT_DSTW, PT_ELEC, PT_EXOT, PT_GAS, PT_H2, PT_INSL, PT_ISOZ, PT_ISZS,
  PT_LAVA, PT_NBLE, PT_NEUT, PT_O2, PT_OIL, PT_PHOT, PT_PLUT, PT_PTNM, PT_RSST, PT_SHLD1, PT_SHLD2, PT_SHLD3,
  PT_SHLD4, PT_SMKE, PT_SPRK, PT_WATR, PT_WTRV,
} from '../sim/numbers.ts';

export function Element_PTNM(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PTNM';
  el.Name = 'PTNM';
  el.Colour = 0xD5E0EB;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
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
  el.Meltable = 1;
  el.Hardness = 0;
  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Platinum. Catalyzes certain reactions.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC | PROP_HOT_GLOW | PROP_SPARKSETTLE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(1768.0 + f(273.15));
  el.HighTemperatureTransition = PT_LAVA; //@ PTNM -> LAVA(PTNM)

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function wtrv_reactions(wtrv1_id: number, sim: Simulation, _i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): void {
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r || ID(r) === wtrv1_id)
          continue;
        const rt = TYP(r);

        //@ PTNM + WTRV + BCOL -> PTNM + OIL
        if (rt === PT_BCOL && parts[ID(r)].temp > f(200.0 + f(273.15)) && parts[wtrv1_id].temp > f(200.0 + f(273.15)) && sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] > 7.0) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_OIL);
          sim.kill_part(wtrv1_id);
          return;
        }
      }
    }
  }
}

function hygn_reactions(hygn1_id: number, sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): void {
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r || ID(r) === hygn1_id)
          continue;
        const rt = TYP(r);

        //@ PTNM + H2 + DESL -> PTNM + OIL + WATR
        if (rt === PT_DESL) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_WATR);
          sim.part_change_type(hygn1_id, itrunc(f(parts[hygn1_id].x + 0.5)), itrunc(f(parts[hygn1_id].y + 0.5)), PT_OIL);
          return;
        }

        //@ PTNM + H2 + O2 -> PTNM + 2xDSTW
        if (rt === PT_O2 && !parts[i].life) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_DSTW);
          sim.part_change_type(hygn1_id, itrunc(f(parts[hygn1_id].x + 0.5)), itrunc(f(parts[hygn1_id].y + 0.5)), PT_DSTW);
          parts[ID(r)].temp = f(parts[ID(r)].temp + 5.0);
          parts[hygn1_id].temp = f(parts[hygn1_id].temp + 5.0);

          parts[i].ctype = PT_PTNM;
          parts[i].life = 4;
          sim.part_change_type(i, x, y, PT_SPRK);
          return;
        }

        // Cold fusion: 2 hydrogen > 500 C has a chance to fuse
        if (rt === PT_H2 && sim.rng.chance(1, 1000) && parts[ID(r)].temp > f(500.0 + f(273.15)) && parts[hygn1_id].temp > f(500.0 + f(273.15))) {
          //@ PTNM + 2xH2 -> PTNM + NBLE + NEUT + PHOT + maybe ELEC
          sim.part_change_type(ID(r), x + rx, y + ry, PT_NBLE);
          sim.part_change_type(hygn1_id, itrunc(f(parts[hygn1_id].x + 0.5)), itrunc(f(parts[hygn1_id].y + 0.5)), PT_NEUT);

          parts[ID(r)].temp = f(parts[ID(r)].temp + 1000.0);
          parts[hygn1_id].temp = f(parts[hygn1_id].temp + 1000.0);
          sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] += 10.0;

          const j = sim.create_part(-3, x + rx, y + ry, PT_PHOT);
          if (j > -1) {
            parts[j].ctype = 0x7C0000;
            parts[j].temp = parts[ID(r)].temp;
            parts[j].tmp = 0x1;
          }
          if (sim.rng.chance(1, 10)) {
            const j = sim.create_part(-3, x + rx, y + ry, PT_ELEC);
            if (j > -1)
              parts[j].temp = parts[ID(r)].temp;
          }
          return;
        }
      }
    }
  }
}

const checkCoordsX = [-4, 4, 0, 0];
const checkCoordsY = [0, 0, -4, 4];

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let hygn1_id = -1; // Id of a hydrogen particle for hydrogen multi-particle reactions
  let wtrv1_id = -1; // same but wtrv

  // Fast conduction (like GOLD)
  if (!parts[i].life) {
    for (let j = 0; j < 4; j++) {
      const rx = checkCoordsX[j];
      const ry = checkCoordsY[j];
      const r = pmap[y + ry][x + rx];
      if (r && TYP(r) === PT_SPRK && parts[ID(r)].life && parts[ID(r)].life < 4) {
        sim.part_change_type(i, x, y, PT_SPRK);
        parts[i].life = 4;
        parts[i].ctype = PT_PTNM;
      }
    }
  }

  // Single element reactions
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);

        if (rt === PT_H2 && hygn1_id < 0)
          hygn1_id = ID(r);

        if (rt === PT_WTRV && wtrv1_id < 0)
          wtrv1_id = ID(r);

        // These reactions will occur instantly in contact with PTNM
        // --------------------------------------------------------

        // Shield instantly grows (even without SPRK)
        if (!parts[ID(r)].life && (rt === PT_SHLD1 || rt === PT_SHLD2 || rt === PT_SHLD3)) {
          let next = PT_SHLD1;
          switch (rt) {
            case PT_SHLD1: next = PT_SHLD2; break;
            case PT_SHLD2: next = PT_SHLD3; break;
            case PT_SHLD3: next = PT_SHLD4; break;
          }
          sim.part_change_type(ID(r), x + rx, y + ry, next);
          parts[ID(r)].life = 7;
          continue;
        }

        //@ PTNM + ISZS/ISOZ -> PTNM + PLUT + PHOT
        if (rt === PT_ISZS || rt === PT_ISOZ) {
          sim.part_change_type(ID(r), x + rx, y + ry, PT_PLUT);
          sim.create_part(-3, x + rx, y + ry, PT_PHOT);
          continue;
        }

        // These reactions are dependent on temperature
        // Probability goes quadratically from 0% / frame to 100% / frame from 0 C to 1500 C
        // --------------------------------------------------------
        let prob = Math.min(1.0, f(parts[i].temp / f(f(273.15) + 1500.0)));
        prob = f(prob * prob);

        if (sim.rng.uniform01() <= prob) {
          switch (rt) {
            case PT_GAS: // GAS + > 2 pressure + >= 200 C -> INSL
              if (parts[ID(r)].temp >= f(200.0 + f(273.15)) && sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] > 2.0) {
                //@ PTNM + GAS -> PTNM + INSL
                sim.part_change_type(ID(r), x + rx, y + ry, PT_INSL);
                parts[i].temp = f(parts[i].temp + 60.0); // Other part is INSL, adding temp is useless
              }
              break;

            case PT_BREC: // BREL + > 1000 C + > 50 pressure -> EXOT
              if (parts[ID(r)].temp > f(1000.0 + f(273.15)) && sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] > 50.0) {
                //@ PTNM + BREC -> PTNM + EXOT
                sim.part_change_type(ID(r), x + rx, y + ry, PT_EXOT);
                parts[ID(r)].temp = f(parts[ID(r)].temp - 30.0);
                parts[i].temp = f(parts[i].temp - 30.0);
              }
              break;

            case PT_SMKE: //@ PTNM + SMKE -> PTNM + CO2
              sim.part_change_type(ID(r), x + rx, y + ry, PT_CO2);
              break;

            case PT_RSST: //@ PTNM + RSST -> PTNM + BIZR
              sim.create_part(ID(r), x + rx, y + ry, PT_BIZR);
              break;
          }
        }
      }
    }
  }

  // Hydrogen reactions
  if (hygn1_id >= 0) {
    hygn_reactions(hygn1_id, sim, i, x, y, surround_space, nt, parts, pmap);
  }

  // WTRV reactions
  if (wtrv1_id >= 0) {
    wtrv_reactions(wtrv1_id, sim, i, x, y, surround_space, nt, parts, pmap);
  }

  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp)
    g.pixel_mode |= PMODE_FLARE;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  if (sim.rng.chance(1, 15))
    sim.parts[i].tmp = 1;
}
