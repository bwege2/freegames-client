// simulation/elements/PLNT.cpp (+ PLNT.h)
import type { Element, Gfx, GraphicsFuncContext } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITL, NT, PROP_LIFE_DEC, PROP_NEUTPENETRATE, SC_SOLIDS, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_CO2, PT_FIRE, PT_GOO, PT_LAVA, PT_O2, PT_PLNT, PT_SEED, PT_SMKE, PT_VINE, PT_WATR, PT_WOOD } from '../sim/numbers.ts';

// PLNT.h

//Directions in counter-clockwise order starting from the top:
// 107
// 2.6
// 345
export const dir3x3: readonly { X: number; Y: number }[] = [
  { X: 0, Y: -1 }, { X: -1, Y: -1 }, { X: -1, Y: 0 }, { X: -1, Y: 1 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 1, Y: 0 }, { X: 1, Y: -1 },
];

// Positions of info in the ctype field
export const PLNT_PHASE = 1;
export const PLNT_DIR = 3;
export const PLNT_COLOUR = 6;
export const PLNT_LIFE = 12;

// Total number of bits used
export const PLNT_TOTAL_CTP = 20;
export const PLNT_TOTAL_TMP = 15;

// PLNT.cpp

export function Element_PLNT(el: Element): void {
  el.Identifier = "DEFAULT_PT_PLNT";
  el.Name = "PLNT";
  el.Colour = 0x0CAC00;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 20;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 10;
  el.PhotonReflectWavelengths = 0x0007C000;

  el.Weight = 100;

  el.HeatConduct = 65;
  el.Description = "Plant, drinks water and grows.";

  el.Properties = TYPE_SOLID | PROP_NEUTPENETRATE | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 573.0;
  el.HighTemperatureTransition = PT_FIRE; //@ PLNT -> FIRE

  el.Update = update;
  el.Graphics = graphics;
}

