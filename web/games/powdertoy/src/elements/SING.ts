// simulation/elements/SING.cpp
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MAX_TEMP, MIN_PRESSURE, MIN_TEMP, NT, PROP_LIFE_DEC,
  SC_NUCLEAR, TYP, TYPE_PART, XCELLS, YCELLS,
} from '../sim/config.ts';
import { PT_DMND, PT_ELEC, PT_NEUT, PT_PHOT, PT_SING } from '../sim/numbers.ts';

export function Element_SING(el: Element): void {
  el.Identifier = 'DEFAULT_PT_SING';
  el.Name = 'SING';
  el.Colour = 0x242424;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = f(0.7);
  el.AirDrag = f(f(0.36) * CFDS);
  el.AirLoss = f(0.96);
  el.Loss = f(0.80);
  el.Collision = f(0.1);
  el.Gravity = f(0.12);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(-0.001) * CFDS);
  el.Falldown = 1;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 86;

  el.HeatConduct = 70;
  el.Description = 'Singularity. Creates huge amounts of negative pressure and destroys everything.';

  el.Properties = TYPE_PART|PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Create = create;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const singularity = -parts[i].life | 0;
  const cy = (y / CELL) | 0, cx = (x / CELL) | 0;
  const pv = sim.pv;

  if (pv[cy][cx] < singularity)
    pv[cy][cx] = f(pv[cy][cx] + f(f(0.1) * f(singularity - pv[cy][cx])));
  if (pv[cy + 1][cx] < singularity)
    pv[cy + 1][cx] = f(pv[cy + 1][cx] + f(f(0.1) * f(singularity - pv[cy + 1][cx])));
  if (pv[cy - 1][cx] < singularity)
    pv[cy - 1][cx] = f(pv[cy - 1][cx] + f(f(0.1) * f(singularity - pv[cy - 1][cx])));

  pv[cy][cx + 1]     = restrict_flt(f(pv[cy][cx + 1]     + f(f(0.1) * f(singularity - pv[cy][cx + 1]))),     MIN_PRESSURE, MAX_PRESSURE);
  pv[cy + 1][cx + 1] = restrict_flt(f(pv[cy + 1][cx + 1] + f(f(0.1) * f(singularity - pv[cy + 1][cx + 1]))), MIN_PRESSURE, MAX_PRESSURE);
  pv[cy][cx - 1]     = restrict_flt(f(pv[cy][cx - 1]     + f(f(0.1) * f(singularity - pv[cy][cx - 1]))),     MIN_PRESSURE, MAX_PRESSURE);
  pv[cy - 1][cx - 1] = restrict_flt(f(pv[cy - 1][cx - 1] + f(f(0.1) * f(singularity - pv[cy - 1][cx - 1]))), MIN_PRESSURE, MAX_PRESSURE);

  if (parts[i].life < 1) {
    //Pop!
    for (let rx = -1; rx <= 1; rx++) {
      const crx = ((x / CELL) | 0) + rx;
      for (let ry = -1; ry <= 1; ry++) {
        const cry = ((y / CELL) | 0) + ry;
        if (cry >= 0 && crx >= 0 && crx < XCELLS && cry < YCELLS) {
          sim.pv[cry][crx] = restrict_flt(f(sim.pv[cry][crx] + f(parts[i].tmp)), MIN_PRESSURE, MAX_PRESSURE);
        }
      }
    }
    let spawncount = Math.abs(parts[i].tmp) | 0;
    spawncount = spawncount > 255 ? 3019 : itrunc(Math.pow(((spawncount / 8) | 0), 2) * Math.PI);
    for (let j = 0; j < spawncount; j++) {
      let nb = -1;
      switch (sim.rng.gen() % 3) {
        case 0:
          //@ SING -> PHOT
          nb = sim.create_part(-3, x, y, PT_PHOT);
          break;
        case 1:
          //@ SING -> NEUT
          nb = sim.create_part(-3, x, y, PT_NEUT);
          break;
        case 2:
          //@ SING -> ELEC
          nb = sim.create_part(-3, x, y, PT_ELEC);
          break;
      }
      if (nb !== -1) {
        parts[nb].life = sim.rng.between(0, 299);
        parts[nb].temp = f(MAX_TEMP / 2);
        const angle = f(f(sim.rng.uniform01() * f(2.0)) * f(Math.PI));
        const v = f(sim.rng.uniform01() * f(5.0));
        parts[nb].vx = f(v * f(Math.cos(angle)));
        parts[nb].vy = f(v * f(Math.sin(angle)));
      }
      else if ((sim.parts as unknown as { MaxPartsReached(): boolean }).MaxPartsReached())
        break;//if we've run out of particles, stop trying to create them - saves a lot of lag on "sing bomb" saves
    }
    sim.kill_part(i);
    return 1;
  }
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) !== PT_DMND && sim.rng.chance(1, 3)) {
          if (TYP(r) === PT_SING && parts[ID(r)].life > 10) {
            if (parts[i].life + parts[ID(r)].life > 255)
              continue;
            parts[i].life += parts[ID(r)].life;
          }
          else {
            if (parts[i].life + 3 > 255) {
              if (parts[ID(r)].type !== PT_SING && sim.rng.chance(1, 1000)) {
                let np: number;
                np = sim.create_part(ID(r), x + rx, y + ry, PT_SING);
                parts[np].life = sim.rng.between(60, 109);
              }
              continue;
            }
            parts[i].life += 3;
            parts[i].tmp++;
          }
          parts[i].temp = restrict_flt(f(parts[ID(r)].temp + parts[i].temp), MIN_TEMP, MAX_TEMP);
          sim.kill_part(ID(r));
        }
      }
    }
  }
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  sim.parts[i].life = sim.rng.between(60, 109);
}
