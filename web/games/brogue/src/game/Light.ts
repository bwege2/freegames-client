// @ts-nocheck
// Brogue CE 1.15.1 Light.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { applyColorScalar, pauseAnimation } from './IO.ts';
import { fp_round, fp_sqrt, randClump, rand_range } from './Math.ts';
import { hasNextCreature, iterateCreatures, monsterRevealed, nextCreature } from './Monsters.ts';
import { getFOVMask, updateFieldOfViewDisplay } from './Movement.ts';
import { demoteVisibility } from './Time.ts';
import { struct_PauseBehavior, struct_flare, struct_lightSource, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $mul64, $realloc, $sat, $u64, G, P, S, free, memset, printf } from '../rt/index.ts';
import { ANY_KIND_OF_VISIBLE, BURNING_CREATURE_LIGHT, COLS, DCOLS, DROWS, DV_DARK, DV_LIT, DV_UNLIT, FP_FACTOR, HAS_MONSTER, HAS_PLAYER, IN_FIELD_OF_VIEW, IS_IN_SHADOW, MESSAGE_LINES, MONST_FIERY, NO_LIGHT, NUMBER_TERRAIN_LAYERS, ROWS, STATUS_BURNING, STATUS_DARKNESS, STATUS_INVISIBLE, STAT_BAR_WIDTH, TELEPATHY_LIGHT, T_OBSTRUCTS_VISION, false_, flarePrecision, true_ } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

export function logLights(): void {
  let i = 0;
  let j = 0;
  printf(S("    "));
  for (i = 0; COLS - 2 > i; i = i + 1 << 16 >> 16) {
    printf(S("%i"), i % 10);
  }
  printf(S("\n"));
  for (j = 0; DROWS - 2 > j; j = j + 1 << 16 >> 16) {
    if (10 > j) {
      printf(S(" "));
    }
    printf(S("%i: "), j);
    for (i = 0; DCOLS - 2 > i; i = i + 1 << 16 >> 16) {
      if ($at2(G.tmap, i, j).light[0] === 0) {
        printf(S(" "));
      } else {
        printf(S("%i"), 0 > ($at2(G.tmap, i, j).light[0] / 10 | 0) - 1 ? 0 : ($at2(G.tmap, i, j).light[0] / 10 | 0) - 1);
      }
    }
    printf(S("\n"));
  }
  printf(S("\n"));
}

export function paintLight(theLight: struct_lightSource | null, x: number, y: number, isMinersLight: number, maintainShadows: number): number {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let colorComponents = new Int16Array(3);
  let randComponent = 0;
  let lightMultiplier = 0;
  let fadeToPercent = 0;
  let radiusRounded = 0;
  let radius = 0;
  let grid = $arr(79, () => new Int8Array(29));
  let dispelShadows = 0;
  let overlappedFieldOfView = 0;
  ;
  radius = Math.trunc($mul64(randClump(theLight.lightRadius), FP_FACTOR) / 100);
  radiusRounded = fp_round(radius) << 16 >> 16;
  randComponent = rand_range(0, theLight.lightColor.rand) << 16 >> 16;
  colorComponents[0] = randComponent + theLight.lightColor.red + rand_range(0, theLight.lightColor.redRand) << 16 >> 16;
  colorComponents[1] = randComponent + theLight.lightColor.green + rand_range(0, theLight.lightColor.greenRand) << 16 >> 16;
  colorComponents[2] = randComponent + theLight.lightColor.blue + rand_range(0, theLight.lightColor.blueRand) << 16 >> 16;
  dispelShadows = (!maintainShadows && colorComponents[0] + colorComponents[1] + colorComponents[2] > 0 ? 1 : 0) << 24 >> 24;
  fadeToPercent = theLight.radialFadeToPercent;
  for (i = (0 > x - radiusRounded ? 0 : x - radiusRounded) << 16 >> 16; DCOLS > i && x + radiusRounded > i; i = i + 1 << 16 >> 16) {
    for (j = (0 > y - radiusRounded ? 0 : y - radiusRounded) << 16 >> 16; DROWS > j && y + radiusRounded > j; j = j + 1 << 16 >> 16) {
      grid[i][j] = 0;
    }
  }
  getFOVMask(P(grid), x, y, radius, T_OBSTRUCTS_VISION, $u64(theLight.passThroughCreatures ? 0 : HAS_MONSTER | HAS_PLAYER), (!isMinersLight ? 1 : 0) << 24 >> 24);
  overlappedFieldOfView = false_;
  for (i = (0 > x - radiusRounded ? 0 : x - radiusRounded) << 16 >> 16; DCOLS > i && x + radiusRounded > i; i = i + 1 << 16 >> 16) {
    for (j = (0 > y - radiusRounded ? 0 : y - radiusRounded) << 16 >> 16; DROWS > j && y + radiusRounded > j; j = j + 1 << 16 >> 16) {
      if (grid[i][j]) {
        lightMultiplier = 100 - Math.trunc($mul64(100 - fadeToPercent, fp_sqrt($mul64(Math.imul(i - x, i - x) + Math.imul(j - y, j - y), FP_FACTOR))) / radius) << 16 >> 16;
        for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
          ($t1 = $at2(G.tmap, i, j).light, $t2 = k, $t1[$t2] = $t1[$t2] + (Math.imul(colorComponents[k], lightMultiplier) / 100 | 0) << 16 >> 16);
          ;
        }
        if (dispelShadows) {
          ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~IS_IN_SHADOW >>> 0) >>> 0);
        }
        if (($at2(G.pmap, i, j).flags & (IN_FIELD_OF_VIEW | ANY_KIND_OF_VISIBLE)) >>> 0) {
          overlappedFieldOfView = true_;
        }
      }
    }
  }
  ($t4 = $at2(G.tmap, x, y).light, $t5 = 0, $t4[$t5] = $t4[$t5] + colorComponents[0] << 16 >> 16);
  ($t6 = $at2(G.tmap, x, y).light, $t7 = 1, $t6[$t7] = $t6[$t7] + colorComponents[1] << 16 >> 16);
  ($t8 = $at2(G.tmap, x, y).light, $t9 = 2, $t8[$t9] = $t8[$t9] + colorComponents[2] << 16 >> 16);
  if (dispelShadows) {
    ($t10 = $at2(G.pmap, x, y), $t10.flags = ($t10.flags & ~IS_IN_SHADOW >>> 0) >>> 0);
  }
  return overlappedFieldOfView;
}

