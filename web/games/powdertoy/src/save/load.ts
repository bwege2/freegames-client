// simulation/Simulation.cpp: Simulation::Load, Simulation::Save and Simulation::SaveSimOptions, as functions of the
// simulation (`sim->Load(save, includePressure, blockP)` is `Load(sim, save, includePressure, blockP)`).
import { CELL, MAXSIGNS, MAX_FIGHTERS, NPART, PT_NUM, PMAPBITS, XCELLS, XRES, YCELLS, YRES, InBounds, OLD_SPC_AIR,
  SPC_AIR } from '../sim/config.ts';
import { f, itrunc } from '../sim/cpp.ts';
import type { Simulation, Sign } from '../sim/simulation.ts';
import { sd } from '../sim/simulationData.ts';
import { type Vec2, type Rect, RectSized, RectBetween, rectAnd, rectContains, rectPoints } from '../sim/vec2.ts';
import { PT_STKM, PT_STKM2, PT_SPAWN, PT_SPAWN2, PT_FIGH, PT_SOAP, PT_DUST } from '../sim/numbers.ts';
import { Element_STKM_init_legs } from '../elements/STKM.ts';
import { Element_FIGH_Alloc, Element_FIGH_CanAlloc, Element_FIGH_NewFighter } from '../elements/FIGH.ts';
import { GameSave, versionCompare } from './gameSave.ts';

const RES: Vec2 = { X: XRES, Y: YRES };
const CELLS: Vec2 = { X: XCELLS, Y: YCELLS };
const originRect = (s: Vec2): Rect => RectSized({ X: 0, Y: 0 }, s);

