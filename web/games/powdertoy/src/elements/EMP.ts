// simulation/elements/EMP.cpp (+ EMP.h)
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import { binomial_gte1, SmallKBinomialGenerator } from '../sim/colour.ts';
import {
  CFDS, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_LIFE_DEC, SC_ELEC, TYPE_SOLID, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import {
  PT_ARAY, PT_BMTL, PT_BREC, PT_BRMT, PT_DLAY, PT_INST, PT_METL, PT_NSCN, PT_NTCT, PT_PSCN, PT_PTCT, PT_SPRK,
  PT_SWCH, PT_WIFI, PT_WIRE,
} from '../sim/numbers.ts';

export function Element_EMP(el: Element): void {
  el.Identifier = 'DEFAULT_PT_EMP';
  el.Name = 'EMP';
  el.Colour = 0x66AAFF; // 0x66AAFF_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.0;
  el.HotAir = f(0.0 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 3;

  el.Weight = 100;

  el.HeatConduct = 121;
  el.Description = 'Electromagnetic pulse. Breaks activated electronics.';

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Graphics = graphics;
}

class DeltaTempGenerator {
  protected stepSize: number;
  protected maxStepCount: number;
  protected binom: SmallKBinomialGenerator;
  constructor(n: number, p: number, tempStep: number) {
    this.stepSize = f(tempStep);
    // hardcoded limit of 10, to avoid massive lag if someone adds a few zeroes to MAX_TEMP
    this.maxStepCount = (f(MAX_TEMP / this.stepSize) < 10) ? ((itrunc(f(MAX_TEMP / this.stepSize)) >>> 0) + 1) : 10;
    this.binom = new SmallKBinomialGenerator(n, p, this.maxStepCount);
  }
  getDelta(randFloat: number): number {
    // randFloat should be a random float between 0 and 1
    return f(this.binom.calc(randFloat) * this.stepSize);
  }
  apply(sim: Simulation, p: Particle): void {
    p.temp = restrict_flt(f(p.temp + this.getDelta(sim.rng.uniform01())), MIN_TEMP, MAX_TEMP);
  }
}

export function Element_EMP_Trigger(sim: Simulation, triggerCount: number): void {
  /* Known differences from original one-particle-at-a-time version:
   * - SPRK that disappears during a frame (such as SPRK with life==0 on that frame) will not cause destruction around it.
   * - SPRK neighbour effects are calculated assuming the SPRK exists and causes destruction around it for the entire frame (so was not turned into BREL/NTCT partway through). This means mass EMP will be more destructive.
   * - The chance of a METL particle near sparked semiconductor turning into BRMT within 1 frame is different if triggerCount>2. See comment for prob_breakMETLMore.
   * - Probability of centre isElec particle breaking is slightly different (1/48 instead of 1-(1-1/80)*(1-1/120) = just under 1/48).
   */

  const parts = sim.parts;

  const prob_changeCenter = binomial_gte1(triggerCount, f(1.0 / 48));
  const temp_center = new DeltaTempGenerator(triggerCount, f(1.0 / 100), 3000.0);

  const prob_breakMETL = binomial_gte1(triggerCount, f(1.0 / 300));
  const prob_breakBMTL = binomial_gte1(triggerCount, f(1.0 / 160));
  const temp_metal = new DeltaTempGenerator(triggerCount, f(1.0 / 280), 3000.0);
  /* Probability of breaking from BMTL to BRMT, given that the particle has just broken from METL to BMTL. There is no mathematical reasoning for the numbers used, other than:
   * - larger triggerCount should make this more likely, so it should depend on triggerCount instead of being a constant probability
   * - triggerCount==1 should make this a chance of 0 (matching previous behaviour)
   * - triggerCount==2 should make this a chance of 1/160 (matching previous behaviour)
   */
  // TODO: work out in a more mathematical way what this should be?
  const prob_breakMETLMore = binomial_gte1(idiv(triggerCount, 2), f(1.0 / 160));

  const prob_randWIFI = binomial_gte1(triggerCount, f(1.0 / 8));
  const prob_breakWIFI = binomial_gte1(triggerCount, f(1.0 / 16));

  const prob_breakSWCH = binomial_gte1(triggerCount, f(1.0 / 100));
  const temp_SWCH = new DeltaTempGenerator(triggerCount, f(1.0 / 100), 2000.0);

  const prob_breakARAY = binomial_gte1(triggerCount, f(1.0 / 60));

  const prob_randDLAY = binomial_gte1(triggerCount, f(1.0 / 70));

  for (let r = 0; r < sim.parts.active; r++) {
    const t = parts[r].type;
    const rx = itrunc(parts[r].x);
    const ry = itrunc(parts[r].y);
    if (t === PT_SPRK || (t === PT_SWCH && parts[r].life !== 0 && parts[r].life !== 10) || (t === PT_WIRE && parts[r].ctype > 0)) {
      let is_elec = false;
      if (parts[r].ctype === PT_PSCN || parts[r].ctype === PT_NSCN || parts[r].ctype === PT_PTCT ||
        parts[r].ctype === PT_NTCT || parts[r].ctype === PT_INST || parts[r].ctype === PT_SWCH || t === PT_WIRE || t === PT_SWCH) {
        is_elec = true;
        temp_center.apply(sim, parts[r]);
        //@ EMP + PSCN/NSCN/PTCT/NTCT/INST/SWCH/WIRE -> EMP + BREC/NTCT
        if (sim.rng.uniform01() < prob_changeCenter) {
          if (sim.rng.chance(2, 5))
            sim.part_change_type(r, rx, ry, PT_BREC);
          else
            sim.part_change_type(r, rx, ry, PT_NTCT);
        }
      }
      for (let nx = -2; nx <= 2; nx++)
        for (let ny = -2; ny <= 2; ny++)
          if (rx + nx >= 0 && ry + ny >= 0 && rx + nx < XRES && ry + ny < YRES && (rx || ry)) {
            let n = sim.pmap[ry + ny][rx + nx];
            if (!n)
              continue;
            const ntype = TYP(n);
            n = ID(n);
            //Some elements should only be affected by wire/swch, or by a spark on inst/semiconductor
            //So not affected by spark on metl, watr etc
            if (is_elec) {
              let skip = false;
              switch (ntype) {
                case PT_METL:
                  temp_metal.apply(sim, parts[n]);
                  if (sim.rng.uniform01() < prob_breakMETL) {
                    //@ EMP + METL -> EMP + BMTL/BRMT
                    sim.part_change_type(n, rx + nx, ry + ny, PT_BMTL);
                    if (sim.rng.uniform01() < prob_breakMETLMore) {
                      sim.part_change_type(n, rx + nx, ry + ny, PT_BRMT);
                      parts[n].temp = restrict_flt(f(parts[n].temp + 1000.0), MIN_TEMP, MAX_TEMP);
                    }
                  }
                  break;
                case PT_BMTL:
                  //@ EMP + BMTL -> EMP + BRMT
                  temp_metal.apply(sim, parts[n]);
                  if (sim.rng.uniform01() < prob_breakBMTL) {
                    sim.part_change_type(n, rx + nx, ry + ny, PT_BRMT);
                    parts[n].temp = restrict_flt(f(parts[n].temp + 1000.0), MIN_TEMP, MAX_TEMP);
                  }
                  break;
                case PT_WIFI:
                  if (sim.rng.uniform01() < prob_randWIFI) {
                    // Randomize channel
                    parts[n].temp = sim.rng.between(0, itrunc(MAX_TEMP) - 1);
                  }
                  //@ EMP + WIFI -> EMP + BREC
                  if (sim.rng.uniform01() < prob_breakWIFI) {
                    sim.create_part(n, rx + nx, ry + ny, PT_BREC);
                    parts[n].temp = restrict_flt(f(parts[n].temp + 1000.0), MIN_TEMP, MAX_TEMP);
                  }
                  skip = true; // continue
                  break;
                default:
                  break;
              }
              if (skip)
                continue;
            }
            switch (ntype) {
              case PT_SWCH:
                //@ EMP + SWCH -> EMP + BREC
                if (sim.rng.uniform01() < prob_breakSWCH)
                  sim.part_change_type(n, rx + nx, ry + ny, PT_BREC);
                temp_SWCH.apply(sim, parts[n]);
                break;
              case PT_ARAY:
                //@ EMP + ARAY -> EMP + BREC
                if (sim.rng.uniform01() < prob_breakARAY) {
                  sim.create_part(n, rx + nx, ry + ny, PT_BREC);
                  parts[n].temp = restrict_flt(f(parts[n].temp + 1000.0), MIN_TEMP, MAX_TEMP);
                }
                break;
              case PT_DLAY:
                if (sim.rng.uniform01() < prob_randDLAY) {
                  // Randomize delay
                  parts[n].temp = f(sim.rng.between(0, 255) + f(273.15));
                }
                break;
              default:
                break;
            }
          }
    }
  }
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life) {
    g.colr = itrunc(cpart.life * 1.5);
    g.colg = itrunc(cpart.life * 1.5);
    g.colb = 200 - (cpart.life);
  }
  return 0;
}
