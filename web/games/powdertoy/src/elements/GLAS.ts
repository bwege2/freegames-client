// simulation/elements/GLAS.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc } from '../sim/cpp.ts';
import { CELL, CFDS, IPH, IPL, ITL, NT, PROP_HOT_GLOW, PROP_NEUTPASS, PROP_PHOTPASS, PROP_SPARKSETTLE, SC_SOLIDS, TYPE_SOLID } from '../sim/config.ts';
import { PT_BGLA, PT_LAVA, PT_LNTG } from '../sim/numbers.ts';

export function Element_GLAS(el: Element): void {
  el.Identifier = "DEFAULT_PT_GLAS";
  el.Name = "GLAS";
  el.Colour = 0x404040;
  el.MenuVisible = 1;
  el.MenuSection = SC_SOLIDS;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = 0.00;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.HeatConduct = 150;
  el.Description = "Glass. Meltable. Shatters under pressure, and refracts photons.";

  el.Properties = TYPE_SOLID | PROP_NEUTPASS | PROP_PHOTPASS | PROP_HOT_GLOW | PROP_SPARKSETTLE;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1973.0;
  el.HighTemperatureTransition = PT_LAVA; //@ GLAS -> LAVA(GLAS)

  el.Update = update;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const press = itrunc(f(sim.pv[(y/CELL) | 0][(x/CELL) | 0] * 64));
  const diff = (press - parts[i].tmp3) | 0;

  // Determine whether the GLAS is chemically strengthened via .life setting. (250 = Max., 16 = Min.)
  let strength = idiv(parts[i].life, 120) + 16;
  if (strength < 16)
    strength = 16;
  if (diff > strength || diff < -1 * strength)
  {
    //@ GLAS -> BGLA
    sim.part_change_type(i, x, y, PT_BGLA);
  }
  parts[i].tmp3 = press;

  // Liquid nitrogen condenses on chemically strengthened glass
  if ((strength > 200) && (parts[i].temp < 77.0) && (sim.hv[(y/CELL) | 0][(x/CELL) | 0] < 77.0)
      && (sim.pv[(y/CELL) | 0][(x/CELL) | 0] > 5.0) && sim.rng.chance(1, 100))
  {
    // Sample 4 adjacent cells
    const adj = sim.rng.between(0, 3);
    const rx = (1 - 2*(adj%2))*(1 - idiv(adj, 2));
    const ry = (1 - 2*(adj%2))*idiv(adj, 2);

    const r = pmap[y+ry][x+rx];
    // If found an empty spot around glass
    if (!r)
    {
      //@ GLAS -> GLAS + LNTG
      const np = sim.create_part(-1, x+rx, y+ry, PT_LNTG);
      if (np>-1)
      {
        sim.pv[(y/CELL) | 0][(x/CELL) | 0] -= 1.0;
        parts[i].temp += 200.0;
      }
    }
  }

  return 0;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, _v: number): void {
  sim.parts[i].tmp3 = itrunc(f(sim.pv[(y/CELL) | 0][(x/CELL) | 0] * 64));
}