/** void Simulation::Load(const GameSave *save, bool includePressure, Vec2<int> blockP) // block coordinates */
export function Load(sim: Simulation, save: GameSave, includePressure: boolean, blockP: Vec2): void {
  const partP = { X: blockP.X * CELL, Y: blockP.Y * CELL };

  const elements = sd.elements;

  sim.RecalcFreeParticles(false);

  interface ExistingParticle {
    id: number;
    pos: Vec2;
  }
  const existingParticles: ExistingParticle[] = [];
  const pasteArea = rectAnd(originRect(RES), RectSized(partP, { X: save.blockSize.X * CELL, Y: save.blockSize.Y * CELL }));
  for (let i = 0; i < sim.parts.active; i++) {
    if (sim.parts[i].type) {
      const p = { X: itrunc(f(sim.parts[i].x + 0.5)), Y: itrunc(f(sim.parts[i].y + 0.5)) };
      if (rectContains(pasteArea, p.X, p.Y)) {
        existingParticles.push({ id: i, pos: p });
      }
    }
  }
  // std::sort by (pos.Y, pos.X): not stable, but entries with equal positions are only ever all killed together
  existingParticles.sort((lhs, rhs) => (lhs.pos.Y - rhs.pos.Y) || (lhs.pos.X - rhs.pos.X));
  // PlaneAdapter<std::vector<size_t>> existingParticleIndices(pasteArea.size, existingParticles.size())
  const existingParticleIndices = new Int32Array(Math.max(pasteArea.size.X * pasteArea.size.Y, 0)).fill(existingParticles.length);
  {
    let lastPos = { X: -1, Y: -1 }; // not a valid pos in existingParticles
    for (let it = 0; it < existingParticles.length; ++it) {
      const pos = existingParticles[it].pos;
      if (lastPos.X !== pos.X || lastPos.Y !== pos.Y) {
        existingParticleIndices[(pos.Y - pasteArea.pos.Y) * pasteArea.size.X + (pos.X - pasteArea.pos.X)] = it;
        lastPos = pos;
      }
    }
  }
  const removeExistingParticles = (p: Vec2): void => {
    const rp = { X: p.X - pasteArea.pos.X, Y: p.Y - pasteArea.pos.Y };
    if (rectContains(originRect(pasteArea.size), rp.X, rp.Y)) {
      const k = rp.Y * pasteArea.size.X + rp.X;
      const index = existingParticleIndices[k];
      for (let it = index; it < existingParticles.length && existingParticles[it].pos.X === p.X && existingParticles[it].pos.Y === p.Y; ++it) {
        sim.kill_part(existingParticles[it].id);
      }
      existingParticleIndices[k] = existingParticles.length;
    }
  };

  const oldPrettyPowders = sim.pretty_powder;
  sim.pretty_powder = 0;
  try {
    // std::map<unsigned int, unsigned int> soapList
    const soapList = new Map<number, number>();
    const { player, player2, fighters } = sim;
    const parts = sim.parts;
    for (let n = 0; n < NPART && n < save.particlesCount; n++) {
      const tempPart = save.part(n).clone();
      if (tempPart.type <= 0 || tempPart.type >= PT_NUM) {
        continue;
      }

      tempPart.x = f(tempPart.x + partP.X);
      tempPart.y = f(tempPart.y + partP.Y);
      const x = itrunc(Math.floor(f(tempPart.x + 0.5)));
      const y = itrunc(Math.floor(f(tempPart.y + 0.5)));

      // Check various scenarios where we are unable to spawn the element, and set type to 0 to block spawning later
      if (!InBounds(x, y)) {
        continue;
      }

      // Ensure we can spawn this element
      if ((player.spwn === 1 && tempPart.type === PT_STKM) || (player2.spwn === 1 && tempPart.type === PT_STKM2)) {
        continue;
      }
      if ((tempPart.type === PT_SPAWN || tempPart.type === PT_SPAWN2) && sim.elementCount[tempPart.type]) {
        continue;
      }
      if (tempPart.type === PT_FIGH && !Element_FIGH_CanAlloc(sim)) {
        continue;
      }
      if (!elements[tempPart.type].Enabled) {
        continue;
      }

      const createAllowed = elements[tempPart.type].CreateAllowed;
      if (createAllowed) {
        if (!createAllowed(sim, -3, itrunc(f(tempPart.x + 0.5)), itrunc(f(tempPart.y + 0.5)), tempPart.type)) {
          continue;
        }
      }

      removeExistingParticles({ X: x, Y: y });

      // Allocate particle (this location is guaranteed to be empty due to "full scan" logic above)
      const i = sim.create_part(-3, x, y, tempPart.type);
      if (i === -1) {
        continue;
      }
      parts[i].copyFrom(tempPart);

      switch (parts[i].type) {
      case PT_STKM:
        Element_STKM_init_legs(sim, player, i);
        player.spwn = 1;
        player.elem = PT_DUST;

        if ((versionCompare(save.version, [93, 0]) < 0 && parts[i].ctype === SPC_AIR) ||
          (versionCompare(save.version, [88, 0]) < 0 && parts[i].ctype === OLD_SPC_AIR)) {
          player.fan = true;
        }
        if (save.stkm.rocketBoots1)
          player.rocketBoots = true;
        if (save.stkm.fan1)
          player.fan = true;
        break;
      case PT_STKM2:
        Element_STKM_init_legs(sim, player2, i);
        player2.spwn = 1;
        player2.elem = PT_DUST;
        if ((versionCompare(save.version, [93, 0]) < 0 && parts[i].ctype === SPC_AIR) ||
          (versionCompare(save.version, [88, 0]) < 0 && parts[i].ctype === OLD_SPC_AIR)) {
          player2.fan = true;
        }
        if (save.stkm.rocketBoots2)
          player2.rocketBoots = true;
        if (save.stkm.fan2)
          player2.fan = true;
        break;
      case PT_SPAWN:
        player.spawnID = i;
        break;
      case PT_SPAWN2:
        player2.spawnID = i;
        break;
      case PT_FIGH: {
        const oldTmp = parts[i].tmp >>> 0;
        parts[i].tmp = Element_FIGH_Alloc(sim);
        if (parts[i].tmp >= 0) {
          let fan = false;
          if ((versionCompare(save.version, [93, 0]) < 0 && parts[i].ctype === SPC_AIR)
            || (versionCompare(save.version, [88, 0]) < 0 && parts[i].ctype === OLD_SPC_AIR)) {
            fan = true;
            parts[i].ctype = 0;
          }
          fighters[parts[i].tmp].elem = PT_DUST;
          Element_FIGH_NewFighter(sim, parts[i].tmp, i, parts[i].ctype);
          if (fan)
            fighters[parts[i].tmp].fan = true;
          for (const fighNum of save.stkm.rocketBootsFigh) {
            if (fighNum === oldTmp)
              fighters[parts[i].tmp].rocketBoots = true;
          }
          for (const fighNum of save.stkm.fanFigh) {
            if (fighNum === oldTmp)
              fighters[parts[i].tmp].fan = true;
          }
        } else {
          // Should not be possible because we verify with CanAlloc above this
          parts[i].type = 0;
        }
        break;
      }
      case PT_SOAP:
        if (!soapList.has(n)) soapList.set(n, i);
        break;
      }
      if (GameSave.PressureInTmp3(parts[i].type) && !includePressure) {
        parts[i].tmp3 = 0;
      }
    }
    parts.active = NPART;
    sim.force_stacking_check = true;
    sim.Element_PPIP_ppip_changed = 1;

    // Sort out pmap, just to be on the safe side.
    sim.RecalcFreeParticles(false);

    // fix SOAP links using soapList, a map of old particle ID -> new particle ID
    // loop through every old particle (loaded from save), and convert .tmp / .tmp2
    for (const key of [...soapList.keys()].sort((a, b) => a - b)) {
      const i = soapList.get(key)!;
      if ((parts[i].ctype & 0x2) === 2) {
        const n = soapList.get(parts[i].tmp >>> 0);
        if (n !== undefined)
          parts[i].tmp = n;
        // sometimes the proper SOAP isn't found. It should remove the link, but seems to break some saves
        // so just ignore it
      }
      if ((parts[i].ctype & 0x4) === 4) {
        const n = soapList.get(parts[i].tmp2 >>> 0);
        if (n !== undefined)
          parts[i].tmp2 = n;
        // sometimes the proper SOAP isn't found. It should remove the link, but seems to break some saves
        // so just ignore it
      }
    }

    for (let i = 0; i < save.signs.length && sim.signs.length < MAXSIGNS; i++) {
      if (save.signs[i].text.length) {
        const tempSign: Sign = { ...save.signs[i] };
        tempSign.x += partP.X;
        tempSign.y += partP.Y;
        if (!InBounds(tempSign.x, tempSign.y)) {
          continue;
        }
        sim.signs.push(tempSign);
      }
    }
    const useGravityMaps = save.hasGravityMaps && !!sim.grav;
    const targetBlocks = rectAnd(RectSized({ X: blockP.X + save.blockContent.pos.X, Y: blockP.Y + save.blockContent.pos.Y },
      save.blockContent.size), originRect(CELLS));
    for (const bpos of rectPoints(targetBlocks)) {
      const spos = { X: bpos.X - blockP.X, Y: bpos.Y - blockP.Y };
      if (save.blockMap.get(spos)) {
        sim.bmap[bpos.Y][bpos.X] = save.blockMap.get(spos);
        sim.fvx[bpos.Y][bpos.X] = save.fanVelX.get(spos);
        sim.fvy[bpos.Y][bpos.X] = save.fanVelY.get(spos);
      }
      if (includePressure) {
        if (save.hasPressure) {
          sim.pv[bpos.Y][bpos.X] = save.pressure.get(spos);
          sim.vx[bpos.Y][bpos.X] = save.velocityX.get(spos);
          sim.vy[bpos.Y][bpos.X] = save.velocityY.get(spos);
        }
        if (save.hasAmbientHeat) {
          sim.hv[bpos.Y][bpos.X] = save.ambientHeat.get(spos);
        }
        if (save.hasBlockAirMaps) {
          sim.air.bmap_blockair[bpos.Y][bpos.X] = save.blockAir.get(spos);
          sim.air.bmap_blockairh[bpos.Y][bpos.X] = save.blockAirh.get(spos);
        }
      }
      if (useGravityMaps) {
        const k = bpos.Y * XCELLS + bpos.X;
        sim.gravIn.mass[k] = save.gravMass.get(spos);
        sim.gravIn.mask[k] = save.gravMask.get(spos);
        sim.gravOut.forceX[k] = save.gravForceX.get(spos);
        sim.gravOut.forceY[k] = save.gravForceY.get(spos);
        sim.gravForceRecalc = true; // gravOut changed outside DispatchNewtonianGravity
      }
    }
    if (useGravityMaps) {
      sim.ResetNewtonianGravity(sim.gravIn, sim.gravOut);
    }

    sim.gravWallChanged = true;
    if (!save.hasBlockAirMaps) {
      sim.air.ApproximateBlockAirMaps(targetBlocks);
    }
  } finally {
    // Defer restorePrettyPowders
    sim.pretty_powder = oldPrettyPowders;
  }
}

