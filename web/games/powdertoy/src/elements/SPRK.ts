// simulation/elements/SPRK.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, FIRE_SPARK, ID, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_CONDUCTS, PROP_LIFE_DEC, PT_NUM, R_TEMP, SC_ELEC, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BMTL, PT_BRMT, PT_DSTW, PT_EMP, PT_ETRD, PT_GPMP, PT_H2, PT_HSWC, PT_INSL, PT_INST, PT_INWR, PT_IRON, PT_LCRY, PT_LIGH, PT_LRBD, PT_METL, PT_NBLE, PT_NONE, PT_NSCN, PT_NTCT, PT_O2, PT_PBCN, PT_PLSM, PT_PPIP, PT_PSCN, PT_PTCT, PT_PUMP, PT_QRTZ, PT_RBDM, PT_RSSS, PT_RSST, PT_SLTW, PT_SPRK, PT_SWCH, PT_TESC, PT_TUNG, PT_WATR } from '../sim/numbers.ts';
import { Element_NTCT_update } from '../elements/NTCT.ts';
import { Element_PPIP_flood_trigger } from '../elements/PPIP.ts';
import { Element_FIRE_update } from '../elements/FIRE.ts';
import { Element_ETRD_nearestSparkablePart } from '../elements/ETRD.ts';

