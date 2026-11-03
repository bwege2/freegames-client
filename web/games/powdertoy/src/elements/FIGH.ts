// simulation/elements/FIGH.cpp (Element_FIGH_Alloc, Element_FIGH_CanAlloc, Element_FIGH_NewFighter are declared in STKM.h)
import { sd } from '../sim/simulationData.ts';
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { FIELD_CTYPE, type Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CFDS, IPH, IPL, ITL, MAX_FIGHTERS, NT, PROP_DEADLY, PROP_NOCTYPEDRAW, PROP_RADIOACTIVE, PT_NUM, R_TEMP, SC_SPECIAL,
} from '../sim/config.ts';
import { PT_DUST, PT_FIGH, PT_FIRE, PT_LIGH, PT_NEUT } from '../sim/numbers.ts';
import { Element_STKM_graphics, Element_STKM_init_legs, Element_STKM_run_stickman } from '../elements/STKM.ts';

export function Element_FIGH(el: Element): void {
  el.Identifier = 'DEFAULT_PT_FIGH';
  el.Name = 'FIGH';
  el.Colour = 0xFFE0A0; // 0xFFE0A0_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
  el.Enabled = 1;

  el.Advection = 0.5;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.2);
  el.Loss = 1.0;
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.NewtonianGravity = 0.0;
  el.Diffusion = 0.0;
  el.HotAir = f(f(0.00) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 50;

  el.DefaultProperties.temp = f(f(R_TEMP + f(14.6)) + f(273.15)); // R_TEMP + 14.6f + 273.15f
  el.HeatConduct = 0;
  el.Description = 'Fighter. Tries to kill stickmen. You must first give it an element to kill him with.';

  el.Properties = PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 620.0;
  el.HighTemperatureTransition = PT_FIRE;

  el.DefaultProperties.life = 100;

  el.Update = update;
  el.Graphics = Element_STKM_graphics;
  el.CreateAllowed = createAllowed;
  el.ChangeType = changeType;
}

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (parts[i].tmp < 0 || parts[i].tmp >= MAX_FIGHTERS) {
    sim.kill_part(i);
    return 1;
  }
  const figh = sim.fighters[parts[i].tmp & 0xFF];

  let tarx = 0, tary = 0;

  parts[i].tmp2 = 0; //0 - stay in place, 1 - seek a stick man

  //Set target cords
  if (sim.player2.spwn) {
    // pow(float, 2) computes in double
    if (sim.player.spwn && (Math.pow(f(sim.player.legs[2] - x), 2) + Math.pow(f(sim.player.legs[3] - y), 2)) <=
      (Math.pow(f(sim.player2.legs[2] - x), 2) + Math.pow(f(sim.player2.legs[3] - y), 2))) {
      tarx = itrunc(sim.player.legs[2]);
      tary = itrunc(sim.player.legs[3]);
    }
    else {
      tarx = itrunc(sim.player2.legs[2]);
      tary = itrunc(sim.player2.legs[3]);
    }
    parts[i].tmp2 = 1;
  }
  else if (sim.player.spwn) {
    tarx = itrunc(sim.player.legs[2]);
    tary = itrunc(sim.player.legs[3]);
    parts[i].tmp2 = 1;
  }

  switch (parts[i].tmp2) {
    case 1:
      if ((Math.pow(f(tarx - x), 2) + Math.pow(f(tary - y), 2)) < 600) {
        if (figh.elem === PT_LIGH || figh.elem === PT_NEUT
          || elements[figh.elem].Properties & (PROP_DEADLY | PROP_RADIOACTIVE)
          || elements[figh.elem].DefaultProperties.temp >= 323 || elements[figh.elem].DefaultProperties.temp <= 243)
          figh.comm = figh.comm | 0x08;
      }
      else if (tarx < x) {
        if (figh.rocketBoots || !(sim.eval_move(PT_FIGH, itrunc(figh.legs[4]) - 10, itrunc(figh.legs[5]) + 6, null)
          && sim.eval_move(PT_FIGH, itrunc(figh.legs[4]) - 10, itrunc(figh.legs[5]) + 3, null)))
          figh.comm = 0x01;
        else
          figh.comm = 0x02;

        if (figh.rocketBoots) {
          if (tary < y)
            figh.comm = figh.comm | 0x04;
        }
        else if (!sim.eval_move(PT_FIGH, itrunc(figh.legs[4]) - 4, itrunc(figh.legs[5]) - 1, null)
          || !sim.eval_move(PT_FIGH, itrunc(figh.legs[12]) - 4, itrunc(figh.legs[13]) - 1, null)
          || sim.eval_move(PT_FIGH, 2 * itrunc(figh.legs[4]) - itrunc(figh.legs[6]), itrunc(figh.legs[5]) + 5, null))
          figh.comm = figh.comm | 0x04;
      }
      else {
        if (figh.rocketBoots || !(sim.eval_move(PT_FIGH, itrunc(figh.legs[12]) + 10, itrunc(figh.legs[13]) + 6, null)
          && sim.eval_move(PT_FIGH, itrunc(figh.legs[12]) + 10, itrunc(figh.legs[13]) + 3, null)))
          figh.comm = 0x02;
        else
          figh.comm = 0x01;

        if (figh.rocketBoots) {
          if (tary < y)
            figh.comm = figh.comm | 0x04;
        }
        else if (!sim.eval_move(PT_FIGH, itrunc(figh.legs[4]) + 4, itrunc(figh.legs[5]) - 1, null)
          || !sim.eval_move(PT_FIGH, itrunc(figh.legs[4]) + 4, itrunc(figh.legs[5]) - 1, null)
          || sim.eval_move(PT_FIGH, 2 * itrunc(figh.legs[12]) - itrunc(figh.legs[14]), itrunc(figh.legs[13]) + 5, null))
          figh.comm = figh.comm | 0x04;
      }
      break;
    default:
      figh.comm = 0;
      break;
  }

  figh.pcomm = figh.comm;

  Element_STKM_run_stickman(figh, sim, i, x, y, surround_space, nt, parts, pmap);
  return 0;
}

