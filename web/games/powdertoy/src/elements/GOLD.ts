// simulation/elements/GOLD.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITL, NT, PROP_CONDUCTS, PROP_HOT_GLOW, PROP_LIFE_DEC, PROP_NEUTPASS, SC_SOLIDS, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_BMTL, PT_GOLD, PT_IRON, PT_LAVA, PT_NEUT, PT_SPRK } from '../sim/numbers.ts';

export function Element_GOLD(el: Element): void {
  el.Identifier = 'DEFAULT_PT_GOLD';
  el.Name = 'GOLD';
  el.Colour = 0xDCAD2C;
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
  el.Meltable = 1;
  el.Hardness = 0;
  el.PhotonReflectWavelengths = 0x3C038100;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = 'Corrosion resistant metal, will reverse corrosion of iron. Excellent conductor.';

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_HOT_GLOW | PROP_LIFE_DEC | PROP_NEUTPASS;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 1337.0;
  el.HighTemperatureTransition = PT_LAVA; //@ GOLD -> LAVA(GOLD)

  el.Update = update;
  el.Graphics = graphics;
}

const checkCoordsX = [-4, 4, 0, 0];
const checkCoordsY = [0, 0, -4, 4];

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  //Find nearby rusted iron (BMTL with tmp 1+)
  for (let j = 0; j < 8; j++) {
    // unsigned int; gen() is below 2^31, so the unsigned wrap of `% 9 - 4` indexes the same cells as signed
    let rndstore = sim.rng.gen();
    const rx = (rndstore % 9) - 4;
    rndstore >>>= 4;
    const ry = (rndstore % 9) - 4;
    if ((!rx !== !ry)) {
      const r = pmap[y + ry][x + rx];
      if (!r) continue;
      if (TYP(r) === PT_BMTL && parts[ID(r)].tmp) {
        //@ GOLD + BMTL -> GOLD + IRON
        parts[ID(r)].tmp = 0;
        sim.part_change_type(ID(r), x + rx, y + ry, PT_IRON);
      }
    }
  }
  //Find sparks
  if (!parts[i].life) {
    for (let j = 0; j < 4; j++) {
      const rx = checkCoordsX[j];
      const ry = checkCoordsY[j];
      const r = pmap[y + ry][x + rx];
      if (!r) continue;
      if (TYP(r) === PT_SPRK && parts[ID(r)].life && parts[ID(r)].life < 4) {
        sim.part_change_type(i, x, y, PT_SPRK);
        parts[i].life = 4;
        parts[i].ctype = PT_GOLD;
      }
    }
  }
  if (TYP(sim.photons[y][x]) === PT_NEUT) {
    if (sim.rng.chance(1, 7)) {
      sim.kill_part(ID(sim.photons[y][x]));
    }
  }
  return 0;
}

function graphics(gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  let rndstore = gfctx.rng.gen();
  g.colr += (rndstore % 10) - 5;
  rndstore >>= 4;
  g.colg += (rndstore % 10) - 5;
  rndstore >>= 4;
  g.colb += (rndstore % 10) - 5;
  return 0;
}
