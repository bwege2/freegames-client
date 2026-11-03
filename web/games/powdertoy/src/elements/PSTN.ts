// simulation/elements/PSTN.cpp
import { Element } from '../sim/element.ts';
import type { GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, ID, IPH, IPL, ITH, ITL, NT, PMAP, SC_FORCE, TYP, TYPE_SOLID, XRES, YRES } from '../sim/config.ts';
import { PT_FRME, PT_PSCN, PT_PSTN, PT_SPRK } from '../sim/numbers.ts';

export function Element_PSTN(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PSTN';
  el.Name = 'PSTN';
  el.Colour = 0xAA9999;
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
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

  el.DefaultProperties.temp = f(10.0 + f(273.15));
  el.HeatConduct = 0;
  el.Description = 'Piston, pushes particles. PSCN extends, NSCN retracts';

  el.Properties = TYPE_SOLID;
  el.CarriesTypeIn = (1 << FIELD_CTYPE) >>> 0;

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
  el.CtypeDraw = ctypeDraw;
}

interface StackData {
  pushed: number;
  spaces: number;
}

function StackData(pushed: number, spaces: number): StackData {
  return { pushed, spaces };
}

const PISTON_INACTIVE = 0x00;
const PISTON_RETRACT = 0x01;
const PISTON_EXTEND = 0x02;
const MAX_FRAME = 0x0F;
const DEFAULT_LIMIT = 0x1F;
const DEFAULT_ARM_LIMIT = 0xFF;
// tmp3 as a bitfield
const FLAG_EXT_OBSTACLE = 0x01; // xxx1 : Don't extend if blocked by obstacles
const FLAG_EXT_ARMLIMIT = 0x02; // xx1x : Don't extend if blocked by arm limit
const FLAG_RET_OBSTACLE = 0x04; // x1xx : Don't retract if frme hinders movement
const FLAG_RET_TOOSHORT = 0x08; // 1xxx : Don't retract if arm is shorter than retraction length

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  if (parts[i].life)
    return 0;
  const maxSize = parts[i].tmp ? parts[i].tmp : DEFAULT_LIMIT;
  const armLimit = parts[i].tmp2 ? parts[i].tmp2 : DEFAULT_ARM_LIMIT;
  let state = PISTON_INACTIVE;

  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if ((rx || ry) && (!rx || !ry)) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        if (TYP(r) === PT_SPRK && parts[ID(r)].life === 3) {
          if (parts[ID(r)].ctype === PT_PSCN)
            state = PISTON_EXTEND;
          else
            state = PISTON_RETRACT;
        }
      }
    }
  }

  if (state === PISTON_EXTEND || state === PISTON_RETRACT) {
    for (let rx = -1; rx <= 1; rx++) {
      for (let ry = -1; ry <= 1; ry++) {
        if ((rx || ry) && (!rx || !ry)) {
          let r = pmap[y + ry][x + rx];
          if (!r)
            continue;
          if (TYP(r) === PT_PSTN && !parts[ID(r)].life) {
            let movedPiston = false;
            let foundEnd = false;
            let pistonEndX = 0, pistonEndY = 0;
            let pistonCount = -1;// number of PSTN particles minus 1
            let armCount = 0;
            const directionX = rx;
            const directionY = ry;
            const nxi = directionX, nyi = directionY;
            for (let nxx = 0, nyy = 0; ; nyy += nyi, nxx += nxi) {
              if (!(x + nxx < XRES && y + nyy < YRES && x + nxx >= 0 && y + nyy >= 0)) {
                break;
              }
              r = pmap[y + nyy][x + nxx];
              if (TYP(r) === PT_PSTN) {
                if (parts[ID(r)].life)
                  armCount++;
                else if (armCount) {
                  pistonEndX = x + nxx;
                  pistonEndY = y + nyy;
                  foundEnd = true;
                  break;
                } else {
                  pistonCount += itrunc(Math.floor(f(f(parts[ID(r)].temp - f(268.15)) / 10)));// How many tens of degrees above 0 C, rounded to nearest ten degrees. Can be negative.
                }
              } else if (nxx === 0 && nyy === 0) {
                // compatibility with BAD THINGS: starting PSTN layered underneath other particles
                // (in v90, it started scanning from the neighbouring particle, so could not break out of loop at offset=(0,0))
                pistonCount += itrunc(Math.floor(f(f(parts[i].temp - f(268.15)) / 10)));
                continue;
              } else {
                pistonEndX = x + nxx;
                pistonEndY = y + nyy;
                foundEnd = true;
                break;
              }
            }
            if (foundEnd) {
              if (state === PISTON_EXTEND) {
                if (armCount + pistonCount > armLimit) {
                  // If extending piston would exceed the armLimit, skip extension entirely
                  if (parts[i].tmp3 & FLAG_EXT_ARMLIMIT)
                    continue;
                  pistonCount = armLimit - armCount;
                }
                if (pistonCount > 0) {
                  const cancelOnObstacle = !!(parts[i].tmp3 & FLAG_EXT_OBSTACLE);
                  const newSpace = MoveStack(sim, pistonEndX, pistonEndY, directionX, directionY, maxSize, pistonCount, false, parts[i].ctype, true, 0, cancelOnObstacle);
                  if (newSpace) {
                    // Create new piston section
                    for (let j = 0; j < newSpace; j++) {
                      const nr = sim.create_part(-3, pistonEndX + (nxi * j), pistonEndY + (nyi * j), PT_PSTN);
                      if (nr > -1) {
                        parts[nr].life = 1;
                        if (parts[i].dcolour) {
                          const colour = parts[i].dcolour | 0;
                          parts[nr].dcolour = (colour & 0xFF000000) | Math.max((colour & 0xFF0000) - 0x3C0000, 0)
                            | Math.max((colour & 0xFF00) - 0x3C00, 0) | Math.max((colour & 0xFF) - 0x3C, 0);
                        }
                      }
                    }
                    movedPiston = true;
                  }
                }
              } else if (state === PISTON_RETRACT) {
                if (pistonCount > armCount) {
                  // Arm too short to retract the full amount
                  if (parts[i].tmp3 & FLAG_RET_TOOSHORT)
                    continue;
                  pistonCount = armCount;
                }

                if (armCount && pistonCount > 0) {
                  const cancelOnObstacle = !!(parts[i].tmp3 & FLAG_RET_OBSTACLE); // Only retract if no obstacles hinder frme movement
                  MoveStack(sim, pistonEndX, pistonEndY, directionX, directionY,
                    maxSize, pistonCount, true, parts[i].ctype, true, 0, cancelOnObstacle);
                  movedPiston = true;
                }
              }
            }
            if (movedPiston)
              return 0;
          }
        }
      }
    }
  }
  return 0;
}

