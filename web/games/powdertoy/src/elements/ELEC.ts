// simulation/elements/ELEC.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, R_TEMP, SC_NUCLEAR,
  TYPE_ENERGY, XRES, YRES, TYP, ID,
} from '../sim/config.ts';
import {
  PT_CBNW, PT_DEUT, PT_DSTW, PT_EMBR, PT_EXOT, PT_GLAS, PT_H2, PT_LCRY, PT_NBLE, PT_NEUT, PT_NONE, PT_O2, PT_PROT,
  PT_RSST, PT_SLTW, PT_SPRK, PT_WATR,
} from '../sim/numbers.ts';

export function Element_ELEC(el: Element): void {
  el.Identifier = 'DEFAULT_PT_ELEC';
  el.Name = 'ELEC';
  el.Colour = 0xDFEFFF; // 0xDFEFFF_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(1.00);
  el.Loss = f(1.00);
  el.Collision = f(-0.99);
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = -1;

  el.DefaultProperties.temp = f(f(R_TEMP + 200.0) + f(273.15)); // R_TEMP + 200.0f + 273.15f
  el.HeatConduct = 251;
  el.Description = 'Electrons. Sparks electronics, reacts with NEUT and WATR.';

  el.Properties = TYPE_ENERGY | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

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
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      let r = pmap[y + ry][x + rx];
      if (!r)
        r = sim.photons[y + ry][x + rx];
      if (!r)
        continue;
      const rt = TYP(r);
      switch (rt) {
        case PT_GLAS:
          for (let rrx = -1; rrx <= 1; rrx++) {
            for (let rry = -1; rry <= 1; rry++) {
              if (x + rx + rrx >= 0 && y + ry + rry >= 0 && x + rx + rrx < XRES && y + ry + rry < YRES) {
                //@ ELEC + GLAS -> EMBR + GLAS
                const nb = sim.create_part(-1, x + rx + rrx, y + ry + rry, PT_EMBR);
                if (nb !== -1) {
                  parts[nb].tmp = 0;
                  parts[nb].life = 50;
                  parts[nb].temp = f(parts[i].temp * f(0.8));
                  parts[nb].vx = sim.rng.between(-10, 10);
                  parts[nb].vy = sim.rng.between(-10, 10);
                }
              }
            }
          }
          sim.kill_part(i);
          return 1;
        case PT_LCRY:
          parts[ID(r)].tmp2 = sim.rng.between(5, 9);
          break;
        case PT_WATR:
        case PT_DSTW:
        case PT_SLTW:
        case PT_CBNW:
          //@ ELEC + WATR/DSTW/SLTW/CBNW -> O2/H2
          if (sim.rng.chance(1, 3))
            sim.create_part(ID(r), x + rx, y + ry, PT_O2);
          else
            sim.create_part(ID(r), x + rx, y + ry, PT_H2);
          sim.kill_part(i);
          return 1;
        case PT_PROT: // this is the correct reaction, not NEUT, but leaving NEUT in anyway
          if (parts[ID(r)].tmp2 & 0x1)
            break;
        // falls through
        case PT_NEUT:
          //@ ELEC + PROT/NEUT -> H2
          sim.part_change_type(ID(r), x + rx, y + ry, PT_H2);
          parts[ID(r)].life = 0;
          parts[ID(r)].ctype = 0;
          sim.kill_part(i);
          break;
        case PT_DEUT:
          if (parts[ID(r)].life < 6000)
            parts[ID(r)].life += 1;
          parts[ID(r)].temp = 0;
          sim.kill_part(i);
          return 1;
        case PT_EXOT:
          parts[ID(r)].tmp2 += 5;
          parts[ID(r)].life = 1000;
          break;
        case PT_RSST: //Destroy RSST
          if (!rx && !ry) {
            sim.kill_part(ID(r));
            sim.kill_part(i);

            return 1;
          }
          break;
        case PT_NONE: //seems to speed up ELEC even if it isn't used
          break;
        default:
          if ((elements[rt].Properties & PROP_CONDUCTS) && (rt !== PT_NBLE || parts[i].temp < 2273.15)) {
            sim.create_part(-1, x + rx, y + ry, PT_SPRK);
            sim.kill_part(i);
            return 1;
          }
          break;
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 70;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode |= FIRE_ADD;
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  const a = f(f(sim.rng.between(0, 359) * f(Math.PI)) / f(180.0));
  sim.parts[i].life = 680;
  sim.parts[i].vx = f(2.0 * f(Math.cos(a)));
  sim.parts[i].vy = f(2.0 * f(Math.sin(a)));
}
