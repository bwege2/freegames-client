// simulation/elements/LITH.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, restrict_flt } from '../sim/cpp.ts';
import { Blue, Green, Red } from '../sim/colour.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PMODE_FLARE, PMODE_GLOW, PROP_LIFE_DEC, SC_EXPLOSIVE, TYP,
  TYPE_PART,
} from '../sim/config.ts';
import {
  PT_CBNW, PT_CO2, PT_DSTW, PT_FIRE, PT_GLAS, PT_H2, PT_INSL, PT_LAVA, PT_LITH, PT_NSCN, PT_O2, PT_PLSM, PT_PSCN,
  PT_RSSS, PT_SLTW, PT_SPRK, PT_WATR, PT_WTRV,
} from '../sim/numbers.ts';

export function Element_LITH(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LITH';
  el.Name = 'LITH';
  el.Colour = 0xB6AABF;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.2);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.95);
  el.Collision = f(-0.1);
  el.Gravity = f(0.2);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 14;

  el.Weight = 17;

  el.HeatConduct = 70;
  el.Description = 'Lithium. Reactive element that explodes on contact with water.';

  el.Properties = TYPE_PART | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(453.65);
  el.HighTemperatureTransition = PT_LAVA; //@ LITH -> LAVA(LITH/GLAS)

  el.Update = update;
  el.Graphics = graphics;
}

/*

tmp2:  carbonation factor
life:  burn timer above 1000, spark cooldown timer otherwise
tmp:   hydrogenation factor
ctype: absorbed energy

For game reasons, baseline LITH has the reactions of both its pure form and
its hydroxide, and also has basic li-ion battery-like behavior.
It absorbs CO2 like its hydroxide form, but can only be converted into GLAS
after having absorbed CO2.

*/

