// simulation/elements/ETRD.cpp (+ ETRD.h)
import type { Element } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, InBounds, NT, PROP_CONDUCTS, PROP_LIFE_DEC, SC_ELEC, TYP, TYPE_SOLID, XRES, YRES } from '../sim/config.ts';
import { PT_ETRD } from '../sim/numbers.ts';

export function Element_ETRD(el: Element): void {
  el.Identifier = "DEFAULT_PT_ETRD";
  el.Name = "ETRD";
  el.Colour = 0x404040;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
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
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 251;
  el.Description = "Electrode. Creates plasma arcs with electricity. (Use sparingly)";

  el.Properties = TYPE_SOLID | PROP_CONDUCTS | PROP_LIFE_DEC;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.ChangeType = changeType;
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, from: number, to: number): void {
  if (sim.etrd_count_valid)
  {
    if (from == PT_ETRD && sim.parts[i].life == 0)
      sim.etrd_life0_count--;
    if (to == PT_ETRD && sim.parts[i].life == 0)
      sim.etrd_life0_count++;
  }
}

/** std::hypot(int, int): the double overload, correctly rounded; sqrt of the exact integer sum is the same value */
function hypotInt(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

class ETRD_deltaWithLength
{
  d: { X: number; Y: number };
  length: number;
  constructor(a: { X: number; Y: number }, b: number) {
    this.d = a;
    this.length = b;
  }
}

function InitDeltaPos(): ETRD_deltaWithLength[]
{
  const maxLength = 12;
  const deltaPos: ETRD_deltaWithLength[] = [];
  for (let ry = -maxLength; ry <= maxLength; ry++)
    for (let rx = -maxLength; rx <= maxLength; rx++)
    {
      const d = { X: rx, Y: ry };
      if (Math.abs(d.X) + Math.abs(d.Y) <= maxLength)
        deltaPos.push(new ETRD_deltaWithLength(d, itrunc(hypotInt(d.X, d.Y))));
    }
  // std::stable_sort; Array.prototype.sort is stable
  deltaPos.sort((a, b) => {
    return a.length < b.length ? -1 : a.length > b.length ? 1 : 0;
  });
  return deltaPos;
}
const deltaPos = InitDeltaPos();

// ETRD.h
export function Element_ETRD_nearestSparkablePart(sim: Simulation, targetId: number): number
{
  if (!sim.elementCount[PT_ETRD])
    return -1;
  if (sim.etrd_count_valid && sim.etrd_life0_count <= 0)
    return -1;

  const parts = sim.parts;
  if (parts[targetId].tmp2 && parts[targetId].tmp > parts[targetId].tmp2) // Invalid range if max is set
    return -1;

  const maxDistance = itrunc(hypotInt(XRES, YRES));
  let foundDistance = parts[targetId].tmp2 ? Math.min(parts[targetId].tmp2, maxDistance) : maxDistance; // tmp2 sets max distance
  let foundI = -1;
  const targetPos = { X: itrunc(parts[targetId].x), Y: itrunc(parts[targetId].y) };

  if (sim.etrd_count_valid)
  {
    // countLife0 doesn't need recalculating, so just focus on finding the nearest particle

    // If the simulation contains lots of particles, check near the target position first since going through all particles will be slow.
    // Threshold = number of positions checked, *2 because it's likely to access memory all over the place (less cache friendly) and there's extra logic needed
    // TODO: probably not optimal if excessive stacking is used
    if (sim.parts.active > deltaPos.length*2)
    {
      for (const delta of deltaPos)
      {
        const checkPos = { X: targetPos.X + delta.d.X, Y: targetPos.Y + delta.d.Y };
        const checkDistance = delta.length;
        if (parts[targetId].tmp >= checkDistance) // tmp sets min distance
        {
          continue;
        }
        if (foundDistance < checkDistance)
        {
          // deltaPos is sorted in order of ascending length, so foundDistance < checkDistance means all later items are further away.
          break;
        }
        if (InBounds(checkPos.X, checkPos.Y) && checkDistance <= foundDistance)
        {
          const r = sim.pmap[checkPos.Y][checkPos.X];
          if (r && TYP(r) == PT_ETRD && !parts[ID(r)].life && ID(r) != targetId && checkDistance < foundDistance)
          {
            foundDistance = checkDistance;
            foundI = ID(r);
          }
        }
      }
    }
    // If neighbor search didn't find a suitable particle, search all particles
    if (foundI < 0)
    {
      for (let i = 0; i < sim.parts.active; i++)
      {
        if (parts[i].type == PT_ETRD && !parts[i].life)
        {
          const checkPos = { X: itrunc(parts[i].x)-targetPos.X, Y: itrunc(parts[i].y)-targetPos.Y };
          const checkDistance = itrunc(hypotInt(checkPos.X, checkPos.Y));
          if (checkDistance < foundDistance && checkDistance > parts[targetId].tmp && i != targetId) // tmp sets min distance
          {
            foundDistance = checkDistance;
            foundI = i;
          }
        }
      }
    }
  }
  else
  {
    // Recalculate countLife0, and search for the closest suitable particle
    let countLife0 = 0;
    for (let i = 0; i < sim.parts.active; i++)
    {
      if (parts[i].type == PT_ETRD && !parts[i].life)
      {
        countLife0++;
        const checkPos = { X: itrunc(parts[i].x)-targetPos.X, Y: itrunc(parts[i].y)-targetPos.Y };
        const checkDistance = itrunc(hypotInt(checkPos.X, checkPos.Y));
        if (checkDistance < foundDistance && checkDistance > parts[targetId].tmp && i != targetId) // tmp sets min distance
        {
          foundDistance = checkDistance;
          foundI = i;
        }
      }
    }
    sim.etrd_life0_count = countLife0;
    sim.etrd_count_valid = true;
  }
  return foundI;
}
