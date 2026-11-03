// simulation/elements/POLO.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITL, NT, PMODE_GLOW, PROP_DEADLY, PROP_LIFE_DEC, PROP_NEUTPASS, PROP_RADIOACTIVE, SC_NUCLEAR, TYP,
  TYPE_PART,
} from '../sim/config.ts';
import { PT_LAVA, PT_NEUT, PT_PLUT, PT_PROT } from '../sim/numbers.ts';

export function Element_POLO(el: Element): void {
  el.Identifier = 'DEFAULT_PT_POLO';
  el.Name = 'POLO';
  el.Colour = 0x506030;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.4);
  el.AirDrag = f(f(0.01) * CFDS);
  el.AirLoss = f(0.99);
  el.Loss = f(0.95);
  el.Collision = 0.0;
  el.Gravity = f(0.4);
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 1;
  el.Hardness = 0;
  el.PhotonReflectWavelengths = 0x000FF200;

  el.Weight = 90;

  el.DefaultProperties.temp = f(388.15);
  el.HeatConduct = 251;
  el.Description = 'Polonium, highly radioactive. Decays into NEUT and heats up.';

  el.Properties = TYPE_PART | PROP_NEUTPASS | PROP_RADIOACTIVE | PROP_LIFE_DEC | PROP_DEADLY;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = f(526.95);
  el.HighTemperatureTransition = PT_LAVA; //@ POLO -> LAVA(POLO)

  el.Update = update;
  el.Graphics = graphics;
}

const COOLDOWN = 15;
const LIMIT = 5;

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  const r = sim.photons[y][x];
  if (parts[i].tmp < LIMIT && !parts[i].life) {
    if (sim.rng.chance(1, 10000) && !parts[i].tmp) {
      //@ POLO -> POLO + NEUT
      const s = sim.create_part(-3, x, y, PT_NEUT);
      if (s >= 0) {
        parts[i].life = COOLDOWN;
        parts[i].tmp++;

        parts[i].temp = f(f(f(parts[i].temp + parts[s].temp) + 600.0) / 2.0);
        parts[s].temp = parts[i].temp;
      }
    }

    if (r && sim.rng.chance(1, 100)) {
      //@ POLO -> POLO + NEUT
      const s = sim.create_part(-3, x, y, PT_NEUT);
      if (s >= 0) {
        parts[i].temp = f(f(f(f(parts[i].temp + parts[ID(r)].temp) + parts[ID(r)].temp) + 600.0) / 3.0);
        parts[i].life = COOLDOWN;
        parts[i].tmp++;

        parts[ID(r)].temp = parts[i].temp;

        parts[s].temp = parts[i].temp;
        parts[s].vx = parts[ID(r)].vx;
        parts[s].vy = parts[ID(r)].vy;
      }
    }
  }
  if (parts[i].tmp2 >= 10) {
    //@ POLO -> PLUT
    sim.part_change_type(i, x, y, PT_PLUT);
    parts[i].temp = f(f(parts[i].temp + 600.0) / 2.0);
    return 1;
  }
  if (TYP(r) === PT_PROT) {
    parts[i].tmp2++;
    sim.kill_part(ID(r));
  }
  if (parts[i].temp < f(388.15)) {
    parts[i].temp = f(parts[i].temp + f(0.2));
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp >= LIMIT) {
    g.colr = 0x70;
    g.colg = 0x70;
    g.colb = 0x70;
  } else
    g.pixel_mode |= PMODE_GLOW;

  return 0;
}
