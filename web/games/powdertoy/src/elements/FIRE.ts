// simulation/elements/FIRE.cpp (+ FIRE.h)
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import { Blue, Green, Red, flameTableAt } from '../sim/colour.ts';
import { CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITL, MAX_TEMP, MIN_TEMP, NT, PMODE_NONE, PROP_LIFE_DEC, PROP_LIFE_KILL, R_TEMP, SC_EXPLOSIVE, TYP, TYPE_GAS, WL_STREAM } from '../sim/config.ts';
import { PT_BCOL, PT_BMTL, PT_BRMT, PT_CLST, PT_CNCT, PT_COAL, PT_CRMC, PT_DSTW, PT_ETRD, PT_FIRE, PT_GLAS, PT_GOLD, PT_HEAC, PT_ICEI, PT_INSL, PT_INWR, PT_IRON, PT_LAVA, PT_LITH, PT_LRBD, PT_METL, PT_NBLE, PT_NONE, PT_NSCN, PT_NTCT, PT_O2, PT_PHOT, PT_PLSM, PT_PLUT, PT_PQRT, PT_PSCN, PT_PTCT, PT_PTNM, PT_QRTZ, PT_RBDM, PT_ROCK, PT_SALT, PT_SAND, PT_SLCN, PT_SLTW, PT_SMKE, PT_SNOW, PT_SPNG, PT_SPRK, PT_STNE, PT_THRM, PT_TTAN, PT_TUNG, PT_URAN, PT_WATR, PT_WTRV } from '../sim/numbers.ts';

export function Element_FIRE(el: Element): void {
  el.Identifier = "DEFAULT_PT_FIRE";
  el.Name = "FIRE";
  el.Colour = 0xFF1000;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = f(0.9);
  el.AirDrag = f(f(0.04) * CFDS);
  el.AirLoss = f(0.97);
  el.Loss = f(0.20);
  el.Collision = 0.0;
  el.Gravity = f(-0.1);
  el.Diffusion = 0.00;
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 2;

  el.DefaultProperties.temp = f(f(R_TEMP + 400.0) + f(273.15));
  el.HeatConduct = 88;
  el.Description = "Ignites flammable materials. Heats air.";

  el.Properties = TYPE_GAS | PROP_LIFE_DEC | PROP_LIFE_KILL;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 2773.0;
  el.HighTemperatureTransition = PT_PLSM; //@ FIRE -> PLSM

  el.Update = Element_FIRE_update;
  el.Graphics = graphics;
  el.Create = create;
}

