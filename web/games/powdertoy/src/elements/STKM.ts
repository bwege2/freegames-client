// simulation/elements/STKM.cpp (+ STKM.h)
import { sd } from '../sim/simulationData.ts';
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation, Playerst } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f, idiv, itrunc, restrict_flt } from '../sim/cpp.ts';
import {
  CELL, CFDS, CHANNELS, GRAV_CUSTOM, GRAV_OFF, GRAV_RADIAL, GRAV_VERTICAL, ID, InBounds, InCellBounds, IPH, IPL,
  ITL, MAX_TEMP, MIN_TEMP, NPART, NT, PROP_DEADLY, PROP_NOCTYPEDRAW, PROP_RADIOACTIVE, PSPEC_STICKMAN, R_TEMP,
  SC_SPECIAL, TYP, TYPE_ENERGY, TYPE_GAS, TYPE_LIQUID, TYPE_SOLID, WL_DETECT, WL_EHOLE, WL_FAN, WL_GRAV, XCELLS,
  XCNTR, XRES, YCNTR, YRES,
} from '../sim/config.ts';
import {
  PT_ACID, PT_BHOL, PT_FIGH, PT_FIRE, PT_LIGH, PT_LOLZ, PT_LOVE, PT_NBHL, PT_NEUT, PT_PHOT, PT_PLNT, PT_PLSM, PT_PRTI,
  PT_PVOD, PT_SPAWN, PT_SPRK, PT_STKM, PT_TESC, PT_VOID,
} from '../sim/numbers.ts';

// STKM.h: the FIGH functions are defined in FIGH.cpp
export { Element_FIGH_Alloc, Element_FIGH_CanAlloc, Element_FIGH_NewFighter } from './FIGH.ts';

export function Element_STKM(el: Element): void {
  el.Identifier = 'DEFAULT_PT_STKM';
  el.Name = 'STKM';
  el.Colour = 0xFFE0A0;
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

  el.DefaultProperties.temp = f(f(R_TEMP + f(14.6)) + f(273.15));
  el.HeatConduct = 0;
  el.Description = "Stickman. Don't kill him! Control with the arrow keys.";

  el.Properties = PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = 620.0;
  el.HighTemperatureTransition = PT_FIRE; //@ STKM -> FIRE

  el.DefaultProperties.life = 100;

  el.Update = update;
  el.Graphics = Element_STKM_graphics;
  el.Create = create;
  el.CreateAllowed = createAllowed;
  el.ChangeType = changeType;
}

function update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  Element_STKM_run_stickman(sim.player, sim, i, x, y, surround_space, nt, parts, pmap);
  return 0;
}

export function Element_STKM_graphics(_gfctx: GraphicsFuncContext, _cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  g.colr = g.colg = g.colb = g.cola = 0;
  g.pixel_mode = PSPEC_STICKMAN;
  return 1;
}

function create(sim: Simulation, _i: number, x: number, y: number, _t: number, _v: number): void {
  const spawnID = sim.create_part(-3, x, y, PT_SPAWN);
  if (spawnID >= 0)
    sim.player.spawnID = spawnID;
}

function createAllowed(sim: Simulation, _i: number, _x: number, _y: number, _t: number): boolean {
  return sim.elementCount[PT_STKM] <= 0 && !sim.player.spwn;
}

function changeType(sim: Simulation, i: number, _x: number, _y: number, _from: number, to: number): void {
  if (to === PT_STKM) {
    Element_STKM_init_legs(sim, sim.player, i);
    sim.player.spwn = 1;
  }
  else
    sim.player.spwn = 0;
}

/** void die(Simulation *sim, playerst *playerp, int i) (a global function of STKM.cpp, not in STKM.h) */
export function die(sim: Simulation, playerp: Playerst, i: number): void {
  if (playerp.fan) {
    const x = idiv(itrunc(f(sim.parts[i].x + 0.5)), CELL);
    const y = idiv(itrunc(f(sim.parts[i].y + 0.5)), CELL);
    sim.pv[y][x] += 64;
  }
  else {
    const x = itrunc(f(sim.parts[i].x + 0.5));
    const y = itrunc(f(sim.parts[i].y + 0.5));
    for (let r = -2; r <= 1; r++) {
      sim.create_part(-1, x + r, y - 2, playerp.elem);
      sim.create_part(-1, x + r + 1, y + 2, playerp.elem);
      sim.create_part(-1, x - 2, y + r + 1, playerp.elem);
      sim.create_part(-1, x + 2, y + r, playerp.elem);
    }
  }
  sim.kill_part(i);  //Kill him
}

