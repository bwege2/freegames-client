// init.c of Open Adventure 1.22: initialisation.
// SPDX-FileCopyrightText: (C) 1977, 2005 by Will Crowther and Don Woods
// SPDX-License-Identifier: BSD-2-Clause
//
// (The static initializers of `game` and `settings` are new_game() and reset_globals() in advent.ts.)
import {
  COND_FORCED, COND_HBASE, HERE as HERE_MOTION, NDWARVES, NLOCATIONS, NOBJECTS, LOC_NOWHERE, conditions,
  dwarflocs, locations, objects, tkey, travel,
} from './dungeon.ts';
import { OBJECT_SET_FOUND, OBJECT_SET_NOT_FOUND, game, host, out, settings } from './advent.ts';
import { drop, set_seed, setbit } from './misc.ts';

/**
 * glibc's srand(seed) followed by rand(): the additive feedback generator of random_r.c (TYPE_3, degree
 * 31, separation 3), seeded by the Lehmer generator 16807 mod 2^31-1, with its first 310 outputs
 * discarded. The original seeds the game with this (srand(time(NULL)); rand()).
 */
export function glibc_srand_rand(seed: number): number {
  const r = new Int32Array(345);
  r[0] = (seed >>> 0) === 0 ? 1 : seed | 0; // srandom_r: a seed of 0 is taken as 1
  for (let i = 1; i < 31; i++) {
    const hi = Math.trunc(r[i - 1] / 127773);
    const lo = r[i - 1] % 127773;
    let word = 16807 * lo - 2836 * hi;
    if (word < 0) word += 2147483647;
    r[i] = word;
  }
  for (let i = 31; i < 34; i++) r[i] = r[i - 31];
  for (let i = 34; i < 345; i++) r[i] = (r[i - 31] + r[i - 3]) | 0;
  return r[344] >>> 1; // the 311th output: (uint32_t)r >> 1
}

export function initialise(): number {
  if (settings.oldstyle) {
    out('Initialising...\n');
  }

  const seedval = glibc_srand_rand(host.time()); // srand(time(NULL)); int seedval = (int)rand();
  set_seed(seedval);

  for (let i = 1; i <= NDWARVES; i++) {
    game.dwarves[i].loc = dwarflocs[i - 1];
  }

  for (let i = 1; i < NOBJECTS; i++) {
    game.objects[i].place = LOC_NOWHERE;
  }

  for (let i = 1; i < NLOCATIONS; i++) {
    if (!(locations[i].description.big == null || tkey[i] === 0)) {
      const k = tkey[i];
      if (travel[k].motion === HERE_MOTION) {
        conditions[i] |= (1 << COND_FORCED);
      }
    }
  }

  /*  Set up the game.locs atloc and game.link arrays.
   *  We'll use the DROP subroutine, which prefaces new objects on the
   *  lists.  Since we want things in the other order, we'll run the
   *  loop backwards.  If the object is in two locs, we drop it twice.
   *  Also, since two-placed objects are typically best described
   *  last, we'll drop them first. */
  for (let i = NOBJECTS - 1; i >= 1; i--) {
    if (objects[i].fixd > 0) {
      drop(i + NOBJECTS, objects[i].fixd);
      drop(i, objects[i].plac);
    }
  }

  for (let k = NOBJECTS - 1; k >= 1; --k) {
    game.objects[k].fixed = objects[k].fixd;
    if (objects[k].plac !== 0 && objects[k].fixd <= 0) {
      drop(k, objects[k].plac);
    }
  }

  /*  Treasure props are initially STATE_NOTFOUND, and are set to
   *  STATE_FOUND the first time they are described.  game.tally
   *  keeps track of how many are not yet found, so we know when to
   *  close the cave.
   *  (ESR) Non-treasures are set to STATE_FOUND explicitly so we
   *  don't rely on the value of uninitialized storage. This is to
   *  make translation to future languages easier. */
  for (let object = 1; object < NOBJECTS; object++) {
    if (objects[object].is_treasure) {
      ++game.tally;
      if (objects[object].inventory != null) {
        OBJECT_SET_NOT_FOUND(object);
      }
    } else {
      OBJECT_SET_FOUND(object);
    }
  }
  game.conds = setbit(COND_HBASE);

  return seedval;
}
