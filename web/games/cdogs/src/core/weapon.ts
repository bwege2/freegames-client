// C-Dogs SDL 2.5.0, translated: weapon instances (weapon.c). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import { MAX } from './base.ts';
import { FPS_FRAMELIMIT, WeaponClassGetBarrel, WeaponClassHasMuzzle, WeaponClassNumBarrels } from './classes.ts';
import { GUNSTATE_FIRING, GUNSTATE_READY, GUNSTATE_RECOIL, type Barrel, type Weapon, type WeaponClass } from './types.ts';

export function newBarrel(): Barrel {
  return { state: GUNSTATE_READY, lock: 0, soundLock: 0, stateCounter: 0, heatCounter: 0 };
}
export function WeaponCreate(wc: WeaponClass | null): Weapon {
  const w: Weapon = { Gun: wc, clickLock: 0, barrels: [newBarrel(), newBarrel()] };
  if (wc != null) {
    for (let i = 0; i < WeaponClassNumBarrels(wc); i++) {
      w.barrels[i].state = GUNSTATE_READY;
      w.barrels[i].stateCounter = -1;
    }
  }
  return w;
}
export function WeaponUpdate(w: Weapon, ticks: number): void {
  w.clickLock -= ticks;
  if (w.clickLock < 0) w.clickLock = 0;
  for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) {
    const b = w.barrels[i];
    b.lock -= ticks;
    if (b.lock < 0) b.lock = 0;
    b.soundLock -= ticks;
    if (b.soundLock < 0) b.soundLock = 0;
    if (b.stateCounter >= 0) {
      b.stateCounter = MAX(0, b.stateCounter - ticks);
      if (b.stateCounter === 0) {
        switch (b.state) {
          case GUNSTATE_FIRING: WeaponBarrelSetState(w, i, GUNSTATE_RECOIL); break;
          case GUNSTATE_RECOIL: WeaponBarrelSetState(w, i, GUNSTATE_FIRING); break;
          default: break;
        }
      }
    }
    b.heatCounter -= ticks;
    if (b.heatCounter < 0) b.heatCounter = 0;
  }
}
export function WeaponGetUnlockedBarrel(w: Weapon): number {
  let unlocked = -1;
  for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) {
    if (w.barrels[i].lock === 0 && unlocked < 0) unlocked = i;
    else if (w.barrels[i].lock > WeaponClassGetBarrel(w.Gun!, i).Lock - w.Gun!.Lock) return -1;
  }
  return unlocked;
}
export function WeaponBarrelSetState(w: Weapon, barrel: number, state: number): void {
  const b = w.barrels[barrel];
  b.state = state;
  switch (state) {
    case GUNSTATE_FIRING: b.stateCounter = 4; break;
    case GUNSTATE_RECOIL: b.stateCounter = MAX(1, b.lock - 3); break;
    default: b.stateCounter = -1; break;
  }
}
export function WeaponBarrelOnFire(w: Weapon, barrel: number): void {
  const wc = WeaponClassGetBarrel(w.Gun!, barrel);
  const b = w.barrels[barrel];
  if (b.soundLock <= 0) b.soundLock = wc.Normal.SoundLockLength;
  b.heatCounter += wc.Lock * 2;
  if (b.heatCounter > FPS_FRAMELIMIT * 3) b.heatCounter = FPS_FRAMELIMIT * 3;
  b.lock = wc.Lock;
}
export function WeaponBarrelIsOverheating(w: Weapon, idx: number): boolean {
  if (!WeaponClassHasMuzzle(w.Gun!) || w.Gun!.OverheatTicks < 0) return false;
  return w.barrels[idx].heatCounter > w.Gun!.OverheatTicks;
}