/** pow(x, 2) of a float: computed in double (exact for a float operand) */
function sq(v: number): number {
  return Math.pow(v, 2);
}

export function Element_STKM_run_stickman(playerp: Playerst, sim: Simulation, i: number, x: number, y: number,
  _surround_space: number, _nt: number, parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  let r: number, rx: number, ry: number;
  const t = parts[i].type;
  let pp: number, d: number;
  const dt = f(0.9);///(FPSB*FPSB);  //Delta time in square
  let gvx: number, gvy: number;
  let gx: number, gy: number, dl: number, dr: number;
  const rocketBootsHeadEffect = f(0.35);
  const rocketBootsFeetEffect = f(0.15);
  let rocketBootsHeadEffectV = f(0.3);// stronger acceleration vertically, to counteract gravity
  let rocketBootsFeetEffectV = f(0.45);
  const legs = playerp.legs;
  const accs = playerp.accs;

  if (!playerp.fan && parts[i].ctype && sd.IsElementOrNone(parts[i].ctype))
    Element_STKM_set_element(sim, playerp, parts[i].ctype);
  playerp.frames = (playerp.frames + 1) >>> 0;

  //Temperature handling
  if (parts[i].temp < 243)
    parts[i].life -= 1;
  if ((parts[i].temp < f(309.6)) && (parts[i].temp >= 243))
    parts[i].temp += 1;

  //Death
  if (parts[i].life < 1 || (sim.pv[(y / CELL) | 0][(x / CELL) | 0] >= 4.5 && !playerp.fan)) //If his HP is less than 0 or there is very big wind...
  {
    die(sim, playerp, i);
    return 1;
  }

  //Follow gravity
  gvx = gvy = 0.0;
  switch (sim.gravityMode) {
    default:
    case GRAV_VERTICAL:
      gvy = 1;
      break;
    case GRAV_OFF:
      gvy = gvx = 0.0;
      break;
    case GRAV_RADIAL:
      {
        // hypotf: glibc computes it in double and rounds once
        const hx = f(parts[i].x - XCNTR), hy = f(parts[i].y - YCNTR);
        const gravd = f(f(0.01) - f(Math.sqrt(hx * hx + hy * hy)));
        gvx = f(f(parts[i].x - XCNTR) / gravd);
        gvy = f(f(parts[i].y - YCNTR) / gravd);
      }
      break;
    case GRAV_CUSTOM:
      gvx = f(sim.customGravityX);
      gvy = f(sim.customGravityY);
      break;
  }

  gvx = f(gvx + sim.gravOut.forceX[idiv(itrunc(parts[i].y), CELL) * XCELLS + idiv(itrunc(parts[i].x), CELL)]);
  gvy = f(gvy + sim.gravOut.forceY[idiv(itrunc(parts[i].y), CELL) * XCELLS + idiv(itrunc(parts[i].x), CELL)]);

  let mvx = gvx;
  let mvy = gvy;
  let rbLowGrav = false;
  let tmp = Math.abs(mvx) > Math.abs(mvy) ? Math.abs(mvx) : Math.abs(mvy);
  if (tmp < f(0.001)) {
    rbLowGrav = true;
    mvx = -parts[i].vx;
    mvy = -parts[i].vy;
    tmp = Math.abs(mvx) > Math.abs(mvy) ? Math.abs(mvx) : Math.abs(mvy);
  }
  if (tmp < f(0.001)) {
    mvx = 0;
    mvy = 1.0;
    tmp = 1.0;
  }
  else
    tmp = f(1.0 / f(Math.sqrt(f(f(mvx * mvx) + f(mvy * mvy)))));
  mvx = f(mvx * tmp);// scale to a unit vector
  mvy = f(mvy * tmp);
  if (rbLowGrav) {
    rocketBootsHeadEffectV = rocketBootsHeadEffect;
    rocketBootsFeetEffectV = rocketBootsFeetEffect;
  }

  parts[i].vx -= f(gvx * dt);  //Head up!
  parts[i].vy -= f(gvy * dt);

  //Verlet integration
  pp = f(f(f(2 * legs[0]) - legs[2]) + f(f(accs[0] * dt) * dt));
  legs[2] = legs[0];
  legs[0] = pp;
  pp = f(f(f(2 * legs[1]) - legs[3]) + f(f(accs[1] * dt) * dt));
  legs[3] = legs[1];
  legs[1] = pp;

  pp = f(f(f(2 * legs[4]) - legs[6]) + f(f(f(accs[2] + gvx) * dt) * dt));
  legs[6] = legs[4];
  legs[4] = pp;
  pp = f(f(f(2 * legs[5]) - legs[7]) + f(f(f(accs[3] + gvy) * dt) * dt));
  legs[7] = legs[5];
  legs[5] = pp;

  pp = f(f(f(2 * legs[8]) - legs[10]) + f(f(accs[4] * dt) * dt));
  legs[10] = legs[8];
  legs[8] = pp;
  pp = f(f(f(2 * legs[9]) - legs[11]) + f(f(accs[5] * dt) * dt));
  legs[11] = legs[9];
  legs[9] = pp;

  pp = f(f(f(2 * legs[12]) - legs[14]) + f(f(f(accs[6] + gvx) * dt) * dt));
  legs[14] = legs[12];
  legs[12] = pp;
  pp = f(f(f(2 * legs[13]) - legs[15]) + f(f(f(accs[7] + gvy) * dt) * dt));
  legs[15] = legs[13];
  legs[13] = pp;

  //Setting acceleration to 0
  accs[0] = 0;
  accs[1] = 0;

  accs[2] = 0;
  accs[3] = 0;

  accs[4] = 0;
  accs[5] = 0;

  accs[6] = 0;
  accs[7] = 0;

  gx = f(f(f(legs[4] + legs[12]) / 2) - gvy);
  gy = f(f(f(legs[5] + legs[13]) / 2) + gvx);
  dl = f(sq(f(gx - legs[4])) + sq(f(gy - legs[5])));
  dr = f(sq(f(gx - legs[12])) + sq(f(gy - legs[13])));

  //Go left
  if ((playerp.comm & 0x01) === 0x01) {
    let moved = false;
    if (dl > dr) {
      if (InBounds(itrunc(legs[4]), itrunc(legs[5])) && !sim.eval_move(t, itrunc(legs[4]), itrunc(legs[5]), null)) {
        accs[2] = f(f(-3 * mvy) - f(3 * mvx));
        accs[3] = f(f(3 * mvx) - f(3 * mvy));
        accs[0] = -mvy;
        accs[1] = mvx;
        moved = true;
      }
    }
    else {
      if (InBounds(itrunc(legs[12]), itrunc(legs[13])) && !sim.eval_move(t, itrunc(legs[12]), itrunc(legs[13]), null)) {
        accs[6] = f(f(-3 * mvy) - f(3 * mvx));
        accs[7] = f(f(3 * mvx) - f(3 * mvy));
        accs[0] = -mvy;
        accs[1] = mvx;
        moved = true;
      }
    }
    if (!moved && playerp.rocketBoots) {
      parts[i].vx -= f(rocketBootsHeadEffect * mvy);
      parts[i].vy += f(rocketBootsHeadEffect * mvx);
      accs[2] -= f(rocketBootsFeetEffect * mvy);
      accs[6] -= f(rocketBootsFeetEffect * mvy);
      accs[3] += f(rocketBootsFeetEffect * mvx);
      accs[7] += f(rocketBootsFeetEffect * mvx);
      for (let leg = 0; leg < 2; leg++) {
        if (leg === 1 && ((playerp.comm & 0x02) === 0x02))
          continue;
        const footX = itrunc(legs[leg * 8 + 4]), footY = itrunc(legs[leg * 8 + 5]);
        const np = sim.create_part(-1, footX, footY, PT_PLSM);
        if (np >= 0) {
          parts[np].vx = parts[i].vx + f(mvy * 25);
          parts[np].vy = parts[i].vy - f(mvx * 25);
          parts[np].life += 30;
        }
      }
    }
  }

  //Go right
  if ((playerp.comm & 0x02) === 0x02) {
    let moved = false;
    if (dl < dr) {
      if (InBounds(itrunc(legs[4]), itrunc(legs[5])) && !sim.eval_move(t, itrunc(legs[4]), itrunc(legs[5]), null)) {
        accs[2] = f(f(3 * mvy) - f(3 * mvx));
        accs[3] = f(f(-3 * mvx) - f(3 * mvy));
        accs[0] = mvy;
        accs[1] = -mvx;
        moved = true;
      }
    }
    else {
      if (InBounds(itrunc(legs[12]), itrunc(legs[13])) && !sim.eval_move(t, itrunc(legs[12]), itrunc(legs[13]), null)) {
        accs[6] = f(f(3 * mvy) - f(3 * mvx));
        accs[7] = f(f(-3 * mvx) - f(3 * mvy));
        accs[0] = mvy;
        accs[1] = -mvx;
        moved = true;
      }
    }
    if (!moved && playerp.rocketBoots) {
      parts[i].vx += f(rocketBootsHeadEffect * mvy);
      parts[i].vy -= f(rocketBootsHeadEffect * mvx);
      accs[2] += f(rocketBootsFeetEffect * mvy);
      accs[6] += f(rocketBootsFeetEffect * mvy);
      accs[3] -= f(rocketBootsFeetEffect * mvx);
      accs[7] -= f(rocketBootsFeetEffect * mvx);
      for (let leg = 0; leg < 2; leg++) {
        if (leg === 0 && ((playerp.comm & 0x01) === 0x01))
          continue;
        const footX = itrunc(legs[leg * 8 + 4]), footY = itrunc(legs[leg * 8 + 5]);
        const np = sim.create_part(-1, footX, footY, PT_PLSM);
        if (np >= 0) {
          parts[np].vx = parts[i].vx - f(mvy * 25);
          parts[np].vy = parts[i].vy + f(mvx * 25);
          parts[np].life += 30;
        }
      }
    }
  }

  if (playerp.rocketBoots && (playerp.comm & 0x03) === 0x03) {
    // Pressing left and right simultaneously with rocket boots on slows the stickman down
    // Particularly useful in zero gravity
    parts[i].vx *= 0.5;
    parts[i].vy *= 0.5;
    accs[2] = accs[6] = 0;
    accs[3] = accs[7] = 0;
  }

  //Jump
  if ((playerp.comm & 0x04) === 0x04) {
    if (playerp.rocketBoots) {
      parts[i].vx -= f(rocketBootsHeadEffectV * mvx);
      parts[i].vy -= f(rocketBootsHeadEffectV * mvy);
      accs[2] -= f(rocketBootsFeetEffectV * mvx);
      accs[6] -= f(rocketBootsFeetEffectV * mvx);
      accs[3] -= f(rocketBootsFeetEffectV * mvy);
      accs[7] -= f(rocketBootsFeetEffectV * mvy);
      for (let leg = 0; leg < 2; leg++) {
        const footX = itrunc(legs[leg * 8 + 4]), footY = itrunc(legs[leg * 8 + 5]);
        const np = sim.create_part(-1, footX, footY + 1, PT_PLSM);
        if (np >= 0) {
          parts[np].vx = parts[i].vx + f(mvx * 30);
          parts[np].vy = parts[i].vy + f(mvy * 30);
          parts[np].life += 10;
        }
      }
    }
    else if ((InBounds(itrunc(legs[4]), itrunc(legs[5])) && !sim.eval_move(t, itrunc(legs[4]), itrunc(legs[5]), null)) ||
      (InBounds(itrunc(legs[12]), itrunc(legs[13])) && !sim.eval_move(t, itrunc(legs[12]), itrunc(legs[13]), null))) {
      parts[i].vx -= f(4 * mvx);
      parts[i].vy -= f(4 * mvy);
      accs[2] -= mvx;
      accs[6] -= mvx;
      accs[3] -= mvy;
      accs[7] -= mvy;
    }
  }

  //Charge detector wall if foot inside
  if (InCellBounds(idiv(itrunc(legs[4] + 0.5), CELL), idiv(itrunc(legs[5] + 0.5), CELL)) &&
    sim.bmap[idiv(itrunc(legs[5] + 0.5), CELL)][idiv(itrunc(legs[4] + 0.5), CELL)] === WL_DETECT)
    sim.set_emap(idiv(itrunc(legs[4]), CELL), idiv(itrunc(legs[5]), CELL));
  if (InCellBounds(idiv(itrunc(legs[12] + 0.5), CELL), idiv(itrunc(legs[13] + 0.5), CELL)) &&
    sim.bmap[idiv(itrunc(legs[13] + 0.5), CELL)][idiv(itrunc(legs[12] + 0.5), CELL)] === WL_DETECT)
    sim.set_emap(idiv(itrunc(legs[12] + 0.5), CELL), idiv(itrunc(legs[13] + 0.5), CELL));

  //Searching for particles near head
  for (rx = -2; rx < 3; rx++)
    for (ry = -2; ry < 3; ry++)
      if (x + rx >= 0 && y + ry > 0 && x + rx < XRES && y + ry < YRES && (rx || ry)) {
        r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];

        if (!r && !sim.bmap[((y + ry) / CELL) | 0][((x + rx) / CELL) | 0])
          continue;

        Element_STKM_set_element(sim, playerp, TYP(r));
        if (TYP(r) === PT_PLNT && parts[i].life < 100) //Plant gives him 5 HP
        {
          if (parts[i].life <= 95)
            parts[i].life += 5;
          else
            parts[i].life = 100;
          sim.kill_part(ID(r));
        }

        if (TYP(r) === PT_NEUT) {
          if (parts[i].life <= 100) parts[i].life -= idiv(102 - parts[i].life, 2);
          else parts[i].life = itrunc(f(f(parts[i].life) * f(0.9)));
          sim.kill_part(ID(r));
        }
        if (sim.bmap[((ry + y) / CELL) | 0][((rx + x) / CELL) | 0] === WL_FAN)
          playerp.fan = true;
        else if (sim.bmap[((ry + y) / CELL) | 0][((rx + x) / CELL) | 0] === WL_EHOLE)
          playerp.rocketBoots = false;
        else if (sim.bmap[((ry + y) / CELL) | 0][((rx + x) / CELL) | 0] === WL_GRAV /* && parts[i].type!=PT_FIGH */)
          playerp.rocketBoots = true;
        if (TYP(r) === PT_PRTI)
          Element_STKM_interact(sim, playerp, i, rx, ry);
        if (!parts[i].type)//STKM_interact may kill STKM
          return 1;
      }

  //Head position
  rx = x + 3 * ((playerp.pcomm & 0x02) === 0x02 ? 1 : 0) - 3 * ((playerp.pcomm & 0x01) === 0x01 ? 1 : 0);
  ry = y - 3 * (playerp.pcomm === 0 ? 1 : 0);

  //Spawn
  if ((playerp.comm & 0x08) === 0x08) {
    ry -= 2 * sim.rng.between(0, 1) + 1;
    r = pmap[ry][rx];
    if (elements[TYP(r)].Properties & TYPE_SOLID) {
      sim.create_part(-1, rx, ry, PT_SPRK);
      playerp.frames = 0;
    }
    else {
      let np = -1;
      if (playerp.fan) {
        for (let j = -4; j < 5; j++)
          for (let k = -4; k < 5; k++) {
            const airx = rx + 3 * ((playerp.pcomm & 0x02) === 0x02 ? 1 : 0) - 3 * ((playerp.pcomm & 0x01) === 0x01 ? 1 : 0) + j;
            const airy = ry + k;
            sim.pv[idiv(airy, CELL)][idiv(airx, CELL)] += f(0.03);
            if (airy + CELL < YRES)
              sim.pv[idiv(airy, CELL) + 1][idiv(airx, CELL)] += f(0.03);
            if (airx + CELL < XRES) {
              sim.pv[idiv(airy, CELL)][idiv(airx, CELL) + 1] += f(0.03);
              if (airy + CELL < YRES)
                sim.pv[idiv(airy, CELL) + 1][idiv(airx, CELL) + 1] += f(0.03);
            }
          }
      }
      else if (playerp.elem === PT_LIGH && playerp.frames < 30)//limit lightning creation rate
        np = -1;
      else
        np = sim.create_part(-1, rx, ry, playerp.elem);
      if ((np < NPART) && np >= 0) {
        if (playerp.elem === PT_PHOT) {
          const random = Math.abs((sim.rng.between(-1, 1))) * 3;
          if (random === 0) {
            sim.kill_part(np);
          }
          else {
            parts[np].vy = 0;
            if (playerp.pcomm & (0x01 | 0x02))
              parts[np].vx = (((playerp.pcomm & 0x02) === 0x02 ? 1 : 0) - ((playerp.pcomm & 0x01) === 0x01 ? 1 : 0)) * random;
            else
              parts[np].vx = random;
          }
        }
        else if (playerp.elem === PT_LIGH) {
          let angle: number;
          const power = 100;
          if (gvx !== 0 || gvy !== 0)
            // atan2(float, float) resolves to ::atan2(double, double): computed in double
            angle = itrunc(Math.atan2(mvx, mvy) * 180.0 / f(Math.PI));
          else
            angle = sim.rng.between(0, 359);
          if (playerp.pcomm & 0x01)
            angle += 180;
          if (angle > 360)
            angle -= 360;
          if (angle < 0)
            angle += 360;
          parts[np].tmp = angle;
          parts[np].life = sim.rng.between(0, 1 + idiv(power, 15)) + idiv(power, 7);
          parts[np].temp = parts[np].life * power / 2.5;
          parts[np].tmp2 = 1;
        }
        else if (!playerp.fan) {
          parts[np].vx -= f(-mvy * (5 * ((playerp.pcomm & 0x02) === 0x02 ? 1 : 0) - 5 * ((playerp.pcomm & 0x01) === 0x01 ? 1 : 0)));
          parts[np].vy -= f(mvx * (5 * ((playerp.pcomm & 0x02) === 0x02 ? 1 : 0) - 5 * ((playerp.pcomm & 0x01) === 0x01 ? 1 : 0)));
          parts[i].vx -= f(f(elements[playerp.elem].Weight * parts[np].vx) / 1000);
        }
        playerp.frames = 0;
      }

    }
  }

  //Simulation of joints
  d = f(25 / (sq(f(legs[0] - legs[4])) + sq(f(legs[1] - legs[5])) + 25) - 0.5);  //Fast distance
  legs[4] -= f(f(legs[0] - legs[4]) * d);
  legs[5] -= f(f(legs[1] - legs[5]) * d);
  legs[0] += f(f(legs[0] - legs[4]) * d);
  legs[1] += f(f(legs[1] - legs[5]) * d);

  d = f(25 / (sq(f(legs[8] - legs[12])) + sq(f(legs[9] - legs[13])) + 25) - 0.5);
  legs[12] -= f(f(legs[8] - legs[12]) * d);
  legs[13] -= f(f(legs[9] - legs[13]) * d);
  legs[8] += f(f(legs[8] - legs[12]) * d);
  legs[9] += f(f(legs[9] - legs[13]) * d);

  d = f(36 / (sq(f(legs[0] - parts[i].x)) + sq(f(legs[1] - parts[i].y)) + 36) - 0.5);
  parts[i].vx -= f(f(legs[0] - parts[i].x) * d);
  parts[i].vy -= f(f(legs[1] - parts[i].y) * d);
  legs[0] += f(f(legs[0] - parts[i].x) * d);
  legs[1] += f(f(legs[1] - parts[i].y) * d);

  d = f(36 / (sq(f(legs[8] - parts[i].x)) + sq(f(legs[9] - parts[i].y)) + 36) - 0.5);
  parts[i].vx -= f(f(legs[8] - parts[i].x) * d);
  parts[i].vy -= f(f(legs[9] - parts[i].y) * d);
  legs[8] += f(f(legs[8] - parts[i].x) * d);
  legs[9] += f(f(legs[9] - parts[i].y) * d);

  if (InBounds(itrunc(legs[4]), itrunc(legs[5])) && !sim.eval_move(t, itrunc(legs[4]), itrunc(legs[5]), null)) {
    legs[4] = legs[6];
    legs[5] = legs[7];
  }

  if (InBounds(itrunc(legs[12]), itrunc(legs[13])) && !sim.eval_move(t, itrunc(legs[12]), itrunc(legs[13]), null)) {
    legs[12] = legs[14];
    legs[13] = legs[15];
  }

  //This makes stick man "pop" from obstacles
  if (InBounds(itrunc(legs[4]), itrunc(legs[5])) && !sim.eval_move(t, itrunc(legs[4]), itrunc(legs[5]), null)) {
    let tt: number;
    tt = legs[4]; legs[4] = legs[6]; legs[6] = tt;
    tt = legs[5]; legs[5] = legs[7]; legs[7] = tt;
  }

  if (InBounds(itrunc(legs[12]), itrunc(legs[13])) && !sim.eval_move(t, itrunc(legs[12]), itrunc(legs[13]), null)) {
    let tt: number;
    tt = legs[12]; legs[12] = legs[14]; legs[14] = tt;
    tt = legs[13]; legs[13] = legs[15]; legs[15] = tt;
  }

  //Keeping legs distance
  if ((sq(f(legs[4] - legs[12])) + sq(f(legs[5] - legs[13]))) < 16) {
    const tvx = -gvy;
    const tvy = gvx;

    if (tvx || tvy) {
      // computed in double: 0.2 is a double, hypot(float, float) is ::hypot(double, double)
      accs[2] -= 0.2 * tvx / Math.hypot(tvx, tvy);
      accs[3] -= 0.2 * tvy / Math.hypot(tvx, tvy);

      accs[6] += 0.2 * tvx / Math.hypot(tvx, tvy);
      accs[7] += 0.2 * tvy / Math.hypot(tvx, tvy);
    }
  }

  if ((sq(f(legs[0] - legs[8])) + sq(f(legs[1] - legs[9]))) < 16) {
    const tvx = -gvy;
    const tvy = gvx;

    if (tvx || tvy) {
      accs[0] -= 0.2 * tvx / Math.hypot(tvx, tvy);
      accs[1] -= 0.2 * tvy / Math.hypot(tvx, tvy);

      accs[4] += 0.2 * tvx / Math.hypot(tvx, tvy);
      accs[5] += 0.2 * tvy / Math.hypot(tvx, tvy);
    }
  }

  //If legs touch something
  Element_STKM_interact(sim, playerp, i, itrunc(legs[4] + 0.5), itrunc(legs[5] + 0.5));
  Element_STKM_interact(sim, playerp, i, itrunc(legs[12] + 0.5), itrunc(legs[13] + 0.5));
  Element_STKM_interact(sim, playerp, i, itrunc(legs[4] + 0.5), itrunc(legs[5]));
  Element_STKM_interact(sim, playerp, i, itrunc(legs[12] + 0.5), itrunc(legs[13]));
  if (!parts[i].type)
    return 1;

  parts[i].ctype = playerp.elem;
  return 0;
}

