// simulation/elements/LIGH.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, DECO_FIRE, FIRE_ADD, ID, IPH, IPL, ITH, ITL, MAX_PRESSURE, MAX_TEMP, MIN_PRESSURE, MIN_TEMP, NT,
  PMODE_GLOW, PROP_CONDUCTS, SC_EXPLOSIVE, TYP, TYPE_SOLID, XRES, YRES,
} from '../sim/config.ts';
import {
  PT_BCOL, PT_BHOL, PT_CLNE, PT_COAL, PT_DEUT, PT_DMND, PT_FIRE, PT_HEAC, PT_LAVA, PT_LIGH, PT_NBHL, PT_NEUT,
  PT_PLUT, PT_PVOD, PT_SPNG, PT_SPRK, PT_STKM, PT_STKM2, PT_TESC, PT_THDR, PT_VOID,
} from '../sim/numbers.ts';

export function Element_LIGH(el: Element): void {
  el.Identifier = 'DEFAULT_PT_LIGH';
  el.Name = 'LIGH';
  el.Colour = 0xFFFFC0;
  el.MenuVisible = 1;
  el.MenuSection = SC_EXPLOSIVE;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Lightning. Change the brush size to set the size of the lightning.';

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
  el.Create = create;
}

const LIGHTING_POWER = f(0.65);

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  /*
   * tmp2:
   * 0 - bending
   * 1 - bending (particle order deferred)
   * 2 - branching
   * 3 - branching (particle order deferred)
   * 4 - first pixel
   * 5+  normal segment. Starts at 8, counts down and is removed at 5
   *
   * life - power of lightning, influences reaction strength and segment length
   *
   * tmp - angle of lighting, measured in degrees counterclockwise from the positive x direction
   */
  const powderful = itrunc(f(f(parts[i].temp * f(1 + idiv(parts[i].life, 40))) * LIGHTING_POWER));
  //Element_FIRE::update(UPDATE_FUNC_SUBCALL_ARGS);
  const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
  if (sim.aheat_enable) {
    sim.hv[cy][cx] = f(sim.hv[cy][cx] + f(idiv(powderful, 50)));
    if (sim.hv[cy][cx] > MAX_TEMP)
      sim.hv[cy][cx] = MAX_TEMP;
    // If the LIGH was so powerful that it overflowed hv, set to max temp
    else if (sim.hv[cy][cx] < 0)
      sim.hv[cy][cx] = MAX_TEMP;
  }

  const elements = sd.elements;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        const rt = TYP(r);
        if ((surround_space || elements[rt].Explosive) &&
          (rt !== PT_SPNG || parts[ID(r)].life === 0) &&
          elements[rt].Flammable && sim.rng.chance(elements[rt].Flammable + itrunc(f(sim.pv[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0] * 10.0)), 1000)) {
          //@ LIGH + flammable -> LIGH + FIRE
          sim.part_change_type(ID(r), x + rx, y + ry, PT_FIRE);
          parts[ID(r)].temp = restrict_flt(f(elements[PT_FIRE].DefaultProperties.temp + f(idiv(elements[rt].Flammable, 2))), MIN_TEMP, MAX_TEMP);
          parts[ID(r)].life = sim.rng.between(180, 259);
          parts[ID(r)].tmp = parts[ID(r)].ctype = 0;
          if (elements[rt].Explosive)
            sim.pv[cy][cx] += f(f(0.25) * CFDS);
        }
        switch (rt) {
          case PT_LIGH:
          case PT_TESC:
            continue;
          case PT_CLNE:
          case PT_THDR:
          case PT_DMND:
          case PT_FIRE:
            parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + f(idiv(powderful, 10))), MIN_TEMP, MAX_TEMP);
            continue;
          case PT_DEUT:
          case PT_PLUT:
            parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + f(powderful)), MIN_TEMP, MAX_TEMP);
            sim.pv[cy][cx] = restrict_flt(f(sim.pv[cy][cx] + f(idiv(powderful, 35))), MIN_PRESSURE, MAX_PRESSURE);
            if (sim.rng.chance(1, 3)) {
              //@ LIGH + DEUT/PLUT -> LIGH + NEUT
              sim.part_change_type(ID(r), x + rx, y + ry, PT_NEUT);
              parts[ID(r)].life = sim.rng.between(480, 959);
              parts[ID(r)].vx = sim.rng.between(-5, 5);
              parts[ID(r)].vy = sim.rng.between(-5, 5);
            }
            break;
          case PT_COAL:
          case PT_BCOL:
            if (parts[ID(r)].life > 100)
              parts[ID(r)].life = 99;
            break;
          case PT_STKM:
            if (sim.player.elem !== PT_LIGH)
              parts[ID(r)].life -= idiv(powderful, 100);
            break;
          case PT_STKM2:
            if (sim.player2.elem !== PT_LIGH)
              parts[ID(r)].life -= idiv(powderful, 100);
            break;
          case PT_HEAC:
            parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + f(idiv(powderful, 10))), MIN_TEMP, MAX_TEMP);
            if (parts[ID(r)].temp > elements[PT_HEAC].HighTemperature) {
              //@ LIGH + HEAC -> LIGH + LAVA(HEAC)
              sim.part_change_type(ID(r), x + rx, y + ry, PT_LAVA);
              parts[ID(r)].ctype = PT_HEAC;
            }
            break;
          default:
            break;
        }
        if ((elements[TYP(r)].Properties & PROP_CONDUCTS) && parts[ID(r)].life === 0)
          sim.create_part(ID(r), x + rx, y + ry, PT_SPRK);
        sim.pv[cy][cx] = restrict_flt(f(sim.pv[cy][cx] + f(idiv(powderful, 400))), MIN_PRESSURE, MAX_PRESSURE);
        // temp + powderful/1.3 is computed in double, then passed as restrict_flt's float parameter
        if (!sd.IsHeatInsulator(parts[ID(r)])) parts[ID(r)].temp = restrict_flt(f(parts[ID(r)].temp + powderful / 1.3), MIN_TEMP, MAX_TEMP);
      }
    }
  }
  // Deferred branch or bend; or in removal countdown stage
  if (parts[i].tmp2 === 1 || parts[i].tmp2 === 3 || (parts[i].tmp2 >= 6 && parts[i].tmp2 <= 8)) {
    // Probably set via console, make sure it doesn't stick around forever
    if (parts[i].tmp2 >= 9)
      parts[i].tmp2 = 7;
    else
      parts[i].tmp2--;
    return 0;
  }
  if (parts[i].tmp2 === 5 || parts[i].life <= 1) {
    sim.kill_part(i);
    return 1;
  }
  const angle = (parts[i].tmp + sim.rng.between(-30, 30)) % 360;
  const multipler = itrunc(parts[i].life * 1.5) + sim.rng.between(0, parts[i].life);
  const PI_F = f(Math.PI);
  // cos/sin of a float resolve to ::cos/::sin(double): computed in double
  let rx = itrunc(Math.cos(f(f(angle * PI_F) / 180)) * multipler);
  let ry = itrunc(-Math.sin(f(f(angle * PI_F) / 180)) * multipler);
  create_line_par(sim, x, y, x + rx, y + ry, PT_LIGH, parts[i].temp, parts[i].life, itrunc(angle), parts[i].tmp2, i);
  if (parts[i].tmp2 === 2)// && pNear == -1)
  {
    const angle2 = (itrunc(angle) + sim.rng.between(-100, 100)) % 360;
    rx = itrunc(Math.cos(f(f(angle2 * PI_F) / 180)) * multipler);
    ry = itrunc(-Math.sin(f(f(angle2 * PI_F) / 180)) * multipler);
    create_line_par(sim, x, y, x + rx, y + ry, PT_LIGH, parts[i].temp, parts[i].life, itrunc(angle2), parts[i].tmp2, i);
  }

  parts[i].tmp2 = 7;
  return 0;
}

