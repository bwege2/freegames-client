// simulation/elements/BASE.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, NT, PMODE_BLUR, PMODE_SPARK, PROP_CONDUCTS, PROP_DEADLY, SC_LIQUID, TYP,
  TYPE_LIQUID, TYPE_SOLID,
} from '../sim/config.ts';
import {
  PT_ACID, PT_BASE, PT_BCOL, PT_BMTL, PT_BOYL, PT_BRMT, PT_CAUS, PT_CBNW, PT_CLNE, PT_DSTW, PT_GEL, PT_GOO, PT_GUNP,
  PT_ICEI, PT_LAVA, PT_MERC, PT_OIL, PT_PCLN, PT_ROCK, PT_SALT, PT_SLTW, PT_SNOW, PT_SOAP, PT_SPRK, PT_WATR,
} from '../sim/numbers.ts';

export function Element_BASE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_BASE';
  el.Name = 'BASE';
  el.Colour = 0x90D5FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = 0.5;
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.96);
  el.Collision = 0.0;
  el.Gravity = f(0.08);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 16;

  el.HeatConduct = 31;
  el.HeatCapacity = 1.5;
  el.Description = 'Corrosive liquid. Rusts conductive solids, neutralizes acid.';

  el.Properties = TYPE_LIQUID | PROP_DEADLY;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 76;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;

  //Reset spark effect
  parts[i].tmp = 0;

  if (parts[i].life < 1)
    parts[i].life = 1;

  if (parts[i].life > 100)
    parts[i].life = 100;

  const pres = sim.pv[(y / CELL) | 0][(x / CELL) | 0];

  //Base evaporates into BOYL or increases concentration
  if (parts[i].life < 100 && pres < 10.0 && parts[i].temp > f(120.0 + f(273.15))) {
    //Slow down boiling
    if (sim.rng.chance(1, 20)) {
      //This way we preserve the total amount of concentrated BASE in the solution
      if (sim.rng.chance(1, parts[i].life + 1)) {
        //@ BASE -> BOYL
        sim.createPartTempVel(i, x, y, PT_BOYL);
        return 1;
      } else {
        parts[i].life++;
        //Enthalpy of vaporization
        parts[i].temp = f(parts[i].temp - f(20.0 / f(parts[i].life)));
      }
    }
  }

  //Base's freezing point lowers with its concentration
  if (parts[i].temp < f(f(273.15) - f(f(parts[i].life) / 4.0))) {
    //@ BASE -> ICE(BASE)
    //We don't save base's concentration, so ICEI(BASE) will unfreeze into life = 0
    sim.createPartTempVel(i, x, y, PT_ICEI);
    parts[i].ctype = PT_BASE;
    parts[i].life = 0;
    return 1;
  }

  //Reactions
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);

        //Don't react with some elements
        if (rt !== PT_BASE && rt !== PT_SALT && rt !== PT_SLTW && rt !== PT_BOYL && rt !== PT_MERC &&
          rt !== PT_BMTL && rt !== PT_BRMT && rt !== PT_SOAP && rt !== PT_CLNE && rt !== PT_PCLN &&
          !(rt === PT_ICEI && parts[ID(r)].ctype === PT_BASE) && !(rt === PT_SNOW && parts[ID(r)].ctype === PT_BASE) &&
          !(rt === PT_SPRK && parts[ID(r)].ctype === PT_BMTL) && !(rt === PT_SPRK && parts[ID(r)].ctype === PT_BRMT)) {
          //Base is diluted by water
          if (parts[i].life > 1 && (rt === PT_WATR || rt === PT_DSTW || rt === PT_CBNW)) {
            if (sim.rng.chance(1, 20)) {
              const saturh = idiv(parts[i].life, 2);

              //@ BASE + WATR/DSTW/CBNW -> 2xBASE
              sim.createPartTempVel(ID(r), x + rx, y + ry, PT_BASE);
              parts[ID(r)].life = saturh;
              parts[ID(r)].temp = f(parts[ID(r)].temp + f(f(saturh) / 10.0));
              parts[i].life -= saturh;
            }
          } //Base neutralizes acid
          else if (rt === PT_ACID) {
            if (parts[ID(r)].life > 50 && parts[i].life > 0) {
              parts[ID(r)].life--;
              parts[i].life--;
            }

            //@ BASE + ACID -> 2xSLTW
            if (parts[ID(r)].life <= 50)
              sim.createPartTempVel(ID(r), x + rx, y + ry, PT_SLTW);
            if (parts[i].life <= 0) {
              sim.createPartTempVel(i, x, y, PT_SLTW);
              return 1;
            }
          } //Base neutralizes CAUS
          else if (rt === PT_CAUS) {
            if (parts[ID(r)].life > 50 && parts[i].life > 0) {
              parts[ID(r)].life--;
              parts[i].life--;
            }

            //@ BASE + CAUS -> SLTW
            if (parts[ID(r)].life <= 50)
              sim.kill_part(ID(r));
            if (parts[i].life <= 0) {
              sim.createPartTempVel(i, x, y, PT_SLTW);
              return 1;
            }
          } //@ BASE + OIL -> SOAP
          else if (parts[i].life >= 70 && rt === PT_OIL) {
            sim.createPartTempVel(i, x, y, PT_SOAP);
            sim.kill_part(ID(r));
            return 1;
          } //@ BASE + GOO -> BASE + GEL
          else if (parts[i].life > 1 && rt === PT_GOO) {
            sim.createPartTempVel(ID(r), x + rx, y + ry, PT_GEL);
            parts[i].life--;
          } //@ BASE + BCOL -> BASE + GUNP
          else if (parts[i].life > 1 && rt === PT_BCOL) {
            sim.createPartTempVel(ID(r), x + rx, y + ry, PT_GUNP);
            parts[i].life--;
          } //@ BASE + LAVA(ROCK) -> MERC
          else if (rt === PT_LAVA && parts[ID(r)].ctype === PT_ROCK && pres >= 10.0 && sim.rng.chance(1, 1000)) {
            sim.createPartTempVel(i, x, y, PT_MERC);
            sim.kill_part(ID(r));
            return 1;
          } //Base rusts conductive solids
          else if (parts[i].life >= 10 &&
            (elements[rt].Properties & (TYPE_SOLID | PROP_CONDUCTS)) === (TYPE_SOLID | PROP_CONDUCTS) && sim.rng.chance(1, 10)) {
            //@ BASE + conductive solid -> BASE + BMTL
            sim.createPartTempVel(ID(r), x + rx, y + ry, PT_BMTL);
            parts[ID(r)].tmp = sim.rng.between(20, 29);
            parts[i].life--;
            //Draw a spark effect
            parts[i].tmp = 1;
          } //Base destroys a substance slower if acid destroys it faster
          else if (elements[rt].Hardness > 0 && elements[rt].Hardness < 50 &&
            parts[i].life >= (2 * elements[rt].Hardness) && sim.rng.chance(50 - elements[rt].Hardness, 1000)) {
            sim.kill_part(ID(r));
            parts[i].life -= 2;
            //Draw a spark
            parts[i].tmp = 1;
          }
        }
      }
    }
  }

  //Diffusion
  for (let trade = 0; trade < 2; trade++) {
    const rx = sim.rng.between(-1, 1);
    const ry = sim.rng.between(-1, 1);
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r)
        continue;
      if (TYP(r) === PT_BASE && (parts[i].life > parts[ID(r)].life) && parts[i].life > 1) {
        const temp = parts[i].life - parts[ID(r)].life;
        if (temp === 1) {
          parts[ID(r)].life++;
          parts[i].life--;
        } else if (temp > 0) {
          parts[ID(r)].life += idiv(temp, 2);
          parts[i].life -= idiv(temp, 2);
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const s = cpart.life;

  if (s <= 25) {
    g.colr = 0x33;
    g.colg = 0x4C;
    g.colb = 0xD8;
  } else if (s <= 50) {
    g.colr = 0x58;
    g.colg = 0x83;
    g.colb = 0xE8;
  } else if (s <= 75) {
    g.colr = 0x7D;
    g.colg = 0xBA;
    g.colb = 0xF7;
  }

  g.pixel_mode |= PMODE_BLUR;

  if (cpart.tmp === 1)
    g.pixel_mode |= PMODE_SPARK;

  return 0;
}
