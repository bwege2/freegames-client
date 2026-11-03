// simulation/elements/PROT.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_BLEND, ID, IPH, IPL, ITH, ITL, MAX_TEMP, MIN_TEMP, NT, PROP_CONDUCTS, SC_NUCLEAR, TYP, TYPE_ENERGY,
} from '../sim/config.ts';
import {
  PT_AMTR, PT_BANG, PT_CO2, PT_DEUT, PT_EXOT, PT_FIRE, PT_LCRY, PT_NBLE, PT_NONE, PT_O2, PT_PHOT, PT_PLSM, PT_PLUT,
  PT_POLO, PT_PROT, PT_RSSS, PT_SEED, PT_SING, PT_SPRK, PT_TUNG, PT_URAN, PT_WIFI,
} from '../sim/numbers.ts';

export function Element_PROT(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PROT';
  el.Name = 'PROT';
  el.Colour = 0x990000;
  el.MenuVisible = 1;
  el.MenuSection = SC_NUCLEAR;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(0.00 * CFDS);
  el.AirLoss = 1.00;
  el.Loss = 1.00;
  el.Collision = f(-.99);
  el.Gravity = 0.0;
  el.Diffusion = 0.00;
  el.HotAir = f(0.000 * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = -1;

  el.HeatConduct = 61;
  el.Description = 'Protons. Transfer heat to materials, and remove sparks.';

  el.Properties = TYPE_ENERGY;

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
  el.Create = create;
}

const SEED_GENE_FIELDS = ['tmp', 'tmp2', 'tmp3', 'tmp4'] as const;

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  sim.pv[(y / CELL) | 0][(x / CELL) | 0] -= f(.003);
  const under = pmap[y][x];
  let utype = TYP(under);
  const uID = ID(under);
  switch (utype) {
    case PT_SPRK:
    {
      //remove active sparks
      const sparked = parts[uID].ctype;
      if (!sim.part_change_type(uID, x, y, sparked)) {
        parts[uID].life = 44 + parts[uID].life;
        parts[uID].ctype = 0;
      } else
        utype = 0;
      break;
    }
    case PT_DEUT:
      if (sim.rng.chance(-(itrunc(sim.pv[(y / CELL) | 0][(x / CELL) | 0]) - 4) + idiv(parts[uID].life, 100), 200)) {
        DeutImplosion(sim, parts[uID].life, x, y, restrict_flt(f(parts[uID].temp + f(Math.imul(parts[uID].life, 500))), MIN_TEMP, MAX_TEMP), PT_PROT);
        sim.kill_part(uID);
      }
      break;
    case PT_LCRY:
      //Powered LCRY reaction: PROT->PHOT
      if (parts[uID].life > 5 && sim.rng.chance(1, 10)) {
        //@ PROT + LCRY -> PHOT + LCRY
        sim.part_change_type(i, x, y, PT_PHOT);
        parts[i].life *= 2;
        parts[i].ctype = 0x3FFFFFFF;
      }
      break;
    case PT_EXOT:
      parts[uID].ctype = PT_PROT;
      break;
    case PT_WIFI: {
      let change: number;
      if (parts[i].temp < f(173.15)) change = -1000.0;
      else if (parts[i].temp < f(273.15)) change = -100.0;
      else if (parts[i].temp > f(473.15)) change = 1000.0;
      else if (parts[i].temp > f(373.15)) change = 100.0;
      else change = 0.0;
      parts[uID].temp = restrict_flt(f(parts[uID].temp + change), MIN_TEMP, MAX_TEMP);
      break;
    }
    case PT_RSSS: //Destroy RSSS
    {
      sim.kill_part(uID);
      sim.kill_part(i);
      return 1;
    }
    case PT_SEED: // Mutate seeds
      if (sim.rng.chance(1, 2)) {
        const ptrs_tmp = SEED_GENE_FIELDS;

        const j = sim.rng.between(0, 3);
        const k = sim.rng.between(0, 3);
        const old_tmpj = parts[uID][ptrs_tmp[j]];
        const old_tmpk = parts[uID][ptrs_tmp[k]];

        // Swap genes for j-th and k-th phases
        parts[uID][ptrs_tmp[j]] = old_tmpk;
        parts[uID][ptrs_tmp[k]] = old_tmpj;
      }
      break;
    case PT_NONE:
      //slowly kill if it's not inside an element
      if (parts[i].life) {
        if (!--parts[i].life) {
          sim.kill_part(i);
          return 1;
        }
      }
      break;
    default:
      //set off explosives (only when hot because it wasn't as fun when it made an entire save explode)
      if (parts[i].temp > f(f(273.15) + 500.0) && (elements[utype].Flammable || elements[utype].Explosive || utype === PT_BANG)) {
        sim.create_part(uID, x, y, PT_FIRE);
        parts[uID].temp = f(parts[uID].temp + restrict_flt(f(elements[utype].Flammable * 5), MIN_TEMP, MAX_TEMP));
        sim.pv[(y / CELL) | 0][(x / CELL) | 0] += 1.00;
      }
      //prevent inactive sparkable elements from being sparked
      else if ((elements[utype].Properties & PROP_CONDUCTS) && parts[uID].life <= 4) {
        parts[uID].life = 40 + parts[uID].life;
      }
      break;
  }
  //make temp of other things closer to it's own temperature. This will change temp of things that don't conduct, and won't change the PROT's temperature
  if (utype && utype !== PT_WIFI)
    parts[uID].temp = restrict_flt(f(parts[uID].temp - f(f(parts[uID].temp - parts[i].temp) / 4.0)), MIN_TEMP, MAX_TEMP);


  //if this proton has collided with another last frame, change it into a heavier element
  if (parts[i].tmp) {
    let element: number;
    if (parts[i].tmp > 500000) {
      if (utype === PT_TUNG)
        element = PT_AMTR; //@ PROT + TUNG -> AMTR
      else //@ PROT -> SING
        element = PT_SING; //particle accelerators are known to create earth-destroying black holes
    } else if (parts[i].tmp > 700)
      element = PT_PLUT; //@ PROT -> PLUT
    else if (parts[i].tmp > 420)
      element = PT_URAN; //@ PROT -> URAN
    else if (parts[i].tmp > 310)
      element = PT_POLO; //@ PROT -> POLO
    else if (parts[i].tmp > 250)
      element = PT_PLSM; //@ PROT -> PLSM
    else if (parts[i].tmp > 100)
      element = PT_O2; //@ PROT -> O2
    else if (parts[i].tmp > 50)
      element = PT_CO2; //@ PROT -> CO2
    else
      element = PT_NBLE; //@ PROT -> NBLE
    // the call's arguments: GCC evaluates them right to left (y offset first)
    const dy = sim.rng.between(-1, 1);
    const dx = sim.rng.between(-1, 1);
    const newID = sim.create_part(-1, x + dx, y + dy, element);
    if (newID >= 0)
      parts[newID].temp = restrict_flt(f(100.0 * f(parts[i].tmp)), MIN_TEMP, MAX_TEMP);
    sim.kill_part(i);
    return 1;
  }
  //collide with other protons to make heavier materials
  const ahead = sim.photons[y][x];
  if (ID(ahead) !== i && TYP(ahead) === PT_PROT) {
    const velocity1 = f(f(Math.pow(parts[i].vx, 2.0)) + f(Math.pow(parts[i].vy, 2.0)));
    const velocity2 = f(f(Math.pow(parts[ID(ahead)].vx, 2.0)) + f(Math.pow(parts[ID(ahead)].vy, 2.0)));
    const direction1 = f(Math.atan2(-parts[i].vy, parts[i].vx));
    const direction2 = f(Math.atan2(-parts[ID(ahead)].vy, parts[ID(ahead)].vx));
    let difference = f(direction1 - direction2); if (difference < 0) difference = f(difference + f(6.28319));

    if (difference > f(3.12659) && difference < f(3.15659) && f(velocity1 + velocity2) > 10.0) {
      parts[ID(ahead)].tmp += itrunc(f(velocity1 + velocity2));
      sim.kill_part(i);
      return 1;
    }
  }
  return 0;
}

function DeutImplosion(sim: Simulation, n: number, x: number, y: number, temp: number, t: number): number {
  let i: number;
  n = idiv(n, 50);
  if (n < 1)
    n = 1;
  else if (n > 340)
    n = 340;

  for (let c = 0; c < n; c++) {
    i = sim.create_part(-3, x, y, t);
    if (i >= 0)
      sim.parts[i].temp = temp;
    else if (sim.parts.MaxPartsReached())
      break;
  }
  sim.pv[(y / CELL) | 0][(x / CELL) | 0] -= f(f(6.0 * CFDS) * n);
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 7;
  g.firer = 250;
  g.fireg = 170;
  g.fireb = 170;

  g.pixel_mode |= FIRE_BLEND;
  return 1;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  const a = f(sim.rng.between(0, 35) * f(0.17453));
  sim.parts[i].life = 680;
  sim.parts[i].vx = f(2.0 * f(Math.cos(a)));
  sim.parts[i].vy = f(2.0 * f(Math.sin(a)));
}