export function updateMinersLightRadius(): void {
  let base_fraction = 0;
  let fraction = 0;
  let lightRadius = 0;
  lightRadius = $mul64(100, G.rogue.minersLightRadius);
  if (0 > G.rogue.lightMultiplier) {
    lightRadius = Math.trunc(lightRadius / (-1 * G.rogue.lightMultiplier + 1));
  } else {
    lightRadius = $mul64(lightRadius, G.rogue.lightMultiplier);
    lightRadius = lightRadius > $mul64(G.rogue.lightMultiplier * 2 + 2, 65536) ? lightRadius : $mul64(G.rogue.lightMultiplier * 2 + 2, 65536);
  }
  if (G.player.status[STATUS_DARKNESS]) {
    base_fraction = FP_FACTOR - Math.trunc($mul64(G.player.status[STATUS_DARKNESS], FP_FACTOR) / G.player.maxStatus[STATUS_DARKNESS]);
    fraction = Math.trunc($mul64(Math.trunc($mul64(base_fraction, base_fraction) / FP_FACTOR), base_fraction) / FP_FACTOR);
    if (Math.trunc(FP_FACTOR / 20) > fraction) {
      fraction = Math.trunc(FP_FACTOR / 20);
    }
    lightRadius = Math.trunc($mul64(lightRadius, fraction) / FP_FACTOR);
  } else {
    fraction = FP_FACTOR;
  }
  if (131072 > lightRadius) {
    lightRadius = 131072;
  }
  if (G.rogue.inWater && lightRadius > 196608) {
    lightRadius = Math.trunc(lightRadius / 2) > 196608 ? Math.trunc(lightRadius / 2) : 196608;
  }
  G.rogue.minersLight.radialFadeToPercent = 35 + Math.trunc($mul64(0 > (G.rogue.lightMultiplier * 5 > 65 ? 65 : G.rogue.lightMultiplier * 5) ? 0 : G.rogue.lightMultiplier * 5 > 65 ? 65 : G.rogue.lightMultiplier * 5, fraction) / FP_FACTOR) << 16 >> 16;
  G.rogue.minersLight.lightRadius.upperBound = G.rogue.minersLight.lightRadius.lowerBound = ((Math.trunc(lightRadius / 65536) > -30000 ? Math.trunc(lightRadius / 65536) : -30000) > 30000 ? 30000 : Math.trunc(lightRadius / 65536) > -30000 ? Math.trunc(lightRadius / 65536) : -30000) << 16 >> 16;
}

