// simulation/elements/PRTO.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, CHANNELS, EFFECT_DBGLINES, EFFECT_GRAVOUT, IPH, IPL, ITH, ITL, NT, PMODE, PMODE_ADD, SC_SPECIAL,
  TYPE_SOLID,
} from '../sim/config.ts';
import { PT_FIGH, PT_SPRK, PT_STKM, PT_STKM2 } from '../sim/numbers.ts';
import { orbitalparts_get, orbitalparts_set, portal_rx, portal_ry } from './PRTI.ts';

export function Element_PRTO(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PRTO';
  el.Name = 'PRTO';
  el.Colour = 0x0020EB;
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.005) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Portal OUT. Particles come out here. Also has temperature dependent channels. (same as WIFI)';

  el.Properties = TYPE_SOLID;

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

/*these are the count values of where the particle gets stored, depending on where it came from
	0 1 2
	7 . 3
	6 5 4
	PRTO does (count+4)%8, so that it will come out at the opposite place to where it came in
	PRTO does +/-1 to the count, so it doesn't jam as easily
*/

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  let fe = 0;
  parts[i].tmp = itrunc(f(f(f(parts[i].temp - f(73.15)) / 100) + 1));
  if (parts[i].tmp >= CHANNELS) parts[i].tmp = CHANNELS - 1;
  else if (parts[i].tmp < 0) parts[i].tmp = 0;
  for (let count = 0; count < 8; count++) {
    const rx = portal_rx[count];
    const ry = portal_ry[count];
    if (rx || ry) {
      const r = pmap[y + ry][x + rx];
      if (!r) {
        fe = 1;
        for (let nnx = 0; nnx < 80; nnx++) {
          const randomness = (count + sim.rng.between(-1, 1) + 4) % 8;//add -1,0,or 1 to count
          const portal = sim.portalp[parts[i].tmp][randomness][nnx];
          if (portal.type === PT_SPRK)// TODO: make it look better, spark creation
          {
            sim.create_part(-1, x + 1, y, PT_SPRK);
            sim.create_part(-1, x + 1, y + 1, PT_SPRK);
            sim.create_part(-1, x + 1, y - 1, PT_SPRK);
            sim.create_part(-1, x, y - 1, PT_SPRK);
            sim.create_part(-1, x, y + 1, PT_SPRK);
            sim.create_part(-1, x - 1, y + 1, PT_SPRK);
            sim.create_part(-1, x - 1, y, PT_SPRK);
            sim.create_part(-1, x - 1, y - 1, PT_SPRK);
            portal.clear(); // memset(..., 0, sizeof(Particle))
            break;
          }
          else if (portal.type) {
            if (portal.type === PT_STKM)
              sim.player.spwn = 0;
            if (portal.type === PT_STKM2)
              sim.player2.spwn = 0;
            if (portal.type === PT_FIGH) {
              sim.fighcount = (sim.fighcount - 1) & 0xFF;
              sim.fighters[portal.tmp & 0xFF].spwn = 0;
            }
            const np = sim.create_part(-1, x + rx, y + ry, portal.type);
            if (np < 0) {
              if (portal.type === PT_STKM)
                sim.player.spwn = 1;
              if (portal.type === PT_STKM2)
                sim.player2.spwn = 1;
              if (portal.type === PT_FIGH) {
                sim.fighcount = (sim.fighcount + 1) & 0xFF;
                sim.fighters[portal.tmp & 0xFF].spwn = 1;
              }
              continue;
            }
            if (parts[np].type === PT_FIGH) {
              // Release the fighters[] element allocated by create_part, the one reserved when the fighter went into the portal will be used
              sim.fighters[parts[np].tmp & 0xFF].spwn = 0;
              sim.fighters[portal.tmp & 0xFF].spwn = 1;
            }
            if (portal.vx === 0.0 && portal.vy === 0.0) {
              // particles that have passed from PIPE into PRTI have lost their velocity, so use the velocity of the newly created particle if the particle in the portal has no velocity
              const tmp_vx = parts[np].vx;
              const tmp_vy = parts[np].vy;
              parts[np].copyFrom(portal);
              parts[np].vx = tmp_vx;
              parts[np].vy = tmp_vy;
            }
            else
              parts[np].copyFrom(portal);
            parts[np].x = x + rx;
            parts[np].y = y + ry;
            portal.clear(); // memset(..., 0, sizeof(Particle))
            break;
          }
        }
      }
    }
  }
  if (fe) {
    const orbd = [0, 0, 0, 0];	//Orbital distances
    const orbl = [0, 0, 0, 0];	//Orbital locations
    if (!sim.parts[i].life) parts[i].life = sim.rng.gen();
    if (!sim.parts[i].ctype) parts[i].ctype = sim.rng.gen();
    orbitalparts_get(parts[i].life, parts[i].ctype, orbd, orbl);
    for (let r = 0; r < 4; r++) {
      if (orbd[r] < 254) {
        orbd[r] += 16;
        if (orbd[r] > 254) {
          orbd[r] = 0;
          orbl[r] = sim.rng.between(0, 254);
        }
        else {
          orbl[r] += 1;
          orbl[r] = orbl[r] % 255;
        }
      }
      else {
        orbd[r] = 0;
        orbl[r] = sim.rng.between(0, 254);
      }
    }
    [parts[i].life, parts[i].ctype] = orbitalparts_set(orbd, orbl);
  }
  else {
    parts[i].life = 0;
    parts[i].ctype = 0;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 8;
  g.firer = 0;
  g.fireg = 0;
  g.fireb = 255;
  g.pixel_mode |= EFFECT_DBGLINES;
  g.pixel_mode |= EFFECT_GRAVOUT;
  g.pixel_mode &= ~PMODE;
  g.pixel_mode |= PMODE_ADD;
  return 1;
}