// Fields used for tree growth (see also PLNT.h):
// ctype: tree or usual PLNT (1 bit), phase (2 bits), direction (3 bits), colour (6 bits), water (8 bits)
// life: used as a counter in growth
// tmp-tmp4: branching bitmask (5 bits), new phases (5x2 bits)

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  // Select tree growth code or usual PLNT code
  if (parts[i].ctype & 1)
  {
    const temp = parts[i].temp;

    // Hot and cold temperature kills tree growth
    if (temp > f(373.15) || temp < f(223.15))
    {
      parts[i].ctype = 0;
      parts[i].tmp = 0;
      parts[i].tmp2 = 0;
      parts[i].tmp3 = 0;
      parts[i].tmp4 = 0;

      return 0;
    }

    // No growth happens at bad temperatures
    if (temp > f(343.15) || temp < f(278.15))
      return 0;

    // Slow things down
    if (sim.rng.chance(9, 10))
      return 0;

    // Current phase, direction and life
    const phase = (parts[i].ctype>>PLNT_PHASE) & 0x3;
    const dir = (parts[i].ctype>>PLNT_DIR) & 0x7;
    const life = (parts[i].ctype>>PLNT_LIFE) & 0xFF;

    let prog = 0;

    // Select a program for the current phase
    switch (phase)
    {
      case 0: prog = parts[i].tmp; break;
      case 1: prog = parts[i].tmp2; break;
      case 2: prog = parts[i].tmp3; break;
      case 3: prog = parts[i].tmp4; break;
    }

    let si = -1; // Used for create_part calls
    let stopped = false; // Did the cell stop growing?

    const down = Element_PLNT_detectDown(sim, x, y); // Down gravity direction (8 means no direction)

    // Do we continue growing?
    if (life > 0)
    {
      // Do we grow forward or branch?
      if (!parts[i].life)
      {
        // Branching
        const bmask = prog&0x1F;
        let phases = prog>>5;

        // Can we branch or it's a dead end?
        if (bmask)
        {
          // Loop through all possible branching directions
          for (let phi = 0; phi < 5; phi++)
          {
            if ((bmask>>phi)&0x1)
            {
              const ndir = (dir + phi + 6) % 8; // phi = 0 is -90 deg, phi = 1 is -45 deg etc
              const nphase = phases&0x3;
              let nlife = idiv(2*life, 3);

              // Discourage branches which go down
              if (down < 8)
              {
                // Down
                if(ndir == down)
                  nlife = idiv(life, 3);

                // Down-left and down-right
                if(ndir == ((down+1)%8) || ndir == ((down+7)%8))
                  nlife = idiv(life, 3);

                // Sideways
                if(life > 4 && (ndir == ((down+2)%8) || ndir == ((down+6)%8)))
                  nlife = idiv(life, 2);
              }

              si = sim.create_part(-1, x+dir3x3[ndir].X, y+dir3x3[ndir].Y, PT_PLNT);
              if (si >= 0)
              {
                parts[si].ctype = ((nlife & 0xFF) << PLNT_LIFE) | (parts[i].ctype & (0x3f << PLNT_COLOUR))
                    | ((ndir & 7) << PLNT_DIR) | ((nphase & 3) << PLNT_PHASE) | 0x1;

                // Reduce the length of diagonal branches by 1/sqrt(2) ~= 0.7
                parts[si].life = (ndir%2 == 1) ? 7*nlife : 10*nlife;

                parts[si].tmp = parts[i].tmp;
                parts[si].tmp2 = parts[i].tmp2;
                parts[si].tmp3 = parts[i].tmp3;
                parts[si].tmp4 = parts[i].tmp4;
              }
            }

            phases = phases>>2;
          }
        }
        else
          stopped = true;
      }
      else
      {
        // Grow forward
        si = sim.create_part(-1, x+dir3x3[dir].X, y+dir3x3[dir].Y, PT_PLNT);
        if (si >= 0)
        {
          parts[si].ctype = ((life & 0xFF) << PLNT_LIFE) | (parts[i].ctype & (0x3f << PLNT_COLOUR))
              | ((dir & 7) << PLNT_DIR) | ((phase & 3) << PLNT_PHASE) | 0x1;

          parts[si].life = parts[i].life;
          parts[si].tmp = parts[i].tmp;
          parts[si].tmp2 = parts[i].tmp2;
          parts[si].tmp3 = parts[i].tmp3;
          parts[si].tmp4 = parts[i].tmp4;
        }
      }

      if (!stopped)
      {
        // Create a stem
        if (phase || life < 12)
        {
          //@ PLNT -> WOOD
          sim.create_part(i, x, y, PT_WOOD);

          parts[i].ctype = 0;
          parts[i].life = 0;
          parts[i].tmp = 0;
          parts[i].tmp2 = 0;
          parts[i].tmp3 = 0;
          parts[i].tmp4 = 0;
        }
        else
        {
          // Thick stem
          //@ PLNT -> GOO
          sim.create_part(i, x, y, PT_GOO);

          parts[i].ctype = 0;
          parts[i].life = 0;
          parts[i].tmp = 0;
          parts[i].tmp2 = 0;
          parts[i].tmp3 = 0;
          parts[i].tmp4 = 0;

          let left_dir = (dir+6)%8;
          let right_dir = (dir+2)%8;

          // Correction for diagonal directions
          if (dir%2)
          {
            left_dir = (dir+5)%8;
            right_dir = (dir+3)%8;
          }

          sim.create_part(-1, x+dir3x3[left_dir].X, y+dir3x3[left_dir].Y, PT_WOOD);
          sim.create_part(-1, x+dir3x3[right_dir].X, y+dir3x3[right_dir].Y, PT_WOOD);
        }
      }
    }
    else
      stopped = true;

    // Stop growing
    if (stopped)
    {
      // Shoot out a seed
      if (sim.rng.chance(1, 10))
      {
        //@ PLNT -> PLNT + SEED
        si = sim.create_part(-1, x+2*dir3x3[dir].X, y+2*dir3x3[dir].Y, PT_SEED);
        if (si >= 0)
        {
          parts[si].vx = dir3x3[dir].X;
          parts[si].vy = dir3x3[dir].Y;

          // Inherit genome
          parts[si].ctype = parts[i].ctype & (0x3f << PLNT_COLOUR); // Preserve only the colour
          parts[si].tmp = parts[i].tmp;
          parts[si].tmp2 = parts[i].tmp2;
          parts[si].tmp3 = parts[i].tmp3;
          parts[si].tmp4 = parts[i].tmp4;
        }
      }

      // Turn into usual plant (but preserve color)
      // We set direction to 7 to tell graphics() that PLNT needs coloring
      parts[i].ctype = (parts[i].ctype & (0x3f << PLNT_COLOUR)) | (7 << PLNT_DIR);
      parts[i].life = 0;
      parts[i].tmp = 0;
      parts[i].tmp2 = 0;
      parts[i].tmp3 = 0;
      parts[i].tmp4 = 0;
    }

    return 1;
  }
  else
  { // Usual PLNT code
    for (let rx = -1; rx <= 1; rx++)
    {
      for (let ry = -1; ry <= 1; ry++)
      {
        if (rx || ry)
        {
          const r = pmap[y+ry][x+rx];
          switch (TYP(r))
          {
            case PT_WATR:
              if (sim.rng.chance(1, 50))
              {
                //@ PLNT + WATR -> 2xPLNT
                const np = sim.create_part(ID(r),x+rx,y+ry,PT_PLNT);
                if (np<0) continue;
                parts[np].life = 0;
                parts[np].ctype = parts[i].ctype;//Keep the color identical
              }
              break;
            case PT_LAVA:
              if (sim.rng.chance(1, 50))
              {
                //@ PLNT + LAVA -> FIRE + LAVA
                sim.part_change_type(i,x,y,PT_FIRE);
                parts[i].life = 4;
              }
              break;
            case PT_SMKE:
            case PT_CO2:
              if (sim.rng.chance(1, 50))
              {
                sim.kill_part(ID(r));
                parts[i].life = sim.rng.between(60, 119);
              }
              break;
            case PT_WOOD:
              {
                // unsigned int
                let rndstore = sim.rng.gen();
                if (surround_space && !(rndstore%4) && parts[i].tmp==1)
                {
                  rndstore >>>= 3;
                  const nnx = (rndstore%3) -1;
                  rndstore >>>= 2;
                  const nny = (rndstore%3) -1;
                  if (nnx || nny)
                  {
                    if (pmap[y+ry+nny][x+rx+nnx])
                      continue;
                    const np = sim.create_part(-1,x+rx+nnx,y+ry+nny,PT_VINE);
                    if (np<0) continue;
                    parts[np].temp = parts[i].temp;
                  }
                }
              }
              break;
            default:
              continue;
          }
        }
      }
    }
    if (parts[i].life==2)
    {
      for (let rx = -1; rx <= 1; rx++)
      {
        for (let ry = -1; ry <= 1; ry++)
        {
          if (rx || ry)
          {
            const r = pmap[y+ry][x+rx];
            //@ PLNT + SMKE/CO2 -> PLNT + O2
            if (!r)
              sim.create_part(-1,x+rx,y+ry,PT_O2);
          }
        }
      }
      parts[i].life = 0;
    }
    if (parts[i].temp > 350 && parts[i].temp > parts[i].tmp2)
      parts[i].tmp2 = itrunc(parts[i].temp);
  }
  return 0;
}