// The C++ binds references: hydrogenationFactor = self.tmp, burnTimer = self.life, carbonationFactor = self.tmp2,
// storedEnergy = self.ctype, neighborStoredEnergy = neighbor.ctype. The port reads and writes those fields directly.
function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const self = parts[i];

  if (self.ctype < 0) {
    self.ctype = 0;
  }

  let charged = false;
  let discharged = false;
  for (let rx = -2; rx <= 2; ++rx) {
    for (let ry = -2; ry <= 2; ++ry) {
      if (rx || ry) {
        const neighborData = pmap[y + ry][x + rx];
        if (!neighborData) {
          if (self.life > 1012 && sim.rng.chance(1, 10)) {
            //@ LITH -> LITH + FIRE
            sim.create_part(-1, x + rx, y + ry, PT_FIRE);
          }
          continue;
        }
        const neighbor = parts[ID(neighborData)];

        const pavg = sim.parts_avg(i, ID(neighborData), PT_INSL);

        switch (TYP(neighborData)) {
          case PT_SLTW:
          case PT_WTRV:
          case PT_WATR:
          case PT_DSTW:
          case PT_CBNW:
            if (self.life > 1016) {
              //@ LITH + SLTW/WATR/DSTW/CBNW -> LITH + WTRV
              sim.part_change_type(ID(neighborData), x + rx, y + ry, PT_WTRV);
              neighbor.temp = 440.0;
              continue;
            }
            if (self.tmp + self.tmp2 >= 10) {
              continue;
            }
            //@ LITH + SLTW/WTRV/WATR/DSTW/CBNW -> LITH + H2
            if (self.temp > 440.0) {
              self.life = 1024 + (self.ctype > 24 ? 96 : self.ctype * 4);
              sim.part_change_type(ID(neighborData), x + rx, y + ry, PT_H2);
              self.tmp = 10;
            } else {
              self.temp = restrict_flt(f(f(self.temp + f(20.365)) + f(f(Math.imul(self.ctype, self.ctype)) * 1.5)), MIN_TEMP, MAX_TEMP);
              sim.part_change_type(ID(neighborData), x + rx, y + ry, PT_H2);
              self.tmp += 1;
            }
            break;

          case PT_CO2:
            if (self.tmp + self.tmp2 >= 10) {
              continue;
            }
            sim.kill_part(ID(neighborData));
            self.tmp2 += 1;
            break;

          case PT_SPRK:
            if (pavg === PT_INSL || pavg === PT_RSSS) {
              break;
            }
            if (self.tmp + self.tmp2 >= 5) {
              continue; // too impure to do battery things.
            }
            if (neighbor.ctype === PT_PSCN && neighbor.life === 3 && !charged && !self.life) {
              charged = true;
            }
            break;

          case PT_NSCN:
            if (pavg === PT_INSL || pavg === PT_RSSS) {
              break;
            }
            if (neighbor.life === 0 && self.ctype > 0 && !self.life) {
              sim.part_change_type(ID(neighborData), x + rx, y + ry, PT_SPRK);
              neighbor.life = 4;
              neighbor.ctype = PT_NSCN;
              discharged = true;
            }
            break;

          case PT_FIRE:
            if (self.temp > 440.0 && sim.rng.chance(1, 40) && self.tmp < 6) {
              self.life = 1013;
              self.tmp += 1;
            }
            break;

          case PT_O2:
            if (self.life > 1000 && sim.rng.chance(1, 10)) {
              //@ LITH + O2 -> 2xPLSM
              sim.part_change_type(i, x, y, PT_PLSM);
              sim.part_change_type(ID(neighborData), x + rx, y + ry, PT_PLSM);
              sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 4.0;
              return 0;
            }
            break;
        }
      }
    }
  }
  if (charged) {
    self.ctype += 1;
    self.life = 8;
  }
  if (discharged) {
    self.ctype -= 1;
    self.life = 8;
  }

  for (let trade = 0; trade < 9; ++trade) {
    const rx = sim.rng.between(-3, 3);
    const ry = sim.rng.between(-3, 3);
    if (rx || ry) {
      const neighborData = pmap[y + ry][x + rx];
      if (TYP(neighborData) !== PT_LITH) {
        continue;
      }
      const neighbor = parts[ID(neighborData)];

      // Transfer overcharge explosion status to nearby LITH
      if (self.life < 1000 && self.ctype > 90 && neighbor.life > 1000)
        self.life = 1024;
      if (self.ctype > neighbor.ctype) {
        let transfer = self.ctype - neighbor.ctype;
        transfer -= idiv(transfer, 2);
        neighbor.ctype += transfer;
        self.ctype -= transfer;
        break;
      }
    }
  }

  // Overcharged - begin explosion
  if (self.life < 1000 && self.ctype >= 100)
    self.life = 1024;
  if (self.life === 1000) {
    self.life = 0;
    sim.part_change_type(i, x, y, PT_LAVA);
    if (self.tmp2 < 3) {
      self.temp = restrict_flt(f(500.0 + f(Math.imul(self.ctype, 10))), MIN_TEMP, MAX_TEMP);
      //@ LITH -> LAVA(LITH)
      self.ctype = PT_LITH;
    } else {
      self.temp = restrict_flt(f(2000.0 + f(Math.imul(self.ctype, 10))), MIN_TEMP, MAX_TEMP);
      //@ LITH -> LAVA(GLAS)
      self.ctype = PT_GLAS;
    }
  }
  return 0;
}

function graphics(gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  // Exploding lith
  if (cpart.life >= 1000) {
    const colour = 0xFFA040;
    g.colr = Red(colour);
    g.colg = Green(colour);
    g.colb = Blue(colour);
    g.pixel_mode |= PMODE_FLARE | PMODE_GLOW;
  }
  // Charged lith
  else if (cpart.ctype > 0) {
    let mult = idiv(gfctx.rng.between(idiv(cpart.ctype, 3), cpart.ctype), 15);
    mult = Math.min(6, mult);
    g.colr -= 30 * mult;
    g.colb += 20 * mult;
    g.pixel_mode |= PMODE_FLARE | PMODE_GLOW;
  }
  return 0;
}
