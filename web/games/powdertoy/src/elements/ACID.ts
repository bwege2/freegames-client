// simulation/elements/ACID.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, PMODE_BLUR, PROP_DEADLY, SC_LIQUID, TYP, TYPE_LIQUID } from '../sim/config.ts';
import { PT_ACID, PT_CAUS, PT_CLNE, PT_FIRE, PT_FOG, PT_GLAS, PT_GUNP, PT_H2, PT_LITH, PT_LRBD, PT_NITR, PT_PCLN, PT_PLEX, PT_RBDM, PT_RIME, PT_WTRV } from '../sim/numbers.ts';

export function Element_ACID(el: Element): void {
  el.Identifier = "DEFAULT_PT_ACID";
  el.Name = "ACID";
  el.Colour = 0xED55FF;
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

  el.Flammable = 40;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;
  el.PhotonReflectWavelengths = 0x1FE001FE;

  el.Weight = 10;

  el.HeatConduct = 34;
  el.Description = "Dissolves almost everything.";

  el.Properties = TYPE_LIQUID | PROP_DEADLY;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 75;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
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
        if (rt != PT_ACID && rt != PT_CAUS)
        {
          if (rt == PT_PLEX || rt == PT_NITR || rt == PT_GUNP || rt == PT_RBDM || rt == PT_LRBD)
          {
            //@ ACID + PLEX/NITR/GUNP/RBDM/LRBD -> 2xFIRE
            sim.part_change_type(i,x,y,PT_FIRE);
            sim.part_change_type(ID(r),x+rx,y+ry,PT_FIRE);
            parts[i].life = 4;
            parts[ID(r)].life = 4;
          }
          else if (rt == PT_WTRV)
          {
            if (sim.rng.chance(1, 250))
            {
              //@ ACID + WTRV -> CAUS
              sim.part_change_type(i, x, y, PT_CAUS);
              parts[i].life = sim.rng.between(25, 74);
              sim.kill_part(ID(r));
            }
          }
          else if (rt != PT_CLNE && rt != PT_PCLN && ((rt != PT_FOG && rt != PT_RIME) || parts[ID(r)].tmp <= 5) && parts[i].life > 50 && sim.rng.chance(elements[rt].Hardness, 1000))
          {
            if (sim.parts_avg(i, ID(r),PT_GLAS)!= PT_GLAS)//GLAS protects stuff from acid
            {
              let newtemp = f(f(60.0-f(elements[rt].Hardness))*7.0);
              if(newtemp < 0){
                newtemp = 0;
              }
              parts[i].temp += newtemp;
              parts[i].life--;
              switch (rt)
              {
              case PT_LITH:
                //@ ACID + LITH -> ACID + H2
                sim.part_change_type(ID(r), x + rx, y + ry, PT_H2);
                break;

              default:
                sim.kill_part(ID(r));
                break;
              }
            }
          }
          else if (parts[i].life<=50)
          {
            sim.kill_part(i);
            return 1;
          }
        }
      }
    }
  }
  for (let trade = 0; trade<2; trade++)
  {
    const rx = sim.rng.between(-2, 2);
    const ry = sim.rng.between(-2, 2);
    if (rx || ry)
    {
      const r = pmap[y+ry][x+rx];
      if (!r)
        continue;
      if (TYP(r) == PT_ACID && (parts[i].life > parts[ID(r)].life) && parts[i].life>0)//diffusion
      {
        const temp = (parts[i].life - parts[ID(r)].life) | 0;
        if (temp == 1)
        {
          parts[ID(r)].life++;
          parts[i].life--;
        }
        else if (temp>0)
        {
          parts[ID(r)].life += idiv(temp, 2);
          parts[i].life -= idiv(temp, 2);
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let s = cpart.life;
  if (s>75) s = 75; //These two should not be here.
  if (s<49) s = 49;
  s = (s-49)*3;
  if (s==0) s = 1;
  g.colr += s*4;
  g.colg += s*1;
  g.colb += s*2;
  g.pixel_mode |= PMODE_BLUR;
  return 0;
}