function updateDisplayDetail(): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (-10 > $at2(G.tmap, i, j).light[0] && -10 > $at2(G.tmap, i, j).light[1] && -10 > $at2(G.tmap, i, j).light[2]) {
        G.displayDetail[i][j] = DV_DARK;
      } else if (($at2(G.pmap, i, j).flags & IS_IN_SHADOW) >>> 0) {
        G.displayDetail[i][j] = DV_UNLIT;
      } else {
        G.displayDetail[i][j] = DV_LIT;
      }
    }
  }
}

export function backUpLighting(lights: Ptr | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        lights.a[lights.o + i][j][k] = $at2(G.tmap, i, j).light[k];
      }
    }
  }
}

export function restoreLighting(lights: Ptr | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        $at2(G.tmap, i, j).light[k] = lights.a[lights.o + i][j][k];
      }
    }
  }
}

function recordOldLights(): void {
  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        $at2(G.tmap, i, j).oldLight[k] = $at2(G.tmap, i, j).light[k];
      }
    }
  }
}

export function updateLighting(): void {
  let $t1: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let layer = 0;
  let tile = 0;
  recordOldLights();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (k = 0; 3 > k; k = k + 1 << 16 >> 16) {
        $at2(G.tmap, i, j).light[k] = 0;
      }
      ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | IS_IN_SHADOW) >>> 0);
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
        tile = $at2(G.pmap, i, j).layers[layer];
        if (G.tileCatalog[tile].glowLight) {
          paintLight($sat(G.lightCatalog, G.tileCatalog[tile].glowLight), i, j, false_, false_);
        }
      }
    }
  }
  let handledPlayer = false_;
  for (let it = iterateCreatures(G.monsters); !handledPlayer || hasNextCreature(it); ) {
    let monst = !handledPlayer ? G.player : nextCreature(it);
    handledPlayer = true_;
    if (monst.info.intrinsicLightType) {
      paintLight($sat(G.lightCatalog, monst.info.intrinsicLightType), monst.loc.x, monst.loc.y, false_, false_);
    }
    if (monst.mutationIndex >= 0 && G.mutationCatalog[monst.mutationIndex].light >>> 0 !== NO_LIGHT) {
      paintLight($sat(G.lightCatalog, G.mutationCatalog[monst.mutationIndex].light), monst.loc.x, monst.loc.y, false_, false_);
    }
    if (monst.status[STATUS_BURNING] && !((monst.info.flags & MONST_FIERY) >>> 0)) {
      paintLight(G.lightCatalog[BURNING_CREATURE_LIGHT], monst.loc.x, monst.loc.y, false_, false_);
    }
    if (monsterRevealed(monst)) {
      paintLight(G.lightCatalog[TELEPATHY_LIGHT], monst.loc.x, monst.loc.y, false_, true_);
    }
  }
  for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if (monsterRevealed(monst)) {
      paintLight(G.lightCatalog[TELEPATHY_LIGHT], monst.loc.x, monst.loc.y, false_, true_);
    }
  }
  updateDisplayDetail();
  paintLight(G.rogue.minersLight, G.player.loc.x, G.player.loc.y, true_, true_);
  if (G.player.status[STATUS_INVISIBLE]) {
    G.player.info.foreColor = G.playerInvisibleColor;
  } else if (playerInDarkness()) {
    G.player.info.foreColor = G.playerInDarknessColor;
  } else if ((pmapAt(G.player.loc).flags & IS_IN_SHADOW) >>> 0) {
    G.player.info.foreColor = G.playerInShadowColor;
  } else {
    G.player.info.foreColor = G.playerInLightColor;
  }
}

export function playerInDarkness(): number {
  return (tmapAt(G.player.loc).light[0] + 10 < G.minersLightColor.red && tmapAt(G.player.loc).light[1] + 10 < G.minersLightColor.green && tmapAt(G.player.loc).light[2] + 10 < G.minersLightColor.blue ? 1 : 0) << 24 >> 24;
}

export function newFlare(light: struct_lightSource | null, x: number, y: number, changePerFrame: number, limit: number): struct_flare | null {
  let theFlare = new struct_flare();
  memset(theFlare, 0, 32);
  theFlare.light = light;
  theFlare.loc.x = x;
  theFlare.loc.y = y;
  theFlare.coeffChangeAmount = changePerFrame;
  if (theFlare.coeffChangeAmount === 0) {
    theFlare.coeffChangeAmount = 1;
  }
  theFlare.coeffLimit = limit;
  theFlare.coeff = 100 * flarePrecision;
  theFlare.turnNumber = G.rogue.absoluteTurnNumber;
  return theFlare;
}

