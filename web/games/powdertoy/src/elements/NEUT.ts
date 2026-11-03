// simulation/elements/NEUT.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import { CELL, CFDS, FIRE_ADD, ID, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_LIFE_DEC, PROP_LIFE_KILL_DEC, PT_NUM, R_TEMP, SC_NUCLEAR, TYP, TYPE_ENERGY } from '../sim/config.ts';
import { PT_ACID, PT_BASE, PT_BCOL, PT_CAUS, PT_COAL, PT_DESL, PT_DEUT, PT_DSTW, PT_DUST, PT_DYST, PT_EXOT, PT_FWRK, PT_GAS, PT_GOO, PT_GUNP, PT_ICEI, PT_ISOZ, PT_LAVA, PT_LRBD, PT_NEUT, PT_NITR, PT_OIL, PT_PLEX, PT_PLNT, PT_PLUT, PT_RFRG, PT_RSSS, PT_RSST, PT_SAWD, PT_SEED, PT_SNOW, PT_TTAN, PT_URAN, PT_WATR, PT_WOOD, PT_YEST } from '../sim/numbers.ts';
import { Element_FIRE_update } from '../elements/FIRE.ts';
import { PLNT_COLOUR, PLNT_LIFE, PLNT_TOTAL_TMP } from '../elements/PLNT.ts';