function CanMoveStack(sim: Simulation, stackX: number, stackY: number, directionX: number, directionY: number, maxSize: number, amount: number, retract: boolean, block: number): StackData {
  let posX: number, posY: number, spaces = 0, currentPos = 0;
  if (amount <= 0)
    return StackData(0, 0);
  for (posX = stackX, posY = stackY; currentPos < maxSize + amount && currentPos < XRES - 1; posX += directionX, posY += directionY) {
    if (!(posX < XRES && posY < YRES && posX >= 0 && posY >= 0))
      break;

    const r = sim.pmap[posY][posX];
    if (sim.IsWallBlocking(posX, posY, 0) || (block && TYP(r) === block))
      return StackData(currentPos - spaces, spaces);
    if (!r) {
      spaces++;
      sim.Element_PSTN_tempParts[currentPos++] = -1;
      if (spaces >= amount)
        break;
    } else {
      if (currentPos - spaces < maxSize && (!retract || (TYP(r) === PT_FRME && posX === stackX && posY === stackY)))
        sim.Element_PSTN_tempParts[currentPos++] = ID(r);
      else
        return StackData(currentPos - spaces, spaces);
    }
  }
  return StackData(currentPos - spaces, spaces);
}

function MoveStack(sim: Simulation, stackX: number, stackY: number, directionX: number, directionY: number, maxSize: number, amount: number, retract: boolean, block: number, sticky: boolean, callDepth: number, cancelOnObstacle: boolean): number {
  let posX: number, posY: number, r: number;
  r = sim.pmap[stackY][stackX];
  if (!callDepth && TYP(r) === PT_FRME) {
    const newY = directionX ? 1 : 0, newX = directionY ? 1 : 0;
    const realDirectionX = retract ? -directionX : directionX;
    const realDirectionY = retract ? -directionY : directionY;
    let maxRight = MAX_FRAME, maxLeft = MAX_FRAME;

    //check if we can push all the FRME
    for (let c = retract ? 1 : 0; c < MAX_FRAME; c++) {
      posY = stackY + (c * newY);
      posX = stackX + (c * newX);
      if (posX < XRES && posY < YRES && posX >= 0 && posY >= 0 && TYP(sim.pmap[posY][posX]) === PT_FRME) {
        const spaces = CanMoveStack(sim, posX, posY, realDirectionX, realDirectionY, maxSize, amount, retract, block).spaces;
        if (spaces < amount) {
          // Obstacle encountered, tmp3 flags are set such that shortened movement is not allowed, abort before moving anything
          if (cancelOnObstacle)
            return 0;
          amount = spaces;
        }
      } else {
        maxRight = c;
        break;
      }
    }
    for (let c = 1; c < MAX_FRAME; c++) {
      posY = stackY - (c * newY);
      posX = stackX - (c * newX);
      if (posX < XRES && posY < YRES && posX >= 0 && posY >= 0 && TYP(sim.pmap[posY][posX]) === PT_FRME) {
        const spaces = CanMoveStack(sim, posX, posY, realDirectionX, realDirectionY, maxSize, amount, retract, block).spaces;
        if (spaces < amount) {
          // Obstacle encountered, tmp3 flags are set such that shortened movement is not allowed, abort before moving anything
          if (cancelOnObstacle)
            return 0;
          amount = spaces;
        }
      } else {
        maxLeft = c;
        break;
      }
    }

    //If the piston is pushing frame, iterate out from the centre to the edge and push everything resting on frame
    for (let c = 1; c < maxRight; c++) {
      posY = stackY + (c * newY);
      posX = stackX + (c * newX);
      MoveStack(sim, posX, posY, directionX, directionY, maxSize, amount, retract, block, !sim.parts[ID(sim.pmap[posY][posX])].tmp, 1, cancelOnObstacle);
    }
    for (let c = 1; c < maxLeft; c++) {
      posY = stackY - (c * newY);
      posX = stackX - (c * newX);
      MoveStack(sim, posX, posY, directionX, directionY, maxSize, amount, retract, block, !sim.parts[ID(sim.pmap[posY][posX])].tmp, 1, cancelOnObstacle);
    }

    //Remove arm section if retracting with FRME
    if (retract)
      for (let j = 1; j <= amount; j++)
        sim.kill_part(ID(sim.pmap[stackY + (directionY * -j)][stackX + (directionX * -j)]));
    return MoveStack(sim, stackX, stackY, directionX, directionY, maxSize, amount, retract, block, !sim.parts[ID(sim.pmap[stackY][stackX])].tmp, 1, cancelOnObstacle);
  }
  if (retract) {
    let foundParts = false;
    //Remove arm section if retracting without FRME
    if (!callDepth)
      for (let j = 1; j <= amount; j++)
        sim.kill_part(ID(sim.pmap[stackY + (directionY * -j)][stackX + (directionX * -j)]));
    let currentPos = 0;
    for (posX = stackX, posY = stackY; currentPos < maxSize && currentPos < XRES - 1; posX += directionX, posY += directionY) {
      if (!(posX < XRES && posY < YRES && posX >= 0 && posY >= 0)) {
        break;
      }
      r = sim.pmap[posY][posX];
      if (!r || TYP(r) === block || (!sticky && TYP(r) !== PT_FRME)) {
        break;
      } else {
        foundParts = true;
        sim.Element_PSTN_tempParts[currentPos++] = ID(r);
      }
    }
    if (foundParts) {
      //Move particles
      for (let j = 0; j < currentPos; j++) {
        const jP = sim.Element_PSTN_tempParts[j];
        const srcX = itrunc(f(sim.parts[jP].x + 0.5)), srcY = itrunc(f(sim.parts[jP].y + 0.5));
        const destX = srcX - directionX * amount, destY = srcY - directionY * amount;
        sim.pmap[srcY][srcX] = 0;
        sim.parts[jP].x = destX;
        sim.parts[jP].y = destY;
        sim.pmap[destY][destX] = PMAP(jP, sim.parts[jP].type);
      }
      return amount;
    }
  } else {
    const stackData = CanMoveStack(sim, stackX, stackY, directionX, directionY, maxSize, amount, retract, block);
    const currentPos = stackData.pushed + stackData.spaces;
    if (currentPos) {
      //Move particles
      let possibleMovement = 0;
      for (let j = currentPos - 1; j >= 0; j--) {
        const jP = sim.Element_PSTN_tempParts[j];
        if (jP < 0) {
          possibleMovement++;
          continue;
        }
        if (!possibleMovement)
          continue;
        const srcX = itrunc(f(sim.parts[jP].x + 0.5)), srcY = itrunc(f(sim.parts[jP].y + 0.5));
        const destX = srcX + directionX * possibleMovement, destY = srcY + directionY * possibleMovement;
        sim.pmap[srcY][srcX] = 0;
        sim.parts[jP].x = destX;
        sim.parts[jP].y = destY;
        sim.pmap[destY][destX] = PMAP(jP, sim.parts[jP].type);
      }
      return possibleMovement;
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.life) {
    g.colr -= 60;
    g.colg -= 60;
  }
  return 0;
}

function ctypeDraw(sim: Simulation, i: number, t: number, v: number): boolean {
  if (t === PT_FRME) {
    return false;
  }
  return Element.basicCtypeDraw(sim, i, t, v);
}