export function createFlare(x: number, y: number, lightIndex: number): void {
  let theFlare = null;
  theFlare = newFlare($sat(G.lightCatalog, lightIndex), x, y, -15, 0);
  if (G.rogue.flareCount >= G.rogue.flareCapacity) {
    G.rogue.flareCapacity = G.rogue.flareCapacity + 10 << 16 >> 16;
    G.rogue.flares = $realloc(G.rogue.flares, 8 * $u64(G.rogue.flareCapacity), Array);
  }
  G.rogue.flares.a[G.rogue.flares.o + G.rogue.flareCount] = theFlare;
  G.rogue.flareCount = G.rogue.flareCount + 1 << 16 >> 16;
}

function flareIsActive(theFlare: struct_flare | null): number {
  let increasing = (theFlare.coeffChangeAmount > 0 ? 1 : 0) << 24 >> 24;
  let active = true_;
  if (theFlare.turnNumber > 0 && G.rogue.absoluteTurnNumber - 1 > theFlare.turnNumber) {
    active = false_;
  }
  if (increasing) {
    if (Math.trunc(theFlare.coeff / flarePrecision) << 16 >> 16 > theFlare.coeffLimit) {
      active = false_;
    }
  } else {
    if (theFlare.coeffLimit > Math.trunc(theFlare.coeff / flarePrecision) << 16 >> 16) {
      active = false_;
    }
  }
  return active;
}

function updateFlare(theFlare: struct_flare | null): number {
  if (!flareIsActive(theFlare)) {
    return false_;
  }
  theFlare.coeff += Math.imul(theFlare.coeffChangeAmount, flarePrecision) / 10 | 0;
  theFlare.coeffChangeAmount = (theFlare.coeffChangeAmount * 12 / 10 | 0) << 16 >> 16;
  return flareIsActive(theFlare);
}

function drawFlareFrame(theFlare: struct_flare | null): number {
  let inView = 0;
  let tempLight = theFlare.light.$clone();
  let tempColor = tempLight.lightColor.$clone();
  if (!flareIsActive(theFlare)) {
    return false_;
  }
  tempLight.lightRadius.lowerBound = Math.trunc($mul64(tempLight.lightRadius.lowerBound, theFlare.coeff) / (flarePrecision * 100)) << 16 >> 16;
  tempLight.lightRadius.upperBound = Math.trunc($mul64(tempLight.lightRadius.upperBound, theFlare.coeff) / (flarePrecision * 100)) << 16 >> 16;
  applyColorScalar(tempColor, Math.trunc(theFlare.coeff / flarePrecision) << 16 >> 16);
  tempLight.lightColor = tempColor;
  inView = paintLight(tempLight, theFlare.loc.x, theFlare.loc.y, false_, true_);
  return inView;
}

export async function animateFlares(flares: Ptr | null, count: number): Promise<void> {
  let lights = $arr(79, () => $arr(29, () => new Int16Array(3)));
  let inView = 0;
  let fastForward = 0;
  let atLeastOneFlareStillActive = 0;
  let i = 0;
  ;
  backUpLighting(P(lights));
  fastForward = (G.rogue.trueColorMode || G.rogue.playbackFastForward ? 1 : 0) << 24 >> 24;
  do {
    inView = false_;
    atLeastOneFlareStillActive = false_;
    for (i = 0; count > i; i = i + 1 << 16 >> 16) {
      if (flares.a[flares.o + i]) {
        if (updateFlare(flares.a[flares.o + i])) {
          atLeastOneFlareStillActive = true_;
          if (drawFlareFrame(flares.a[flares.o + i])) {
            inView = true_;
          }
        } else {
          free(flares.a[flares.o + i]);
          flares.a[flares.o + i] = null;
        }
      }
    }
    demoteVisibility();
    await updateFieldOfViewDisplay(false_, true_);
    if (!fastForward && (inView || G.rogue.playbackOmniscience) && atLeastOneFlareStillActive) {
      fastForward = await pauseAnimation(10, struct_PauseBehavior.$of());
    }
    recordOldLights();
    restoreLighting(P(lights));
  } while (atLeastOneFlareStillActive);
  await updateFieldOfViewDisplay(false_, true_);
}

export function deleteAllFlares(): void {
  let i = 0;
  for (i = 0; G.rogue.flareCount > i; i = i + 1 << 16 >> 16) {
    free(G.rogue.flares.a[G.rogue.flares.o + i]);
  }
  G.rogue.flareCount = 0;
}

export function $init(): void {
}