export function Element_STKM_interact(sim: Simulation, playerp: Playerst, i: number, x: number, y: number): void {
  const elements = sd.elements;
  if (x < 0 || y < 0 || x >= XRES || y >= YRES || !sim.parts[i].type)
    return;
  const r = sim.pmap[y][x];
  if (r) {
    let damage = 0;
    if (TYP(r) === PT_SPRK && playerp.elem !== PT_LIGH) //If on charge
    {
      damage += sim.rng.between(32, 51);
    }

    if (!sd.IsHeatInsulator(sim.parts[ID(r)]) && ((playerp.elem !== PT_LIGH && sim.parts[ID(r)].temp >= 323) || sim.parts[ID(r)].temp <= 243) && (!playerp.rocketBoots || TYP(r) !== PT_PLSM)) {
      damage += 2;
      playerp.accs[3] -= 1;
    }

    if (elements[TYP(r)].Properties & PROP_DEADLY)
      switch (TYP(r)) {
        case PT_ACID:
          damage += 5;
          break;
        default:
          damage++;
          break;
      }

    if (elements[TYP(r)].Properties & PROP_RADIOACTIVE)
      damage++;

    if (damage) {
      if (damage > sim.parts[i].life) {
        die(sim, playerp, i);
        return;
      }
      sim.parts[i].life -= damage;
    }

    if (TYP(r) === PT_PRTI && sim.parts[i].type) {
      let nnx: number;
      const count = 1;//gives rx=0, ry=1 in update_PRTO
      sim.parts[ID(r)].tmp = itrunc(f(f(f(sim.parts[ID(r)].temp - f(73.15)) / 100) + 1));
      if (sim.parts[ID(r)].tmp >= CHANNELS) sim.parts[ID(r)].tmp = CHANNELS - 1;
      else if (sim.parts[ID(r)].tmp < 0) sim.parts[ID(r)].tmp = 0;
      for (nnx = 0; nnx < 80; nnx++)
        if (!sim.portalp[sim.parts[ID(r)].tmp][count][nnx].type) {
          sim.portalp[sim.parts[ID(r)].tmp][count][nnx].copyFrom(sim.parts[i]);
          sim.kill_part(i);
          //stop new STKM/fighters being created to replace the ones in the portal:
          playerp.spwn = 1;
          if (sim.portalp[sim.parts[ID(r)].tmp][count][nnx].type === PT_FIGH)
            sim.fighcount = (sim.fighcount + 1) & 0xFF;
          break;
        }
    }
    if ((TYP(r) === PT_BHOL || TYP(r) === PT_NBHL) && sim.parts[i].type) {
      if (!sim.legacy_enable) {
        sim.parts[ID(r)].temp = restrict_flt(f(sim.parts[ID(r)].temp + f(sim.parts[i].temp / 2)), MIN_TEMP, MAX_TEMP);
      }
      sim.kill_part(i);
    }
    if ((TYP(r) === PT_VOID || (TYP(r) === PT_PVOD && sim.parts[ID(r)].life === 10)) && (!sim.parts[ID(r)].ctype || (sim.parts[ID(r)].ctype === sim.parts[i].type ? 1 : 0) !== (sim.parts[ID(r)].tmp & 1)) && sim.parts[i].type) {
      sim.kill_part(i);
    }
  }
}

