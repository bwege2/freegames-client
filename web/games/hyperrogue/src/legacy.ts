// legacy.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8; created by P2): legacy_modecode
// is real (modecode() calls it on every treasure, through updateHi). (C) Zeno Rogue, GPL-2.0-or-later.
import { G } from './globals.ts';
import { gNormal } from './classes.ts';
import { BITRUNCATED, euclid, sphere, elliptic } from './classes.ts';
import { pureHardcore } from './checkmove.ts';
import { numplayers } from './pcmove.ts';
import { ls_any_chaos, ls_std_chaos } from './landlock.ts';
import { get_default_land_structure } from './yendor.ts';
import { los_none, PURELOS_LEVEL } from './environment.ts';

/** #define UNKNOWN 65535 (hyper.h) */
export const UNKNOWN = 65535;

// mode codes for 'old' modes, from 0 to 255
const modecodetable: number[][] = [
  [0, 38, 39, 40, 41, 42], // softcore hyperbolic
  [7, 43, 44, 45, 46, 47], // hardcore hyperbolic
  [2, 4, 9, 11, 48, 49], // shmup hyperbolic
  [13, 50, 51, 52, 53, 54], // softcore heptagonal hyperbolic
  [16, 55, 56, 57, 58, 59], // hardcore heptagonal hyperbolic
  [14, 15, 17, 18, 60, 61], // shmup heptagonal hyperbolic
  [1, 62, 63, 64, 65, 66], // softcore euclidean
  [8, 67, 68, 69, 70, 71], // hardcore euclidean
  [3, 5, 10, 12, 72, 73], // shmup euclidean
  [110, 111, 112, 113, 114, 115], // softcore spherical
  [116, 117, 118, 119, 120, 121], // hardcore spherical
  [122, 123, 124, 125, 126, 127], // shmup spherical
  [128, 129, 130, 131, 132, 133], // softcore heptagonal spherical
  [134, 135, 136, 137, 138, 139], // hardcore heptagonal spherical
  [140, 141, 142, 143, 144, 145], // shmup heptagonal spherical
  [146, 147, 148, 149, 150, 151], // softcore elliptic
  [152, 153, 154, 155, 156, 157], // hardcore elliptic
  [158, 159, 160, 161, 162, 163], // shmup elliptic
  [164, 165, 166, 167, 168, 169], // softcore heptagonal elliptic
  [170, 171, 172, 173, 174, 175], // hardcore heptagonal elliptic
  [176, 177, 178, 179, 180, 181], // shmup heptagonal elliptic
  [19, 74, 75, 76, 77, 78], // softcore hyperbolic chaosmode
  [26, 79, 80, 81, 82, 83], // hardcore hyperbolic chaosmode
  [21, 23, 28, 30, 84, 85], // shmup hyperbolic chaosmode
  [32, 86, 87, 88, 89, 90], // softcore heptagonal hyperbolic chaosmode
  [35, 91, 92, 93, 94, 95], // hardcore heptagonal hyperbolic chaosmode
  [33, 34, 36, 37, 96, 97], // shmup heptagonal hyperbolic chaosmode
  [20, 98, 99, 100, 101, 102], // softcore euclidean chaosmode
  [27, 103, 104, 105, 106, 107], // hardcore euclidean chaosmode
  [22, 24, 29, 31, 108, 109], // shmup euclidean chaosmode
  [182, 183, 184, 185, 186, 187], // softcore spherical chaosmode
  [188, 189, 190, 191, 192, 193], // hardcore spherical chaosmode
  [194, 195, 196, 197, 198, 199], // shmup spherical chaosmode
  [200, 201, 202, 203, 204, 205], // softcore heptagonal spherical chaosmode
  [206, 207, 208, 209, 210, 211], // hardcore heptagonal spherical chaosmode
  [212, 213, 214, 215, 216, 217], // shmup heptagonal spherical chaosmode
  [218, 219, 220, 221, 222, 223], // softcore elliptic chaosmode
  [224, 225, 226, 227, 228, 229], // hardcore elliptic chaosmode
  [230, 231, 232, 233, 234, 235], // shmup elliptic chaosmode
  [236, 237, 238, 239, 240, 241], // softcore heptagonal elliptic chaosmode
  [242, 243, 244, 245, 246, 247], // hardcore heptagonal elliptic chaosmode
  [248, 249, 250, 251, 252, 253], // shmup heptagonal elliptic chaosmode
];
// unused codes: 6 (cheat/tampered), 25, 254, 255

export function legacy_modecode(): number { // STAGE1-STUB (real)
  if (G.geometry > 3 || G.variation > 1) return UNKNOWN;
  if (G.casual) return UNKNOWN;
  if (G.bow_weapon) return UNKNOWN;
  if (G.use_custom_land_list) return UNKNOWN;
  if (G.lineofsight !== los_none || G.lineofsightAt >= PURELOS_LEVEL) return UNKNOWN;

  const is_default_land_structure = G.land_structure === get_default_land_structure();

  if (!is_default_land_structure && !ls_std_chaos()) return UNKNOWN;

  // compute the old code
  let xcode = 0;

  if (G.shmup_on) xcode += 2;
  else if (pureHardcore()) xcode++;

  if (euclid()) xcode += 6;
  else if (!BITRUNCATED()) xcode += 3;

  if (sphere()) {
    xcode += 9;
    if (elliptic()) xcode += 6;
  }

  if (ls_any_chaos() && !G.yendor_on) xcode += 21;

  let np = numplayers() - 1; if (np < 0 || np > 5) np = 5;

  // bits: 0 to 7
  let mct = modecodetable[xcode][np];

  // CAP_INV
  if (G.inv_on) mct += (1 << 11);
  if (G.peace_on) mct += (1 << 12);
  // CAP_TOUR
  if (G.tour_on) mct += (1 << 13);
  if (numplayers() === 7) mct += (1 << 14);

  return mct;
}

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function legacy_racing(): boolean { return G.racing_on && G.geometry === gNormal && BITRUNCATED(); } // STAGE1-STUB (real)