// FIRE.h
export function Element_FIRE_update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const t = parts[i].type;
  switch (t)
  {
  case PT_PLSM:
    if (parts[i].life <=1)
    {
      if (parts[i].ctype == PT_NBLE)
      {
        //@ PLSM(NBLE) -> NBLE
        sim.part_change_type(i,x,y,PT_NBLE);
        parts[i].life = 0;
      }
      else if ((parts[i].tmp&0x3) == 3)
      {
        //@ PLSM + O2 + H2 -> WTRV(FIRE)
        sim.part_change_type(i,x,y,PT_WTRV);
        parts[i].life = 0;
        parts[i].ctype = PT_FIRE;
      }
    }
    break;
  case PT_FIRE:
    if (parts[i].life <=1)
    {
      if ((parts[i].tmp&0x3) == 3)
      {
        //@ FIRE + O2 + H2 -> WTRV(FIRE)
        sim.part_change_type(i,x,y,PT_WTRV);
        parts[i].life = 0;
        parts[i].ctype = PT_FIRE;
      }
      else if (parts[i].temp<625)
      {
        //@ FIRE -> SMKE
        sim.part_change_type(i,x,y,PT_SMKE);
        parts[i].life = sim.rng.between(250, 269);
      }
    }
    break;
  case PT_LAVA: {
    const pres = sim.pv[(y / CELL) | 0][(x / CELL) | 0];
    if (parts[i].ctype == PT_ROCK)
    {
      if (pres <= -9)
      {
        //@ LAVA(ROCK) -> LAVA(STNE)
        parts[i].ctype = PT_STNE;
        break;
      }

      if (pres >= 25 && sim.rng.chance(1, 12500))
      {
        if (pres <= 50)
        {
          //@ LAVA(ROCK) -> LAVA(BRMT/CNCT)
          if (sim.rng.chance(1, 2))
            parts[i].ctype = PT_BRMT;
          else
            parts[i].ctype = PT_CNCT;
        }
        else if (pres <= 75)
        {
          //@ LAVA(ROCK) -> LAVA(GOLD/QRTZ)
          if (pres >= 73 || sim.rng.chance(1, 8))
            parts[i].ctype = PT_GOLD;
          else
            parts[i].ctype = PT_QRTZ;
        }
        else if (pres <= 100 && parts[i].temp >= 5000)
        {
          //@ LAVA(ROCK) -> LAVA(TTAN/IRON)
          if (sim.rng.chance(1, 5)) // 1 in 5 chance IRON to TTAN
            parts[i].ctype = PT_TTAN;
          else
            parts[i].ctype = PT_IRON;
        }
        else if (parts[i].temp >= 5000 && sim.rng.chance(1, 5))
        {
          //@ LAVA(ROCK) -> LAVA(URAN/PLUT/TUNG)
          if (sim.rng.chance(1, 5))
            parts[i].ctype = PT_URAN;
          else if (sim.rng.chance(1, 5))
            parts[i].ctype = PT_PLUT;
          else
            parts[i].ctype = PT_TUNG;
        }
      }
    }
    else if (parts[i].ctype == PT_GOLD && pres < -200.0 && parts[i].temp > elements[PT_PTNM].HighTemperature && sim.rng.chance(1, 20000))
    {
      //@ LAVA(GOLD) -> LAVA(PTNM)
      parts[i].ctype = PT_PTNM;
      sim.pv[(y/CELL) | 0][(x/CELL) | 0] += 2.0;
    }
    else if ((parts[i].ctype == PT_STNE || !parts[i].ctype) && pres >= 30.0 && (parts[i].temp > elements[PT_ROCK].HighTemperature || pres < elements[PT_ROCK].HighPressure)) // Form ROCK with pressure, if it will stay molten or not immediately break
    {
      //@ LAVA -> LAVA(ROCK)
      parts[i].tmp2 = sim.rng.between(0, 10); // Provide tmp2 for color noise
      parts[i].ctype = PT_ROCK;
    }
    break;
  }
  default:
    break;
  }
  for (let rx = -2; rx <= 2; rx++)
  {
    for (let ry = -2; ry <= 2; ry++)
    {
      if (rx || ry)
      {
        const r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        const rt = TYP(r);

        //THRM burning
        if (rt==PT_THRM && (t==PT_FIRE || t==PT_PLSM || t==PT_LAVA))
        {
          //@ FIRE/PLSM/LAVA + THRM -> FIRE/PLSM/LAVA + LAVA(BMTL/THRM)
          if (sim.rng.chance(1, 500)) {
            sim.part_change_type(ID(r),x+rx,y+ry,PT_LAVA);
            parts[ID(r)].ctype = PT_BMTL;
            parts[ID(r)].temp = 3500.0;
            sim.pv[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0] += 50.0;
          } else {
            sim.part_change_type(ID(r),x+rx,y+ry,PT_LAVA);
            parts[ID(r)].life = 400;
            parts[ID(r)].ctype = PT_THRM;
            parts[ID(r)].temp = 3500.0;
            parts[ID(r)].tmp = 20;
          }
          continue;
        }

        if ((rt==PT_COAL) || (rt==PT_BCOL))
        {
          if ((t==PT_FIRE || t==PT_PLSM))
          {
            if (parts[ID(r)].life>100 && sim.rng.chance(1, 500))
            {
              parts[ID(r)].life = 99;
            }
          }
          else if (t==PT_LAVA)
          {
            //@ LAVA(IRON) + COAL/BCOL -> LAVA(METL)
            if (parts[i].ctype == PT_IRON && sim.rng.chance(1, 500))
            {
              parts[i].ctype = PT_METL;
              sim.kill_part(ID(r));
              continue;
            }
            //@ LAVA + COAL/BCOL -> LAVA(SLCN)
            if ((parts[i].ctype == PT_STNE || parts[i].ctype == PT_NONE) && sim.rng.chance(1, 60))
            {
              parts[i].ctype = PT_SLCN;
              sim.kill_part(ID(r));
              continue;
            }
          }
        }

        if (t == PT_LAVA)
        {
          //@ LAVA(QRTZ) + LAVA(CLST) -> 2xLAVA(CRMC)
          if (parts[i].ctype == PT_QRTZ && rt == PT_LAVA && parts[ID(r)].ctype == PT_CLST)
          {
            const pres = f(Math.max(f(sim.pv[(y/CELL) | 0][(x/CELL) | 0]*10.0), 0.0));
            if (parts[i].temp >= f(f(pres+elements[PT_CRMC].HighTemperature)+50.0))
            {
              parts[i].ctype = PT_CRMC;
              parts[ID(r)].ctype = PT_CRMC;
            }
          }
          else if (rt == PT_O2 && parts[i].ctype == PT_SLCN)
          {
            //@ LAVA(SLCN) + O2 -> LAVA(SAND/CLST/PQRT/STNE)
            switch (sim.rng.between(0, 2))
            {
            case 0:
              parts[i].ctype = PT_SAND;
              break;

            case 1:
              parts[i].ctype = PT_CLST;
              // avoid creating CRMC.
              if (parts[i].temp >= f(elements[PT_PQRT].HighTemperature * 3))
              {
                parts[i].ctype = PT_PQRT;
              }
              break;

            case 2:
              parts[i].ctype = PT_STNE;
              break;
            }
            parts[i].tmp = 0;
            sim.kill_part(ID(r));
            continue;
          }
          else if (rt == PT_LAVA && (parts[ID(r)].ctype == PT_METL || parts[ID(r)].ctype == PT_BMTL) && parts[i].ctype == PT_SLCN)
          {
            //@ LAVA(SLCN) + LAVA(METL/BMTL) -> LAVA(NSCN) + LAVA(PSCN)
            parts[i].tmp = 0;
            parts[i].ctype = PT_NSCN;
            parts[ID(r)].ctype = PT_PSCN;
          }
          else if (parts[i].ctype == PT_SLCN && rt == PT_LAVA && parts[ID(r)].ctype == PT_SALT)
          {
            //@ LAVA(SLCN) + LAVA(SALT) -> LAVA(LITH)
            if (parts[i].temp > elements[PT_LITH].HighTemperature && sim.rng.chance(1, 1000))
            {
              parts[i].ctype = PT_LITH;
              parts[i].tmp = 0;
              parts[i].tmp2 = 0;
              parts[i].life = 0;

              sim.kill_part(ID(r));
              continue;
            }
          }
          else if (rt == PT_HEAC && parts[i].ctype == PT_HEAC)
          {
            if (parts[ID(r)].temp > elements[PT_HEAC].HighTemperature)
            {
              sim.part_change_type(ID(r), x+rx, y+ry, PT_LAVA);
              parts[ID(r)].ctype = PT_HEAC;
            }
          }
          else if (parts[i].ctype == PT_ROCK && rt == PT_LAVA && parts[ID(r)].ctype == PT_GOLD && parts[ID(r)].tmp == 0 &&
            sim.pv[(y / CELL) | 0][(x / CELL) | 0] >= 50 && sim.rng.chance(1, 10000)) // Produce GOLD veins/clusters
          {
            //@ LAVA(ROCK) + LAVA(GOLD) -> 2xLAVA(GOLD)
            parts[i].ctype = PT_GOLD;
            if (rx > 1 || rx < -1) // Trend veins vertical
              parts[i].tmp = 1;
          }
          else if (parts[i].ctype == PT_SALT && rt == PT_GLAS && parts[ID(r)].life < 234 * 120)
          {
            parts[ID(r)].life++;
          }
        }

        if ((surround_space || elements[rt].Explosive) &&
            elements[rt].Flammable && sim.rng.chance(itrunc(f(elements[rt].Flammable + f(sim.pv[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0] * 10.0))), 1000) &&
            //exceptions, t is the thing causing the spark and rt is what's burning
            (t != PT_SPRK || (rt != PT_RBDM && rt != PT_LRBD && rt != PT_INSL)) &&
            (t != PT_PHOT || rt != PT_INSL) &&
            (rt != PT_SPNG || parts[ID(r)].life == 0))
        {
          sim.part_change_type(ID(r), x+rx, y+ry, PT_FIRE);
          parts[ID(r)].temp = restrict_flt(f(elements[PT_FIRE].DefaultProperties.temp + idiv(elements[rt].Flammable, 2)), MIN_TEMP, MAX_TEMP);
          parts[ID(r)].life = sim.rng.between(180, 259);
          parts[ID(r)].tmp = parts[ID(r)].ctype = 0;
          if (elements[rt].Explosive)
            sim.pv[(y/CELL) | 0][(x/CELL) | 0] += f(f(0.25) * CFDS);
        }
      }
    }
  }
  if (sim.legacy_enable && t!=PT_SPRK) // SPRK has no legacy reactions
    updateLegacy(sim, i, x, y, surround_space, nt, parts, pmap);
  return 0;
}