export function Element_STKM_init_legs(sim: Simulation, playerp: Playerst, i: number): void {
  const x = itrunc(f(sim.parts[i].x + 0.5));
  const y = itrunc(f(sim.parts[i].y + 0.5));
  const legs = playerp.legs;

  legs[0] = x - 1;
  legs[1] = y + 6;
  legs[2] = x - 1;
  legs[3] = y + 6;

  legs[4] = x - 3;
  legs[5] = y + 12;
  legs[6] = x - 3;
  legs[7] = y + 12;

  legs[8] = x + 1;
  legs[9] = y + 6;
  legs[10] = x + 1;
  legs[11] = y + 6;

  legs[12] = x + 3;
  legs[13] = y + 12;
  legs[14] = x + 3;
  legs[15] = y + 12;

  for (let i = 0; i < 8; i++)
    playerp.accs[i] = 0;
  playerp.comm = 0;
  playerp.pcomm = 0;
  playerp.frames = 0;
  playerp.spwn = 0;
  playerp.fan = false;
  playerp.rocketBoots = false;
}

export function Element_STKM_set_element(_sim: Simulation, playerp: Playerst, element: number): void {
  const elements = sd.elements;
  if (elements[element].Falldown !== 0
    || elements[element].Properties & TYPE_GAS
    || elements[element].Properties & TYPE_LIQUID
    || elements[element].Properties & TYPE_ENERGY
    || element === PT_LOLZ || element === PT_LOVE) {
    if (!playerp.rocketBoots || element !== PT_PLSM) {
      playerp.elem = element;
      playerp.fan = false;
    }
  }
  if (element === PT_TESC || element === PT_LIGH) {
    playerp.elem = PT_LIGH;
    playerp.fan = false;
  }
}