const leafColor: readonly (readonly number[])[] = [
    [ 243, 246, 244 ], // White
    [ 255, 223, 50  ], // Yellow
    [ 255, 183, 197 ], // Pink
    [ 250, 0,   25  ], // Red
    [ 128, 206, 196 ], // Cyan / light blue
    [ 127, 255, 0   ], // Bright green
    [ 0,   74,  178 ], // Blue
    [ 12,  172, 0   ],  // Usual PLNT green
];

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.ctype == 0)
  {
    // std::max((float)cpart->tmp2, cpart->temp): (a < b) ? b : a
    const tmp2f = f(cpart.tmp2);
    const maxtemp = (tmp2f < cpart.temp) ? cpart.temp : tmp2f;
    if (maxtemp > 300)
    {
      g.colr += itrunc(restrict_flt(f(f(maxtemp-300)/5),0,58));
      g.colg -= itrunc(restrict_flt(f(f(maxtemp-300)/2),0,102));
      g.colb += itrunc(restrict_flt(f(f(maxtemp-300)/5),0,70));
    }
    if (maxtemp < 273)
    {
      g.colg += itrunc(restrict_flt(f(f(273-maxtemp)/4),0,255));
      g.colb += itrunc(restrict_flt(f(f(273-maxtemp)/1.5),0,255));
    }
  }
  else
  {
    // Set tree-grown PLNT color
    const colour = (cpart.ctype >> PLNT_COLOUR) & 0x3f;

    const cyan = (colour & 0b110000) != 0 ? 1 : 0;
    const magenta = (colour & 0b001100) != 0 ? 1 : 0;
    const yellow = (colour & 0b000011) != 0 ? 1 : 0;

    const ind = 4*cyan + 2*magenta + yellow;

    if (0 <= ind && ind < 8)
    {
      g.colr = leafColor[ind][0];
      g.colg = leafColor[ind][1];
      g.colb = leafColor[ind][2];
    }
  }

  return 0;
}

// Inverse of dir3x3 table
const invDir: readonly (readonly number[])[] = [
    [ 1, 2, 3 ],
    [ 0, 8, 4 ],
    [ 7, 6, 5 ],
];

// Detect down direction using gravity. Returns 8 when there's no direction.
export function Element_PLNT_detectDown(sim: Simulation, x: number, y: number): number
{
  const g = { x: 0, y: 0 }; // float pGravX, pGravY

  sim.GetGravityField(x, y, 1.0, 1.0, g);
  let pGravX = f(g.x);
  let pGravY = f(g.y);

  // hypot(float, float) is hypotf; glibc computes it as sqrt in double of the squares in double, rounded to float
  const gravLen = f(Math.sqrt(pGravX * pGravX + pGravY * pGravY));

  // Normalize gravity
  if (gravLen > 0)
  {
    pGravX = f(pGravX / gravLen);
    pGravY = f(pGravY / gravLen);
  }

  let gravx = 1;
  let gravy = 1;

  if (pGravX > 0.5)
    gravx = 2;
  if (pGravX < -0.5)
    gravx = 0;
  if (pGravY > 0.5)
    gravy = 2;
  if (pGravY < -0.5)
    gravy = 0;

  return invDir[gravx][gravy];
}
