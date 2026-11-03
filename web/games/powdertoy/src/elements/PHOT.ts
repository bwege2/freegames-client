// simulation/elements/PHOT.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, FIRE_ADD, FLAG_PHOTDECO, ID, IPH, IPL, ITH, ITL, NO_DECO, NT, PMODE_ADD, PMODE_FLAT, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, PROP_PHOTPASS, PT_NUM, R_TEMP, SC_NUCLEAR, TYP, TYPE_ENERGY } from '../sim/config.ts';
import { PT_BGLA, PT_FILT, PT_ISOZ, PT_ISZS, PT_PHOT, PT_PQRT, PT_QRTZ, PT_RSSS, PT_RSST } from '../sim/numbers.ts';
import { Element_FIRE_update } from '../elements/FIRE.ts';
import { Element_FILT_interactWavelengths } from '../elements/FILT.ts';

export function Element_PHOT(el: Element): void {
  el.Identifier = "DEFAULT_PT_PHOT";
  el.Name = "PHOT";
  el.Colour = 0xFFFFFF;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 1.00;
  el.Collision = f(-0.99);
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = -1;

  el.DefaultProperties.temp = f(f(R_TEMP + 900.0) + f(273.15));
  el.HeatConduct = 251;
  el.Description = "Photons. Refract through glass, and different elements change its color. Can ignite flammable materials.";

  el.Properties = TYPE_ENERGY | PROP_PHOTPASS | PROP_LIFE_DEC | PROP_LIFE_KILL_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 680;
  el.DefaultProperties.ctype = 0x3FFFFFFF;

  el.Update = update;
  el.Graphics = graphics;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;

  if (!(parts[i].ctype&0x3FFFFFFF)) {
    sim.kill_part(i);
    return 1;
  }
  if (parts[i].temp > 506)
    if (sim.rng.chance(1, 10))
      Element_FIRE_update(sim, i, x, y, surround_space, nt, parts, pmap);
  for (let rx = -1; rx <= 1; rx++)
  {
    for (let ry = -1; ry <= 1; ry++)
    {
      const r = pmap[y+ry][x+rx];
      if (!r)
        continue;
      if (TYP(r)==PT_ISOZ || TYP(r)==PT_ISZS)
      {
        if (sim.rng.chance(1, 400))
        {
          parts[i].vx *= f(0.90);
          parts[i].vy *= f(0.90);
          //@ PHOT + ISOZ/ISZS -> 2xPHOT
          sim.create_part(ID(r), x+rx, y+ry, PT_PHOT);
          const rrr = f(f(sim.rng.between(0, 359) * f(Math.PI)) / 180.0);
          let rr;
          if (TYP(r) == PT_ISOZ)
            rr = itrunc(f(sim.rng.between(128, 255) / 127.0));
          else
            rr = itrunc(f(sim.rng.between(128, 355) / 127.0));
          parts[ID(r)].vx = f(rr*f(Math.cos(rrr)));
          parts[ID(r)].vy = f(rr*f(Math.sin(rrr)));
          sim.pv[(y/CELL) | 0][(x/CELL) | 0] -= f(15.0 * CFDS);
        }
      }
      else if((TYP(r) == PT_QRTZ || TYP(r) == PT_PQRT) && !ry && !rx)//if on QRTZ
      {
        const a = f(f(sim.rng.between(0, 359) * f(Math.PI)) / 180.0);
        parts[i].vx = f(3.0*f(Math.cos(a)));
        parts[i].vy = f(3.0*f(Math.sin(a)));
        if(parts[i].ctype == 0x3FFFFFFF)
          parts[i].ctype = 0x1F << sim.rng.between(0, 25);
        if (parts[i].life)
          parts[i].life++; //Delay death
      }
      else if(TYP(r) == PT_BGLA && !ry && !rx)//if on BGLA
      {
        const a = f(sim.rng.between(-50, 50) * f(0.001));
        const rx = f(Math.cos(a)), ry = f(Math.sin(a));
        let vx, vy;
        vx = f(f(rx * parts[i].vx) + f(ry * parts[i].vy));
        vy = f(f(rx * parts[i].vy) - f(ry * parts[i].vx));
        parts[i].vx = vx;
        parts[i].vy = vy;
      }
      else if(TYP(r) == PT_RSST && !ry && !rx)//if on RSST, make it solid
      {
        let ct_under, tmp_under;

        ct_under = parts[ID(r)].ctype;
        tmp_under = parts[ID(r)].tmp;

        //If there's a correct ctype set, solidify RSST into it
        if(ct_under > 0 && ct_under < PT_NUM)
        {
          //@ PHOT + RSST(ctype) -> ctype
          sim.create_part(ID(r), x, y, ct_under);

          //If there's a correct tmp set, use it for ctype
          if((tmp_under > 0) && (tmp_under < PT_NUM) && (elements[ct_under].CarriesTypeIn & (1 << FIELD_CTYPE)))
            parts[ID(r)].ctype = tmp_under;
        }
        else //@ PHOT + RSST -> RSSS
          sim.part_change_type(ID(r), x, y, PT_RSSS); //Default to RSSS if no ctype

        sim.kill_part(i);

        return 1;
      }
      else if (TYP(r) == PT_FILT && parts[ID(r)].tmp==9)
      {
        parts[i].vx += f(f(sim.rng.between(-500, 500))/1000.0);
        parts[i].vy += f(f(sim.rng.between(-500, 500))/1000.0);
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let x = 0;
  g.colr = g.colg = g.colb = 0;
  for (x=0; x<12; x++) {
    g.colr += (cpart.ctype >> (x+18)) & 1;
    g.colb += (cpart.ctype >>  x)     & 1;
  }
  for (x=0; x<12; x++)
    g.colg += (cpart.ctype >> (x+9))  & 1;
  x = idiv(624, g.colr+g.colg+g.colb+1);
  g.colr *= x;
  g.colg *= x;
  g.colb *= x;

  g.firea = 100;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode &= ~PMODE_FLAT;
  g.pixel_mode |= FIRE_ADD | PMODE_ADD | NO_DECO;
  if (cpart.flags & FLAG_PHOTDECO)
  {
    g.pixel_mode &= ~NO_DECO;
  }
  return 0;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, _v: number): void {
  const a = f(sim.rng.between(0, 7) * f(0.78540));
  sim.parts[i].vx = f(3.0 * f(Math.cos(a)));
  sim.parts[i].vy = f(3.0 * f(Math.sin(a)));
  if (TYP(sim.pmap[y][x]) == PT_FILT)
    sim.parts[i].ctype = Element_FILT_interactWavelengths(sim, sim.parts[ID(sim.pmap[y][x])], sim.parts[i].ctype);
}
