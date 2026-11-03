// simulation/elements/VIRS.cpp (+ VIRS.h)
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_TMP2 } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, NO_DECO, NT, PMODE_BLUR, PROP_DEADLY, SC_LIQUID, TYP, TYPE_LIQUID,
} from '../sim/config.ts';
import {
  PT_BASE, PT_DMND, PT_PLSM, PT_PROT, PT_SOAP, PT_VIRS, PT_VRSG, PT_VRSS,
} from '../sim/numbers.ts';

export function Element_VIRS(el: Element): void {
  el.Identifier = 'DEFAULT_PT_VIRS';
  el.Name = 'VIRS';
  el.Colour = 0xFE11F6;
  el.MenuVisible = 1;
  el.MenuSection = SC_LIQUID;
  el.Enabled = 1;

  el.Advection = f(0.6);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.98);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 2;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 20;

  el.Weight = 31;

  el.DefaultProperties.temp = f(72.0 + f(273.15));
  el.HeatConduct = 251;
  el.Description = 'Virus. Turns everything it touches into virus.';

  el.Properties = TYPE_LIQUID | PROP_DEADLY;
  el.CarriesTypeIn = (1 << FIELD_TMP2) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = 305.0;
  el.LowTemperatureTransition = PT_VRSS; //@ VIRS -> VRSS
  el.HighTemperature = 673.0;
  el.HighTemperatureTransition = PT_VRSG; //@ VIRS -> VRSG

  el.DefaultProperties.tmp4 = 250;

  el.Update = Element_VIRS_update;
  el.Graphics = graphics;
}

export function Element_VIRS_update(sim: Simulation, i: number, x: number, y: number, surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //tmp3 measures how many frames until it is cured (0 if still actively spreading and not being cured)
  //tmp4 measures how many frames until it dies
  let rndstore = sim.rng.gen();
  if (parts[i].tmp3) {
    parts[i].tmp3 -= (rndstore & 0x1) ? 0 : 1;
    //has been cured, so change back into the original element
    if (!parts[i].tmp3) {
      sim.part_change_type(i, x, y, parts[i].tmp2);
      parts[i].tmp2 = 0;
      parts[i].tmp3 = 0;
      parts[i].tmp4 = 0;
    }
    return 0;
    //cured virus is never in below code
  }
  //decrease tmp4 so it slowly dies
  if (parts[i].tmp4) {
    if (!(rndstore & 0x7) && --parts[i].tmp4 <= 0) {
      sim.kill_part(i);
      return 1;
    }
    rndstore >>= 3;
  }

  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;

        //spread "being cured" state
        if (parts[ID(r)].tmp3 && (TYP(r) === PT_VIRS || TYP(r) === PT_VRSS || TYP(r) === PT_VRSG)) {
          parts[i].tmp3 = parts[ID(r)].tmp3 + ((rndstore & 0x3) ? 2 : 1);
          return 0;
        }
        //soap cures virus
        else if (TYP(r) === PT_SOAP) {
          parts[i].tmp3 += 10;
          if (!(rndstore & 0x3))
            sim.kill_part(ID(r));
          return 0;
        } else if (TYP(r) === PT_PLSM) {
          if (surround_space && sim.rng.chance(10 + itrunc(sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0]), 100)) {
            //@ VIRS/VRSS/VRSG + PLSM -> 2xPLSM
            sim.create_part(i, x, y, PT_PLSM);
            return 1;
          }
        }
        //transforms things into virus here
        else if (TYP(r) !== PT_VIRS && TYP(r) !== PT_VRSS && TYP(r) !== PT_VRSG && TYP(r) !== PT_DMND && TYP(r) !== PT_BASE) {
          if (!(rndstore & 0x7)) {
            parts[ID(r)].tmp2 = TYP(r);
            parts[ID(r)].tmp3 = 0;
            if (parts[i].tmp4)
              parts[ID(r)].tmp4 = parts[i].tmp4 + 1;
            else
              parts[ID(r)].tmp4 = 0;
            if (parts[ID(r)].temp < 305.0)
              sim.part_change_type(ID(r), x + rx, y + ry, PT_VRSS);
            else if (parts[ID(r)].temp > 673.0)
              sim.part_change_type(ID(r), x + rx, y + ry, PT_VRSG);
            else
              sim.part_change_type(ID(r), x + rx, y + ry, PT_VIRS);
          }
          rndstore >>= 3;
        }
        //protons make VIRS last forever
        else if (TYP(sim.photons[y + ry][x + rx]) === PT_PROT) {
          parts[i].tmp4 = 0;
        }
      }
      //reset rndstore only once, halfway through
      else if (!rx && !ry)
        rndstore = sim.rng.gen();
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.pixel_mode |= PMODE_BLUR;
  g.pixel_mode |= NO_DECO;
  return 1;
}