function createAllowed(sim: Simulation, _i: number, _x: number, _y: number, _t: number): boolean {
  return Element_FIGH_CanAlloc(sim);
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, _from: number, to: number): void {
  if (to === PT_FIGH) {
    sim.parts[i].tmp = Element_FIGH_Alloc(sim);
    if (sim.parts[i].tmp >= 0)
      Element_FIGH_NewFighter(sim, sim.parts[i].tmp, i, PT_DUST);
  }
  else {
    Free(sim, sim.parts[i].tmp & 0xFF);
  }
}

export function Element_FIGH_CanAlloc(sim: Simulation): boolean {
  return sim.fighcount < MAX_FIGHTERS;
}

export function Element_FIGH_Alloc(sim: Simulation): number {
  if (sim.fighcount >= MAX_FIGHTERS)
    return -1;
  let i = 0;
  while (i < MAX_FIGHTERS && sim.fighters[i].spwn === 1)
    i++;
  if (i < MAX_FIGHTERS) {
    sim.fighters[i].spwn = 1;
    sim.fighters[i].elem = PT_DUST;
    sim.fighcount = (sim.fighcount + 1) & 0xFF;
    return i;
  }
  else return -1;
}

function Free(sim: Simulation, i: number): void {
  // i is an unsigned char: with i >= MAX_FIGHTERS the C++ reads past fighters[] (undefined behaviour); the port
  // treats that as a free slot
  if (i >= MAX_FIGHTERS)
    return;
  if (sim.fighters[i].spwn) {
    sim.fighters[i].spwn = 0;
    sim.fighcount = (sim.fighcount - 1) & 0xFF;
  }
}

export function Element_FIGH_NewFighter(sim: Simulation, fighterID: number, i: number, elem: number): void {
  Element_STKM_init_legs(sim, sim.fighters[fighterID], i);
  if (elem > 0 && elem < PT_NUM)
    sim.fighters[fighterID].elem = elem;
  sim.fighters[fighterID].spwn = 1;
}