/** std::unique_ptr<GameSave> Simulation::Save(bool includePressure, Rect<int> partR) // particle coordinates */
export function Save(sim: Simulation, includePressure: boolean, partR: Rect): GameSave {
  const tl = partR.pos;
  const br = { X: partR.pos.X + partR.size.X - 1, Y: partR.pos.Y + partR.size.Y - 1 };
  const blockR = RectBetween({ X: (tl.X / CELL) | 0, Y: (tl.Y / CELL) | 0 }, { X: (br.X / CELL) | 0, Y: (br.Y / CELL) | 0 });
  const blockP = blockR.pos;

  const newSave = new GameSave(blockR.size);
  newSave.frameCount = sim.frameCount;
  newSave.rngState = sim.rng.state();

  let storedParts = 0;
  const elementCount = new Int32Array(PT_NUM);
  // Map of soap particles loaded into this save, old ID -> new ID
  // Now stores all particles, not just SOAP (but still only used for soap)
  const particleMap = new Map<number, number>();

  const elements = sd.elements;
  const parts = sim.parts;
  for (let i = 0; i < NPART; i++) {
    const x = itrunc(f(parts[i].x + 0.5));
    const y = itrunc(f(parts[i].y + 0.5));
    if (parts[i].type && rectContains(partR, x, y)) {
      const tempPart = parts[i].clone();
      tempPart.x = f(tempPart.x - blockP.X * CELL);
      tempPart.y = f(tempPart.y - blockP.Y * CELL);
      if (elements[tempPart.type].Enabled) {
        particleMap.set(i, storedParts);
        newSave.addParticle(tempPart);
        storedParts++;
        elementCount[tempPart.type]++;
      }
    }
  }

  if (storedParts && elementCount[PT_SOAP]) {
    // fix SOAP links using particleMap, a map of old particle ID -> new particle ID
    // loop through every new particle (saved into the save), and convert .tmp / .tmp2
    for (const i of particleMap.values()) {
      const p = newSave.part(i);
      if (p.type !== PT_SOAP)
        continue;
      if ((p.ctype & 0x2) === 2) {
        const n = particleMap.get(p.tmp >>> 0);
        if (n !== undefined)
          p.tmp = n;
        else {
          p.tmp = 0;
          p.ctype ^= 2;
        }
      }
      if ((p.ctype & 0x4) === 4) {
        const n = particleMap.get(p.tmp2 >>> 0);
        if (n !== undefined)
          p.tmp2 = n;
        else {
          p.tmp2 = 0;
          p.ctype ^= 4;
        }
      }
    }
  }

  for (let i = 0; i < MAXSIGNS && i < sim.signs.length; i++) {
    if (sim.signs[i].text.length && rectContains(partR, sim.signs[i].x, sim.signs[i].y)) {
      const tempSign: Sign = { ...sim.signs[i] };
      tempSign.x -= blockP.X * CELL;
      tempSign.y -= blockP.Y * CELL;
      newSave.addSign(tempSign);
    }
  }

  for (const bpos of rectPoints(originRect(newSave.blockSize))) {
    const sy = bpos.Y + blockP.Y, sx = bpos.X + blockP.X;
    if (sim.bmap[sy][sx]) {
      newSave.blockMap.set(bpos, sim.bmap[sy][sx]);
      newSave.fanVelX.set(bpos, sim.fvx[sy][sx]);
      newSave.fanVelY.set(bpos, sim.fvy[sy][sx]);
    }
    if (includePressure) {
      newSave.pressure.set(bpos, sim.pv[sy][sx]);
      newSave.velocityX.set(bpos, sim.vx[sy][sx]);
      newSave.velocityY.set(bpos, sim.vy[sy][sx]);
      newSave.ambientHeat.set(bpos, sim.hv[sy][sx]);
      newSave.blockAir.set(bpos, sim.air.bmap_blockair[sy][sx]);
      newSave.blockAirh.set(bpos, sim.air.bmap_blockairh[sy][sx]);
    }
    if (sim.grav) {
      const k = sy * XCELLS + sx;
      newSave.gravMass.set(bpos, sim.gravIn.mass[k]);
      newSave.gravMask.set(bpos, sim.gravIn.mask[k]);
      newSave.gravForceX.set(bpos, sim.gravOut.forceX[k]);
      newSave.gravForceY.set(bpos, sim.gravOut.forceY[k]);
    }
  }
  if (includePressure) {
    newSave.hasBlockAirMaps = true;
  }
  if (sim.grav) {
    newSave.hasGravityMaps = true;
  }
  if (includePressure || sim.ensureDeterminism) {
    newSave.hasPressure = true;
    newSave.hasAmbientHeat = true;
  }
  newSave.ensureDeterminism = sim.ensureDeterminism;

  newSave.stkm.rocketBoots1 = sim.player.rocketBoots;
  newSave.stkm.rocketBoots2 = sim.player2.rocketBoots;
  newSave.stkm.fan1 = sim.player.fan;
  newSave.stkm.fan2 = sim.player2.fan;
  for (let i = 0; i < MAX_FIGHTERS; i++) {
    if (sim.fighters[i].rocketBoots)
      newSave.stkm.rocketBootsFigh.push(i);
    if (sim.fighters[i].fan)
      newSave.stkm.fanFigh.push(i);
  }

  SaveSimOptions(sim, newSave);
  newSave.pmapbits = PMAPBITS;
  return newSave;
}

/** void Simulation::SaveSimOptions(GameSave &gameSave) */
export function SaveSimOptions(sim: Simulation, gameSave: GameSave): void {
  gameSave.gravityMode = sim.gravityMode;
  gameSave.customGravityX = sim.customGravityX;
  gameSave.customGravityY = sim.customGravityY;
  gameSave.airMode = sim.air.airMode;
  gameSave.ambientAirTemp = sim.air.ambientAirTemp;
  gameSave.edgePressure = sim.air.edgePressure;
  gameSave.edgeVelocityX = sim.air.edgeVelocityX;
  gameSave.edgeVelocityY = sim.air.edgeVelocityY;
  gameSave.vorticityCoeff = sim.air.vorticityCoeff;
  gameSave.convectionMode = sim.air.convectionMode;
  gameSave.edgeMode = sim.edgeMode;
  gameSave.legacyEnable = !!sim.legacy_enable;
  gameSave.waterEEnabled = !!sim.water_equal_test;
  gameSave.gravityEnable = !!sim.grav;
  gameSave.aheatEnable = !!sim.aheat_enable;
}