export function Element_SPRK(el: Element): void {
  el.Identifier = "DEFAULT_PT_SPRK";
  el.Name = "SPRK";
  el.Colour = 0xFFFF80;
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
  el.HotAir = f(f(0.001) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;
  el.PhotonReflectWavelengths = 0x00000000;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "Electricity. The basis of all electronics in TPT, travels along conductive elements.";

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC;
  el.CarriesTypeIn = 1 << FIELD_CTYPE;

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

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let ct = parts[i].ctype;
  Element_FIRE_update(sim, i, x, y, surround_space, nt, parts, pmap);

  if (parts[i].life<=0)
  {
    if (ct==PT_WATR||ct==PT_SLTW||ct==PT_PSCN||ct==PT_NSCN||ct==PT_ETRD||ct==PT_INWR)
      parts[i].temp = f(R_TEMP + f(273.15));
    if (ct<=0 || ct>=PT_NUM || !elements[parts[i].ctype].Enabled)
      ct = PT_METL;
    parts[i].ctype = PT_NONE;
    parts[i].life = 4;
    if (ct == PT_WATR)
      parts[i].life = 64;
    else if (ct == PT_SLTW)
      parts[i].life = 54;
    else if (ct == PT_SWCH)
      parts[i].life = 14;
    else if (ct == PT_RSST) //RSST disappears at the end of its spark cycle
    {
      sim.kill_part(i);
      return 1;
    }

    if (sim.part_change_type(i,x,y,ct))
      return 1;
    return 0;
  }
  //Some functions of SPRK based on ctype (what it is on)
  switch(ct)
  {
  case PT_SPRK:
    sim.kill_part(i);
    return 1;
  case PT_NTCT:
  case PT_PTCT:
    Element_NTCT_update(sim, i, x, y, surround_space, nt, parts, pmap);
    break;
  case PT_ETRD:
    if (parts[i].life==1)
    {
      const nearp = Element_ETRD_nearestSparkablePart(sim, i);
      if (nearp == -1)
        break;
      const pavg = sim.parts_avg(i, nearp, PT_INSL);
      if (pavg != PT_INSL && pavg != PT_RSSS)
      {
        //@ ETRD -> ETRD + PLSM
        sim.CreateLine(x, y, itrunc(f(parts[nearp].x+0.5)), itrunc(f(parts[nearp].y+0.5)), PT_PLSM);
        parts[i].life = 20;
        sim.part_change_type(i,x,y,ct);
        ct = parts[i].ctype = PT_NONE;
        sim.part_change_type(nearp,itrunc(f(parts[nearp].x+0.5)),itrunc(f(parts[nearp].y+0.5)),PT_SPRK);
        parts[nearp].life = 9;
        parts[nearp].ctype = PT_ETRD;
      }
    }
    break;
  case PT_NBLE:
    if (parts[i].life<=1 && !(parts[i].tmp&0x1))
    {
      //@ NBLE -> PLSM(NBLE)
      parts[i].life = sim.rng.between(50, 199);
      sim.part_change_type(i,x,y,PT_PLSM);
      parts[i].ctype = PT_NBLE;
      if (parts[i].temp > 5273.15)
        parts[i].tmp |= 0x4;
      parts[i].temp = 3500;
      sim.pv[(y/CELL) | 0][(x/CELL) | 0] += 1;
    }
    break;
  case PT_TESC:
    if (parts[i].tmp>300)
      parts[i].tmp=300;
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        if (rx || ry)
        {
          const r = pmap[y+ry][x+rx];
          if (r)
            continue;
          if (parts[i].tmp>4 && sim.rng.chance(1, idiv(Math.imul(parts[i].tmp, parts[i].tmp), 20)+6))
          {
            //@ TESC -> TESC + LIGH
            const p = sim.create_part(-1, x+rx*2, y+ry*2, PT_LIGH);
            if (p!=-1)
            {
              parts[p].life = sim.rng.between(0, 2+idiv(parts[i].tmp, 15)) + idiv(parts[i].tmp, 7);
              if (parts[i].life>60)
                parts[i].life=60;
              parts[p].temp=Math.imul(parts[p].life, parts[i].tmp)/2.5;
              parts[p].tmp2=1;
              // atan2(int, float) is the double overload; pi_v<float> is promoted to double
              parts[p].tmp=itrunc(Math.atan2(-ry, f(rx))*360/f(Math.PI));
              parts[p].dcolour = parts[i].dcolour;
              parts[i].temp = restrict_flt(f(parts[i].temp - f(parts[i].tmp * 2 + f(parts[i].temp / 5))), MIN_TEMP, MAX_TEMP); // slight self-cooling
              if (Math.abs(sim.pv[(y/CELL) | 0][(x/CELL) | 0])!=0.0)
              {
                if (Math.abs(sim.pv[(y/CELL) | 0][(x/CELL) | 0])<=0.5)
                  sim.pv[(y/CELL) | 0][(x/CELL) | 0]=0;
                else
                  sim.pv[(y/CELL) | 0][(x/CELL) | 0]-=(sim.pv[(y/CELL) | 0][(x/CELL) | 0]>0)?0.5:-0.5;
              }
            }
          }
        }
      }
    }
    break;
  case PT_IRON:
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        if (rx || ry)
        {
          const r = pmap[y+ry][x+rx];
          if (!r)
            continue;
          if (TYP(r)==PT_DSTW || TYP(r)==PT_SLTW || TYP(r)==PT_WATR)
          {
            const rndstore = sim.rng.gen()%100;
            //@ IRON + DSTW/SLTW/WATR -> IRON + O2/H2
            if (!rndstore)
              sim.part_change_type(ID(r),x+rx,y+ry,PT_O2);
            else if (3 > rndstore)
              sim.part_change_type(ID(r),x+rx,y+ry,PT_H2);
          }
        }
      }
    }
    break;
  case PT_TUNG:
    if(parts[i].temp < 3595.0){
      parts[i].temp += sim.rng.between(-4, 15);
    }
    // falls through
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
        const receiver = TYP(r);
        const sender = ct;
        const pavg = sim.parts_avg(ID(r), i,PT_INSL);
        //receiver is the element SPRK is trying to conduct to
        //sender is the element the SPRK is on
        //First, some checks usually for (de)activation of elements
        switch (receiver)
        {
        case PT_SWCH:
          if (pavg!=PT_INSL && pavg!=PT_RSSS && parts[i].life<4)
          {
            if(sender==PT_PSCN && parts[ID(r)].life<10) {
              parts[ID(r)].life = 10;
            }
            else if (sender==PT_NSCN)
            {
              parts[ID(r)].ctype = PT_NONE;
              parts[ID(r)].life = 9;
            }
          }
          break;
        case PT_SPRK:
          if (pavg!=PT_INSL && pavg!=PT_RSSS && parts[i].life<4)
          {
            if (parts[ID(r)].ctype==PT_SWCH)
            {
              if (sender==PT_NSCN)
              {
                sim.part_change_type(ID(r),x+rx,y+ry,PT_SWCH);
                parts[ID(r)].ctype = PT_NONE;
                parts[ID(r)].life = 9;
              }
            }
            else if(parts[ID(r)].ctype==PT_NTCT||parts[ID(r)].ctype==PT_PTCT)
              if (sender==PT_METL)
              {
                parts[ID(r)].temp = 473.0;
              }
          }
          continue;
        case PT_PUMP: case PT_GPMP: case PT_HSWC: case PT_PBCN:
          if (parts[i].life<4)// PROP_PTOGGLE, Maybe? We seem to use 2 different methods for handling actived elements, this one seems better. Yes, use this one for new elements, PCLN is different for compatibility with existing saves
          {
            if (sender==PT_PSCN) parts[ID(r)].life = 10;
            else if (sender==PT_NSCN && parts[ID(r)].life>=10) parts[ID(r)].life = 9;
          }
          continue;
        case PT_LCRY:
          if (Math.abs(rx)<2&&Math.abs(ry)<2 && parts[i].life<4)
          {
            if (sender==PT_PSCN && parts[ID(r)].tmp == 0) parts[ID(r)].tmp = 2;
            else if (sender==PT_NSCN && parts[ID(r)].tmp == 3) parts[ID(r)].tmp = 1;
          }
          continue;
        case PT_PPIP:
          if (parts[i].life == 3 && pavg!=PT_INSL && pavg!=PT_RSSS)
          {
            if (sender == PT_NSCN || sender == PT_PSCN || sender == PT_INST)
              Element_PPIP_flood_trigger(sim, x+rx, y+ry, sender);
          }
          continue;
        case PT_NTCT: case PT_PTCT: case PT_INWR:
          if (sender==PT_METL && pavg!=PT_INSL && pavg!=PT_RSSS && parts[i].life<4)
          {
            parts[ID(r)].temp = 473.0;
            if (receiver==PT_NTCT||receiver==PT_PTCT)
              continue;
          }
          break;
        case PT_EMP:
          if (!parts[ID(r)].life && parts[i].life > 0 && parts[i].life < 4)
          {
            sim.emp_trigger_count++;
            sim.emp_decor += 3;
            if (sim.emp_decor > 40)
              sim.emp_decor = 40;
            parts[ID(r)].life = 220;
          }
          continue;
        }

        if ((pavg == PT_INSL) || (pavg == PT_RSSS)) continue; //Insulation blocks everything past here
        if (!((elements[receiver].Properties&PROP_CONDUCTS)||receiver==PT_INST||receiver==PT_QRTZ)) continue; //Stop non-conducting receivers, allow INST and QRTZ as special cases
        if (Math.abs(rx)+Math.abs(ry)>=4 &&sender!=PT_SWCH&&receiver!=PT_SWCH) continue; //Only switch conducts really far

        const tryConduct = (): boolean => {
          if (receiver==sender && receiver!=PT_INST && receiver!=PT_QRTZ) return true; //Everything conducts to itself, except INST.

          //Sender cases, where elements can have specific outputs
          switch (sender)
          {
          case PT_INST:
            if (receiver==PT_NSCN)
              return true;
            return false;
          case PT_SWCH:
            if (receiver==PT_PSCN||receiver==PT_NSCN||receiver==PT_WATR||receiver==PT_SLTW||receiver==PT_NTCT||receiver==PT_PTCT||receiver==PT_INWR)
              return false;
            break;
          case PT_ETRD:
            if (receiver==PT_METL||receiver==PT_BMTL||receiver==PT_BRMT||receiver==PT_LRBD||receiver==PT_RBDM||receiver==PT_PSCN||receiver==PT_NSCN)
              return true;
            return false;
          case PT_NTCT:
            if (receiver==PT_PSCN || (receiver==PT_NSCN && parts[i].temp>373.0))
              return true;
            return false;
          case PT_PTCT:
            if (receiver==PT_PSCN || (receiver==PT_NSCN && parts[i].temp<373.0))
              return true;
            return false;
          case PT_INWR:
            if (receiver==PT_NSCN || receiver==PT_PSCN)
              return true;
            return false;
          default:
            break;
          }
          //Receiving cases, where elements can have specific inputs
          switch (receiver)
          {
          case PT_QRTZ:
            if ((sender==PT_NSCN||sender==PT_METL||sender==PT_PSCN||sender==PT_QRTZ) && (parts[ID(r)].temp<173.15||sim.pv[((y+ry)/CELL) | 0][((x+rx)/CELL) | 0]>8))
              return true;
            return false;
          case PT_NTCT:
            if (sender==PT_NSCN || (sender==PT_PSCN&&parts[ID(r)].temp>373.0))
              return true;
            return false;
          case PT_PTCT:
            if (sender==PT_NSCN || (sender==PT_PSCN&&parts[ID(r)].temp<373.0))
              return true;
            return false;
          case PT_INWR:
            if (sender==PT_NSCN || sender==PT_PSCN)
              return true;
            return false;
          case PT_INST:
            if (sender==PT_PSCN)
              return true;
            return false;
          case PT_NBLE:
            if (!(parts[i].tmp&0x1))
              return true;
            return false;
          case PT_PSCN:
            if (sender!=PT_NSCN)
              return true;
            return false;
          default:
            break;
          }
          return true;
        };

        if (!tryConduct())
        {
          continue;
        }
        //Yay, passed normal conduction rules, check a few last things and change receiver to spark
        if (receiver==PT_WATR||receiver==PT_SLTW) {
          if (parts[ID(r)].life==0 && parts[i].life<3)
          {
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SPRK);
            if (receiver==PT_WATR) parts[ID(r)].life = 6;
            else parts[ID(r)].life = 5;
            parts[ID(r)].ctype = receiver;
          }
        }
        else if (receiver==PT_INST) {
          if (parts[ID(r)].life==0 && parts[i].life<4)
          {
            sim.FloodINST(x+rx,y+ry);//spark the wire
          }
        }
        else if (receiver==PT_RSST) {
          if (parts[ID(r)].life==0 && parts[i].life<4)
          {
            sim.part_change_type(ID(r),x+rx,y+ry,PT_SPRK);
            parts[ID(r)].life = 5;
            parts[ID(r)].ctype = receiver;
          }
        }
        else if (parts[ID(r)].life==0 && parts[i].life<4) {
          parts[ID(r)].life = 4;
          parts[ID(r)].ctype = receiver;
          sim.part_change_type(ID(r),x+rx,y+ry,PT_SPRK);
          if (f(parts[ID(r)].temp+10.0)<673.0&&!sim.legacy_enable&&(receiver==PT_METL||receiver==PT_BMTL||receiver==PT_BRMT||receiver==PT_PSCN||receiver==PT_NSCN||receiver==PT_ETRD||receiver==PT_NBLE||receiver==PT_IRON))
            parts[ID(r)].temp = f(parts[ID(r)].temp+10.0);
        }
        else if (!parts[ID(r)].life && sender==PT_ETRD && parts[i].life==5) //ETRD is odd and conducts to others only at life 5, this could probably be somewhere else
        {
          sim.part_change_type(i,x,y,sender);
          parts[i].ctype = PT_NONE;
          parts[i].life = 20;
          parts[ID(r)].life = 4;
          parts[ID(r)].ctype = receiver;
          sim.part_change_type(ID(r),x+rx,y+ry,PT_SPRK);
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 60;
  g.firer = idiv(g.colr, 2);
  g.fireg = idiv(g.colg, 2);
  g.fireb = idiv(g.colb, 2);
  g.pixel_mode |= FIRE_SPARK;
  return 1;
}
