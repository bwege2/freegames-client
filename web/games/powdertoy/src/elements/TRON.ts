// simulation/elements/TRON.cpp
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, HSV_to_RGB, idiv, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, FIRE_ADD, IPH, IPL, ITH, ITL, NT, PMODE_BLEND, PMODE_FLARE, PMODE_FLAT, PMODE_GLOW, PROP_LIFE_DEC,
  PROP_LIFE_KILL, PROP_LIFE_KILL_DEC, SC_SPECIAL, TYPE_SOLID, XCELLS, XRES, YCELLS, YRES, TYP, ID,
} from '../sim/config.ts';
import { PT_INVIS, PT_SWCH, PT_TRON } from '../sim/numbers.ts';

export function Element_TRON(el: Element): void {
  el.Identifier = 'DEFAULT_PT_TRON';
  el.Name = 'TRON';
  el.Colour = 0xA9FF00; // 0xA9FF00_rgb
  el.MenuVisible = 1;
  el.MenuSection = SC_SPECIAL;
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
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = 0.0;
  el.HeatConduct = 40;
  el.Description = 'Smart particles, Travels in straight lines and avoids obstacles. Grows with time.';

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC | PROP_LIFE_KILL;

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

/* TRON element is meant to resemble a tron bike (or worm) moving around and trying to avoid obstacles itself.
 * It has four direction each turn to choose from, 0 (left) 1 (up) 2 (right) 3 (down).
 * Each turn has a small random chance to randomly turn one way (so it doesn't do the exact same thing in a large room)
 * If the place it wants to move isn't a barrier, it will try and 'see' in front of itself to determine its safety.
 * For now the tron can only see its own body length in pixels ahead of itself (and around corners)
 *  - - - - - - - - - -
 *  - - - - + - - - - -
 *  - - - + + + - - - -
 *  - - +<--+-->+ - - -
 *  - +<----+---->+ - -
 *  - - - - H - - - - -
 * Where H is the head with tail length 4, it checks the + area to see if it can hit any of the edges, then it is called safe, or picks the biggest area if none safe.
 * .tmp bit values: 1st head, 2nd no tail growth, 3rd wait flag, 4th Nodie, 5th Dying, 6th & 7th is direction, 8th - 16th hue, 17th Norandom
 * .tmp2 is tail length (gets longer every few hundred frames)
 * .life is the timer that kills the end of the tail (the head uses life for how often it grows longer)
 * .ctype Contains the colour, lost on save, regenerated using hue tmp (bits 7 - 16)
 */

const TRON_HEAD = 0x00000001;
const TRON_NOGROW = 0x00000002;
const TRON_WAIT = 0x00000004; //it was just created, so WAIT a frame
const TRON_NODIE = 0x00000008;
const TRON_DEATH = 0x00000010; //Crashed, now dying
const TRON_NORANDOM = 0x00010000;
const tron_rx = [-1, 0, 1, 0];
const tron_ry = [0, -1, 0, 1];

function MakeTronColors(): number[] {
  const tron_colours: number[] = new Array<number>(32).fill(0);
  let i: number;
  let r = 0, g = 0, b = 0;
  for (i = 0; i < 32; i++) {
    // funny almost-bug: if (i<<4) > 360(ish), HSV_to_RGB does nothing with r/g/b,
    // but since the variables are reused across iterations of the loop, they will still have sane values
    // (HSV_to_RGB then only adds m, which is 0 for s = v = 255)
    if (f((i << 4) / f(60.0)) < 6)
      [r, g, b] = HSV_to_RGB(i << 4, 255, 255);
    tron_colours[i] = (r << 16 | g << 8 | b) >>> 0;
  }
  return tron_colours;
}
const tron_colours = MakeTronColors();

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], _pmap: Int32Array[]): number {
  if (parts[i].tmp & TRON_WAIT) {
    parts[i].tmp &= ~TRON_WAIT;
    return 0;
  }
  if (parts[i].tmp & TRON_HEAD) {
    let firstdircheck = 0, seconddir = 0, seconddircheck = 0, lastdir = 0, lastdircheck = 0;
    let direction = (parts[i].tmp >> 5 & 0x3);
    const originaldir = direction;

    //random turn
    const random = sim.rng.between(0, 339);
    if ((random === 1 || random === 3) && !(parts[i].tmp & TRON_NORANDOM)) {
      //randomly turn left(3) or right(1)
      direction = (direction + random) % 4;
    }

    //check in front
    //do sight check
    firstdircheck = trymovetron(sim, x, y, direction, i, parts[i].tmp2);
    if (firstdircheck < parts[i].tmp2) {
      if (parts[i].tmp & TRON_NORANDOM) {
        seconddir = (direction + 1) % 4;
        lastdir = (direction + 3) % 4;
      }
      else if (originaldir !== direction) //if we just tried a random turn, don't pick random again
      {
        seconddir = originaldir;
        lastdir = (direction + 2) % 4;
      }
      else {
        seconddir = (direction + (sim.rng.between(0, 1) * 2) + 1) % 4;
        lastdir = (seconddir + 2) % 4;
      }
      seconddircheck = trymovetron(sim, x, y, seconddir, i, parts[i].tmp2);
      lastdircheck = trymovetron(sim, x, y, lastdir, i, parts[i].tmp2);
    }
    //find the best move
    if (seconddircheck > firstdircheck)
      direction = seconddir;
    if (lastdircheck > seconddircheck && lastdircheck > firstdircheck)
      direction = lastdir;
    //now try making new head, even if it fails
    if (new_tronhead(sim, x + tron_rx[direction], y + tron_ry[direction], i, direction) === -1) {
      //ohgod crash
      parts[i].tmp |= TRON_DEATH;
      //trigger tail death for TRON_NODIE, or is that mode even needed? just set a high tail length(but it still won't start dying when it crashes)
    }

    //set own life and clear .tmp (it dies if it can't move anyway)
    parts[i].life = parts[i].tmp2;
    parts[i].tmp &= parts[i].tmp & 0xF818;
  }
  else // fade tail deco, or prevent tail from dying
  {
    if (parts[i].tmp & TRON_NODIE)
      parts[i].life++;
    //parts[i].dcolour =  clamp_flt((float)parts[i].life/(float)parts[i].tmp2,0,1.0f) << 24 |  parts[i].dcolour&0x00FFFFFF;
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const col = tron_colours[(cpart.tmp & 0xF800) >> 11];
  if (cpart.tmp & TRON_HEAD)
    g.pixel_mode |= PMODE_GLOW;
  g.colr = (col & 0xFF0000) >> 16;
  g.colg = (col & 0x00FF00) >> 8;
  g.colb = (col & 0x0000FF);
  if (cpart.tmp & TRON_DEATH) {
    g.pixel_mode |= FIRE_ADD | PMODE_FLARE;
    g.firer = g.colr;
    g.fireg = g.colg;
    g.fireb = g.colb;
    g.firea = 255;
  }
  if (cpart.life < cpart.tmp2 && !(cpart.tmp & TRON_HEAD)) {
    g.pixel_mode |= PMODE_BLEND;
    g.pixel_mode &= ~PMODE_FLAT;
    g.cola = itrunc(f(f(f(cpart.life) / f(cpart.tmp2)) * f(255.0)));
  }
  return 0;
}

function create(sim: Simulation, i: number, _x: number, _y: number, _t: number, _v: number): void {
  const randhue = sim.rng.between(0, 359);
  const randomdir = sim.rng.between(0, 3);
  // Set as a head and a direction
  sim.parts[i].tmp = 1 | (randomdir << 5) | (randhue << 7);
  // Tail
  sim.parts[i].tmp2 = 4;
  sim.parts[i].life = 5;
}

function new_tronhead(sim: Simulation, x: number, y: number, i: number, direction: number): number {
  const np = sim.create_part(-1, x, y, PT_TRON);
  if (np === -1)
    return -1;
  if (sim.parts[i].life >= 100) // increase tail length
  {
    if (!(sim.parts[i].tmp & TRON_NOGROW))
      sim.parts[i].tmp2++;
    sim.parts[i].life = 5;
  }
  //give new head our properties
  sim.parts[np].tmp = 1 | direction << 5 | (sim.parts[i].tmp & (TRON_NOGROW | TRON_NODIE | TRON_NORANDOM)) | (sim.parts[i].tmp & 0xF800);
  if (np > i)
    sim.parts[np].tmp |= TRON_WAIT;

  sim.parts[np].ctype = sim.parts[i].ctype;
  sim.parts[np].tmp2 = sim.parts[i].tmp2;
  sim.parts[np].life = sim.parts[i].life + 2;
  return 1;
}

// The C++ reads pmap/bmap before its bounds check, possibly out of the arrays; whatever it reads there, the bounds
// check that follows fails and the loop breaks, so the port reads 0 outside the arrays.
function pmapAt(sim: Simulation, y: number, x: number): number {
  if (y < 0 || y >= YRES || x < 0 || x >= XRES) return 0;
  return sim.pmap[y][x];
}
function bmapAt(sim: Simulation, cy: number, cx: number): number {
  if (cy < 0 || cy >= YCELLS || cx < 0 || cx >= XCELLS) return 0;
  return sim.bmap[cy][cx];
}

function trymovetron(sim: Simulation, x: number, y: number, dir: number, _i: number, len: number): number {
  let k: number, j: number, r: number, rx: number, ry: number, tx: number, ty: number, count: number;
  count = 0;
  rx = x;
  ry = y;
  for (k = 1; k <= len; k++) {
    rx += tron_rx[dir];
    ry += tron_ry[dir];
    r = pmapAt(sim, ry, rx);
    if (canmovetron(sim, r, k - 1) && !bmapAt(sim, idiv(ry, CELL), idiv(rx, CELL)) && ry >= CELL && rx >= CELL && ry < YRES - CELL && rx < XRES - CELL) {
      count++;
      for (tx = rx - tron_ry[dir], ty = ry - tron_rx[dir], j = 1; Math.abs(tx - rx) < (len - k) && Math.abs(ty - ry) < (len - k); tx -= tron_ry[dir], ty -= tron_rx[dir], j++) {
        r = pmapAt(sim, ty, tx);
        if (canmovetron(sim, r, j + k - 1) && !bmapAt(sim, idiv(ty, CELL), idiv(tx, CELL)) && ty >= CELL && tx >= CELL && ty < YRES - CELL && tx < XRES - CELL) {
          if (j === (len - k))//there is a safe path, so we can break out
            return len + 1;
          count++;
        }
        else //we hit a block so no need to check farther here
          break;
      }
      for (tx = rx + tron_ry[dir], ty = ry + tron_rx[dir], j = 1; Math.abs(tx - rx) < (len - k) && Math.abs(ty - ry) < (len - k); tx += tron_ry[dir], ty += tron_rx[dir], j++) {
        r = pmapAt(sim, ty, tx);
        if (canmovetron(sim, r, j + k - 1) && !bmapAt(sim, idiv(ty, CELL), idiv(tx, CELL)) && ty >= CELL && tx >= CELL && ty < YRES - CELL && tx < XRES - CELL) {
          if (j === (len - k))
            return len + 1;
          count++;
        }
        else
          break;
      }
    }
    else //a block infront, no need to continue
      break;
  }
  return count;
}

function canmovetron(sim: Simulation, r: number, len: number): boolean {
  const elements = sd.elements;
  if (!r || (TYP(r) === PT_SWCH && sim.parts[ID(r)].life >= 10) || (TYP(r) === PT_INVIS && sim.parts[ID(r)].tmp2 === 1))
    return true;
  if ((((elements[TYP(r)].Properties & PROP_LIFE_KILL_DEC) && sim.parts[ID(r)].life > 0) || ((elements[TYP(r)].Properties & PROP_LIFE_KILL) && (elements[TYP(r)].Properties & PROP_LIFE_DEC))) && sim.parts[ID(r)].life < len)
    return true;
  return false;
}