function create_LIGH(sim: Simulation, x: number, y: number, c: number, temp: number, life: number, tmp: number, tmp2: number, last: boolean, i: number): boolean {
  const p = sim.create_part(-1, x, y, c);
  if (p !== -1) {
    sim.parts[p].temp = f(temp);
    sim.parts[p].tmp = tmp;
    sim.parts[p].dcolour = sim.parts[i].dcolour;
    if (last) {
      const nextSegmentLife = itrunc(life / 1.5 - sim.rng.between(0, 1));
      sim.parts[p].life = nextSegmentLife;
      if (nextSegmentLife > 1) {
        // Decide whether to branch or to bend
        const doBranch = sim.rng.chance(7, 10);
        sim.parts[p].tmp2 = (doBranch ? 2 : 0) + (p > i && tmp2 !== 4 ? 1 : 0);
      }
      // Not enough energy to continue
      else {
        sim.parts[p].tmp2 = 7 + (p > i ? 1 : 0);
      }
    }
    else {
      sim.parts[p].life = life;
      sim.parts[p].tmp2 = 7 + (p > i ? 1 : 0);
    }
  }
  else if (x >= 0 && x < XRES && y >= 0 && y < YRES) {
    const r = sim.pmap[y][x];
    if (((TYP(r) === PT_VOID || (TYP(r) === PT_PVOD && sim.parts[ID(r)].life >= 10)) && (!sim.parts[ID(r)].ctype || (sim.parts[ID(r)].ctype === c ? 1 : 0) !== (sim.parts[ID(r)].tmp & 1))) || TYP(r) === PT_BHOL || TYP(r) === PT_NBHL) // VOID, PVOD, VACU, and BHOL eat LIGH here
      return true;
  }
  else return true;
  return false;
}

