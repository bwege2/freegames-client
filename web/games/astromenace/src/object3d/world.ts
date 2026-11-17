// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the object lists of
// space_ship.cpp, weapon.cpp, projectile.cpp, ground_object.cpp, space_object.cpp and explosion.cpp
// (each a std::list, new objects at the front) with their ForEach cycles, and PlayerFighter
// (game.cpp). Changed for the browser by the freegames project, 2026.
import type { Object3D } from './object3d.ts';
import type { SpaceShip } from './spaceship.ts';
import type { Weapon } from './weapon.ts';
import type { Projectile } from './projectile.ts';
import type { GroundObject } from './ground.ts';
import type { SpaceObject } from './spaceobject.ts';
import type { Explosion } from './explosion.ts';

export const Cycle = { Continue: 0, Break: 1, DeleteObjectAndContinue: 2, DeleteObjectAndBreak: 3 };
export const PairCycle = { Continue: 0, DeleteFirstObjectAndContinue: 1, DeleteSecondObjectAndContinue: 2, DeleteBothObjectsAndContinue: 3 };

export const world = {
  ShipList: [] as SpaceShip[],
  WeaponList: [] as Weapon[],
  ProjectileList: [] as Projectile[],
  GroundObjectList: [] as GroundObject[],
  SpaceObjectList: [] as SpaceObject[],
  ExplosionList: [] as Explosion[],
  PlayerFighter: null as SpaceShip | null,
};

/** an object leaves its list (std::list::erase of the last shared_ptr: the destructor runs) */
export function eraseFrom<T extends Object3D>(list: T[], i: number): void {
  const o = list[i];
  list.splice(i, 1);
  o.released = true;
  o.Destroy();
}

export function releaseFrom<T extends Object3D>(list: T[], o: T | null): void {
  if (!o || o.released) return;
  const i = list.indexOf(o);
  if (i >= 0) eraseFrom(list, i);
}

export function releaseAll<T extends Object3D>(list: T[]): void {
  while (list.length) eraseFrom(list, 0);
}

/**
 * The managed cycle of ForEachSpaceShip & co.: the callback returns a Cycle command. Objects created
 * during the cycle go to the front of the list and, as with std::list, are not visited; the position
 * is found again by identity after each call.
 */
export function forEachManaged<T extends Object3D>(list: T[], fn: (o: T) => number | void): void {
  for (let i = 0; i < list.length;) {
    const o = list[i];
    const cmd = fn(o) ?? Cycle.Continue;
    const k = list.indexOf(o);
    if (k < 0) return;
    if (cmd === Cycle.Continue) i = k + 1;
    else if (cmd === Cycle.Break) return;
    else if (cmd === Cycle.DeleteObjectAndContinue) {
      eraseFrom(list, k);
      i = k;
    } else {
      eraseFrom(list, k);
      return;
    }
  }
}

/** ForEachSpaceShipPair & co. */
export function forEachPair<T extends Object3D>(list: T[], fn: (a: T, b: T) => number | void): void {
  for (let i = 0; i < list.length;) {
    const a = list[i];
    let cmd = PairCycle.Continue;
    for (let j = list.indexOf(a) + 1; j < list.length;) {
      const b = list[j];
      cmd = fn(a, b) ?? PairCycle.Continue;
      const kb = list.indexOf(b);
      if (cmd === PairCycle.DeleteSecondObjectAndContinue || cmd === PairCycle.DeleteBothObjectsAndContinue) {
        eraseFrom(list, kb);
        j = kb;
      } else {
        j = kb + 1;
      }
      if (cmd === PairCycle.DeleteFirstObjectAndContinue || cmd === PairCycle.DeleteBothObjectsAndContinue) break;
    }
    const ka = list.indexOf(a);
    if (cmd === PairCycle.DeleteFirstObjectAndContinue || cmd === PairCycle.DeleteBothObjectsAndContinue) {
      eraseFrom(list, ka);
      i = ka;
    } else {
      i = ka + 1;
    }
  }
}

/** UpdateAll*: objects whose update returns false are erased (objects created meanwhile are not updated) */
export function updateAll<T extends Object3D>(list: T[], time: number): void {
  for (let i = 0; i < list.length;) {
    const o = list[i];
    const ok = o.UpdateWithTimeSheetList(time);
    const k = list.indexOf(o);
    if (k < 0) {
      continue;
    }
    if (!ok) {
      eraseFrom(list, k);
      i = k;
    } else {
      i = k + 1;
    }
  }
}

export function playerFighter(): SpaceShip | null {
  const p = world.PlayerFighter;
  return p && !p.released ? p : null;
}