export function Element_NEUT(el: Element): void {
  el.Identifier = "DEFAULT_PT_NEUT";
  el.Name = "NEUT";
  el.Colour = 0x20E0FF;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 1.00;
  el.Collision = f(-0.99);
  el.Gravity = 0.0;
  el.Diffusion = f(0.01);
  el.HotAir = f(f(0.002) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = -1;

  el.DefaultProperties.temp = f(f(R_TEMP + 4.0) + f(273.15));
  el.HeatConduct = 60;
  el.Description = "Neutrons. Interact with matter in odd ways.";

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

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  // unsigned int; it reaches rng.chance(int, ...) as the same 32 bits
  const pressureFactor = (3 + itrunc(sim.pv[(y/CELL) | 0][(x/CELL) | 0])) | 0;
  for (let rx = -1; rx <= 1; rx++)
  {
    for (let ry = -1; ry <= 1; ry++)
    {
      const r = pmap[y+ry][x+rx];
      switch (TYP(r))
      {
      case PT_WATR:
        //@ NEUT + WATR -> NEUT + DSTW
        if (sim.rng.chance(3, 20))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_DSTW);
        // falls through
      case PT_ICEI:
      case PT_SNOW:
        parts[i].vx *= f(0.995);
        parts[i].vy *= f(0.995);
        break;
      case PT_PLUT:
        if (sim.rng.chance(pressureFactor, 1000))
        {
          if (sim.rng.chance(1, 3))
          {
            //@ NEUT + PLUT -> NEUT + URAN/LAVA(PLUT)
            sim.create_part(ID(r), x+rx, y+ry, sim.rng.chance(2, 3) ? PT_LAVA : PT_URAN);
            parts[ID(r)].temp = MAX_TEMP;
            if (parts[ID(r)].type==PT_LAVA) {
              parts[ID(r)].tmp = 100;
              parts[ID(r)].ctype = PT_PLUT;
            }
          }
          else
          {
            //@ NEUT + PLUT -> 2xNEUT
            sim.create_part(ID(r), x+rx, y+ry, PT_NEUT);
            parts[ID(r)].vx = f(f(0.25*parts[ID(r)].vx) + parts[i].vx);
            parts[ID(r)].vy = f(f(0.25*parts[ID(r)].vy) + parts[i].vy);
          }
          sim.pv[(y/CELL) | 0][(x/CELL) | 0] += f(10.0 * CFDS); //Used to be 2, some people said nukes weren't powerful enough
          Element_FIRE_update(sim, i, x, y, surround_space, nt, parts, pmap);
        }
        break;
      case PT_DEUT:
        if (sim.rng.chance((pressureFactor + 1 + idiv(parts[ID(r)].life, 100)) | 0, 1000))
        {
          //@ NEUT + DEUT -> 2xNEUT
          DeutExplosion(sim, parts[ID(r)].life, x+rx, y+ry, restrict_flt(f(parts[ID(r)].temp + f(f(parts[ID(r)].life)*500.0)), MIN_TEMP, MAX_TEMP), PT_NEUT);
          sim.kill_part(ID(r));
        }
        break;
      case PT_GUNP:
        //@ NEUT + GUNP -> NEUT + DUST
        if (sim.rng.chance(3, 200))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_DUST);
        break;
      case PT_DYST:
        //@ NEUT + DYST -> NEUT + YEST
        if (sim.rng.chance(3, 200))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_YEST);
        break;
      case PT_YEST:
        //@ NEUT + YEST -> NEUT + DYST
        sim.part_change_type(ID(r),x+rx,y+ry,PT_DYST);
        break;
      case PT_PLEX:
        //@ NEUT + PLEX -> NEUT + GOO
        if (sim.rng.chance(3, 200))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_GOO);
        break;
      case PT_NITR:
        //@ NEUT + NITR -> NEUT + DESL
        if (sim.rng.chance(3, 200))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_DESL);
        break;
      case PT_PLNT:
        //@ NEUT + PLNT -> NEUT + WOOD
        if (sim.rng.chance(1, 20))
          sim.create_part(ID(r), x+rx, y+ry, PT_WOOD);
        break;
      case PT_DESL:
      case PT_OIL:
        //@ NEUT + DESL/OIL -> NEUT + GAS
        if (sim.rng.chance(3, 200))
          sim.part_change_type(ID(r),x+rx,y+ry,PT_GAS);
        break;
      case PT_COAL:
        //@ NEUT + COAL -> NEUT + WOOD
        if (sim.rng.chance(1, 20))
          sim.create_part(ID(r), x+rx, y+ry, PT_WOOD);
        break;
      case PT_BCOL:
        //@ NEUT + BCOL -> NEUT + SAWD
        if (sim.rng.chance(1, 20))
          sim.create_part(ID(r), x+rx, y+ry, PT_SAWD);
        break;
      case PT_DUST:
        //@ NEUT + DUST -> NEUT + FWRK
        if (sim.rng.chance(1, 20))
          sim.part_change_type(ID(r), x+rx, y+ry, PT_FWRK);
        break;
      case PT_FWRK:
        if (sim.rng.chance(1, 20))
          parts[ID(r)].ctype = PT_DUST;
        break;
      case PT_ACID:
        //@ NEUT + ACID -> NEUT + ISOZ
        if (sim.rng.chance(1, 20))
          sim.create_part(ID(r), x+rx, y+ry, PT_ISOZ);
        break;
      case PT_TTAN:
        if (sim.rng.chance(1, 20))
        {
          sim.kill_part(i);
          return 1;
        }
        break;
      case PT_EXOT:
        if (sim.rng.chance(1, 20))
          parts[ID(r)].life = 1500;
        break;
      case PT_RFRG:
        //@ NEUT + RFRG -> NEUT + GAS/CAUS
        if (sim.rng.chance(1, 2))
          sim.create_part(ID(r), x+rx, y+ry, PT_GAS);
        else
          sim.create_part(ID(r), x+rx, y+ry, PT_CAUS);
        break;
      case PT_RSSS:
        if(!rx && !ry)
        {
          let ct_under, tmp_under;

          ct_under = parts[ID(r)].ctype;
          tmp_under = parts[ID(r)].tmp;

          //If there's a correct ctype set, liquefy into it
          if(ct_under > 0 && ct_under < PT_NUM)
          {
            //@ NEUT + RSSS(ctype) -> ctype
            sim.create_part(ID(r), x, y, ct_under);

            //If there's a correct tmp set, use it for ctype
            if((tmp_under > 0) && (tmp_under < PT_NUM) && (elements[ct_under].CarriesTypeIn & (1 << FIELD_CTYPE)))
              parts[ID(r)].ctype = tmp_under;
          }
          else //@ NEUT + RSSS -> RSST
            sim.part_change_type(ID(r), x, y, PT_RSST); //Default to RSST if no ctype

          sim.kill_part(i);

          return 1;
        }
        break;
      case PT_BASE:
        //@ NEUT + BASE -> NEUT + LRBD
        if (parts[ID(r)].temp > (50 + 273.15) && sim.rng.chance(1, 35))
          sim.create_part(ID(r), x+rx, y+ry, PT_LRBD);
        break;
      case PT_SEED:
        if(!rx && !ry)
        {
          // Flip a random gene with 1/2 chance
          switch (sim.rng.between(0, 9))
          {
            case 0:
              parts[ID(r)].ctype ^= 1 << sim.rng.between(PLNT_COLOUR, PLNT_LIFE-1);
              break;
            case 1:
              parts[ID(r)].tmp ^= 1 << sim.rng.between(0, PLNT_TOTAL_TMP-1);
              break;
            case 2:
              parts[ID(r)].tmp2 ^= 1 << sim.rng.between(0, PLNT_TOTAL_TMP-1);
              break;
            case 3:
              parts[ID(r)].tmp3 ^= 1 << sim.rng.between(0, PLNT_TOTAL_TMP-1);
              break;
            case 4:
              parts[ID(r)].tmp4 ^= 1 << sim.rng.between(0, PLNT_TOTAL_TMP-1);
              break;
            default:
              break;
          }
        }
        break;
      default:
        break;
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 120;
  g.firer = 10;
  g.fireg = 80;
  g.fireb = 120;

  g.pixel_mode |= FIRE_ADD;
  return 1;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  const r = f(sim.rng.between(128, 255) / 127.0);
  const a = f(f(sim.rng.between(0, 359) * f(Math.PI)) / 180.0);
  sim.parts[i].life = sim.rng.between(480, 959);
  sim.parts[i].vx = f(r * f(Math.cos(a)));
  sim.parts[i].vy = f(r * f(Math.sin(a)));
}

function DeutExplosion(sim: Simulation, n: number, x: number, y: number, temp: number, t: number): number//testing a new deut create part
{
  let i;
  n = idiv(n, 50);
  if (n < 1)
    n = 1;
  else if (n > 340)
    n = 340;

  for (let c = 0; c < n; c++)
  {
    i = sim.create_part(-3, x, y, t);
    if (i >= 0)
      sim.parts[i].temp = temp;
    else if (sim.parts.MaxPartsReached())
      break;
  }
  sim.pv[(y/CELL) | 0][(x/CELL) | 0] += f(f(6.0 * CFDS)*n);
  return 0;
}