function create_line_par(sim: Simulation, x1: number, y1: number, x2: number, y2: number, c: number, temp: number, life: number, tmp: number, tmp2: number, i: number): void {
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let back = false;
  let x: number, y: number;
  let e = 0.0, de: number;
  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2)
    back = true;
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  if (dx)
    de = f(dy / f(dx));
  else
    de = 0.0;
  y = y1;
  const Ystep = (y1 < y2) ? 1 : -1;
  if (!back) {
    for (x = x1; x <= x2; x++) {
      let ret: boolean;
      if (reverseXY)
        ret = create_LIGH(sim, y, x, c, temp, life, tmp, tmp2, x === x2, i);
      else
        ret = create_LIGH(sim, x, y, c, temp, life, tmp, tmp2, x === x2, i);
      if (ret)
        return;

      e = f(e + de);
      if (e >= 0.5) {
        y += Ystep;
        e = f(e - 1.0);
      }
    }
  }
  else {
    for (x = x1; x >= x2; x--) {
      let ret: boolean;
      if (reverseXY)
        ret = create_LIGH(sim, y, x, c, temp, life, tmp, tmp2, x === x2, i);
      else
        ret = create_LIGH(sim, x, y, c, temp, life, tmp, tmp2, x === x2, i);
      if (ret)
        return;

      e = f(e + de);
      if (e <= -0.5) {
        y += Ystep;
        e = f(e + 1.0);
      }
    }
  }
}

function graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.firea = 120;
  g.firer = g.colr = 235;
  g.fireg = g.colg = 245;
  g.fireb = g.colb = 255;
  g.pixel_mode |= PMODE_GLOW | FIRE_ADD | DECO_FIRE;
  return 1;
}

function create(sim: Simulation, i: number, x: number, y: number, _t: number, v: number): void {
  let gsize: number;
  if (v >= 0) {
    if (v > 55)
      v = 55;
    sim.parts[i].life = v;
  }
  else
    sim.parts[i].life = 30;
  sim.parts[i].temp = f(sim.parts[i].life * 150.0); // temperature of the lightning shows the power of the lightning
  const grav = { x: 0, y: 0 };
  sim.GetGravityField(x, y, 1.0, 1.0, grav);
  let gx = f(grav.x), gy = f(grav.y);
  gsize = f(f(gx * gx) + f(gy * gy));
  if (gsize < f(0.0016)) {
    const angle = f(sim.rng.between(0, 6283) * f(0.001)); //(in radians, between 0 and 2*pi)
    gsize = f(Math.sqrt(gsize));
    // randomness in weak gravity fields (more randomness with weaker fields)
    gx = f(gx + f(f(Math.cos(angle)) * f(f(0.04) - gsize)));
    gy = f(gy + f(f(Math.sin(angle)) * f(f(0.04) - gsize)));
  }
  sim.parts[i].tmp = (itrunc(f(f(f(Math.atan2(-gy, gx)) * 180.0) / f(Math.PI))) + sim.rng.between(-20, 20) + 360) % 360;
  sim.parts[i].tmp2 = 4;
}