function updateLegacy(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  const t = parts[i].type;
  for (let rx = -2; rx <= 2; rx++)
  {
    for (let ry = -2; ry <= 2; ry++)
    {
      if (rx || ry)
      {
        const r = pmap[y+ry][x+rx];
        if (!r)
          continue;
        if (sim.bmap[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0] && sim.bmap[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0]!=WL_STREAM)
          continue;
        const rt = TYP(r);

        let lpv = itrunc(sim.pv[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0]);
        if (lpv < 1) lpv = 1;
        if (elements[rt].Meltable &&
                ((rt!=PT_RBDM && rt!=PT_LRBD) || t!=PT_SPRK)
                && ((t!=PT_FIRE&&t!=PT_PLSM) || (rt!=PT_METL && rt!=PT_IRON && rt!=PT_ETRD && rt!=PT_PSCN && rt!=PT_NSCN && rt!=PT_NTCT && rt!=PT_PTCT && rt!=PT_BMTL && rt!=PT_BRMT && rt!=PT_SALT && rt!=PT_INWR))
                && sim.rng.chance(Math.imul(elements[rt].Meltable, lpv), 1000))
        {
          if (t!=PT_LAVA || parts[i].life>0)
          {
            if (rt==PT_BRMT)
              parts[ID(r)].ctype = PT_BMTL;
            else if (rt==PT_SAND)
              parts[ID(r)].ctype = PT_GLAS;
            else
              parts[ID(r)].ctype = rt;
            sim.part_change_type(ID(r),x+rx,y+ry,PT_LAVA);
            parts[ID(r)].life = sim.rng.between(240, 359);
          }
          else
          {
            parts[i].life = 0;
            parts[i].ctype = PT_NONE;//rt;
            sim.part_change_type(i,x,y,(parts[i].ctype)?parts[i].ctype:PT_STNE);
            return 1;
          }
        }
        if (rt==PT_ICEI || rt==PT_SNOW)
        {
          sim.part_change_type(ID(r), x+rx, y+ry, PT_WATR);
          if (t==PT_FIRE)
          {
            sim.kill_part(i);
            return 1;
          }
          if (t==PT_LAVA)
          {
            parts[i].life = 0;
            sim.part_change_type(i,x,y,PT_STNE);
          }
        }
        if (rt==PT_WATR || rt==PT_DSTW || rt==PT_SLTW)
        {
          sim.kill_part(ID(r));
          if (t==PT_FIRE)
          {
            sim.kill_part(i);
            return 1;
          }
          if (t==PT_LAVA)
          {
            parts[i].life = 0;
            parts[i].ctype = PT_NONE;
            sim.part_change_type(i,x,y,(parts[i].ctype)?parts[i].ctype:PT_STNE);
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const color = flameTableAt(cpart.life);
  g.colr = Red(color);
  g.colg = Green(color);
  g.colb = Blue(color);

  g.firea = 255;
  g.firer = g.colr;
  g.fireg = g.colg;
  g.fireb = g.colb;

  g.pixel_mode = PMODE_NONE; //Clear default, don't draw pixel
  g.pixel_mode |= FIRE_ADD;
  //Returning 0 means dynamic, do not cache
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(120, 169);
}
